# 🏗️ Complete System Architecture & Ideal End-to-End Flows

This document outlines the complete system architecture philosophy and ideal flows for different scenarios, showing the complete journey from trigger to completion with file details, data structures, and logic explanations.

---

## 🎯 **System Design Philosophy**

### **📋 Core Architecture Principles:**

1. **🏗️ Dictionary-Driven Building**: All rendering flows through a unified dictionary structure processed by the builder
2. **🔒 Security-First Design**: `protected = true` automatically enforces `dynamic = true` 
3. **⚡ Event Handler Injection**: PHP adds event handlers directly to HTML (no DOMContentLoaded dependency)
4. **🎪 Universal Block Design**: All blocks (site/container/component) follow identical patterns
5. **🔄 Hash-Based Navigation**: Complete state management through URL hash changes
6. **🎨 CSS-Only Styling**: JavaScript never touches styles, only CSS variables
7. **🚀 Async Dynamic Loading**: Separate API calls for each dynamic component

### **🧱 Universal Block Architecture:**

**Every block (site/container/component) has:**
- ✅ **Init Function**: `init[BlockName][Type]()` - Called on DOM load + dynamic load
- ✅ **Handler Function**: `handle[BlockName]Navigation()` - Called by navigator with arguments
- ✅ **Unique Function Prefix**: Prevents naming conflicts across components
- ✅ **Dynamic/Static Flag**: Controls shell vs full rendering
- ✅ **Protected/Public Flag**: Controls authentication requirements
- ✅ **Page Source Metadata**: `data-page-source` for dynamic loading API targeting

### **📊 Dictionary Structure:**

```javascript
{
    metadata: { pageSource: "education_page_t1.json", ... },
    layer_type: "site",
    objects: [
        {
            metadata: { pageSource: "education_page_t1.json", ... },
            layer_type: "container", // page-level container
            id: "education-main-container", // This becomes the "page-id" in hash
            objects: [
                {
                    metadata: { pageSource: "education_page_t1.json", ... }, 
                    layer_type: "component",
                    id: "certifications-component",
                    data: {...},
                    dynamic: true,  // Set by security rules
                    protected: true // Triggers dynamic=true
                }
            ]
        }
    ]
}
```

### **🔗 Hash Navigation Format:**

```
#page-id/component-id:arg1=value1,arg2=value2/component-id2:arg3=value3
```

**Examples:**
- `#education-main-container/visible.education` - Show education page, set to visible state
- `#projects-main-container/project-details:project=portfolio-website/visible.projects` - Show projects page, load specific project, set visible
- `#admin-main-container/admin-controls:mode=edit,section=users/visible.admin` - Protected admin access with parameters

**Key Points:**
- **page-id** = outermost container ID from page JSON definition
- **component-id** = any container/component ID within the visible page
- **arguments** = passed to component's handler function via navigator
- **state** = visibility state for the component/container

### **🔒 Security Model:**

1. **Automatic Security Enforcement**:
   - `index.php` scans all objects during dictionary assembly
   - Any `protected: true` → automatically sets `dynamic: true`
   - Builder always renders protected content as shells initially

2. **Dynamic Loading Security**:
   - API endpoint validates authentication before content generation
   - Protected + authenticated → `dynamic: false` (return full content)
   - Protected + unauthenticated → `dynamic: true` (return shell/error)
   - Non-protected → `dynamic: false` (return full content)

3. **Logout Security**:
   - Site block auth functions remove all protected content HTML
   - Redirect to first page automatically
   - Replace protected element innerHTML with "Please authenticate" message
   - Clear any cached protected content

### **🎨 Theme System:**

- **CSS Variables Only**: `--primary-color`, `--font-size-large`, `--spacing-medium`
- **Site Block Defines**: Global theme variables at `:root` level
- **Components Use**: Same variable names in their CSS files
- **Theme Switch**: JavaScript changes CSS variable values, components update automatically
- **No JS Styling**: JavaScript never manipulates styles directly

---

## 🌟 Scenario 1: Initial Website Load ✅ **UPDATED: Dictionary-Driven Architecture**

### **Complete Flow Steps:**

1. **User visits** → `http://localhost/portfolio?profile=ml_mlops`
2. **Entry Point** → `index.php`
3. **Profile Resolution** → `definitions/entry.json` (simplified structure)
4. **Dictionary Assembly** → Profile → Site → Pages (new unified process)
5. **Security Enforcement** → `protected = true` → `dynamic = true`
6. **Builder Execution** → `builders/builder_t1.php` with dictionary input
7. **Object Processing** → Unified object array (flattened from all pages)
8. **Component Loading** → Multiple `blocks/components/*/loader*.php`
9. **Container Loading** → Multiple `blocks/containers/*/loader*.php`
10. **Site Template** → `blocks/sites/top_bar/type_2/top_bar_site_loader_t2.php`
11. **Browser Response** → Complete HTML document

### **Detailed File Processing:**

#### **Step 1-3: Entry Point & Profile Resolution (`index.php`)**
- **Input**: `$_GET['profile'] = 'ml_mlops'`
- **Logic** ✅ **UPDATED**: 
  - Reads simplified entry configuration (no parameters, builders list, default_builder)
  - Validates profile exists in available profiles
  - Extracts builder file from profile configuration
  - **NEW**: Calls `assembleDictionary()` function for unified data preparation
  - Creates builder instance
- **Output**: Calls `$builder->build('ml_mlops_t1.json')`

```php
// Input Data
$_GET = ['profile' => 'ml_mlops'];

// Processing Logic
$entryConfig = json_decode(file_get_contents('definitions/entry.json'), true);
$profileConfig = $entryConfig['profiles']['ml_mlops'];
$builderFile = $profileConfig['builder'];

// Output Data  
$builder = new PortfolioBuilder();
echo $builder->build('ml_mlops_t1.json');
```

#### **Step 3: Entry Configuration (`definitions/entry.json`)**
- **Input**: Profile key `'ml_mlops'`
- **File Content**:
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
- **Logic**: Maps profile keys to configuration objects
- **Output**: Profile configuration object with file path

#### **Step 4: Builder Initialization (`builders/builder_t1.php`)**
- **Input**: Profile filename `'ml_mlops_t1.json'`
- **Logic**:
  - Sets base paths for definitions and blocks
  - Loads profile JSON file
  - Extracts site configuration from external file
  - Processes each page in pages array
  - Assembles final site with page content
- **Output**: Complete HTML document

```php
// Input Data
$profileName = 'ml_mlops_t1.json';

// Processing Logic
$profileConfig = $this->loadJson($this->definitionsPath . '/profiles/' . $profileName);
$siteName = $profileConfig['site']; // Site config filename
$siteConfig = $this->loadJson($this->definitionsPath . '/sites/' . $siteName);
$pages = $profileConfig['pages']; // Array of page files
$pageContent = $this->buildPages($pages);
$result = $this->loadSiteBlock($siteConfig, $pageContent);

// Output Data
return $result; // Complete HTML document
```

#### **Step 5: Profile Loading (`definitions/profiles/ml_mlops_t1.json`)**
- **Input**: None (file read)
- **File Content**:
```json
{
  "site": "top_bar_site_t2.json",
  "pages": [
    "summary_page_t1.json",
    "skills_page_t1.json", 
    "projects_page_t1.json",
    "experience_page_t1.json",
    "education_page_t1.json",
    "control_page_t1.json",
    "project_details_page_t1.json"
  ]
}
```
- **Logic**: Defines which site template and pages to include
- **Output**: Site configuration string and pages array

#### **Step 6: Site Configuration (`definitions/sites/top_bar_site_t2.json`)**
- **Input**: None (file read)
- **File Content**:
```json
{
  "type": "top_bar/type_2",
  "branding": { "title": "Portfolio" },
  "navigation": {
    "defaultNavigation": { "hash": "summary-main-container/visible.about" },
    "tabs": [
      {
        "label": "About", "target": "summary-main-container",
        "tabId": "about", "state": "visible"
      },
      {
        "label": "Skills", "target": "skills-main-container", 
        "tabId": "skills", "state": "visible"
      }
    ]
  }
}
```
- **Logic**: Defines navigation structure and site-wide configuration
- **Output**: Navigation tabs array, default navigation hash, branding

#### **Step 7: Page Assembly (Multiple `definitions/pages/*.json`)**
- **Input**: Array of page filenames
- **Example File** (`summary_page_t1.json`):
```json
{
  "objects": [
    {
      "type": "container",
      "component": "vertical/type_1", 
      "id": "summary-main-container",
      "navigation": {
        "defaultState": "visible",
        "allowedStates": ["visible", "hidden", "scrollTo"]
      },
      "objects": [
        {
          "type": "component",
          "component": "summaries/type_1",
          "id": "my-summary",
          "dynamic": false,
          "variant": "main",
          "data": {
            "main": {
              "title": "Professional Summary",
              "expertise": [...]
            }
          }
        }
      ]
    }
  ]
}
```
- **Logic**: 
  - Loops through each page file
  - Loads JSON and processes objects array
  - Detects flat vs nested structure
  - Calls appropriate building method
- **Output**: Concatenated HTML content from all pages

#### **Step 8: Component Loading (Example: `blocks/components/summaries/type_1/summary_loader_t1.php`)**
- **Input**: 
```php
$id = 'my-summary';
$title = 'Professional Summary';
$navigationConfig = ['defaultState' => 'visible', 'allowedStates' => [...]];
$loadingMode = 'full'; // dynamic=false
$componentMetadata = [
  'componentSpec' => 'summaries/type_1',
  'componentId' => 'my-summary', 
  'componentData' => ['title' => 'Professional Summary', 'expertise' => [...]],
  'pageDefinition' => 'summary_page_t1.json'
];
```
- **Logic**:
  - Detects loading mode (full/shell/content)
  - Loads HTML template file
  - Processes navigation configuration
  - Injects component data into template
  - Adds navigation attributes and state classes
- **Output**: Complete component HTML with navigation setup

```php
// Processing Logic
switch ($loadingMode) {
  case 'full':
    return $this->generateFullComponent($id, $componentData, $navConfig);
  case 'shell': 
    return $this->generateShell($id, $navConfig, $componentMetadata);
  case 'content':
    return $this->generateContent($componentData);
}

// Output Structure
$html = file_get_contents(__DIR__ . '/summary_structure_t1.html');
$html = $this->fillTemplate($html, $id, $componentData, $navConfig);
return $html; // Complete component HTML
```

#### **Step 9: Container Loading (`blocks/containers/vertical/type_1/vertical_loader_t1.php`)**
- **Input**:
```php
$id = 'summary-main-container';
$childrenHtml = ['<div class="summary-component">...</div>']; // Array of child HTML
$navigationConfig = ['defaultState' => 'visible', 'allowedStates' => [...]];
```
- **Logic**:
  - Loads container HTML template
  - Combines all children HTML content
  - Replaces children placeholder in template
  - Adds navigation configuration and ID
  - Applies default state styling
  - Includes container-specific scripts
- **Output**: Container HTML wrapping all children

```php
// Processing Logic
$template = file_get_contents(__DIR__ . '/vertical_structure_t1.html');
$childrenContent = implode("\n", $childrenHtml);
$html = str_replace('<!-- CHILDREN_PLACEHOLDER -->', $childrenContent, $template);
$html = $this->addNavigationAttributes($html, $id, $navigationConfig);

// Output Structure
return $html; // Container with embedded children and navigation setup
```

#### **Step 10: Site Template (`blocks/sites/top_bar/type_2/top_bar_site_loader_t2.php`)**
- **Input**:
```php
$navigationTabs = [
  ['label' => 'About', 'target' => 'summary-main-container', 'tabId' => 'about'],
  ['label' => 'Skills', 'target' => 'skills-main-container', 'tabId' => 'skills']
];
$title = 'Portfolio';
$pageContent = '<div class="vertical-container" id="summary-main-container">...</div>';
$defaultNavigation = ['hash' => 'summary-main-container/visible.about'];
```
- **Logic**:
  - Loads site HTML template
  - Generates navigation HTML from tabs array
  - Injects title, navigation, and page content
  - Adds default navigation configuration
  - Includes site-wide scripts and styles
- **Output**: Complete HTML document

```php
// Processing Logic
$template = file_get_contents(__DIR__ . '/top_bar_site_structure_t2.html');
$navigationHtml = $this->generateNavigationTabs($navigationTabs);
$html = str_replace('<!-- NAVIGATION_TABS_PLACEHOLDER -->', $navigationHtml, $template);
$html = str_replace('<!-- PAGE_CONTENT_PLACEHOLDER -->', $pageContent, $html);

// Output Structure
return $html; // Complete website HTML
```

#### **Step 11: Final Browser Response**
- **Input**: Complete HTML document from site loader
- **Output**: Fully rendered website with:
  - Navigation system initialized
  - All components in appropriate states (visible/hidden)
  - Dynamic components showing shells only
  - Client-side scripts loaded and ready

---

## 🔄 Scenario 2: Dynamic Content Loading (User Navigation)

### **Complete Flow Steps:**

1. **User clicks navigation** → "Experience" tab
2. **Hash Change** → `#experience-main-container/visible.experience`
3. **Global Navigator** → Parse hash and validate
4. **Navigation Execution** → Apply visibility changes
5. **State Management** → Call local navigation handlers
6. **Dynamic Content Scan** → Find dynamic components in visible containers
7. **API Request** → `POST /endpoints/dynamic_content_t1.php`
8. **Component Loading** → Direct loader execution (bypassing builder)
9. **Content Response** → Return HTML content
10. **DOM Injection** → Insert content into component shells
11. **Post-Processing** → Initialize loaded components

### **Detailed File Processing:**

#### **Step 1-3: Navigation Trigger (`blocks/sites/top_bar/type_2/behaviors/global_navigator_t1.js`)**
- **Input**: Hash change event `#experience-main-container/visible.experience`
- **Logic**:
  - Parses hash format: `elementId/state.tabId`
  - Finds target element in DOM
  - Validates navigation permissions and allowed states
  - Creates navigation state map
- **Output**: Navigation state map for execution

```javascript
// Input Data
const hash = '#experience-main-container/visible.experience';

// Processing Logic
const [elementId, stateWithTab] = hash.substring(1).split('/');
const [state, tabId] = stateWithTab.split('.');
const targetElement = document.getElementById(elementId);
const navConfig = JSON.parse(targetElement.getAttribute('data-nav-config'));

// Output Data
const navigationState = new Map([
  ['experience-main-container', { state: 'visible', parameters: { tabId: 'experience' } }]
]);
```

#### **Step 4-5: Navigation Execution (3-Phase Process: `global_navigator_t1.js`)**
- **Input**: Navigation state map from hash parsing
- **Logic**: **CORRECT 3-PHASE ORDER**:
  1. **Visibility Control**: Show target page/components, hide previous (from localStorage)
  2. **Dynamic Loading**: Scan visible area for `data-dynamic="true"` blocks
  3. **Argument Passing**: Pass URL parameters to component handler functions
- **Output**: Fully navigated and loaded page state

```javascript
// IDEAL 3-Phase Navigation Implementation
async executeNavigation(hash) {
  // Parse hash into navigation state
  const navigationState = this.parseNavigationHash(hash);
  
  // PHASE 1: Visibility Control
  await this.applyVisibilityControl(navigationState);
  
  // PHASE 2: Dynamic Content Loading  
  await this.handleDynamicContentLoading(navigationState);
  
  // PHASE 3: Argument Passing
  await this.passArgumentsToComponents(navigationState);
  
  // Save current navigation to localStorage for next navigation
  localStorage.setItem('previousNavigation', hash);
}

// Phase 1: Visibility Control
async applyVisibilityControl(navigationState) {
  // Get previous navigation from localStorage
  const previousHash = localStorage.getItem('previousNavigation');
  
  // Hide previous page and reset components to default states
  if (previousHash) {
    this.resetPreviousNavigation(previousHash);
  }
  
  // Show target page (outermost container)
  const pageId = navigationState.pageId;
  const pageElement = document.getElementById(pageId);
  pageElement.classList.remove('nav-hidden');
  pageElement.classList.add('nav-visible');
  
  // Show specified components within visible page
  navigationState.components.forEach(({id, state}) => {
    const element = document.getElementById(id);
    if (element && pageElement.contains(element)) {
      element.classList.remove('nav-hidden');
      element.classList.add('nav-visible');
    }
  });
}

// Phase 2: Dynamic Loading (handled by separate dynamic loader)
async handleDynamicContentLoading(navigationState) {
  // Scan visible containers for dynamic components
  const pageElement = document.getElementById(navigationState.pageId);
  const dynamicElements = pageElement.querySelectorAll('[data-dynamic="true"]');
  
  // Load each dynamic component separately (async)
  const loadPromises = Array.from(dynamicElements).map(element => {
    return this.loadDynamicComponent(element);
  });
  
  await Promise.all(loadPromises);
}

// Phase 3: Argument Passing
async passArgumentsToComponents(navigationState) {
  navigationState.components.forEach(({id, arguments}) => {
    if (arguments && Object.keys(arguments).length > 0) {
      const element = document.getElementById(id);
      const handlerName = element.getAttribute('data-nav-handler');
      
      if (handlerName && typeof window[handlerName] === 'function') {
        window[handlerName](arguments);
      }
    }
  });
}
```

#### **Step 6: Dynamic Content Detection (`blocks/sites/top_bar/type_2/behaviors/top_bar_site_behavior_dynamic_content_t2.js`)**
- **Input**: Navigation state map with visible containers
- **Logic**:
  - Scans each visible container for `[data-dynamic="true"]` elements
  - Filters out already loaded content
  - Validates security permissions
  - Manages loading queue to prevent duplicates
- **Output**: List of dynamic components to load

```javascript
// Input Data
const navigationState = new Map([
  ['experience-main-container', { state: 'visible' }]
]);

// Processing Logic
navigationState.forEach((config, elementId) => {
  if (config.state === 'visible') {
    const container = document.getElementById(elementId);
    const dynamicComponents = container.querySelectorAll('[data-dynamic="true"]');
    dynamicComponents.forEach(component => {
      if (!component.getAttribute('data-loading-state')) {
        this.loadComponentContent(component);
      }
    });
  }
});

// Output Data
// Triggers loading for: component with id="my-experience" and data-dynamic="true"
```

#### **Step 7: API Request Preparation (`blocks/sites/top_bar/type_2/behaviors/dynamic_content_loader_t1.js`)**
- **Input**: Dynamic component DOM element with page source metadata
- **Logic**:
  - Extracts `data-page-source` attribute (added by index.php during dictionary assembly)
  - Gets component ID from element
  - Prepares separate API request for each dynamic component
  - Sets loading state to prevent duplicate requests
- **Output**: Individual HTTP POST request to API endpoint

```javascript
// Input Data - Page Source Metadata Added by index.php
const componentElement = document.getElementById('certifications-component');
const pageSource = componentElement.getAttribute('data-page-source'); // "education_page_t1.json"
const componentId = componentElement.id; // "certifications-component"
const isProtected = componentElement.getAttribute('data-protected') === 'true';

// Processing Logic - Separate API Call Per Component
const requestPayload = {
  componentId: componentId,           // "certifications-component"
  pageDefinition: pageSource,        // "education_page_t1.json" (from data-page-source)
  isSecured: isProtected,            // true/false
  requestType: 'component'           // component/page-container/full-page
};

// Output Data - Individual Async Request
fetch('endpoints/dynamic_content_t1.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestPayload)
});

// Multiple Components = Multiple Parallel Requests
// certifications-component → API call 1
// education-history → API call 2  
// projects-grid → API call 3
// All execute in parallel via Promise.all()
```

#### **Step 8: API Processing (`endpoints/dynamic_content_t1.php`)**
- **Input**: 
```json
{
  "componentId": "certifications-component",
  "pageDefinition": "education_page_t1.json", 
  "isSecured": true,
  "requestType": "component"
}
```
- **Logic**:
  1. **Load Page Definition**: Read specified page JSON file
  2. **Extract Component**: Find component by ID in objects array  
  3. **Security Validation**: Check authentication for protected components
  4. **Dynamic Flag Management**: Force `dynamic=false` for authenticated content
  5. **Builder Integration**: Create mini-dictionary and call builder
  6. **Full Content Generation**: Builder generates complete HTML with event handlers
- **Output**: JSON response with complete component HTML

```php
// IDEAL API Processing with Builder Integration
try {
    // Step 1: Load page definition
    $pageConfig = loadJsonFile(__DIR__ . '/../definitions/pages/' . $pageDefinition);
    
    // Step 2: Extract component objects
    $objects = [];
    if ($requestType === 'component') {
        $component = findComponentInObjects($pageConfig['objects'], $componentId);
        if ($component) {
            $objects = [$component];
        }
    }
    
    // Step 3: Security validation BEFORE builder call
    session_start();
    $authenticated = !empty($_SESSION['auth']) && $_SESSION['auth'] === true;
    
    foreach ($objects as $object) {
        $isProtected = !empty($object['protected']) || !empty($object['navigation']['protected']);
        
        if ($isProtected && !$authenticated) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Authentication required for protected content'
            ]);
            exit();
        }
    }
    
    // Step 4: Dynamic flag management
    foreach ($objects as &$object) {
        $isObjectProtected = !empty($object['protected']) || !empty($object['navigation']['protected']);
        
        if ($isObjectProtected) {
            $object['dynamic'] = $authenticated ? false : true; // Protected: full if authed, shell if not
        } else {
            $object['dynamic'] = false; // Non-protected: always full content
        }
        
        // Recursively handle nested objects (containers)
        if (isset($object['objects'])) {
            $object['objects'] = applyDynamicFlagManagement($object['objects'], $authenticated);
        }
    }
    
    // Step 5: Create mini-dictionary for builder
    $dictionary = [
        'site' => null, // No site wrapper for dynamic loading
        'objects' => $objects,
        'pageDefinition' => 'dynamic_' . $pageDefinition . '_' . $requestType . '_' . $componentId
    ];
    
    // Step 6: Use builder to generate content (same logic as initial load)
    $builder = new PortfolioBuilder(__DIR__ . '/..', false);
    $content = $builder->build($dictionary);
    
    // Step 7: Return successful response
    echo json_encode([
        'success' => true,
        'content' => $content,
        'componentId' => $componentId,
        'loadedAt' => time()
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load dynamic content: ' . $e->getMessage()
    ]);
}
```

#### **Step 9: Component Content Generation (`blocks/components/certifications/type_1/certifications_loader_t1.php`)**
- **Input**:
```php
$id = 'certifications-component';
$title = 'Professional Certifications';
$navigationConfig = [...];
$loadingMode = 'full'; // Dynamic loading uses 'full' mode, not 'content'
$componentMetadata = [
  'componentData' => ['certifications' => [...]]
];
```
- **Logic**: **NEW PHILOSOPHY - Complete HTML with Event Handlers**
  - Loads HTML template structure
  - Processes certifications data array into HTML cards
  - **PHP generates complete slideshow HTML** (all slides, pagination dots)
  - **PHP adds event handlers directly** (`onclick="showSlide(0)"`, `onclick="showNextSlide()"`)
  - Includes init hook for any auto-triggered behaviors
  - Returns complete, interactive component
- **Output**: Complete component HTML with embedded event handlers

```php
// NEW Processing Logic - Complete HTML Generation
switch ($loadingMode) {
  case 'full':
    return $this->generateFullComponent($id, $componentMetadata['componentData'], $navConfig, $componentMetadata);
}

private function generateFullComponent($id, $data, $navConfig, $componentMetadata) {
    $certificationsData = $data['certifications'] ?? [];
    
    // Load HTML template
    $template = file_get_contents(__DIR__ . '/certifications_structure_t1.html');
    
    // PHP GENERATES COMPLETE SLIDESHOW HTML
    $slidesHtml = '';
    foreach ($certificationsData as $index => $cert) {
        $activeClass = $index === 0 ? ' active' : '';
        $slidesHtml .= '<div class="certification-slide' . $activeClass . '" data-slide="' . $index . '">';
        $slidesHtml .= '<img src="' . htmlspecialchars($cert['image']) . '" alt="' . htmlspecialchars($cert['name']) . '">';
        $slidesHtml .= '<h3>' . htmlspecialchars($cert['name']) . '</h3>';
        $slidesHtml .= '<p class="issuer">' . htmlspecialchars($cert['issuer']) . '</p>';
        $slidesHtml .= '<p class="description">' . htmlspecialchars($cert['description']) . '</p>';
        if (!empty($cert['link'])) {
            $slidesHtml .= '<a href="' . htmlspecialchars($cert['link']) . '" target="_blank">View Certificate</a>';
        }
        $slidesHtml .= '</div>';
    }
    
    // PHP GENERATES PAGINATION WITH EVENT HANDLERS
    $paginationHtml = '';
    foreach ($certificationsData as $index => $cert) {
        $activeClass = $index === 0 ? ' active' : '';
        $paginationHtml .= '<button class="pagination-dot' . $activeClass . '" ';
        $paginationHtml .= 'onclick="showCertificationsSlide(' . $index . ')" ';
        $paginationHtml .= 'data-slide="' . $index . '"></button>';
    }
    
    // PHP GENERATES NAVIGATION BUTTONS WITH EVENT HANDLERS
    $prevButton = '<button class="certifications__nav-prev" onclick="showPreviousCertification()">';
    $prevButton .= '<ion-icon name="chevron-back-outline"></ion-icon></button>';
    
    $nextButton = '<button class="certifications__nav-next" onclick="showNextCertification()">';
    $nextButton .= '<ion-icon name="chevron-forward-outline"></ion-icon></button>';
    
    // Replace placeholders in template
    $html = str_replace('<!-- SLIDES_PLACEHOLDER -->', $slidesHtml, $template);
    $html = str_replace('<!-- PAGINATION_PLACEHOLDER -->', $paginationHtml, $html);
    $html = str_replace('<!-- PREV_BUTTON -->', $prevButton, $html);
    $html = str_replace('<!-- NEXT_BUTTON -->', $nextButton, $html);
    
    // Add component ID, navigation config, and init hook
    $html = str_replace('<div class="certifications-component">',
        '<div class="certifications-component" id="' . htmlspecialchars($id) . '" 
         data-nav-handler="handleCertificationsNavigation" 
         data-nav-config="' . htmlspecialchars(json_encode($navConfig)) . '" 
         data-init-hook="initCertificationsT1">', 
        $html);
    
    return $html; // Complete interactive component
}

// Output Structure - Complete Component with Event Handlers
return '<div class="certifications-component" id="certifications-component" data-init-hook="initCertificationsT1">
    <div class="slides-container">
        <div class="certification-slide active" data-slide="0">...</div>
        <div class="certification-slide" data-slide="1">...</div>
    </div>
    <div class="pagination">
        <button onclick="showCertificationsSlide(0)" class="pagination-dot active"></button>
        <button onclick="showCertificationsSlide(1)" class="pagination-dot"></button>
    </div>
    <button onclick="showPreviousCertification()">Previous</button>
    <button onclick="showNextCertification()">Next</button>
</div>';
```

#### **Step 10: Component Replacement (Back to `dynamic_content_loader_t1.js`)**
- **Input**: 
```json
{
  "success": true,
  "content": "<div class=\"certifications-component\" id=\"certifications-component\" data-init-hook=\"initCertificationsT1\">...</div>",
  "componentId": "certifications-component"
}
```
- **Logic**: **NEW APPROACH - Complete Component Replacement**
  - Validates response success
  - Finds original shell component by ID
  - **Replaces entire component** (not just inner content)
  - Sets loading state to 'loaded'
  - No caching for protected content
- **Output**: Complete interactive component replaces shell

```javascript
// Input Processing
const response = await fetch('endpoints/dynamic_content_t1.php', {...});
const data = await response.json();

// COMPLETE COMPONENT REPLACEMENT (Not content injection)
const shellElement = document.getElementById(data.componentId);
const parentContainer = shellElement.parentNode;

// Create new element from complete HTML
const tempDiv = document.createElement('div');
tempDiv.innerHTML = data.content;
const newComponent = tempDiv.firstElementChild;

// Replace shell with complete component
parentContainer.replaceChild(newComponent, shellElement);
newComponent.setAttribute('data-loading-state', 'loaded');

// Output State
// Shell completely replaced with full interactive component
// Event handlers already attached by PHP (onclick attributes)
// No need for event listener attachment
```

#### **Step 11: Post-Processing & Initialization (Same file: `dynamic_content_loader_t1.js`)**
- **Input**: Newly loaded complete component with embedded event handlers
- **Logic**:
  - **Execute embedded scripts** (CSS/JS files in component)
  - **Call init hook** if defined (for auto-triggered behaviors only)
  - **Apply theme classes** if needed
  - **Dispatch load event** for other components to react
- **Output**: Fully functional, interactive component

```javascript
// Post-Processing Logic
const newComponent = document.getElementById(data.componentId);

// 1. Execute embedded scripts (CSS/JS files)
const scripts = newComponent.querySelectorAll('script[src]');
scripts.forEach(script => {
  if (script.src && !document.querySelector(`script[src="${script.src}"]`)) {
    // Load external script if not already loaded
    const newScript = document.createElement('script');
    newScript.src = script.src;
    document.head.appendChild(newScript);
  }
});

// 2. Call initialization hook (for auto-triggered behaviors)
const initHook = newComponent.getAttribute('data-init-hook');
if (initHook && typeof window[initHook] === 'function') {
  window[initHook](); // Call init function (e.g., initCertificationsT1())
}

// 3. Dispatch load event
newComponent.dispatchEvent(new CustomEvent('component:dynamicLoaded', {
  detail: { 
    componentId: data.componentId,
    loadedAt: data.loadedAt
  }
}));

// Output State
// Component is fully loaded and interactive
// Event handlers work immediately (onclick attributes from PHP)
// Init function called for any auto-behaviors (timers, auto-slideshow, etc.)
// No DOMContentLoaded dependency - everything works instantly
```

---

## 🏗️ Scenario 3: Ideal Dynamic Loading (With Builder Integration)

### **Complete Flow Steps:**

1. **User Navigation** → Same as Scenario 2 (Steps 1-6)
2. **API Request** → `POST /endpoints/dynamic_content_t1.php`
3. **Builder Delegation** → `PortfolioBuilder->buildEntity()`
4. **Entity Resolution** → Find component/container in page definition
5. **Dynamic Building** → Use existing builder logic with 'content' mode
6. **Content Response** → Return generated content
7. **DOM Injection** → Same as Scenario 2 (Steps 10-11)

### **Key Differences from Current Implementation:**

#### **Step 3: Simplified API (`endpoints/dynamic_content_t1.php` - IDEAL)**
- **Input**: Same request payload
- **Logic**:
  - Validates request parameters only
  - Creates builder instance
  - Delegates all processing to builder
  - Returns builder response
- **Output**: Same JSON response

```php
// Simplified API Logic (IDEAL)
require_once '../builders/builder_t1.php';

// Validate input only
$componentId = $requestData['componentId'];
$pageDefinition = $requestData['pageDefinition'];

// Delegate to builder
$builder = new PortfolioBuilder();
$content = $builder->buildEntity($pageDefinition, $componentId, 'content');

// Return response
echo json_encode([
  'success' => true,
  'content' => $content,
  'componentId' => $componentId
]);
```

#### **Step 4: Builder Entity Mode (`builders/builder_t1.php` - NEW METHOD)**
- **Input**:
```php
$pageDefinition = 'experience_page_t1.json';
$entityId = 'my-experience';
$mode = 'content';
```
- **Logic**:
  - Loads page definition JSON
  - Finds entity by ID (component or container)
  - Determines entity type and calls appropriate method
  - Uses existing loading logic with specified mode
- **Output**: HTML content for the specific entity

```php
// New Method Implementation
public function buildEntity($pageDefinition, $entityId, $mode = 'content') {
  // Load page definition
  $pageConfig = $this->loadJson($this->definitionsPath . '/pages/' . $pageDefinition);
  
  // Find entity in objects array
  $entity = $this->findEntityById($pageConfig['objects'], $entityId);
  
  if (!$entity) {
    throw new Exception("Entity not found: $entityId");
  }
  
  // Build entity based on type
  if ($entity['type'] === 'component') {
    return $this->loadComponentWithMode($entity, $mode);
  } elseif ($entity['type'] === 'container') {
    return $this->loadContainerWithMode($entity, $mode);
  }
}

private function loadComponentWithMode($object, $mode) {
  // Use existing loadComponent logic but force the specified mode
  // This reuses all existing validation, security, metadata logic
  return $this->loadComponent($object, $mode);
}
```

### **Benefits of Ideal Implementation:**

1. **Code Deduplication**: API becomes 10-15 lines instead of 240+
2. **Consistency**: Same logic for initial and dynamic loading
3. **Maintainability**: Single source of truth for all building logic
4. **Security**: Same security model across all scenarios
5. **Extensibility**: Container dynamic loading becomes trivial to add

---

## 🔒 Scenario 4: Protected Content Loading

### **Complete Flow Steps:**

1. **Authentication Check** → Validate user session
2. **Protected Navigation** → Access admin-only sections
3. **Security Validation** → Multiple security checkpoints
4. **Protected API Call** → Enhanced security validation
5. **Secured Content** → Return protected content with security metadata

### **Detailed Processing:**

#### **Step 1: Authentication Validation (`blocks/sites/top_bar/type_2/behaviors/global_navigator_t1.js`)**
- **Input**: Navigation to protected element
```javascript
const targetElement = document.getElementById('admin-main-container');
const isProtected = targetElement.getAttribute('data-protected') === 'true';
```
- **Logic**:
  - Checks `data-protected="true"` attribute
  - Validates authentication status via `window.authManager`
  - Blocks navigation if not authenticated
- **Output**: Permits or denies navigation

```javascript
// Security Check Logic
if (isProtected) {
  const isAuthenticated = window.authManager && window.authManager.isAuthenticated;
  if (!isAuthenticated) {
    console.warn('Access denied to protected element:', elementId);
    return false; // Block navigation
  }
}
```

#### **Step 2: Protected API Request (Enhanced `endpoints/dynamic_content_t1.php`)**
- **Input**: Request with `isSecured: true` hint
- **Logic**:
  - Validates component protection status from page definition
  - Starts PHP session for authentication check
  - Verifies `$_SESSION['auth'] === true`
  - Returns 401 Unauthorized if not authenticated
- **Output**: Protected content or authentication error

```php
// Enhanced Security Logic
$isProtected = !empty($componentObject['protected']) || 
               (!empty($componentObject['navigation']['protected']));

if ($isProtected) {
  session_start();
  $authenticated = !empty($_SESSION['auth']) && $_SESSION['auth'] === true;
  
  if (!$authenticated) {
    http_response_code(401);
    echo json_encode([
      'success' => false,
      'error' => 'Unauthorized access to protected component'
    ]);
    exit();
  }
}
```

#### **Step 3: Protected Content Response**
- **Input**: Authenticated request for protected component
- **Logic**: Same as regular content loading but with additional security metadata
- **Output**: Content with security markers

```json
{
  "success": true,
  "content": "<div class=\"admin-placeholder\">...</div>",
  "componentId": "admin-placeholder", 
  "secured": true,
  "timestamp": 1234567890
}
```

---

## 🔒 Scenario 5: Logout Security Handling

### **Complete Flow Steps:**

1. **User Logout** → Click logout button or session expires
2. **Authentication Cleanup** → Clear session and local storage
3. **Protected Content Removal** → Remove all protected component HTML
4. **Navigation Reset** → Redirect to first page automatically
5. **Placeholder Injection** → Show "Please authenticate" in protected elements
6. **State Persistence** → Maintain theme and non-protected preferences

### **Detailed Processing:**

#### **Step 1-2: Logout Trigger (`blocks/sites/top_bar/type_2/behaviors/auth_manager_t2.js`)**
- **Input**: Logout button click or session expiration detection
- **Logic**:
  - Clear PHP session via API call
  - Clear localStorage authentication state
  - Clear any cached protected content
  - Update global authentication status
- **Output**: User in unauthenticated state

```javascript
// Logout Processing
async function handleLogout() {
  try {
    // Clear server-side session
    await fetch('endpoints/auth_logout.php', { method: 'POST' });
    
    // Clear client-side authentication state
    localStorage.removeItem('authToken');
    localStorage.removeItem('userSession');
    window.authManager.isAuthenticated = false;
    
    // Clear protected content cache
    this.clearProtectedContentCache();
    
    // Trigger security cleanup
    this.handleSecurityCleanup();
    
  } catch (error) {
    console.error('Logout error:', error);
    // Force cleanup even if API fails
    this.handleSecurityCleanup();
  }
}
```

#### **Step 3: Protected Content Removal (Same file: `auth_manager_t2.js`)**
- **Input**: List of all protected elements in DOM
- **Logic**:
  - Scan entire DOM for `[data-protected="true"]` elements
  - Remove HTML content from protected components
  - Replace with authentication placeholder message
  - Maintain element structure for future re-authentication
- **Output**: Protected elements showing placeholder content

```javascript
// Security Cleanup Logic
handleSecurityCleanup() {
  // Find all protected elements
  const protectedElements = document.querySelectorAll('[data-protected="true"]');
  
  protectedElements.forEach(element => {
    // Store original loading state for restoration
    const originalState = element.getAttribute('data-loading-state');
    
    // Clear protected content
    element.innerHTML = this.generateAuthPlaceholder(element.id);
    
    // Mark as requiring authentication
    element.setAttribute('data-loading-state', 'auth-required');
    element.setAttribute('data-dynamic', 'true'); // Force dynamic loading on re-auth
    
    // Add visual indicator
    element.classList.add('auth-required');
  });
}

generateAuthPlaceholder(componentId) {
  return `
    <div class="auth-placeholder">
      <div class="auth-placeholder__icon">
        <ion-icon name="lock-closed-outline"></ion-icon>
      </div>
      <div class="auth-placeholder__message">
        <h3>Authentication Required</h3>
        <p>Please log in to view this content.</p>
        <button onclick="showLoginModal()" class="auth-placeholder__button">
          Log In
        </button>
      </div>
    </div>
  `;
}
```

#### **Step 4: Navigation Reset (Same file: `auth_manager_t2.js`)**
- **Input**: Current navigation hash (may contain protected pages)
- **Logic**:
  - Check if current page is protected
  - Get first page from site configuration
  - Force navigation to first public page
  - Clear navigation history of protected pages
- **Output**: User redirected to safe public page

```javascript
// Navigation Reset Logic
handleNavigationReset() {
  const currentHash = window.location.hash;
  const currentPageId = this.extractPageIdFromHash(currentHash);
  
  // Check if current page is protected
  const currentPageElement = document.getElementById(currentPageId);
  const isCurrentPageProtected = currentPageElement?.getAttribute('data-protected') === 'true';
  
  if (isCurrentPageProtected) {
    // Get first public page from site config
    const firstPublicPage = this.getFirstPublicPage();
    
    // Force navigation to safe page
    window.location.hash = `#${firstPublicPage}/visible.${firstPublicPage.replace('-main-container', '')}`;
    
    // Clear protected navigation history
    localStorage.removeItem('previousNavigation');
  }
}

getFirstPublicPage() {
  // Scan site navigation for first non-protected page
  const navTabs = document.querySelectorAll('[data-nav-target]');
  
  for (const tab of navTabs) {
    const targetId = tab.getAttribute('data-nav-target');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement && targetElement.getAttribute('data-protected') !== 'true') {
      return targetId;
    }
  }
  
  // Fallback to summary page
  return 'summary-main-container';
}
```

#### **Step 5-6: State Persistence & Theme Maintenance**
- **Input**: Current theme and non-protected user preferences
- **Logic**:
  - Preserve theme selection (not security-related)
  - Maintain non-protected component states
  - Keep navigation preferences for public content
  - Clear only authentication-related data
- **Output**: User maintains non-security preferences

```javascript
// State Persistence Logic
clearProtectedContentCache() {
  // Clear only protected content from localStorage
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('protected_') || 
        key.startsWith('auth_') || 
        key.includes('admin_')) {
      localStorage.removeItem(key);
    }
  });
  
  // Preserve theme and public preferences
  // localStorage items like 'theme', 'language', 'publicNavHistory' remain intact
}

// Re-authentication Hook
onReAuthentication() {
  // When user logs back in, restore protected content
  const protectedElements = document.querySelectorAll('[data-loading-state="auth-required"]');
  
  protectedElements.forEach(element => {
    // Reset to dynamic state for fresh loading
    element.setAttribute('data-loading-state', 'not-loaded');
    element.setAttribute('data-dynamic', 'true');
    element.classList.remove('auth-required');
    
    // Clear placeholder content
    element.innerHTML = '<div class="loading-indicator">Loading...</div>';
  });
  
  // Trigger dynamic loading for all protected components
  this.loadProtectedContent();
}
```

---

## 🎯 **Implementation Divergence Analysis**

### **❌ Current Issues vs Ideal Design:**

1. **Data Injection Complexity**: 
   - **Current**: Complex JavaScript data injection with timing issues
   - **Ideal**: PHP generates complete HTML with embedded event handlers

2. **Event Handler Attachment**:
   - **Current**: DOMContentLoaded dependency breaks dynamic loading
   - **Ideal**: PHP adds onclick attributes directly to HTML

3. **Component Replacement**:
   - **Current**: Content injection into shell containers
   - **Ideal**: Complete component replacement (shell → full component)

4. **Initialization Hooks**:
   - **Current**: Inconsistent init function naming and calling
   - **Ideal**: Standardized `init[ComponentName][Type]()` with data-init-hook

5. **Page Source Metadata**:
   - **Current**: Missing `_pageSource` metadata for dynamic API targeting
   - **Ideal**: `index.php` adds `data-page-source` to all components

6. **Security Model**:
   - **Current**: Manual dynamic flag management
   - **Ideal**: Automatic `protected = true` → `dynamic = true` enforcement

7. **Navigation Flow**:
   - **Current**: Wrong order (dynamic loading before visibility)
   - **Ideal**: 3-phase process (visibility → dynamic loading → arguments)

8. **Builder Integration**:
   - **Current**: API bypasses builder, duplicates logic
   - **Ideal**: API delegates to builder for consistency

### **✅ Correct Current Elements:**

1. **Dictionary Structure**: Builder processes nested objects correctly
2. **Security Validation**: API validates authentication properly
3. **Dynamic Flag Switching**: API flips dynamic flags for authenticated users
4. **Component Metadata**: Proper metadata passing to loaders

---

This comprehensive flow documentation provides clear, scenario-based guidance for understanding both current and ideal implementations, making it easier to plan and execute the architectural improvements.
