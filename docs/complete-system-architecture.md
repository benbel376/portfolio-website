# Complete System Architecture & File Responsibilities

## System Overview

This portfolio website uses a sophisticated **data-driven, component-based architecture** with **dynamic loading capabilities**. The system separates concerns across multiple layers and supports multiple portfolio profiles through configuration.

## Core Design Principles

1. **Configuration Over Code** - Content changes through JSON, not code modifications
2. **Component Isolation** - Each component is self-contained with its own HTML, CSS, JS, PHP
3. **Separation of Concerns** - Data (JSON) ↔ Structure (HTML) ↔ Style (CSS) ↔ Behavior (JS) ↔ Assembly (PHP)
4. **Dynamic Loading** - Components can load content on-demand for performance
5. **Multiple Profiles** - Single codebase supports different portfolio types

---

## File Structure & Responsibilities

### **Entry Point Layer**

#### `index.php` - Main Entry Point
**Responsibility**: Request routing and profile determination
- Reads `definitions/entry.json` for available profiles
- Supports URL routing (`/profile_name`) and query parameters (`?profile=name`)
- Determines profile from URL or falls back to default
- Loads specified builder with profile-specific parameters
- Handles errors with user-friendly profile selection

#### `definitions/entry.json` - Entry Configuration
**Responsibility**: Profile registry and builder configuration
- Maps profile keys to profile files and builders
- Defines builder parameters per profile (theme, optimization, debug)
- Specifies default profile and builder
- Documents builder capabilities

---

### **Configuration Layer**

#### `definitions/profiles/[profile]_t1.json` - Profile Configuration
**Responsibility**: Profile-specific site and page definitions
- Specifies site layout configuration
- Lists pages to include in the profile
- Contains profile-specific metadata

#### `definitions/sites/[site]_t1.json` - Site Configuration
**Responsibility**: Site-level layout and navigation structure
- Defines site template and navigation
- Specifies global assets and behaviors
- Contains site-wide configuration parameters

#### `definitions/pages/[page]_t1.json` - Page Configuration
**Responsibility**: Page structure and component data
- Defines page objects (components/containers)
- Contains component-specific data and variants
- Specifies dynamic loading settings
- Handles navigation configuration per component

---

### **Build System Layer**

#### `builders/builder_t1.php` - Portfolio Builder
**Responsibility**: Orchestrates HTML assembly from configurations
- **Core Methods**:
  - `build($profileName)` - Main build orchestration
  - `buildPages($pages)` - Processes all pages in profile
  - `buildPageFromObjects($objects)` - Handles nested/flat object structures
  - `loadComponent()` - Loads individual components
  - `loadContainer()` - Loads layout containers
  - `loadSiteBlock()` - Loads site template

**Key Features**:
- Supports both nested and flat page structures
- Tracks current page definition for dynamic loading metadata
- Passes builder parameters to loaders
- Handles component variants and data mapping
- Supports three loading modes: `full`, `shell`, `content`

---

### **Component System Layer**

Each component follows the pattern: `blocks/[type]/[name]/type_1/`

#### `[component]_structure_t1.html` - HTML Template
**Responsibility**: Component markup structure
- Contains placeholder elements for dynamic content
- Includes CSS and JS file references
- Defines data attributes for navigation and dynamic loading
- Must be framework-agnostic HTML

#### `[component]_loader_t1.php` - PHP Loader Class
**Responsibility**: Server-side component assembly and data processing
- **Required Method**: `load($id, $title, $navigationConfig, $loadingMode, $componentMetadata)`
- **Loading Modes**:
  - `full` - Complete component with data (static rendering)
  - `shell` - Empty component structure (for dynamic loading)
  - `content` - Data-populated content only (for API injection)
- **Key Features**:
  - Processes component data from `$componentMetadata['componentData']`
  - Handles navigation configuration
  - Supports variant-based data structures
  - Generates security wrappers for dynamic content

#### `[component]_style_t1.css` - Component Styles
**Responsibility**: Component-specific styling
- Uses CSS custom properties for theming
- Includes responsive design rules
- Supports light/dark theme variants
- Must not conflict with other components

#### `[component]_behavior_t1.js` - Component JavaScript
**Responsibility**: Client-side component behavior
- **Three Function Categories**:
  1. **Event Handlers** - Pure DOM event listeners
  2. **Hook Functions** - Called by global systems (exported to `window`)
  3. **Auto-trigger Functions** - Run on component initialization
- **Key Features**:
  - Must handle dynamic content loading gracefully
  - Should be idempotent and retry-safe
  - Exports navigation handlers to global scope
  - Handles data injection from PHP loaders

---

### **Dynamic Loading System Layer**

#### `blocks/sites/top_bar/type_2/behaviors/dynamic_content_loader_t1.js` - Client-side Dynamic Loader
**Responsibility**: On-demand component content loading
- **Core Methods**:
  - `loadContainerContent(containerId)` - Loads all dynamic components in container
  - `loadComponentContent(componentElement)` - Loads specific component
  - `performDynamicLoad(componentElement)` - Handles API communication
- **Key Features**:
  - Caches loaded content in localStorage
  - Manages loading states and promises
  - Handles component visibility detection
  - Passes URL parameters to API
  - Injects content into component shells

#### `endpoints/dynamic_content_t1.php` - Dynamic Loading Endpoint
**Responsibility**: Server-side dynamic content generation
- **Process Flow**:
  1. Validates POST request and parameters
  2. Loads page definition to find component
  3. Verifies component is marked as dynamic
  4. Handles security/authentication checks
  5. Loads component loader class
  6. Calls loader with `content` mode
  7. Returns JSON response with generated content
- **Key Features**:
  - Sets URL parameters for PHP loaders via `$_GET`
  - Handles component security wrappers
  - Supports authentication for protected components
  - Validates component specifications

---

### **Navigation & State Management Layer**

#### `blocks/sites/top_bar/type_2/behaviors/global_navigator_t1.js` - Global Navigation System
**Responsibility**: URL-based navigation and container visibility
- Handles hash-based navigation (`#container/state.page`)
- Manages container visibility states
- Triggers dynamic content loading
- Coordinates with component navigation handlers

#### `assets/behaviors/top_bar_site_behavior_navigation_t2.js` - Site Navigation
**Responsibility**: Top-level navigation behavior
- Handles main navigation menu interactions
- Coordinates with global navigator
- Manages navigation state persistence

---

## Request Flow Patterns

### **Static Loading Flow**
```
User Request → index.php → entry.json → Profile Config → Builder → Page Configs → Component Loaders (full mode) → Complete HTML → Browser
```

### **Dynamic Loading Flow**
```
User Request → index.php → Builder → Component Loaders (shell mode) → Shell HTML → Browser
↓
JavaScript → Dynamic Content Loader → API Request → dynamic_content_t1.php → Component Loader (content mode) → Content HTML → Injection
```

### **Navigation Flow**
```
User Click → Global Navigator → URL Hash Change → Container Visibility → Dynamic Content Loader → API → Content Injection
```

### **Project Details Specific Flow**
```
Project Click → projects_grid_behavior_t1.js → URL with ?project=name → Global Navigator → project-details container visible → Dynamic Content Loader → endpoints/dynamic_content_t1.php with URL params → project_details_loader_t1.php reads $_GET['project'] → Correct project data → Content injection
```

---

## Component Lifecycle

### **Static Components**
1. Builder calls loader with `full` mode
2. Loader populates HTML template with data
3. Complete HTML returned to browser
4. JavaScript behavior initializes immediately

### **Dynamic Components**
1. Builder calls loader with `shell` mode
2. Empty HTML shell returned to browser
3. Dynamic Content Loader detects component
4. API call made with component metadata
5. Loader called with `content` mode
6. Content injected into shell
7. JavaScript behavior re-initializes

---

## Data Flow Architecture

### **Configuration Data Flow**
```
entry.json → Profile Selection → profile_t1.json → site_t1.json + pages → page_t1.json → Component Data
```

### **Component Data Flow**
```
Page Config → data[variant] → componentMetadata['componentData'] → PHP Loader → HTML Template → Browser
```

### **Dynamic Data Flow**
```
Client Request → URL Parameters → API → $_GET superglobal → PHP Loader → Database/Config → Dynamic Content
```

---

## Key Integration Points

1. **Builder ↔ Loaders**: Component metadata and loading mode communication
2. **JavaScript ↔ PHP**: Data injection and global function exports
3. **API ↔ Loaders**: Dynamic content generation with URL parameter passing
4. **Navigator ↔ Dynamic Loader**: Container visibility and content loading coordination
5. **Components ↔ Global Systems**: Navigation handlers and initialization hooks

This architecture enables flexible, maintainable, and performant portfolio websites that can adapt to different profiles while maintaining clean separation of concerns and supporting advanced features like dynamic loading and client-side navigation.
