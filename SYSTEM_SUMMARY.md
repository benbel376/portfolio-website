# Portfolio Website System - Quick Reference

## What Is This?

A **custom-built, data-driven portfolio website framework** that generates multiple portfolio variations from JSON configuration files without code changes. Built from scratch with PHP, vanilla JavaScript, and pure CSS.

## Core Concepts

### Dictionary-Driven Architecture
Everything flows through a unified dictionary structure:
```
{site, objects[], pageDefinition} → Builder → HTML
```

### Component-Based System
Each component is self-contained:
- `structure.html` - Template
- `style.css` - Styles
- `behavior.js` - JavaScript
- `loader.php` - Server-side assembly

### Configuration Layers
```
entry.json → profile.json → site.json → page.json → components
```

## Key Features

### 1. Hash-Based Navigation
```
#elementId/state.tabId
#summary-main-container/visible.about
```
- SPA-like experience
- No page reloads
- State management
- Tab highlighting

### 2. Dynamic Loading
- Components load on-demand
- Shell-based initial load
- Client-side caching
- Protected content support

### 3. Security System
```
protected: true → dynamic: true → shell on load → auth required → content delivered
```

### 4. Variant-Based Data
```json
{
  "variant": "main",
  "data": {
    "main": { "title": "Version 1" },
    "alternative": { "title": "Version 2" }
  }
}
```

## File Structure

```
portfolio-website/
├── index.php                 # Entry point
├── builders/                 # Build system
├── endpoints/                # API layer
├── definitions/              # Configuration
│   ├── entry.json
│   ├── profiles/
│   ├── sites/
│   └── pages/
└── blocks/                   # Components
    ├── components/
    ├── containers/
    └── sites/
```

## Request Flows

### Initial Load
```
HTTP → index.php → Load configs → Assemble dictionary → 
Builder → Generate HTML → Browser
```

### Dynamic Load
```
Navigation → Hash change → Dynamic loader → API request → 
Extract object → Create dictionary → Builder → Return content → 
Inject into shell
```

## Quick Commands

### Access Profile
```
http://localhost/?profile=ml_mlops
http://localhost/ml_mlops
```

### Debug Mode
```php
$builder = new PortfolioBuilder('.', $debugMode = true);
```

### Browser Console
```javascript
// Navigation
window.globalNavigator.navigate('container-id', 'visible', {}, 'tab-id')

// Dynamic loading
window.dynamicContentLoader.loadContainerContent('container-id')

// Cache
window.dynamicContentLoader.clearCache()

// Auth
window.authManager.isAuthenticated
```

## Component Template

```php
class MyComponentLoader {
    public function load($id, $title, $navigationConfig, $loadingMode, $componentMetadata) {
        $data = $componentMetadata['componentData'] ?? [];
        
        switch ($loadingMode) {
            case 'shell': return $this->generateShell(...);
            case 'content': return $this->generateContent(...);
            case 'full': 
            default: return $this->generateFullComponent(...);
        }
    }
}
```

## Key Innovations

1. **Context-Agnostic Builder**: Same code for full sites and dynamic content
2. **Dynamic Discovery**: No hardcoded loader mappings
3. **Security-First**: Automatic protection enforcement
4. **Dictionary-Driven**: Unified data structure throughout
5. **Zero Dependencies**: No frameworks, pure vanilla code

## Performance

- Fast initial load (shells only)
- On-demand content loading
- Client-side caching (24h)
- Parallel component loading
- Minimal network overhead

## Documentation

- `COMPLETE_SYSTEM_ANALYSIS.md` - Full detailed analysis
- `docs/` - Architecture documentation
- `DYNAMIC_LOADING_ARCHITECTURE.md` - Dynamic loading guide

## Status

✅ Fully functional production-ready system  
✅ Multiple profiles supported  
✅ Dynamic loading operational  
✅ Security system implemented  
✅ Navigation system complete  
✅ Theme system working  
✅ Responsive design  

---

**For detailed information, see COMPLETE_SYSTEM_ANALYSIS.md**
