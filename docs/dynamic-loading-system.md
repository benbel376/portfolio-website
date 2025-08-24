## JavaScript function design philosophy

Components organize their scripts into three categories:

1. Event-based functions
   - Pure DOM event handlers (click, input, etc.).
   - They do not require special treatment and work whether a component is statically rendered or dynamically injected.

2. Hook functions
   - Explicit functions called by global systems (e.g., Global Navigator, Dynamic Content Loader) or other modules.
   - Components may expose these as globals (e.g., `window.handleXNavigation`) or via a declared hook name in `data-*` attributes.

3. Automatic trigger functions (first-load initializers)
   - Must run the first time a component’s HTML is available.
   - Behavior for static render: they run immediately on initial page load.
   - Behavior for dynamic render: if invoked while only the shell exists, they must fail gracefully (no errors) and be retriggered when the inner HTML arrives.
   - Mechanism: after content injection, the Dynamic Loader dispatches a `component:contentLoaded` event on the component element and optionally calls an init hook function when declared via `data-init-hook`.

Contract
- All CSS and JS are included by the component’s HTML (structure/shell templates). PHP loaders never insert `<link>` or `<script>` tags.
- Loaders only return: full component markup, shell-only, or inner content; they perform placeholder replacement, but no asset inclusion.
- Automatic trigger functions should be idempotent and tolerate missing inner HTML (bail quickly), then re-run successfully after dynamic injection.

# Dynamic Content Loading System

## Overview

The Dynamic Content Loading System enables client-side loading of component content on-demand, improving initial page load performance while maintaining a smooth user experience. Components can be marked as "dynamic" and will load their content only when their containers become visible.

## Architecture

### Core Components

1. **Global Dynamic Content Loader** (`assets/behaviors/dynamic_content_loader_t1.js`)
   - Handles the core dynamic loading logic
   - Manages caching and state tracking
   - Provides API communication

2. **Site-Specific Dynamic Content Behavior** (`blocks/sites/top_bar/type_2/behaviors/top_bar_site_behavior_dynamic_content_t2.js`)
   - Site-specific integration layer
   - Handles post-processing and site-specific initialization
   - Called by the global navigator

3. **Global Navigator Integration** (`assets/behaviors/global_navigator_t1.js`)
   - Triggers dynamic loading before navigation
   - Waits for content loading to complete
   - Maintains navigation flow integrity

4. **API Endpoint** (`api/dynamic-content.php`)
   - Server-side content generation
   - Security validation
   - Component metadata verification

5. **Cache Manager** (`assets/behaviors/cache_manager_t1.js`)
   - Handles cache clearing and hard resets
   - Version management
   - Keyboard shortcuts for cache operations

## Component Configuration

### Marking Components as Dynamic

In page definition JSON files:

```json
{
    "type": "component",
    "component": "heros/type_1",
    "id": "dynamic-hero-1",
    "dynamic": true,
    "data": {
        "title": "Dynamic Hero Component"
    },
    "navigation": {
        "defaultState": "visible",
        "allowedStates": ["visible", "hidden"]
    }
}
```

### Component Loader Enhancement

Component loaders must support dynamic loading modes:

```php
public function load($id, $title, $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
    switch ($loadingMode) {
        case 'shell':
            return $this->generateShell($id, $navConfig, $componentMetadata);
        case 'content':
            return $this->generateContent($title);
        case 'full':
        default:
            return $this->generateFullComponent($id, $title, $navConfig);
    }
}
```

## Loading States

Components have four loading states tracked via `data-load-state` attribute:

- **`not-loaded`**: Initial state, content not yet requested
- **`loading`**: Content is being fetched from API
- **`loaded`**: Content successfully loaded and injected
- **`failed`**: Content loading failed, error placeholder shown

## Caching System

### Client-Side Caching

- Uses localStorage for persistent caching
- 24-hour cache expiration by default
- Cache keys based on component metadata hash
- Automatic cache version management

### Cache Management

- **Hard Reset**: `?hard_reset=true` or `Ctrl+Shift+R`
- **Clear Cache**: `?clear_cache=true` or `Ctrl+Shift+C`
- **Version Mismatch**: Automatic cache clearing on version changes

## Navigation Integration

### Loading Flow

1. User triggers navigation (hash change)
2. Global navigator parses navigation state
3. Site-specific dynamic content loader is called
4. Dynamic components are identified and loaded
5. Navigation continues after loading completes
6. Tab highlighting and state management proceed

### Error Handling

- Failed loads don't block navigation
- Error placeholders shown for failed components
- Retry mechanisms available through debug commands

## Debug System

### Enabling Debug Mode

- URL parameter: `?debug=true` or `?debug_dynamic=true`
- localStorage: `dynamic_debug_enabled=true`
- Keyboard shortcut: `Ctrl+Shift+D` (toggle debug panel)

### Debug Commands

Available via `window.dynamicDebug`:

```javascript
dynamicDebug.status()           // Show system status
dynamicDebug.cache()            // Show cache statistics
dynamicDebug.clearCache()       // Clear all caches
dynamicDebug.reload(containerId) // Force reload container
dynamicDebug.history()          // Show loading history
dynamicDebug.test(containerId)  // Test dynamic loading
dynamicDebug.help()             // Show help
dynamicDebug.toggle()           // Toggle debug mode
```

### Keyboard Shortcuts

- `Ctrl+Shift+D`: Toggle debug panel
- `Ctrl+Shift+S`: Show system status
- `Ctrl+Shift+R`: Hard reset (clear cache and reload)
- `Ctrl+Shift+C`: Clear dynamic content cache

## API Endpoint

### Request Format

```json
{
    "componentSpec": "heros/type_1",
    "componentId": "dynamic-hero-1",
    "componentData": {
        "title": "Dynamic Hero Component"
    },
    "pageDefinition": "dynamic_test_page_t1.json"
}
```

### Response Format

```json
{
    "success": true,
    "content": "<h1>Dynamic Hero Component</h1>",
    "componentId": "dynamic-hero-1",
    "timestamp": 1234567890,
    "cacheKey": "abc123def456"
}
```

### Security Features

- Page definition validation
- Component specification format validation
- Component existence verification in page definition
- Dynamic flag verification

## Testing

### Test Profile

Use the `dynamic_test` profile for testing:

```
http://localhost:8000/?profile=dynamic_test&debug=true
```

### Test Components

The test page includes:
- Dynamic hero components (loaded on demand)
- Static hero components (loaded immediately)
- Multiple containers with different visibility states

### Manual Testing

1. Load test page with debug enabled
2. Use navigation tabs to show/hide containers
3. Monitor console for loading events
4. Use debug commands to inspect system state
5. Test cache clearing and hard reset functionality

## Performance Considerations

### Benefits

- Reduced initial page load time
- Improved perceived performance
- Bandwidth savings for unused content
- Better mobile experience

### Trade-offs

- Additional API requests for dynamic content
- Slight delay when showing dynamic containers
- Increased complexity in debugging
- Cache storage usage

## Best Practices

### When to Use Dynamic Loading

- Heavy components not immediately visible
- Content that requires external data
- Components with expensive rendering
- Mobile-first optimization scenarios

### When NOT to Use Dynamic Loading

- Above-the-fold content
- Critical navigation elements
- Simple, lightweight components
- Content needed for SEO

### Implementation Guidelines

1. Mark only appropriate components as dynamic
2. Ensure proper error handling and fallbacks
3. Test with various network conditions
4. Monitor cache usage and cleanup
5. Use debug tools during development

## Troubleshooting

### Common Issues

1. **Components not loading**
   - Check console for API errors
   - Verify component is marked as dynamic
   - Ensure API endpoint is accessible

2. **Cache issues**
   - Use hard reset to clear all caches
   - Check cache version compatibility
   - Monitor localStorage usage

3. **Navigation delays**
   - Check if dynamic loading is blocking navigation
   - Verify loading promises are resolving
   - Use debug commands to inspect loading queue

### Debug Steps

1. Enable debug mode: `?debug=true`
2. Check system status: `dynamicDebug.status()`
3. Monitor loading history: `dynamicDebug.history()`
4. Test specific containers: `dynamicDebug.test('container-id')`
5. Clear cache if needed: `dynamicDebug.clearCache()`

## Future Enhancements

### Planned Features

- Progressive loading with priority levels
- Background preloading of likely-needed content
- Service worker integration for offline support
- Advanced caching strategies (LRU, size-based)
- Loading analytics and performance metrics

### Extension Points

- Custom loading indicators per component type
- Site-specific post-processing hooks
- Advanced error recovery mechanisms
- Integration with external content management systems 