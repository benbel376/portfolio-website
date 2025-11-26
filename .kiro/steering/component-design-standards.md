# Component Design Standards

## Component File Structure

Every component MUST follow this exact structure:

```
blocks/components/{component_name}/type_{version}/
├── {component}_structure_t{version}.html
├── {component}_style_t{version}.css
├── {component}_behavior_t{version}.js
├── {component}_loader_t{version}.php
└── assets/
    ├── media/
    ├── styles/
    └── files/
```

## Naming Conventions

### Type Versioning
- All files use `_t{number}` suffix
- Examples: `hero_loader_t1.php`, `hero_style_t1.css`

### Component Specifications
- Format: `{component_name}/type_{version}`
- Examples: `heros/type_1`, `projects_grid/type_1`

### Class Names
- PHP Loader: `{ComponentName}LoaderT{Version}` (PascalCase)
- CSS: `.{component-name}-component` (kebab-case)
- BEM: `.{component-name}__{element}`, `.{component-name}--{modifier}`

### JavaScript Functions
- Navigation: `handle{ComponentName}Navigation`
- Init: `initialize{ComponentName}`
- Data setters: `set{ComponentName}Data`

## HTML Structure Standards

### Single Root Container
ALL content MUST be wrapped in single root:

```html
<link rel="stylesheet" href="blocks/components/{component}/type_1/{component}_style_t1.css">
<div class="{component}-component" data-nav-handler="handle{Component}Navigation">
  <!-- All content here -->
</div>
<script src="blocks/components/{component}/type_1/{component}_behavior_t1.js"></script>
```

### Required Attributes
- `data-nav-handler`: Navigation handler function name
- `class`: Component root class

### Placeholders
- Use HTML comments: `<!-- PLACEHOLDER_NAME -->`
- UPPERCASE names: `<!-- TITLE_PLACEHOLDER -->`


## CSS Standards

### Theme Variables
ALWAYS use CSS custom properties:

```css
.component {
  background: var(--color-background-light);
  color: var(--color-text-primary);
  padding: var(--spacing-4);
}

.theme-dark .component {
  background: var(--color-background-dark);
}
```

### Available Variables
- Colors: `--color-primary`, `--color-background-light/dark`, `--color-text-primary/secondary`
- Spacing: `--spacing-1` (4px) through `--spacing-12` (48px)
- Typography: `--font-size-xs` through `--font-size-3xl`, `--font-weight-normal/medium/semibold/bold`
- Border: `--border-radius-sm/md/lg/xl/full`
- Transitions: `--transition-fast/normal/slow`

### Responsive Design (Mobile-First)
```css
/* Mobile (default) */
.component { padding: 1rem; }

/* Tablet */
@media (min-width: 768px) {
  .component { padding: 1.5rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .component { padding: 2rem; }
}
```

### Breakpoints
- Mobile: `< 768px` (default)
- Tablet: `768px - 1023px`
- Desktop: `≥ 1024px`

### Component Isolation
- NEVER use global selectors
- Scope all styles to component class
- Use BEM notation
- Avoid `!important`


## JavaScript Standards

### Three Function Categories

#### 1. Event Handlers
Pure DOM events - work automatically

#### 2. Hook Functions (MUST export to window)
```javascript
function handleMyComponentNavigation(componentId, state, parameters = {}) {
  const component = document.getElementById(componentId);
  if (!component) return false;

  switch (state) {
    case 'visible':
      component.style.display = 'block';
      component.classList.add('nav-visible');
      break;
    case 'hidden':
      component.classList.add('nav-hidden');
      setTimeout(() => {
        if (component.classList.contains('nav-hidden')) {
          component.style.display = 'none';
        }
      }, 300);
      break;
  }
  return true;
}

// CRITICAL: Export to global scope
window.handleMyComponentNavigation = handleMyComponentNavigation;
```

#### 3. Auto-trigger Functions
```javascript
function initializeMyComponent(componentElement) {
  console.log('MyComponent: Initializing...');
  if (window.myComponentData && window.myComponentData.length > 0) {
    renderMyComponent();
  }
}

window.initializeMyComponent = initializeMyComponent;
```

### Global State Management
```javascript
// CORRECT: Prevent redeclaration
window.myComponentData = window.myComponentData || [];
window.myComponentState = window.myComponentState || {};

// WRONG: Fails on dynamic reload
let myComponentData = [];  // ❌
```

### Data Setter Pattern
```javascript
function setMyComponentData(data) {
  window.myComponentData = data || [];
  const container = document.getElementById('my-component-container');
  if (container) {
    renderMyComponent();
  }
}

window.setMyComponentData = setMyComponentData;
```


## PHP Loader Standards

### Required Interface
```php
class MyComponentLoaderT1 {
    public function load($id, $title = '', $navigationConfig = [], 
                        $loadingMode = 'full', $componentMetadata = []) {
        
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $data = $componentMetadata['componentData'] ?? [];

        switch ($loadingMode) {
            case 'shell':
                return $this->generateShell($id, $navConfig, $componentMetadata);
            case 'content':
                return $this->generateContent($data);
            case 'full':
            default:
                return $this->generateFullComponent($id, $navConfig, $data);
        }
    }
}
```

### Three Loading Modes

#### Full Mode (Static)
- Complete component with data
- Used on initial page load
- Includes structure + data + scripts

#### Shell Mode (Dynamic Placeholder)
- Empty structure with metadata
- Used for dynamic loading
- Minimal HTML footprint

#### Content Mode (API Response)
- Data-populated content only
- Used in API responses
- No wrapper structure

### Data Injection (CRITICAL)
```php
private function generateFullComponent($id, $navConfig, $data) {
    $template = file_get_contents(__DIR__ . '/my_component_structure_t1.html');
    $html = $this->fillTemplate($template, $data);
    
    // Inject ID and config
    $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
    $html = str_replace('<div class="my-component-component"',
        '<div class="my-component-component" 
             id="' . htmlspecialchars($id) . '" 
             data-nav-config="' . $navConfigJson . '"',
        $html);
    
    // CRITICAL: Inject data script INSIDE container
    $dataScript = $this->injectDataScript($data);
    $lastDivPos = strrpos($html, '</div>');
    $html = substr_replace($html, $dataScript . '</div>', $lastDivPos, 6);
    
    return $html;
}

private function injectDataScript($data) {
    $script = '<script>';
    $script .= 'if (typeof window.setMyComponentData === "function") {';
    $script .= '    window.setMyComponentData(' . json_encode($data) . ');';
    $script .= '} else {';
    $script .= '    setTimeout(function() {';
    $script .= '        if (typeof window.setMyComponentData === "function") {';
    $script .= '            window.setMyComponentData(' . json_encode($data) . ');';
    $script .= '        }';
    $script .= '    }, 100);';
    $script .= '}';
    $script .= '</script>';
    return $script;
}
```

### Shell Generation
```php
private function generateShell($id, $navConfig, $componentMetadata) {
    $template = file_get_contents(__DIR__ . '/my_component_structure_t1.html');
    $html = $this->removeDataFromTemplate($template);
    
    $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
    $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
    
    $html = str_replace('<div class="my-component-component"',
        '<div class="my-component-component" 
             id="' . htmlspecialchars($id) . '" 
             data-nav-config="' . $navConfigJson . '"
             data-dynamic="true"
             data-load-state="not-loaded"
             data-init-hook="initializeMyComponent"
             data-component-metadata="' . $metadataJson . '"',
        $html);
    
    return $html;
}
```


## Dynamic Loading Support

### Required Attributes
```html
<div class="component-name-component"
     id="component-id"
     data-nav-handler="handleComponentNavigation"
     data-nav-config='{...}'
     data-dynamic="true"
     data-load-state="not-loaded"
     data-init-hook="initializeComponent"
     data-component-metadata='{...}'>
```

### Load States
- `not-loaded`: Initial state
- `loading`: Fetching content
- `loaded:{identifier}`: Successfully loaded (identifier includes URL params)
- `failed`: Loading failed

### URL Parameter Support
```php
// In PHP loader
$projectName = $_GET['project'] ?? 'default';
$category = $_GET['category'] ?? 'all';
```

## Security Standards

### Protected Content
```json
{
  "navigation": {
    "protected": true
  }
}
```

- `protected: true` automatically sets `dynamic: true`
- Content only delivered after authentication
- API validates session before returning content

### Output Sanitization
```php
// Text content
$html = htmlspecialchars($data['title'], ENT_QUOTES, 'UTF-8');

// JSON data
$jsonData = json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP);

// Attributes
$attrValue = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
```

## Accessibility Standards

### Semantic HTML
Use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`

### ARIA Attributes
```html
<button aria-label="Close" aria-expanded="false">
  <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
</button>
```

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Visible focus indicators

### Screen Reader Support
```html
<span class="visually-hidden">Context for screen readers</span>
```

## Error Handling

### PHP
```php
try {
    return $this->generateComponent($data);
} catch (Exception $e) {
    error_log("Component error: " . $e->getMessage());
    return $this->generateErrorPlaceholder();
}
```

### JavaScript
```javascript
try {
    renderComponent(data);
} catch (error) {
    console.error('Component error:', error);
    showErrorState();
}
```

## Testing Requirements

- Test component in isolation
- Test in multiple browsers
- Test on mobile devices
- Test with JavaScript disabled
- Test with screen readers
- Measure performance
