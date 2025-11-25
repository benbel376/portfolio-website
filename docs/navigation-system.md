# Navigation System Documentation

## Overview

The portfolio website implements a sophisticated **hash-based navigation system** that provides state-based routing, tab highlighting, auto-navigation, and comprehensive state management. The system is designed to be configuration-driven, modular, and extensible.

## Architecture

### Core Components

1. **Global Navigator** (`assets/behaviors/global_navigator_t1.js`)
   - Central navigation controller
   - Hash parsing and state management
   - Handler discovery and coordination

2. **Local Navigation Handlers**
   - Component-specific navigation logic
   - State management for individual elements
   - Integration with global navigator

3. **Auto-Navigation System**
   - First-load navigation configuration
   - Site-level default navigation setup

4. **Tab Highlighting System**
   - Active tab visual feedback
   - CSS integration with theme support

## Hash URL Format

### Basic Format
```
#elementId/state.tabId
```

### Advanced Formats
```
# Multiple elements
#element1/state1|element2/state2.tabId

# With parameters
#elementId/state/param1=value1&param2=value2.tabId

# Complex example
#summary-main-container/visible|hero-section/hidden/theme=dark&animation=fade.about
```

### URL Examples

| URL | Description |
|-----|-------------|
| `#summary-main-container/visible.about` | Show summary container, highlight "about" tab |
| `#skills-main-container/visible.skills` | Show skills container, highlight "skills" tab |
| `#hero-section/hidden\|content-section/visible.portfolio` | Hide hero, show content, highlight "portfolio" |

## Global Navigator

### Initialization

The global navigator automatically initializes when the DOM is ready:

```javascript
// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.globalNavigator.init();
});
```

### Handler Discovery

The system automatically discovers navigation handlers by scanning for elements with `data-nav-handler` attributes:

```html
<div id="summary-main-container" 
     data-nav-handler="handleVerticalContainerNavigation"
     data-nav-config='{"defaultState":"hidden","allowedStates":["visible","hidden"]}'>
```

### State Management

The global navigator maintains state using Maps:

```javascript
class GlobalNavigator {
    constructor() {
        this.currentState = new Map();
        this.previousState = new Map();
        this.registeredHandlers = new Map();
        this.defaultStates = new Map();
    }
}
```

**State Flow**:
1. Save current state as previous state
2. Restore previous elements to their default states
3. Apply new navigation states
4. Update current state tracking

### Hash Parsing

The system parses complex hash URLs:

```javascript
parseHash(hash) {
    const navigationState = new Map();
    let activeTab = null;
    
    // Extract tab highlighting signal (after final .)
    const tabSplit = hash.split('.');
    if (tabSplit.length > 1) {
        activeTab = tabSplit.pop();
        hash = tabSplit.join('.');
    }
    
    // Parse multiple element states (separated by |)
    const elementStates = hash.split('|');
    
    // Process each element state
    elementStates.forEach(elementState => {
        const parts = elementState.split('/');
        const elementId = parts[0];
        const state = parts[1];
        const paramString = parts[2] || '';
        
        // Parse parameters
        const parameters = {};
        if (paramString) {
            const paramPairs = paramString.split('&');
            paramPairs.forEach(pair => {
                const [key, value] = pair.split('=');
                if (key && value) {
                    parameters[decodeURIComponent(key)] = decodeURIComponent(value);
                }
            });
        }
        
        navigationState.set(elementId, {
            state: state,
            parameters: parameters
        });
    });
    
    return { navigationState, activeTab };
}
```

## Local Navigation Handlers

### Handler Registration

Components register handlers via HTML attributes:

```html
<!-- Vertical Container -->
<div id="summary-main-container" 
     data-nav-handler="handleVerticalContainerNavigation"
     data-nav-config='{"defaultState":"hidden","allowedStates":["visible","hidden"]}'>

<!-- Hero Component -->
<header id="summary-header" 
        data-nav-handler="handleHeroNavigation"
        data-nav-config='{"defaultState":"visible","allowedStates":["visible","hidden"]}'>
```

### Available Handlers

#### 1. Vertical Container Navigation
**Function**: `handleVerticalContainerNavigation(containerId, state, parameters)`

**States**:
- `visible`: Show container with fade-in animation
- `hidden`: Hide container with fade-out animation
- `toggle`: Toggle between visible/hidden

**Implementation**:
```javascript
function handleVerticalContainerNavigation(containerId, state, parameters = {}) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    switch (state) {
        case 'visible':
            container.style.display = 'flex';
            container.classList.remove('nav-hidden');
            container.classList.add('nav-visible');
            break;
        case 'hidden':
            container.classList.remove('nav-visible');
            container.classList.add('nav-hidden');
            setTimeout(() => {
                if (container.classList.contains('nav-hidden')) {
                    container.style.display = 'none';
                }
            }, 300);
            break;
    }
    return true;
}
```

#### 2. Hero Component Navigation
**Function**: `handleHeroNavigation(heroId, state, parameters)`

**States**:
- `visible`: Show hero component
- `hidden`: Hide hero component
- `toggle`: Toggle visibility

#### 3. Tab Highlighting
**Function**: `updateTabHighlighting(activeTabId)`

**Implementation**:
```javascript
function updateTabHighlighting(activeTabId) {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Clear all active states
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Highlight specified tab
    if (activeTabId) {
        navLinks.forEach(link => {
            const tabId = link.getAttribute('data-tab-id') || link.getAttribute('data-target');
            if (tabId === activeTabId) {
                link.classList.add('active');
            }
        });
    }
}
```

## Auto-Navigation System

### Configuration

Site JSON includes default navigation configuration:

```json
{
  "type": "top_bar",
  "navigation": {
    "tabs": [
      {
        "id": "summary",
        "label": "About",
        "page": "summary_page_t1.json",
        "active": true
      }
    ]
  },
  "defaultNavigation": {
    "hash": "summary-main-container/visible.about",
    "description": "Default navigation on first load"
  }
}
```

### Implementation

**File**: `blocks/sites/top_bar/type_2/behaviors/top_bar_site_behavior_auto_navigation_t2.js`

```javascript
function initializeAutoNavigation() {
    // Only execute on first load, not on hash changes
    if (window.location.hash) {
        return; // Hash already exists, don't override
    }
    
    const siteContainer = document.querySelector('.site-container');
    const defaultNavConfig = siteContainer?.getAttribute('data-default-navigation');
    
    if (defaultNavConfig) {
        try {
            const config = JSON.parse(defaultNavConfig);
            if (config.hash) {
                window.location.hash = config.hash;
            }
        } catch (error) {
            console.error('Error parsing default navigation config:', error);
        }
    }
}
```

### Integration

The auto-navigation is integrated into the site structure:

```html
<div class="site-container" 
     data-default-navigation='{"hash":"summary-main-container/visible.about","description":"Default navigation on first load"}'>
```

## Tab Highlighting System

### CSS Integration

The system uses CSS classes for tab highlighting:

```css
/* Active tab styling */
.main-nav a.active {
    color: #262626;
    background: linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
}

/* Dark theme active tab */
.theme-dark .main-nav a.active {
    color: #FAFAFA;
    background: linear-gradient(135deg, #333333 0%, #404040 100%);
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.08);
}

/* Mobile active tab */
@media (max-width: 768px) {
    .main-nav ul.nav-links-list li a.active {
        background: linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%);
        color: #262626;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
}
```

### Fallback Mechanism

The global navigator includes a fallback for tab highlighting when the main navigation handler is not available:

```javascript
updateTabHighlighting(activeTab) {
    if (window.topBarNavigation && typeof window.topBarNavigation.updateTabHighlighting === 'function') {
        window.topBarNavigation.updateTabHighlighting(activeTab);
    } else {
        // Fallback: direct DOM manipulation
        this.directUpdateTabHighlighting(activeTab);
    }
}
```

## Navigation Link Generation

### Site Loader Integration

The site loader generates navigation links with proper attributes:

```php
// Generate navigation tabs HTML
foreach ($navigationTabs as $tab) {
    $targetId = $tab['target'] ?? $tab['id'] . '-main-container';
    $state = $tab['state'] ?? 'visible';
    $tabId = $tab['id'];
    $hashUrl = '#' . $targetId . '/' . $state . '.' . $tabId;
    
    $tabsHtml .= '<li>';
    $tabsHtml .= '<a href="' . $hashUrl . '" class="nav-link" data-target="' . $targetId . '" data-state="' . $state . '" data-tab-id="' . $tabId . '">';
    $tabsHtml .= htmlspecialchars($tab['label']);
    $tabsHtml .= '</a>';
    $tabsHtml .= '</li>';
}
```

### Generated HTML

```html
<ul class="nav-links-list">
    <li><a href="#summary-main-container/visible.about" 
           class="nav-link" 
           data-target="summary-main-container" 
           data-state="visible" 
           data-tab-id="about">About</a></li>
    <li><a href="#skills-main-container/visible.skills" 
           class="nav-link" 
           data-target="skills-main-container" 
           data-state="visible" 
           data-tab-id="skills">Skills</a></li>
</ul>
```

## Configuration Integration

### Component JSON Configuration

Components specify navigation handlers in their JSON definitions:

```json
{
  "id": "summary-main-container",
  "type": "vertical",
  "version": "type_1",
  "navigation": {
    "handler": "handleVerticalContainerNavigation",
    "defaultState": "hidden",
    "allowedStates": ["visible", "hidden", "toggle"],
    "transitions": "fade"
  }
}
```

### Builder Integration

The builder passes navigation configurations to loaders:

```php
public function loadContainer($containerConfig, $content) {
    $loader = $this->findAndInstantiateLoader($containerPath, $loaderClass);
    
    // Pass navigation config to loader
    $navigationConfig = $containerConfig['navigation'] ?? [];
    
    return $loader->load($content, [
        'navigation' => $navigationConfig,
        'containerId' => $containerConfig['id']
    ]);
}
```

## Usage Examples

### Basic Navigation

```javascript
// Navigate to a specific state
window.globalNavigator.navigate('summary-main-container', 'visible', {}, 'about');

// Navigate to multiple states
window.globalNavigator.navigateMultiple({
    'summary-main-container': { state: 'hidden', parameters: {} },
    'skills-main-container': { state: 'visible', parameters: {} }
}, 'skills');
```

### Manual Hash Setting

```javascript
// Simple navigation
window.location.hash = 'summary-main-container/visible.about';

// Complex navigation with parameters
window.location.hash = 'hero-section/visible/theme=dark&animation=slide|content-section/visible.portfolio';
```

### Programmatic Tab Highlighting

```javascript
// Update tab highlighting directly
if (window.topBarNavigation) {
    window.topBarNavigation.updateTabHighlighting('about');
}
```

## Error Handling

### Handler Not Found

```javascript
setElementState(elementId, state, parameters = {}) {
    const handlerName = this.registeredHandlers.get(elementId);
    
    if (!handlerName) {
        console.warn(`No handler registered for element: ${elementId}`);
        return false;
    }
    
    const handlerFunction = window[handlerName];
    
    if (typeof handlerFunction !== 'function') {
        console.warn(`Handler function not found: ${handlerName}`);
        return false;
    }
    
    // Execute handler with error handling
    try {
        const result = handlerFunction(elementId, state, parameters);
        console.log(`Navigation: ${elementId} -> ${state}`, parameters);
        return result;
    } catch (error) {
        console.error(`Error calling handler ${handlerName} for ${elementId}:`, error);
        return false;
    }
}
```

### Tab Highlighting Fallback

```javascript
updateTabHighlighting(activeTab) {
    if (window.topBarNavigation && typeof window.topBarNavigation.updateTabHighlighting === 'function') {
        window.topBarNavigation.updateTabHighlighting(activeTab);
    } else {
        // Fallback: direct DOM manipulation
        this.directUpdateTabHighlighting(activeTab);
    }
}
```

## Performance Considerations

### State Management Efficiency

- Uses Maps for O(1) state lookups
- Minimal DOM queries through caching
- Event delegation for navigation links

### Memory Management

- Proper cleanup of previous states
- Efficient state restoration
- Garbage collection friendly Map usage

### CSS Performance

- Hardware-accelerated transforms for animations
- Efficient CSS selectors
- Minimal reflows and repaints

## Browser Compatibility

### Hash Change Support
- Modern browsers: Native `hashchange` event
- Legacy browsers: Polling fallback (if needed)

### CSS Features
- CSS Grid and Flexbox for layout
- CSS Custom Properties for theming
- Progressive enhancement approach

### JavaScript Features
- ES6 Maps and Classes
- Module system support
- Graceful degradation for older browsers

## Debugging

### Console Logging

The system provides comprehensive logging:

```javascript
// Handler registration
console.log(`Registered handler: ${elementId} -> ${handlerFunction}`);

// Navigation execution
console.log(`Navigation: ${elementId} -> ${state}`, parameters);

// State changes
console.log(`Restored ${elementId} to default state: ${defaultState}`);
```

### Browser DevTools

- Hash changes visible in URL bar
- State Maps inspectable in console
- CSS classes observable in Elements panel
- Network requests trackable in Network panel

## Extension Points

### Adding New Navigation Handlers

1. Create handler function:
```javascript
function handleCustomNavigation(elementId, state, parameters) {
    // Custom navigation logic
    return true;
}

// Export to global scope
window.handleCustomNavigation = handleCustomNavigation;
```

2. Register in HTML:
```html
<div id="custom-element" 
     data-nav-handler="handleCustomNavigation"
     data-nav-config='{"defaultState":"visible"}'>
```

### Adding New States

Extend existing handlers with new state cases:

```javascript
function handleVerticalContainerNavigation(containerId, state, parameters = {}) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    switch (state) {
        case 'visible':
            // existing logic
            break;
        case 'hidden':
            // existing logic
            break;
        case 'minimized':  // New state
            container.classList.add('nav-minimized');
            break;
    }
    return true;
}
```

### Custom Hash Formats

Extend the hash parser for custom formats:

```javascript
parseHash(hash) {
    // Handle custom hash formats
    if (hash.startsWith('custom:')) {
        return this.parseCustomHash(hash.substring(7));
    }
    
    // Default parsing logic
    return this.parseStandardHash(hash);
}
```

## Best Practices

### Navigation Design

1. **Consistent Hash Format**: Use the standard format for predictability
2. **Meaningful State Names**: Use descriptive state names (`visible`, `hidden`, `expanded`)
3. **Default States**: Always define sensible default states
4. **Error Handling**: Implement proper error handling and fallbacks

### Performance

1. **Minimize DOM Queries**: Cache DOM elements when possible
2. **Efficient State Updates**: Batch state changes when possible
3. **CSS Animations**: Use CSS transitions over JavaScript animations
4. **Memory Management**: Clean up event listeners and references

### Accessibility

1. **ARIA Attributes**: Update ARIA states with navigation changes
2. **Focus Management**: Handle focus appropriately during navigation
3. **Screen Reader Support**: Provide meaningful labels and descriptions
4. **Keyboard Navigation**: Ensure keyboard accessibility

### Testing

1. **Hash URL Testing**: Test various hash formats and edge cases
2. **State Persistence**: Verify state management across navigation
3. **Browser Compatibility**: Test across different browsers
4. **Mobile Testing**: Verify mobile navigation functionality

This navigation system provides a robust, extensible foundation for complex single-page application navigation while maintaining simplicity and performance. 