# Component Guide

## Component Structure

Every component follows this structure:
```
blocks/components/{name}/type_{version}/
├── {name}_structure_t{v}.html    # HTML template
├── {name}_style_t{v}.css         # Component styles
├── {name}_behavior_t{v}.js       # JavaScript behavior
├── {name}_loader_t{v}.php        # PHP loader
└── assets/                       # Optional media/files
```

## Creating a Component

### 1. HTML Structure (`{name}_structure_t1.html`)

```html
<link rel="stylesheet" href="blocks/components/{name}/type_1/{name}_style_t1.css">
<section class="{name}-component" data-nav-handler="handle{Name}Navigation">
    <!-- Component content -->
    <div class="{name}__header">
        <h2 class="{name}__title"><!-- TITLE_PLACEHOLDER --></h2>
    </div>
    <div class="{name}__content">
        <!-- Content here -->
    </div>
</section>
<script src="blocks/components/{name}/type_1/{name}_behavior_t1.js"></script>
```

**Rules:**
- Root element MUST be `<section>`
- Class MUST follow `{name}-component` pattern
- MUST have `data-nav-handler` attribute
- CSS link BEFORE section, script AFTER section
- NO `type="module"` on script tags

### 2. CSS Styles (`{name}_style_t1.css`)

```css
/* Component root */
.{name}-component {
    font-family: var(--font-primary);
    background: var(--card-bg);
    color: var(--text);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
}

/* BEM naming for children */
.{name}__header {
    margin-bottom: var(--spacing-sm);
}

.{name}__title {
    font-size: var(--text-xl);
    color: var(--primary);
}

/* Responsive */
@media (max-width: 768px) {
    .{name}-component {
        padding: var(--spacing-sm);
    }
}
```

**Rules:**
- Use CSS custom properties for colors
- Use BEM naming: `{name}__{element}`, `{name}--{modifier}`
- Mobile-first responsive design
- No hardcoded hex colors

### 3. JavaScript Behavior (`{name}_behavior_t1.js`)

```javascript
// Global state (prevent redeclaration on dynamic reload)
window.{name}Data = window.{name}Data || [];

// Initialize component
function initialize{Name}(componentElement) {
    console.log('{Name}: Initializing...');
    const el = componentElement || document.querySelector('.{name}-component');
    if (!el) return;
    
    // Setup logic here
    if (window.{name}Data.length > 0) {
        render{Name}();
    }
}

// Data setter (called by PHP loader)
function set{Name}Data(data) {
    window.{name}Data = data || [];
    render{Name}();
}

// Render function
function render{Name}() {
    const container = document.getElementById('{name}-container');
    if (!container) return;
    // Render logic
}

// Navigation handler (REQUIRED)
function handle{Name}Navigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initialize{Name}(element);
            break;
        case 'hidden':
            element.classList.remove('nav-visible');
            element.classList.add('nav-hidden');
            setTimeout(() => {
                if (element.classList.contains('nav-hidden')) {
                    element.style.display = 'none';
                }
            }, 300);
            break;
        case 'scrollTo':
            element.scrollIntoView({ behavior: 'smooth' });
            break;
    }
    return true;
}

// CRITICAL: Export to global scope
window.initialize{Name} = initialize{Name};
window.set{Name}Data = set{Name}Data;
window.handle{Name}Navigation = handle{Name}Navigation;
```

**Rules:**
- Use `window.` for global state to prevent redeclaration
- Navigation handler MUST be exported to `window`
- Handler MUST handle `visible`, `hidden`, `scrollTo` states
- Handler MUST be idempotent

### 4. PHP Loader (`{name}_loader_t1.php`)

```php
<?php
class {Name}LoaderT1 {
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
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

    private function generateFullComponent($id, $navConfig, $data) {
        $template = file_get_contents(__DIR__ . '/{name}_structure_t1.html');
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        // Inject ID and config
        $html = str_replace(
            '<section class="{name}-component" data-nav-handler="handle{Name}Navigation">',
            '<section class="{name}-component" id="' . htmlspecialchars($id) . '" 
                data-nav-handler="handle{Name}Navigation" 
                data-nav-config="' . $navConfigJson . '">',
            $template
        );
        
        // Inject data script INSIDE section (before </section>)
        $dataScript = $this->injectDataScript($data);
        $lastPos = strrpos($html, '</section>');
        $html = substr_replace($html, $dataScript . '</section>', $lastPos, 10);
        
        return $html;
    }

    private function generateShell($id, $navConfig, $componentMetadata) {
        $template = file_get_contents(__DIR__ . '/{name}_structure_t1.html');
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace(
            '<section class="{name}-component" data-nav-handler="handle{Name}Navigation">',
            '<section class="{name}-component" id="' . htmlspecialchars($id) . '"
                data-nav-handler="handle{Name}Navigation"
                data-nav-config="' . $navConfigJson . '"
                data-dynamic="true"
                data-load-state="not-loaded"
                data-init-hook="initialize{Name}"
                data-component-metadata="' . $metadataJson . '">',
            $template
        );
        
        return $html;
    }

    private function generateContent($data) {
        return $this->injectDataScript('', $data);
    }

    private function injectDataScript($data) {
        return '<script>
            if (typeof window.set{Name}Data === "function") {
                window.set{Name}Data(' . json_encode($data) . ');
            }
        </script>';
    }

    private function processNavigationConfig($config) {
        return array_merge([
            'defaultState' => 'visible',
            'allowedStates' => ['visible', 'hidden']
        ], $config);
    }
}
```

## Using a Component

### In Page Definition
```json
{
    "type": "component",
    "component": "{name}/type_1",
    "id": "my-{name}",
    "variant": "main",
    "data": {
        "main": {
            "title": "My Title",
            "items": [...]
        }
    },
    "navigation": {
        "defaultState": "visible",
        "allowedStates": ["visible", "hidden"]
    }
}
```

### Protected Component
```json
{
    "type": "component",
    "component": "{name}/type_1",
    "id": "protected-{name}",
    "navigation": {
        "protected": true
    }
}
```

## Extending Components

### Adding a Variant
1. Add new data key in page definition:
```json
"data": {
    "main": { ... },
    "compact": { ... }
}
```
2. Set `"variant": "compact"` to use it

### Creating a New Type
1. Copy `type_1` folder to `type_2`
2. Rename all files: `*_t1.*` → `*_t2.*`
3. Update class names and references
4. Modify as needed

### Adding Features
1. Add HTML structure
2. Add CSS styles (use theme variables)
3. Add JS behavior (export to window)
4. Update loader to handle new data

## Component Checklist

Before deploying a component, verify:

- [ ] Root element is `<section>`
- [ ] Class follows `{name}-component` pattern
- [ ] Has `data-nav-handler` attribute
- [ ] CSS link before section, script after
- [ ] No `type="module"` on script
- [ ] Navigation handler exported to window
- [ ] Handler handles visible/hidden/scrollTo
- [ ] Loader has shell/content/full modes
- [ ] Data injection uses `</section>` (10 chars)
- [ ] No hardcoded hex colors in CSS
- [ ] Responsive design implemented
