# Navigation and Dynamic Content Loading Architecture

## Overview
This document provides a comprehensive breakdown of the website's navigation system and dynamic content loading mechanism, covering both initial page loading and runtime dynamic content loading.

---

## 🏗️ Core Components

### **1. Page Builder (`builders/builder_t1.php`)**
- **Purpose**: Central HTML generation engine
- **Current Modes**: Full page building only
- **Needed Enhancement**: Dynamic content building mode
- **Input**: Profile/page definitions, entity IDs, build mode
- **Output**: Complete HTML or partial HTML content

### **2. Dynamic Content API (`endpoints/dynamic_content_t1.php`)**
- **Purpose**: Server-side endpoint for dynamic content requests
- **Current State**: Manually handles component loading (bypasses builder)
- **Needed Change**: Should route all requests to page builder
- **Input**: Entity ID, page definition, URL parameters, security hints
- **Output**: JSON response with HTML content

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

## 🚀 Initial Website Loading Flow

### **Phase 1: Entry Point Processing**
1. **Browser Request** → `index.php` or specific entry point
2. **Entry Point** loads profile configuration
3. **Profile Config** specifies:
   - Site type and configuration
   - Page definitions to include
   - Default navigation state
   - Builder parameters

### **Phase 2: Page Builder Execution**
1. **Builder Initialization**:
   - Sets base paths for definitions and blocks
   - Loads builder parameters from entry config
   
2. **Profile Loading**:
   - Reads profile JSON from `definitions/profiles/`
   - Extracts site configuration
   - Gets list of page definition files
   
3. **Page Assembly**:
   - For each page definition in profile:
     - Loads page JSON from `definitions/pages/`
     - Processes `objects` array (components and containers)
     - Builds hierarchical structure (flat or nested)
   
4. **Component/Container Building**:
   - For each object in page definition:
     - Determines type (component vs container)
     - Loads appropriate loader from `blocks/components/` or `blocks/containers/`
     - Passes data, navigation config, and metadata
     - Gets back HTML content
   
5. **Site Template Integration**:
   - Loads site template from `blocks/sites/`
   - Injects assembled page content
   - Adds navigation, theme support, and behaviors
   - Returns complete HTML document

### **Phase 3: Client-Side Initialization**
1. **DOM Ready**: Page loads with initial content
2. **Navigation System Init**:
   - Global Navigator scans for navigation handlers
   - Registers component/container navigation configs
   - Parses initial URL hash or applies default navigation
3. **Dynamic Content System Init**:
   - Dynamic Content Loader initializes
   - Site-specific handler initializes
   - Scans for dynamic components in initial load

### **Data Structures in Initial Load**:

#### **Profile Definition** (`definitions/profiles/`)
```
{
  site: "top_bar/type_2" | { site: "spec", config: {...} }
  pages: ["page1.json", "page2.json"]
  defaultNavigation: { hash: "element/state.tab", description: "..." }
}
```

#### **Page Definition** (`definitions/pages/`)
```
{
  objects: [
    {
      id: "unique-element-id"
      type: "component" | "container"
      component: "spec/version"
      variant: "data_key"
      data: { variant_key: { actual_data } }
      navigation: { defaultState, allowedStates, protected, etc. }
      dynamic: true | false
      objects: [...] // for containers in nested structure
      parent: "parent-id" // for flat structure
    }
  ]
}
```

---

## ⚡ Runtime Dynamic Content Loading Flow

### **Trigger Events**:
1. **Hash Navigation**: User clicks navigation or URL hash changes
2. **Programmatic Navigation**: JavaScript calls navigation methods
3. **Direct API Calls**: Manual dynamic content loading

### **Phase 1: Navigation Event Processing**

#### **Global Navigator Sequence**:
1. **Hash Change Detection**:
   - Browser `hashchange` event or programmatic navigation
   - Extract target element ID and desired state from hash
   
2. **Navigation Validation**:
   - Find target element in DOM
   - Verify element has navigation handler
   - Check if requested state is allowed
   - Validate security permissions
   
3. **State Management**:
   - Store previous navigation state
   - Calculate new navigation state map
   - Determine which elements need state changes

#### **Current Problem**: Dynamic Loading Happens Before Visibility
- **Current Sequence**: Dynamic Loading → Visibility → State Passing
- **Correct Sequence**: Visibility → State Passing → Dynamic Loading

### **Phase 2: Visibility and State Management**

#### **Visibility Changes**:
1. **Hide Previous Elements**:
   - Elements that should become hidden
   - Apply CSS classes or display properties
   - Reset to default states if needed
   
2. **Show Target Elements**:
   - Elements that should become visible
   - Remove hidden classes or set display properties
   - Prepare for content loading

#### **State Passing**:
1. **Local Navigation Handlers**:
   - Call component/container specific navigation functions
   - Pass new state and parameters
   - Allow components to prepare for new state

### **Phase 3: Dynamic Content Loading Decision**

#### **Container Analysis**:
1. **Dynamic Container Rule**:
   - If parent container is dynamic → All nested components are static
   - Only scan for dynamic elements in static containers
   - Dynamic containers load all content via single API call

#### **Component Scanning**:
1. **Visibility Check**: Only scan visible containers
2. **Dynamic Element Detection**: Find `[data-dynamic="true"]`
3. **Loading State Check**: Skip already loaded content
4. **Security Validation**: Check authentication for protected content

### **Phase 4: API Communication**

#### **Request Preparation**:
1. **Metadata Extraction**:
   - Read `data-component-metadata` from DOM element
   - Extract component spec, ID, data, page definition
   - Get current URL parameters
   
2. **Request Payload Assembly**:
```
{
  entityId: "component-or-container-id"
  pageDefinition: "source_page.json"
  urlParams: { key: value, ... }
  isSecured: boolean // client hint only
}
```

#### **API Processing** (Current vs Desired):

**Current API Behavior**:
1. Manually loads page definition JSON
2. Manually searches for component in objects array
3. Manually extracts component specification
4. Manually loads component loader
5. Manually calls loader with parameters
6. Returns HTML content

**Desired API Behavior**:
1. Route request to Page Builder
2. Pass entity ID, page definition, and mode
3. Let builder handle everything
4. Return whatever builder returns

#### **Page Builder Processing** (Desired):
1. **Mode Detection**: Recognize 'dynamic_content' mode
2. **Page Loading**: Load specified page definition
3. **Entity Finding**: Locate entity by ID in objects array
4. **Entity Building**: Build only the requested entity
5. **Content Return**: Return HTML content as string

### **Phase 5: Content Injection and Post-Processing**

#### **Content Injection**:
1. **Response Validation**: Check API response success
2. **Content Stripping**: Remove any wrapper elements
3. **DOM Injection**: Insert HTML into `.dynamic-content-container`
4. **Script Execution**: Execute any embedded JavaScript
5. **State Update**: Mark component as loaded

#### **Post-Processing**:
1. **Event Dispatch**: Trigger `component:contentLoaded` event
2. **Hook Execution**: Call `data-init-hook` functions if defined
3. **Theme Application**: Apply current site theme
4. **Component Initialization**: Run component-specific setup

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

## 🚨 Current Architecture Issues

### **1. API Bypasses Page Builder**
- **Problem**: API manually implements component loading logic
- **Solution**: API should route all requests to page builder
- **Benefit**: Single source of truth for content generation

### **2. Page Builder Lacks Dynamic Mode**
- **Problem**: Builder only supports full page building
- **Solution**: Add dynamic content building mode
- **Benefit**: Unified building logic for all scenarios

### **3. Incorrect Dynamic Loading Sequence**
- **Problem**: Dynamic loading happens before visibility changes
- **Solution**: Change sequence to Visibility → State → Dynamic Loading
- **Benefit**: Content loads only when actually needed

### **4. No Container Dynamic Support**
- **Problem**: API only handles components, not containers
- **Solution**: Make API entity-agnostic (components AND containers)
- **Benefit**: Unified handling of all dynamic content

### **5. Inconsistent Data Structures**
- **Problem**: Different metadata formats between initial and dynamic loading
- **Solution**: Standardize metadata structure across all scenarios
- **Benefit**: Simplified debugging and maintenance

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

## 📋 Implementation Priority

### **Phase 1: Core Architecture Fixes**
1. Add dynamic content mode to page builder
2. Simplify API to route to page builder
3. Fix navigation sequence (visibility → state → dynamic loading)

### **Phase 2: Enhanced Features**
1. Add container dynamic loading support
2. Implement unified security model
3. Standardize metadata structures

### **Phase 3: Optimization**
1. Implement advanced caching strategies
2. Add performance monitoring
3. Optimize for large-scale deployments

---

This architecture provides a clean separation of concerns where each component has a single, well-defined responsibility, making the system maintainable, testable, and scalable.
