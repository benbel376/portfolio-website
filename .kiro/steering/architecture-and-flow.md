# System Architecture & Request Flow

## Core Architecture Principles

### 1. Dictionary-Driven Design
The entire system operates on a unified dictionary structure that flows through all layers:

```php
$dictionary = [
    'site' => $siteConfig,           // Site layout configuration
    'objects' => $flattenedObjects,  // All page objects in flat array
    'pageDefinition' => $pageFile    // Source page definition file
];
```

### 2. Configuration Over Code
- Content changes through JSON files, not code modifications
- No code changes needed for new profiles or pages
- Data-driven component rendering

### 3. Component Isolation
- Each component is completely self-contained
- Own HTML, CSS, JavaScript, PHP loader
- No dependencies on other components
- Portable and reusable

### 4. Security-First
- Protected content automatically becomes dynamic
- Multi-layer security enforcement
- Authentication validated before content delivery

### 5. Context-Agnostic Builder
- Builder works for full sites AND dynamic content
- Same code path for initial load and API responses
- Dictionary-driven, not context-dependent

## Request Flow Patterns

### Initial Page Load Flow

```
HTTP Request
  ↓
index.php (Entry Point)
  ↓
Load entry.json → Get profile key
  ↓
Load profile JSON → Get site + pages list
  ↓
Load site JSON → Get navigation config
  ↓
Load all page JSONs → Get objects arrays
  ↓
Flatten objects → Single unified array
  ↓
Apply security rules → protected: true → dynamic: true
  ↓
Create dictionary → {site, objects[], pageDefinition}
  ↓
PortfolioBuilder.build(dictionary)
  ↓
For each object:
  - Parse component spec (e.g., "heros/type_1")
  - Resolve data from variant
  - Find loader dynamically
  - Determine loading mode (dynamic → shell, else → full)
  - Call loader with metadata
  - Get HTML
  ↓
Wrap in site template
  ↓
Return complete HTML
  ↓
Browser renders page
  ↓
JavaScript initializes
  - GlobalNavigator discovers handlers
  - DynamicContentLoader initializes
  - Auto-navigation executes
```

### Dynamic Content Loading Flow

```
User Navigation
  ↓
Hash change event (#container/state)
  ↓
GlobalNavigator.handleHashChange()
  ↓
Parse hash → navigationState Map
  ↓
TopBarSiteDynamicContent.loadContainerContent()
  ↓
Scan for [data-dynamic="true"]
  ↓
For each dynamic component:
  ↓
DynamicContentLoader.loadComponentContent()
  ↓
Check cache → If cached, inject and done
  ↓
Extract metadata from data-component-metadata
  ↓
Prepare API request:
  {
    componentId,
    pageDefinition,
    isSecured,
    urlParams
  }
  ↓
POST to endpoints/dynamic_content_t1.php
  ↓
API validates request
  ↓
Load page definition JSON
  ↓
Extract target object + dependencies
  ↓
Check authentication for protected content
  ↓
Set dynamic=false for content mode
  ↓
Create mini-dictionary → {site: null, objects[], pageDefinition}
  ↓
PortfolioBuilder.build(dictionary)
  ↓
Return JSON response:
  {
    success: true,
    content: "<html>...",
    cacheKey: "..."
  }
  ↓
Client receives response
  ↓
Cache content (if not protected)
  ↓
Inject content into shell
  ↓
Execute embedded scripts
  ↓
Trigger init hooks
  ↓
Mark as loaded:{identifier}
```

## File Structure & Responsibilities

### Entry Point Layer

#### index.php
- Request routing and profile determination
- Dictionary assembly
- Security enforcement (protected → dynamic)
- Builder execution

#### definitions/entry.json
- Profile registry
- Builder configuration
- Default profile specification

### Configuration Layer

#### definitions/profiles/*.json
- Profile-specific site and page definitions
- Lists pages to include

#### definitions/sites/*.json
- Site-level layout and navigation
- Navigation tabs configuration
- Default navigation hash

#### definitions/pages/*.json
- Page structure and component data
- Component configurations
- Variant-based data maps

### Build System Layer

#### builders/builder_t1.php
- Dictionary-driven HTML generation
- Component/container loading orchestration
- Dynamic loader discovery
- Loading mode determination
- Context-agnostic operation

### Component System Layer

#### blocks/components/{name}/type_{version}/
- {name}_structure_t{version}.html - HTML template
- {name}_style_t{version}.css - Component styles
- {name}_behavior_t{version}.js - JavaScript behavior
- {name}_loader_t{version}.php - PHP loader class

### Dynamic Loading Layer

#### endpoints/dynamic_content_t1.php
- Server-side dynamic content generation
- Authentication validation
- Object extraction from page definitions
- Dictionary creation for builder
- Content delivery

#### blocks/sites/top_bar/type_2/behaviors/dynamic_content_loader_t1.js
- Client-side dynamic content fetching
- Caching management
- Content injection
- Script execution
- Init hook triggering

### Navigation Layer

#### blocks/sites/top_bar/type_2/behaviors/global_navigator_t1.js
- Hash-based navigation controller
- Handler discovery and registration
- State management
- Tab highlighting coordination

## Data Flow Architecture

### Configuration Data Flow
```
entry.json
  → Profile Selection
  → profile_t{version}.json
  → site_t{version}.json + pages list
  → page_t{version}.json files
  → Component Data (variant-based)
```

### Component Data Resolution
```
Page Definition:
{
  "variant": "main",
  "data": {
    "main": { "title": "..." },
    "alt": { "title": "..." }
  }
}

Builder Process:
1. Read variant field → "main"
2. Look up data["main"]
3. Pass to loader in componentMetadata
4. Loader uses data to populate template
```

### URL Parameter Passing
```
Client:
  URL: ?project=ai-platform
  → Dynamic loader extracts params
  → Sends in API request: urlParams: { project: "ai-platform" }

Server:
  API receives urlParams
  → Sets in $_GET superglobal
  → Loader reads: $_GET['project']
  → Loads project-specific data
  → Returns project content
```

## Security Model

### Three-Layer Security

#### Layer 1: Dictionary Assembly (index.php)
```php
// Automatic enforcement
if ($object['protected'] === true) {
    $object['dynamic'] = true; // Force dynamic loading
}
```

#### Layer 2: API Authentication (endpoints/dynamic_content_t1.php)
```php
// Validate BEFORE builder call
session_start();
$authed = !empty($_SESSION['auth']) && $_SESSION['auth'] === true;

if ($isProtected && !$authed) {
    http_response_code(401);
    exit();
}
```

#### Layer 3: Dynamic Flag Management
```php
// After authentication, deliver content
foreach ($objects as &$object) {
    if ($isProtected && $authed) {
        $object['dynamic'] = false; // Deliver actual content
    }
}
```

## Navigation System

### Hash URL Format
```
#elementId/state                                    # Basic
#element1/state1|element2/state2                   # Multiple
#elementId/state?param1=value1&param2=value2       # With parameters
```

### Navigation Execution Sequence
```
1. Save current state as previous
2. Load dynamic content for visible elements
3. Restore previous elements to defaults
4. Apply new navigation states
5. Update current state tracking
6. Update tab highlighting
```

### Tab Highlighting System
- Pages declare their parent tab via `parentTab` field
- Builder adds `data-parent-tab` attribute to containers
- Navigation system detects visible containers
- Highlights tab based on `data-parent-tab` attribute
- No manual tab ID management in URLs

## Builder System Details

### Dynamic Discovery
- Finds loader files: Any .php with "loader" in name
- Finds loader classes: Any class with "Loader" in name
- No hardcoded filename assumptions
- Supports any naming convention

### Loading Mode Determination
```php
if ($object['dynamic'] === true) {
    $loadingMode = 'shell';  // Empty structure
} else {
    $loadingMode = 'full';   // Complete with data
}
```

### Loader Interface Detection
Uses reflection to detect capabilities:
- 5+ parameters: Dynamic-capable loader
- 3+ parameters: Navigation-aware loader
- 2 parameters: Legacy loader

## Performance Optimization

### Initial Load
- Dynamic components load as lightweight shells
- Reduces initial HTML payload
- Faster time to first paint
- Content loads on-demand

### Runtime
- Client-side localStorage caching
- 24-hour cache expiration
- Parallel component loading
- Promise-based async operations

### Network
- Single API call per component
- Batch loading for containers
- Compressed JSON responses
- Cached content reuse

## Extension Points

### Custom Builders
```php
class CustomBuilder extends PortfolioBuilder {
    public function build($dictionary) {
        $html = parent::build($dictionary);
        return $this->applyCustomTransformations($html);
    }
}
```

### Custom Loaders
```php
class AdvancedLoader extends BaseLoader {
    public function load($id, $title, $navigationConfig, $loadingMode, $componentMetadata) {
        return $this->generateAdvancedComponent($componentMetadata);
    }
}
```

### Plugin System
```javascript
window.portfolioPlugins = window.portfolioPlugins || [];
window.portfolioPlugins.push({
    name: 'CustomPlugin',
    init: function() { /* ... */ },
    onNavigate: function(state) { /* ... */ }
});
```
