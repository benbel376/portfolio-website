# Architecture Guide

## Design Philosophy

This system follows three core principles:

1. **Dictionary-Driven** - All configuration flows through JSON definitions
2. **Component Isolation** - Each component is self-contained with own HTML/CSS/JS/PHP
3. **Context-Agnostic Building** - Same builder works for initial load and dynamic content

## Request Flow

### Initial Page Load
```
HTTP Request → index.php
  → Load entry.json (get profile)
  → Load profile.json (get site + pages)
  → Load site.json (navigation config)
  → Load page JSONs (component definitions)
  → Flatten objects into dictionary
  → PortfolioBuilder.build(dictionary)
  → For each object: find loader → generate HTML
  → Return complete page
```

### Dynamic Content Load
```
User Navigation → Hash change
  → GlobalNavigator parses hash
  → DynamicContentLoader.loadComponentContent()
  → Check cache → if cached, inject
  → POST to endpoints/dynamic_content_t1.php
  → API validates auth, builds content
  → Client caches and injects HTML
  → Trigger init hooks
```

## Dictionary Structure

```php
$dictionary = [
    'site' => $siteConfig,           // Site layout config
    'objects' => $flattenedObjects,  // All page objects
    'pageDefinition' => $pageFile    // Source page file
];
```

## Component Specification

Components are referenced as `{category}/type_{version}`:
- `heros/type_1`
- `projects_grid/type_1`
- `vertical/type_1` (container)

## Loading Modes

| Mode | Use Case | Output |
|------|----------|--------|
| `full` | Initial static load | Complete HTML with data |
| `shell` | Dynamic placeholder | Empty structure with metadata |
| `content` | API response | Data-populated content only |

## Navigation System

### URL Format
```
#elementId                    # Default state
#elementId/state              # Explicit state
#element1|element2            # Multiple elements
#elementId?param=value        # With parameters
```

### Navigation Handler
Every component exports a handler to `window`:
```javascript
function handleMyComponentNavigation(elementId, state, parameters) {
    const el = document.getElementById(elementId);
    switch (state) {
        case 'visible': el.style.display = 'block'; break;
        case 'hidden': el.style.display = 'none'; break;
        case 'scrollTo': el.scrollIntoView({ behavior: 'smooth' }); break;
    }
    return true;
}
window.handleMyComponentNavigation = handleMyComponentNavigation;
```

### Tab Highlighting
Pages declare their parent tab:
```json
{ "id": "summary-container", "parentTab": "about" }
```
Builder adds `data-parent-tab` attribute, navigation system auto-highlights.

## Dynamic Loading

### Required Attributes (Shell Mode)
```html
<section class="my-component"
    data-dynamic="true"
    data-load-state="not-loaded"
    data-init-hook="initializeMyComponent"
    data-component-metadata='{...}'>
```

### Load States
- `not-loaded` - Initial state
- `loading` - Fetching content
- `loaded:{identifier}` - Successfully loaded
- `failed` - Loading failed

### Caching
- Public content: Cached 24 hours in localStorage
- Protected content: Never cached
- Cache key: component spec + ID + data hash + URL params

## Security Model

### Three-Layer Security

1. **Dictionary Assembly** (index.php)
   - `protected: true` → automatically sets `dynamic: true`

2. **API Authentication** (endpoints/dynamic_content_t1.php)
   - Validates session before building content

3. **Dynamic Flag Management**
   - After auth, `dynamic: false` to deliver actual content

## Theme System

### Site-Level Variables
```css
--bg, --text, --primary, --accent
--card-bg, --border, --nav-bg
--font-primary, --font-secondary, --font-mono
--spacing-xs/sm/md/lg/xl
--radius-sm/md/lg/xl
--text-xs/sm/base/lg/xl/2xl
```

### Component Usage
Components use variables directly:
```css
.my-component {
    background: var(--card-bg);
    color: var(--text);
    border: 1px solid var(--border);
}
```

### Light/Dark Themes
- Light: `rgba(0, 0, 0, opacity)` for darkening
- Dark: `rgba(255, 255, 255, opacity)` for lightening

## File Structure

### Component
```
blocks/components/{name}/type_{version}/
├── {name}_structure_t{v}.html    # Template
├── {name}_style_t{v}.css         # Styles
├── {name}_behavior_t{v}.js       # JavaScript
├── {name}_loader_t{v}.php        # PHP loader
└── assets/                       # Media/files
```

### Site Layout
```
blocks/sites/{type}/type_{version}/
├── {type}_site_structure_t{v}.html
├── {type}_site_loader_t{v}.php
├── behaviors/                    # JS modules
│   └── {type}_site_ai_assistant_t{v}.js
└── styles/                       # CSS modules
    └── {type}_site_ai_assistant_style_t{v}.css
```

## AI Assistant Integration

Both site layouts (`top_bar/type_2` and `side_bar/type_1`) include an integrated AI Assistant chat widget.

### Configuration
AI Assistant is configured in site JSON files:
```json
{
  "aiAssistant": {
    "enabled": true,
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }
}
```

### Architecture
- **Frontend**: Floating chat widget with toggle button, message panel, and input form
- **Backend**: `endpoints/ai_assistant_t1.php` handles API requests to Gemini
- **Context Gathering**: Collects portfolio data (skills, projects, experience) for AI context
- **Navigation**: AI can suggest navigation to relevant sections via `navigate` response field
- **Session Persistence**: Chat history stored in sessionStorage for multi-turn conversations
- **Rate Limiting**: Handles 429 errors with user-friendly messages

### Files
| File | Purpose |
|------|---------|
| `behaviors/*_ai_assistant_t1.js` | Client-side chat behavior |
| `styles/*_ai_assistant_style_t1.css` | Chat widget styling |
| `endpoints/ai_assistant_t1.php` | API endpoint for Gemini integration |
| `features/ai_assistant/` | Loader for dynamic component mode |

## Builder System

### Loader Discovery
Builder dynamically finds loaders:
1. Scans component directory for `*loader*.php`
2. Finds class with `Loader` in name
3. Uses reflection to detect capabilities

### Loader Interface
```php
class MyComponentLoaderT1 {
    public function load($id, $title, $navigationConfig, $loadingMode, $componentMetadata) {
        switch ($loadingMode) {
            case 'shell': return $this->generateShell(...);
            case 'content': return $this->generateContent(...);
            default: return $this->generateFullComponent(...);
        }
    }
}
```

## Data Flow

### Variant-Based Data
```json
{
    "variant": "main",
    "data": {
        "main": { "title": "Primary" },
        "alt": { "title": "Alternative" }
    }
}
```

Builder resolves: `variant` → `data[variant]` → passes to loader.

### URL Parameters
Client extracts from hash, sends to API, API sets in `$_GET`:
```php
$projectName = $_GET['project'] ?? 'default';
```
