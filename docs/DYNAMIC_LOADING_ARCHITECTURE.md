# 🏗️ Dynamic Loading Architecture & Replication Guide

## 📋 **Overview**

Dynamic loading allows components to be rendered as **shells** initially, then **replaced** with full content via AJAX. This enables:
- 🔐 **Protected content** requiring authentication
- ⚡ **Faster initial page loads** (shells load instantly)
- 🔄 **On-demand content loading**
- 🎯 **Conditional rendering** based on user state

---

## 🔄 **Complete Flow Architecture**

### **Phase 1: Initial Page Load (Static Build)**

```
index.php → entry.json → profile.json → page.json → builder_t1.php → component_loader.php
```

1. **`index.php`** reads entry, profile, and page configurations
2. **Dictionary Assembly**: All page objects flattened into unified array
3. **Security Enforcement**: `protected = true` automatically sets `dynamic = true`
4. **Builder Processing**: Loops through dictionary, calls component loaders
5. **Loader Decision**: 
   - `dynamic = false` → **Full Component** (HTML + data + behavior)
   - `dynamic = true` → **Shell Only** (HTML structure + metadata)

### **Phase 2: Runtime Dynamic Loading**

```
Navigation → Page Visibility → Dynamic Scan → API Request → Authentication → Builder → Component Replacement
```

1. **Navigation Trigger**: Hash change detected by `global_navigator_t1.js`
2. **Page Visibility**: `top_bar_site_behavior_dynamic_content_t2.js` makes page visible
3. **Dynamic Scan**: `dynamic_content_loader_t1.js` scans for `data-dynamic="true"`
4. **API Request**: POST to `endpoints/dynamic_content_t1.php` with component/page info
5. **Authentication Check**: Session validation adjusts `dynamic` flags
6. **Content Generation**: Builder creates full content with data injection
7. **Component Replacement**: JavaScript replaces shell with populated component

---

## 🎯 **Certifications Component Example**

### **📁 File Structure**
```
blocks/components/certifications/type_1/
├── certifications_structure_t1.html    # HTML template
├── certifications_style_t1.css         # Styles
├── certifications_behavior_t1.js       # JavaScript behavior
└── certifications_loader_t1.php        # PHP loader logic
```

### **🔧 PHP Loader (`certifications_loader_t1.php`)**

#### **Key Methods:**
- **`load()`**: Main entry point, switches between `shell`/`content`/`full`
- **`generateShell()`**: Creates empty shell with metadata
- **`generateFullComponent()`**: Creates populated component with data injection

#### **Critical Dynamic Features:**

1. **Shell Generation** (`generateShell()`):
```php
// Adds dynamic markers and metadata
$html = str_replace('<div class="certifications-component">',
    '<div class="certifications-component ' . $stateClass . '" 
     id="' . $id . '" 
     data-nav-handler="handleCertificationsNavigation" 
     data-nav-config="' . $navConfigJson . '" 
     data-init-hook="initializeCertifications"
     data-dynamic="true" 
     data-load-state="not-loaded" 
     data-component-metadata="' . $metadataJson . '">', 
    $template);
```

2. **Data Injection** (`generateFullComponent()`):
```php
// Injects data script INSIDE component container
$dataScript = $this->injectDataScript($certificationsData);
$lastDivPos = strrpos($html, '</div>');
$html = substr_replace($html, $dataScript . '</div>', $lastDivPos, 6);
```

3. **Data Script Generation** (`injectDataScript()`):
```php
$script = '<script>';
$script .= 'if (typeof window.setCertificationsData === "function") {';
$script .= '    window.setCertificationsData(' . json_encode($data) . ');';
$script .= '}';
$script .= '</script>';
```

### **🎭 JavaScript Behavior (`certifications_behavior_t1.js`)**

#### **Global State Management:**
```javascript
// Prevent conflicts with multiple script loads
window.certificationsData = window.certificationsData || [];
window.currentSlideIndex = window.currentSlideIndex || 0;
```

#### **Key Functions:**

1. **Initialization Hook:**
```javascript
function initializeCertifications() {
    // Called automatically when component loads
    if (window.certificationsData.length > 0) {
        renderCertificationsSlideshow();
    } else {
        showEmptyState();
    }
}
```

2. **Data Setter (Global):**
```javascript
function setCertificationsData(data) {
    window.certificationsData = data || [];
    // Auto-render if component already exists
    if (document.getElementById('certifications-slide-container')) {
        renderCertificationsSlideshow();
    }
}
// CRITICAL: Make function globally accessible
window.setCertificationsData = setCertificationsData;
```

### **🏗️ HTML Structure (`certifications_structure_t1.html`)**

#### **Single Root Container:**
```html
<div class="certifications-component">
    <link rel="stylesheet" href="blocks/components/certifications/type_1/certifications_style_t1.css">
    
    <!-- Component content here -->
    
    <script src="blocks/components/certifications/type_1/certifications_behavior_t1.js"></script>
</div>
```

**⚠️ CRITICAL**: All `<link>`, `<script>`, and content must be wrapped in **single root container** for proper replacement.

---

## 🚀 **Replication Checklist for Other Components**

### **✅ PHP Loader Requirements**

#### **1. Support Three Loading Modes:**
```php
switch ($loadingMode) {
    case 'shell':
        return $this->generateShell($id, $navConfig, $componentMetadata);
    case 'content':
        return $this->generateContent($componentData);
    case 'full':
    default:
        return $this->generateFullComponent($id, $componentData, $navConfig, $componentMetadata);
}
```

#### **2. Shell Generation with Dynamic Markers:**
```php
private function generateShell($id, $navConfig, $componentMetadata) {
    $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
    $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
    
    // Add required dynamic attributes
    $html = str_replace('<div class="COMPONENT-component">',
        '<div class="COMPONENT-component ' . $stateClass . '" 
         id="' . htmlspecialchars($id) . '" 
         data-nav-handler="handleCOMPONENTNavigation" 
         data-nav-config="' . $navConfigJson . '" 
         data-init-hook="initializeCOMPONENT"
         data-dynamic="true" 
         data-load-state="not-loaded" 
         data-component-metadata="' . $metadataJson . '">', 
        $template);
    
    return $html;
}
```

#### **3. Data Injection Inside Container:**
```php
private function generateFullComponent($id, $data, $navConfig, $componentMetadata) {
    // ... HTML generation ...
    
    // CRITICAL: Inject data script INSIDE container
    $dataScript = $this->injectDataScript($componentData);
    $lastDivPos = strrpos($html, '</div>');
    if ($lastDivPos !== false) {
        $html = substr_replace($html, $dataScript . '</div>', $lastDivPos, 6);
    }
    
    return $html;
}

private function injectDataScript($data) {
    $script = '<script>';
    $script .= 'if (typeof window.setCOMPONENTData === "function") {';
    $script .= '    window.setCOMPONENTData(' . json_encode($data) . ');';
    $script .= '}';
    $script .= '</script>';
    return $script;
}
```

### **✅ JavaScript Behavior Requirements**

#### **1. Global State Management:**
```javascript
// Prevent redeclaration conflicts
window.componentData = window.componentData || [];
window.componentState = window.componentState || {};
```

#### **2. Initialization Hook:**
```javascript
function initializeCOMPONENT() {
    console.log('COMPONENT: Initializing component...');
    
    // Check for existing data
    if (window.componentData.length > 0) {
        renderComponent();
    } else {
        showEmptyState();
    }
}
```

#### **3. Global Data Setter:**
```javascript
function setCOMPONENTData(data) {
    console.log('COMPONENT: Setting data:', data);
    window.componentData = data || [];
    
    // Auto-render if component exists
    const container = document.getElementById('component-container');
    if (container) {
        renderComponent();
    }
}

// CRITICAL: Export to global scope
window.setCOMPONENTData = setCOMPONENTData;
```

### **✅ HTML Structure Requirements**

#### **Single Root Container:**
```html
<div class="COMPONENT-component">
    <link rel="stylesheet" href="blocks/components/COMPONENT/type_1/COMPONENT_style_t1.css">
    
    <!-- Component content -->
    <div id="component-container">
        <!-- Dynamic content here -->
    </div>
    
    <script src="blocks/components/COMPONENT/type_1/COMPONENT_behavior_t1.js"></script>
</div>
```

### **✅ Page Definition Integration**

#### **Component Configuration:**
```json
{
    "type": "component",
    "componentSpec": "COMPONENT/type_1",
    "id": "my-component",
    "dynamic": false,  // Will be set to true if protected
    "protected": false, // Set to true for protected content
    "data": {
        "componentData": [
            // Embed data directly in page definition
        ]
    },
    "navigation": {
        "defaultState": "visible"
    }
}
```

---

## 🔍 **Current Component Status**

### **✅ Fully Dynamic-Ready:**
- **Certifications** ✅ (Working example)
- **Project Details** ✅ (Has shell generation)
- **Placeholders** ✅ (Basic dynamic support)

### **⚠️ Partially Ready:**
- **Projects Grid** - Has data injection but missing shell generation
- **Experience** - Has data injection but missing shell generation  
- **Education History** - Has data injection but missing shell generation

### **❌ Needs Dynamic Implementation:**
- **Testimonials** - Missing shell generation and data injection placement
- **Competencies** - Missing shell generation and data injection placement
- **Tools** - Missing shell generation and data injection placement
- **Workflow T2** - Missing shell generation and data injection placement
- **Summaries** - Has old shell structure, needs updating

---

## 🚨 **Common Pitfalls & Solutions**

### **1. Script Placement Issue**
**Problem**: Data injection script outside container → not found by dynamic loader
**Solution**: Place script inside component container using `substr_replace()`

### **2. Variable Redeclaration**
**Problem**: `let variable = value` fails on multiple script loads
**Solution**: Use `window.variable = window.variable || value`

### **3. Function Not Global**
**Problem**: `setCOMPONENTData` not accessible from PHP injection
**Solution**: Explicitly assign to window: `window.setCOMPONENTData = setCOMPONENTData`

### **4. Multiple Root Elements**
**Problem**: Dynamic loader can't replace multiple roots properly
**Solution**: Wrap everything in single root container

### **5. Missing Initialization Hook**
**Problem**: Component doesn't initialize after dynamic loading
**Solution**: Add `data-init-hook="initializeCOMPONENT"` and implement function

---

## 🎯 **Next Steps**

1. **Update Projects Grid** - Add shell generation method
2. **Update Experience** - Add shell generation method  
3. **Update Education History** - Add shell generation method
4. **Update Testimonials** - Complete dynamic implementation
5. **Update Competencies** - Complete dynamic implementation
6. **Update Tools** - Complete dynamic implementation
7. **Update Workflow T2** - Complete dynamic implementation
8. **Modernize Summaries** - Update to new architecture

Each component needs the **PHP Loader**, **JavaScript Behavior**, and **HTML Structure** updates as outlined above.

