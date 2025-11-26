# Dynamic Loader Discovery Feature

## Overview

The Dynamic Loader Discovery feature provides a flexible and robust mechanism for automatically finding and loading component, container, and site loader files without requiring strict naming conventions.

## Problem Statement

The original system required exact filename patterns and made assumptions about class names based on directory names:

- Expected files like `{componentType}_loader_t1.php`
- Assumed class names like `{ComponentType}Loader`
- Failed when directory names didn't match expected patterns (e.g., `heros` directory vs `hero` component)
- Required hardcoded mappings for exceptions

## Solution Architecture

### Dynamic File Discovery

The system now scans directories for loader files using flexible criteria:

```php
private function findLoaderFile($directoryPath) {
    if (!is_dir($directoryPath)) {
        return false;
    }
    
    $files = scandir($directoryPath);
    
    foreach ($files as $file) {
        // Check if it's a PHP file and contains "loader" in the name
        if (pathinfo($file, PATHINFO_EXTENSION) === 'php' && strpos($file, 'loader') !== false) {
            return $directoryPath . '/' . $file;
        }
    }
    
    return false;
}
```

**Criteria**:
- File must have `.php` extension
- Filename must contain the word "loader" (case-sensitive)
- Returns the first matching file found

### Dynamic Class Discovery

The system scans PHP file content to find loader classes:

```php
private function findLoaderClass($filePath) {
    $content = file_get_contents($filePath);
    
    // Use regex to find class definitions that contain "Loader"
    if (preg_match('/class\s+(\w*Loader\w*)/i', $content, $matches)) {
        return $matches[1];
    }
    
    return false;
}
```

**Criteria**:
- Searches for class definitions using regex pattern
- Class name must contain "Loader" (case-insensitive)
- Returns the first matching class name found

## Implementation Details

### Component Loading Flow

1. Parse component specification (e.g., `"heros/type_1"`)
2. Build directory path: `./blocks/components/heros/type_1/`
3. Scan directory for any `.php` file containing "loader"
4. Include the found loader file
5. Scan file content for class containing "Loader"
6. Instantiate the found class
7. Call the loader's `load()` method

### Container Loading Flow

Same process as components but uses `./blocks/containers/` path.

### Site Loading Flow

Same process but uses `./blocks/sites/` path.

## Configuration Changes

### Page Definitions

Component and container specifications now require full paths:

**Before**:
```json
{
    "id": "summary-header",
    "type": "component",
    "component": "hero",
    "parent": "summary-main-container"
}
```

**After**:
```json
{
    "id": "summary-header",
    "type": "component", 
    "component": "heros/type_1",
    "parent": "summary-main-container"
}
```

## Supported Naming Patterns

The system now supports flexible naming patterns:

### Loader Files
- `hero_loader_t1.php` ✓
- `heros_loader_t1.php` ✓
- `vertical_loader_t1.php` ✓
- `custom_component_loader.php` ✓
- `my_loader_v2.php` ✓

### Class Names
- `class HeroLoader` ✓
- `class HerosLoader` ✓
- `class VerticalLoader` ✓
- `class CustomComponentLoader` ✓
- `class MyLoaderV2` ✓

## Benefits

1. **Flexibility**: No longer tied to specific naming conventions
2. **Robustness**: Handles mismatches between directory names and class names
3. **Maintainability**: Eliminates hardcoded mappings and assumptions
4. **Extensibility**: Easy to add new components without following strict patterns
5. **Error Reduction**: Fewer naming-related failures

## Error Handling

The system provides clear error messages for common issues:

- `"Component loader not found in: {path}"` - No loader file found in directory
- `"Loader class not found in: {file}"` - No valid loader class found in file
- Directory or file access issues are handled gracefully

## Migration Guide

### For Existing Components

1. Update page definitions to use full path specifications:
   - Change `"component": "hero"` to `"component": "heros/type_1"`
   - Change `"component": "vertical"` to `"component": "vertical/type_1"`

2. Ensure loader files contain "loader" in filename
3. Ensure loader classes contain "Loader" in class name

### For New Components

1. Create component directory structure: `blocks/components/{name}/{version}/`
2. Create loader file with "loader" in filename (any pattern)
3. Create loader class with "Loader" in class name (any pattern)
4. Use full path specification in page definitions: `"{name}/{version}"`

## Navigation System Integration

### Global Function Export

The dynamic loader discovery system now works seamlessly with the navigation system through global function exports:

```javascript
// Export functions to global scope for the navigation system
window.handleVerticalContainerNavigation = handleVerticalContainerNavigation;
window.initializeVerticalContainerNavigation = initializeVerticalContainerNavigation;
```

### Navigation Configuration Support

Container loaders now support navigation configuration parameters:

```php
public function load($id, $childrenHtml = [], $navigationConfig = []) {
    // Process navigation configuration
    $navConfig = $this->processNavigationConfig($navigationConfig);
    
    // Add navigation configuration as data attribute
    if (!empty($navConfig)) {
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        $html = str_replace('data-nav-handler="handleVerticalContainerNavigation"', 
                          'data-nav-handler="handleVerticalContainerNavigation" data-nav-config="' . $navConfigJson . '"', 
                          $html);
    }
}
```

### Template Placeholder System

The loader system now properly handles template placeholders for dynamic content injection:

**Site Loaders**:
- `<!-- NAVIGATION_TABS_PLACEHOLDER -->` - Replaced with generated navigation links
- `<!-- PAGE_CONTENT_PLACEHOLDER -->` - Replaced with page content
- `<!-- TITLE_PLACEHOLDER -->` - Replaced with page title

**Container Loaders**:
- `<!-- CHILDREN_PLACEHOLDER -->` - Replaced with child component HTML

### Script Loading Integration

The system ensures proper script loading order for navigation functionality:

```html
<!-- Theme Script (loaded first to ensure availability) -->
<script src="blocks/sites/top_bar/type_2/behaviors/top_bar_site_behavior_theme_t2.js"></script>
<!-- Global Navigator Script -->
<script src="assets/behaviors/global_navigator_t1.js" type="module"></script>
<!-- Vertical Container Navigation -->
<script src="blocks/containers/vertical/type_1/vertical_container_behavior_t1.js" type="module"></script>
```

## Recent Bug Fixes and Improvements

### Template Reference Corrections

Fixed incorrect file references in type_2 templates:
- CSS: `top_bar_stie_style_main_t1.css` → `top_bar_stie_style_main_t2.css`
- JS: `top_bar_site_behavior_main_t1.js` → `top_bar_site_behavior_main_t2.js`

### Function Availability Issues

Resolved timing issues with global function availability:
- Theme toggle functions now load before HTML attempts to access them
- Navigation functions properly exported to global scope
- Console logging added for debugging function loading

### Navigation State Management

Enhanced container navigation with proper state management:
- Default state configuration support
- Transition effect parameters
- Initialization script generation
- Error handling for missing containers

## Future Enhancements

Potential improvements to consider:

1. **Multiple Loader Support**: Handle multiple loader files in same directory
2. **Version-Specific Discovery**: Enhanced version handling and discovery
3. **Caching**: Cache discovered loader files for performance
4. **Validation**: Validate loader class interfaces and methods
5. **Configuration**: Allow custom discovery patterns via configuration
6. **Navigation Templates**: Standardized navigation template patterns
7. **Asset Management**: Automatic CSS/JS dependency resolution
8. **Hot Reloading**: Development mode with automatic reloading 