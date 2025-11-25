# Navigation and Dynamic Content Loading Architecture

## Overview
This document provides a comprehensive breakdown of the website's navigation system and dynamic content loading mechanism, covering both initial page loading and runtime dynamic content loading.

---

## 🏗️ Core Components

### **1. Unified Page Builder (`builders/builder_t1.php`)** ✅ **IMPLEMENTED**
- **Purpose**: Dictionary-driven HTML generation engine
- **Architecture**: Completely agnostic to build context (full site vs. dynamic content)
- **Input**: Unified dictionary structure with objects array, site config (optional), page definition
- **Output**: Complete HTML for full sites or partial HTML for dynamic content
- **Key Features**:
  - **Dictionary-driven**: Accepts structured data, no file reading
  - **Context-agnostic**: Same code path for all scenarios
  - **Security-aware**: Respects dynamic flags and protection settings

### **2. Dictionary-Driven Dynamic API (`endpoints/dynamic_content_t1.php`)** ✅ **IMPLEMENTED**
- **Purpose**: Server-side endpoint for dynamic content requests
- **Architecture**: Extract object → Create mini-dictionary → Pass to builder
- **Security**: Validates authentication BEFORE builder call for protected content
- **Input**: Component ID, page definition, URL parameters
- **Output**: JSON response with HTML content from builder
- **Key Features**:
  - **Object extraction**: Finds target component and dependencies from page definitions
  - **Security-first**: Authentication validation before processing
  - **Force content mode**: Sets `dynamic = false` to prevent shells in responses

### **3. Global Navigator (`blocks/sites/top_bar/type_2/behaviors/global_navigator_t1.js`)**
- **Purpose**: Central navigation coordinator and hash manager
- **Responsibilities**: Hash parsing, state management, triggering dynamic loading
- **Input**: URL hash changes, navigation events
- **Output**: Navigation state, visibility changes, dynamic loading triggers

### **4. Dynamic Content Loader (`blocks/sites/top_bar/type_2/behaviors/dynamic_content_loader_t1.js`)**
- **Purpose**: Client-side dynamic content fetching and injection
- **Responsibilities**: API communication, caching, content injection
- **Input**: Component elements, metadata, URL parameters
- **Output**: Injected HTML content, loading states

### **5. Site-Specific Handler (`blocks/sites/top_bar/type_2/behaviors/top_bar_site_behavior_dynamic_content_t2.js`)**
- **Purpose**: Site-level dynamic content coordination
- **Responsibilities**: Container scanning, post-processing, theme application
- **Input**: Navigation states from global navigator
- **Output**: Coordinated dynamic loading, post-processed content

---

## 🚀 Initial Website Loading Flow ✅ **UPDATED ARCHITECTURE**

### **Phase 1: Entry Point Processing (`index.php`)** ✅ **IMPLEMENTED**
1. **Profile Resolution**:
   - Reads `definitions/entry.json` for available profiles (no parameters, builders list, or default_builder)
   - Determines profile from URL path (`/profile_name`) or query param (`?profile=profile_name`)
   - Fallback to `default_profile` from entry config
   
2. **Dictionary Assembly** ✅ **NEW**:
   - Loads profile → site → pages in sequence
   - Flattens all page objects into unified array
   - **Security enforcement**: `protected = true` → `dynamic = true`
   - Creates dictionary: `{site, objects[], pageDefinition}`
   - Extracts builder file from profile configuration

3. **Builder Execution** ✅ **UPDATED**:
   - Creates `PortfolioBuilder` instance from `builders/builder_t1.php`
   - Calls `$builder->build($dictionary)` with assembled dictionary (not profile name)
   - Builder processes objects array using context-agnostic logic

### **Phase 2: Profile and Site Loading**
1. **Profile Loading** (`definitions/profiles/`):
   - Loads profile JSON (e.g., `ml_mlops_t1.json`)
   - Extracts site configuration: `"site": "top_bar_site_t2.json"` → loads from `definitions/sites/`
   - Gets array of page definition files to include

2. **Site Configuration Setup**:
   - Prepares navigation tabs and default navigation hash
   - Sets up branding (title, etc.)

### **Phase 3: Page Assembly and Content Building**
1. **Page Processing Loop**:
   - For each page in `pages` array (e.g., `summary_page_t1.json`)
   - Loads page JSON from `definitions/pages/`
   - Calls `buildPageFromObjects()` with `objects` array
   - Tracks current page definition for dynamic loading metadata

2. **Structure Detection**:
   - **Flat Structure**: Has `parent` relationships → builds dependency tree first
   - **Nested Structure**: Has `objects` arrays → processes recursively

3. **Object Building Process**:
   - For each object in page definition:
     - **Components**: Calls `loadComponent()` 
     - **Containers**: Calls `loadContainer()` with children processing

### **Phase 4: Component/Container Loading**
1. **Component Loading** (`loadComponent()`):
   - Validates `variant` and `data[variant]` structure for data resolution
   - Parses component spec (e.g., `"heros/type_1"` → `componentType="heros"`, `version="type_1"`)
   - Finds loader file in `blocks/components/{type}/{version}/*loader*.php`
   - Uses reflection to detect loader capabilities (parameter count)
   - Determines loading mode: `dynamic=true` forces `shell` mode, otherwise `full`
   - Passes metadata including `componentSpec`, `componentId`, `componentData`, `pageDefinition`

2. **Container Loading** (`loadContainer()`):
   - Recursively builds children (flat structure uses dependency tree, nested uses `objects` array)
   - Finds loader in `blocks/containers/{type}/{version}/*loader*.php`
   - Passes `childrenHtml` array and navigation config to container loader

3. **Loader Interface Standards**:
   - **Legacy Loaders**: `load($id, $title)`
   - **Navigation-Aware**: `load($id, $title, $navigationConfig)`
   - **Dynamic-Capable**: `load($id, $title, $navigationConfig, $loadingMode, $componentMetadata)`

### **Phase 5: Site Template Integration**
1. **Site Loader Execution**:
   - Loads site loader from `blocks/sites/{siteType}/{version}/*loader*.php`
   - Calls `load($navigationTabs, $title, $pageContent, $defaultNavigation)`
   - Injects navigation HTML, page content, and site-wide scripts/styles

2. **Final Output**:
   - Returns complete HTML document with embedded components/containers
   - Includes all navigation configuration as data attributes
   - Sets up client-side navigation system initialization

### **Phase 6: Client-Side Initialization**
1. **DOM Ready Processing**:
   - Page loads with initial content (shells for dynamic components)
   - Site structure includes navigation scripts and global behaviors

2. **Navigation System Startup**:
   - `GlobalNavigator` scans DOM for elements with `data-nav-handler` attributes
   - Registers navigation configurations from `data-nav-config` attributes
   - Processes default navigation hash or applies fallback

3. **Dynamic Content System Setup**:
   - `DynamicContentLoader` initializes with cache and API endpoint
   - `TopBarSiteDynamicContent` sets up site-specific coordination
   - Scans for dynamic components (`data-dynamic="true"`) in visible containers

### **Data Structures in Initial Load**:

#### **Entry Configuration** (`definitions/entry.json`)
```json
{
  "default_profile": "ml_mlops",
  "profiles": {
    "ml_mlops": {
      "profile": "ml_mlops_t1.json",
      "builder": "builder_t1.php"
    }
  }
}
```

#### **Profile Definition** (`definitions/profiles/`)
```json
{
  "site": "top_bar_site_t2.json",
  "pages": ["summary_page_t1.json", "skills_page_t1.json", ...]
}
```

#### **Page Definition** (`definitions/pages/`)
```json
{
  "objects": [
    {
      "id": "unique-element-id",
      "type": "component" | "container",
      "component": "spec/version",
      "variant": "data_key",
      "data": { "variant_key": { "actual_data": "..." } },
      "navigation": { 
        "defaultState": "visible|hidden", 
        "allowedStates": ["visible", "hidden", "scrollTo"],
        "protected": true|false 
      },
      "dynamic": true|false,
      "objects": [...],  // for containers in nested structure
      "parent": "parent-id"  // for flat structure
    }
  ]
}
```

#### **Site Configuration** (`definitions/sites/`)
```json
{
  "type": "top_bar/type_2",
  "branding": { "title": "Portfolio" },
  "navigation": {
    "defaultNavigation": { "hash": "summary-main-container/visible.about" },
    "tabs": [
      {
        "label": "About", "target": "summary-main-container", 
        "tabId": "about", "state": "visible", "protected": false
      }
    ]
  }
}
```

---

## ⚡ Runtime Dynamic Content Loading Flow ✅ **UPDATED ARCHITECTURE**

### **Trigger Events**:
1. **Hash Navigation**: User clicks navigation links or URL hash changes
2. **Programmatic Navigation**: JavaScript calls `window.globalNavigator.navigate()`
3. **Direct Navigation**: Direct calls to navigation handlers

### **Phase 1: Navigation Event Processing (`GlobalNavigator`)**

1. **Hash Change Detection**:
   - Listens for browser `hashchange` event
   - Parses hash format: `elementId/state.tabId` or `elementId/state`
   - Extracts target element ID, desired state, and optional tab parameters

2. **Navigation Validation**:
   - Finds target element in DOM by ID
   - Verifies element has `data-nav-handler` attribute
   - Checks if requested state is in `allowedStates` from `data-nav-config`
   - Validates authentication for protected elements (`data-protected="true"`)

3. **State Calculation**:
   - Creates new navigation state map (`Map<elementId, {state, parameters}>`)
   - Determines which elements need state changes
   - Stores current state for restoration

### **Phase 2: Navigation Execution Sequence**

#### **Current Implementation Sequence** (PROBLEM):
1. **Dynamic Content Loading** → `handleDynamicContentLoading()`
2. **State Application** → `applyNavigationState()`
3. **Restoration** → `restorePreviousElements()`

#### **Correct Sequence** (NEEDED):
1. **Visibility Changes** → Apply state changes first
2. **State Passing** → Call local navigation handlers
3. **Dynamic Content Loading** → Load content only for visible elements

### **Phase 3: Dynamic Content Loading Coordination**

1. **Site-Level Handler** (`TopBarSiteDynamicContent`):
   - Called by `GlobalNavigator.handleDynamicContentLoading()`
   - Filters out protected elements for unauthenticated users
   - Manages loading queue to prevent duplicate requests
   - Calls `loadContainerContentInternal()` for each visible container

2. **Container Scanning**:
   - Only processes containers with `state === 'visible'`
   - Scans for `[data-dynamic="true"]` elements within container
   - Skips already loaded content (`data-loading-state !== 'loaded'`)
   - Validates security permissions for protected components

### **Phase 4: Component Loading Process (`DynamicContentLoader`)**

1. **Metadata Extraction**:
   - Reads `data-component-metadata` JSON from component shell
   - Extracts: `componentSpec`, `componentId`, `componentData`, `pageDefinition`
   - Gets current URL parameters for context

2. **Request Payload** (`endpoints/dynamic_content_t1.php`):
```json
{
  "componentId": "my-experience", 
  "pageDefinition": "experience_page_t1.json",
  "isSecured": false,
  "urlParams": { "project": "ai-platform", "tab": "details" }
}
```

3. **API Processing** (**CURRENT IMPLEMENTATION**):
   - Validates page definition file name format
   - Loads page JSON from `definitions/pages/{pageDefinition}`
   - **Recursively searches** objects array (flat + nested) for component by ID
   - **Manually extracts** component specification and validates `dynamic=true`
   - **Directly loads** component loader from `blocks/components/{type}/{version}/`
   - **Bypasses Builder** - manually calls loader with `'content'` mode
   - Handles variant-based data resolution (`data[variant]`)
   - Enforces security: checks session authentication for protected components

4. **Component Loader Execution**:
   - Calls `loader->load($id, $title, $navigationConfig, 'content', $metadata)`
   - `'content'` mode returns only inner content (no shell/wrapper)
   - Returns raw HTML content for injection

### **Phase 5: Content Injection and Finalization**

1. **Response Processing**:
   - Validates JSON response success
   - Extracts content from API response
   - Caches content (skipped for protected components)

2. **DOM Injection**:
   - Finds `.dynamic-content-container` within component shell
   - Injects HTML content directly
   - Sets `data-loading-state="loaded"` on component element

3. **Post-Processing**:
   - Dispatches `component:contentLoaded` event
   - Executes any embedded JavaScript in loaded content
   - Calls `data-init-hook` functions if defined
   - Applies current theme classes and styles

---

## 🔄 Data Flow Summary

### **Initial Load Data Flow**:
```
Entry Point → Profile Config → Page Builder → Page Definitions → 
Component Loaders → Site Template → Complete HTML → Browser
```

### **Dynamic Load Data Flow**:
```
Navigation Event → Global Navigator → Site Handler → 
Dynamic Loader → API Endpoint → Page Builder → Component Loader → 
HTML Response → Content Injection → Post-Processing
```

---

## ✅ Architecture Issues - RESOLVED

### **1. API Integration with Page Builder** ✅ **FIXED**
- **Solution**: `endpoints/dynamic_content_t1.php` now uses unified dictionary-driven builder
  - **Object extraction**: Finds components in page definitions
  - **Mini-dictionary creation**: Assembles objects array for builder
  - **Builder delegation**: Uses same `$builder->build($dictionary)` method
  - **No code duplication**: All logic centralized in builder
### **2. Page Builder Context Agnosticism** ✅ **FIXED**
- **Solution**: `PortfolioBuilder` now completely agnostic to build context
  - **Dictionary input**: Accepts unified data structure instead of profile names
  - **Context-agnostic**: Same logic for full sites vs. dynamic content
  - **File reading separation**: No file I/O in builder, handled upstream
  - No capability to build individual components/containers
  - No dynamic content mode parameter support
  - Cannot isolate single entity from page definition
- **Solution**: Add `buildEntity($pageDefinition, $entityId, $mode)` method
- **Benefit**: Single source of truth for all content generation

### **3. Incorrect Navigation Execution Sequence**
- **Problem**: `GlobalNavigator.executeNavigation()` runs in wrong order:
  1. `handleDynamicContentLoading()` ← **RUNS FIRST** 
  2. `applyNavigationState()` ← Should run first
  3. `restorePreviousElements()` ← Should run last
- **Impact**: Content loads before elements are visible, wasting resources
- **Solution**: Reorder to: Visibility → State → Dynamic Loading

### **4. No Container Dynamic Support in API**
- **Problem**: API only handles components, not containers
  - `$componentObject['component']` assumes component type
  - Containers use same `component` field but API doesn't handle them
  - No logic for dynamic containers loading all nested content
- **Solution**: Make API entity-type agnostic (handle both types)

### **5. Duplicate Component Loading Logic**
- **Problem**: Builder and API implement same logic differently:
  - **Builder**: Uses reflection, supports all loader types, comprehensive metadata
  - **API**: Hardcoded 5-parameter requirement, simplified metadata, bypasses builder validation
  - **Result**: Inconsistent behavior between initial and dynamic loading
- **Solution**: Consolidate all component loading through builder

### **6. Inconsistent Security Model**
- **Problem**: Multiple security validation points with different logic:
  - Builder: `$isProtected = isset($navigationConfig['protected'])` 
  - API: `$isProtected = !empty($componentObject['protected']) || (!empty($componentObject['navigation']['protected']))`
  - Client: `data-protected="true"` attribute checks
- **Solution**: Standardize security checks across all layers

### **7. No Dynamic Container Architecture**
- **Problem**: System assumes only components can be dynamic
  - No concept of dynamic containers that load all nested content
  - API search logic doesn't distinguish container vs component dynamic loading
  - Missing batch loading for container hierarchies
- **Solution**: Add container dynamic loading with single API call for all children

---

## 🎯 Proposed Architecture Improvements

### **1. Unified Entity Building**
- Page builder handles both components and containers
- Single `buildEntity()` method for all scenarios
- Consistent metadata and data passing

### **2. Simplified API Layer**
- API becomes pure task router
- No component-specific logic in API
- Direct delegation to page builder

### **3. Dynamic Container Support**
- Containers can be marked as dynamic
- Dynamic containers load all nested content at once
- Nested components in dynamic containers are treated as static

### **4. Improved Security Model**
- Consistent security checks across API and builder
- Session-based authentication for protected content
- Security metadata embedded in DOM for client-side decisions

### **5. Enhanced Caching Strategy**
- Component-level caching with metadata-based keys
- Cache invalidation based on content changes
- Separate caching policies for protected vs public content

---

## 🔒 Security Model ✅ **IMPLEMENTED**

### **Security-First Design Principles**:

1. **Protected = Dynamic Rule** ✅ **ENFORCED**:
   - Any object marked `protected: true` automatically becomes `dynamic: true` during dictionary assembly
   - Ensures protected content shows as shells on initial load
   - Enforced in `index.php` during dictionary assembly phase

2. **Authentication Before Builder** ✅ **IMPLEMENTED**:
   - Dynamic API validates authentication BEFORE calling builder
   - HTTP 401 response for unauthorized access to protected content
   - No builder execution for failed authentication

3. **Content Mode Enforcement** ✅ **IMPLEMENTED**:
   - Dynamic API forces `dynamic: false` for all objects in content mode
   - Prevents shells from being returned in API responses
   - Ensures actual content is delivered after authentication

4. **Security Validation Points**:
   - **Initial Load**: `index.php` enforces protected → dynamic rule
   - **Dynamic API**: `endpoints/dynamic_content_t1.php` validates auth before processing
   - **Builder**: Respects dynamic flags without internal security logic

### **Protected Content Flow**:
```
Initial Load: protected=true → dynamic=true → shows shell
User Authentication: login → session established
Dynamic Request: auth validation → dynamic=false → content returned
```

---

## 📋 Implementation Priority ✅ **UPDATED**

### **Phase 1: Core Architecture Fixes** ✅ **COMPLETED**
1. ✅ **Dictionary-driven builder**: Unified architecture implemented
2. ✅ **API routes to builder**: Dynamic API now uses page builder
3. ⏳ **Navigation sequence**: Visibility → State → Dynamic Loading (pending)

### **Phase 2: Enhanced Features** 
1. ✅ **Container dynamic loading**: Implemented with object extraction
2. ✅ **Unified security model**: Security-first design implemented
3. ⏳ **Standardized metadata structures**: Partially completed

### **Phase 3: Optimization**
1. Implement advanced caching strategies
2. Add performance monitoring
3. Optimize for large-scale deployments

---

## 📋 Related Documentation

For detailed end-to-end flow scenarios with complete file processing steps, see:
- **[Ideal End-to-End Flows](ideal_end_to_end_flows.md)** - Complete walkthrough of all scenarios with file details, data structures, and processing logic

---

This architecture provides a clean separation of concerns where each component has a single, well-defined responsibility, making the system maintainable, testable, and scalable.
