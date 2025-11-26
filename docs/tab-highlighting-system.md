# Tab Highlighting System

## Overview

The navigation system automatically highlights the correct tab based on which page/container is currently visible. This is achieved through the `data-parent-tab` attribute on containers.

## How It Works

### 1. Container Configuration

Pages/containers specify which tab they belong to using the `parentTab` field in their JSON definition:

```json
{
  "type": "container",
  "component": "vertical/type_1",
  "id": "project-details-main-container",
  "parentTab": "projects",
  "navigation": {
    "defaultState": "hidden",
    "allowedStates": ["visible", "hidden", "scrollTo"]
  }
}
```

### 2. HTML Attribute

The builder automatically adds the `data-parent-tab` attribute to the container's HTML:

```html
<div class="vertical-container" 
     id="project-details-main-container"
     data-parent-tab="projects"
     data-nav-handler="handleVerticalContainerNavigation">
  <!-- Container content -->
</div>
```

### 3. Automatic Tab Highlighting

The Global Navigator automatically detects which tab to highlight:

1. **After navigation completes**, it scans for visible containers with `data-parent-tab` attribute
2. **Finds the first visible container** with the attribute
3. **Highlights the corresponding tab** in the navigation bar

```javascript
highlightTabFromVisibleContainers() {
    // Find all visible containers with data-parent-tab attribute
    const visibleContainers = document.querySelectorAll('[data-parent-tab]:not(.nav-hidden)');
    
    if (visibleContainers.length === 0) return;
    
    // Get the parent tab from the first visible container
    const parentTab = visibleContainers[0].getAttribute('data-parent-tab');
    
    if (parentTab) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const tabId = link.getAttribute('data-tab-id') || link.getAttribute('data-target');
            if (tabId === parentTab) {
                link.classList.add('active');
            }
        });
    }
}
```

## Benefits

### 1. Automatic Child Page Highlighting
Child pages automatically highlight their parent tab without manual configuration:
- Project details page → highlights "Projects" tab
- Any future child pages → automatically work

### 2. Clean Hash URLs
Simple, clean URLs without tab IDs:
- `#project-details-main-container/visible?project=AI-Platform`
- `#summary-main-container/visible`
- `#skills-main-container/visible`

### 3. Single Source of Truth
Tab association is defined once in the page definition, not in every navigation call.

### 4. Maintainable
Adding new child pages is simple - just add `parentTab` to the container definition.

## Usage Examples

### All Pages Need `parentTab`
Every page container specifies which tab it belongs to:

```json
{
  "id": "projects-main-container",
  "component": "vertical/type_1",
  "parentTab": "projects"  // Highlights "Projects" tab
}
```

### Child Pages
Child pages also specify their parent tab:

```json
{
  "id": "project-details-main-container",
  "component": "vertical/type_1",
  "parentTab": "projects"  // Highlights "Projects" tab
}
```

### Navigation Code
Navigation code doesn't need to specify tab ID:

```javascript
// Navigate to project details
window.location.hash = '#project-details-main-container/visible?project=AI-Platform';

// Tab highlighting happens automatically via data-parent-tab="projects"
```

## Clean and Simple

The system uses **only one method** for tab highlighting:

**Automatic detection via `data-parent-tab`**: `#container/state`
- Every page/container declares which tab it belongs to
- Navigation system automatically highlights the correct tab
- No manual tab ID needed in URLs
- Clean, maintainable, and intuitive

## Implementation Files

- **Page Definitions**: `definitions/pages/*.json` - Add `parentTab` field
- **Builder**: `builders/builder_t1.php` - Passes `parentTab` to container loader
- **Container Loader**: `blocks/containers/vertical/type_1/vertical_loader_t1.php` - Adds `data-parent-tab` attribute
- **Global Navigator**: `blocks/sites/top_bar/type_2/behaviors/global_navigator_t1.js` - Detects and highlights tabs
