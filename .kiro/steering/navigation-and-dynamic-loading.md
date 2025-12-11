# Navigation and Dynamic Loading Systems

## Navigation System

### Hash-Based Navigation

#### URL Format (Minimal Hash)
```
#elementId                                          # Uses element's defaultState
#elementId/customState                              # Explicit non-default state
#element1|element2                                  # Multiple elements (all default states)
#element1|element2/hidden                           # Multiple, second has non-default state
#elementId?param1=value1&param2=value2              # With parameters (default state)
#elementId/state?param1=value1                      # With parameters (explicit state)
```

**Key Principle:** Only include `/state` in URL if it's NOT the element's default state. This keeps URLs clean and minimal.

#### Examples
```
#summary-main-container                             # Show summary (visible is default)
#admin-main-container                               # Show admin (visible is default)
#projects-main-container?category=ml                # Show projects with filter
#project-details?project=AI-Platform                # Show project details with param
#some-container/hidden                              # Explicitly hide (non-default)
```

### Tab Highlighting System

#### Clean Approach (Current)
Pages declare which tab they belong to via `parentTab` field:

```json
{
  "id": "summary-main-container",
  "parentTab": "about"
}
```

**How It Works:**
1. Page definition includes `parentTab` field
2. Builder adds `data-parent-tab="about"` attribute to HTML
3. Navigation system detects visible containers
4. Automatically highlights tab based on `data-parent-tab`
5. No manual tab ID management in URLs

**Benefits:**
- Declarative - pages know their tab association
- Automatic - no manual work in navigation URLs
- Clean URLs - no `.tabId` suffixes needed
- Maintainable - easy to change tab associations

### Navigation Handler Registration

#### Component Registration
```html
<div id="summary-main-container" 
     data-nav-handler="handleVerticalContainerNavigation"
     data-nav-config='{"defaultState":"hidden","allowedStates":["visible","hidden"]}'>
```

#### Handler Implementation
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

// CRITICAL: Export to global scope
window.handleVerticalContainerNavigation = handleVerticalContainerNavigation;
```

#### Handler Requirements
1. Accept three parameters: `(elementId, state, parameters)`
2. Return boolean indicating success
3. Handle all allowed states for the element
4. Be exported to `window` object
5. Be idempotent and safe to call multiple times

### Navigation Execution Flow

```
1. User triggers navigation (click link, hash change)
2. GlobalNavigator.handleHashChange()
3. Parse hash → navigationState Map
4. Save current state as previous
5. Load dynamic content for containers becoming visible (if any dynamic components)
6. Restore previous page elements to their default states
7. Apply new navigation states via handlers for elements in hash
8. Trigger child component handlers with their default states
9. Update tab highlighting
```

### State Handler Behavior

**Key Principles:**
- Navigation and state changes work INDEPENDENTLY of dynamic loading
- Dynamic loading is only about fetching HTML for `dynamic: true` components
- State handlers are ALWAYS called on navigation (for both dynamic and static components)
- State handlers should be IDEMPOTENT (ignore if already in requested state)
- Component-specific logic (like API calls) belongs in the state handler

**On Every Navigation:**
1. **Previous page components** → Called with their `defaultState` (navigating away)
2. **New page components** → Called with:
   - Explicit state from URL hash if specified, OR
   - Their `defaultState` from `data-nav-config`

**State Handler Responsibilities:**
- Show/hide the component based on state
- Initialize component if becoming visible (load data, setup UI)
- Clean up if becoming hidden (pause animations, etc.)
- Ignore request if already in the requested state (idempotent)
8. Update current state tracking
9. Update tab highlighting based on data-parent-tab
```

### Global Navigator API

```javascript
// Navigate to single element
window.globalNavigator.navigate('summary-main-container', 'visible', {});

// Navigate to multiple elements
window.globalNavigator.navigateMultiple({
  'summary-main-container': { state: 'hidden', parameters: {} },
  'skills-main-container': { state: 'visible', parameters: {} }
});

// Get current state
window.globalNavigator.getCurrentState();

// Get previous state
window.globalNavigator.getPreviousState();
```

## Dynamic Loading System

### Overview

Dynamic loading enables components to render as lightweight shells initially, then load full content on-demand via AJAX.

**Benefits:**
- Faster initial page loads
- Protected content security
- On-demand content loading
- Reduced bandwidth usage

### Component Marking

#### In Page Definition
```json
{
  "type": "component",
  "component": "project_details/type_1",
  "id": "project-details",
  "dynamic": true
}
```

#### Automatic for Protected Content
```json
{
  "navigation": {
    "protected": true  // Automatically sets dynamic: true
  }
}
```

### Loading States

Components track their loading state via `data-load-state` attribute:

- `not-loaded`: Initial state, content not yet requested
- `loading`: Content is being fetched from API
- `loaded:{identifier}`: Content successfully loaded
  - Identifier includes URL parameters for context-specific content
  - Examples: `loaded:default`, `loaded:project=AI-Platform`
- `failed`: Content loading failed

### Dynamic Loading Flow

```
1. User navigates to container with dynamic components
2. GlobalNavigator triggers navigation
3. TopBarSiteDynamicContent.loadContainerContent(containerId)
4. Scan container for [data-dynamic="true"] elements
5. Filter protected elements if not authenticated
6. For each dynamic component:
   a. Check current load state
   b. Generate expected load state from URL params
   c. Compare current vs expected
   d. If match → skip (already showing correct content)
   e. If different → reset to "not-loaded" and continue
   f. Check cache for this specific content
   g. If cached → inject and done
   h. If not cached → make API request
7. API validates authentication for protected content
8. API generates content using builder
9. Client receives response
10. Cache content (if not protected)
11. Inject content into shell
12. Execute embedded scripts (skip duplicates)
13. Trigger init hooks
14. Mark as loaded:{identifier}
```

### Smart State Tracking

#### Content Identifier Generation
```javascript
// Generates unique identifier based on URL parameters
getContentIdentifier(componentElement) {
  const urlParams = this.getCurrentUrlParams();
  
  if (Object.keys(urlParams).length === 0) {
    return 'default';
  }
  
  // Create sorted parameter string for consistency
  const sortedParams = Object.keys(urlParams)
    .sort()
    .map(key => `${key}=${urlParams[key]}`)
    .join('&');
  return sortedParams;
}
```

#### Smart Reload Detection
```javascript
const currentState = componentElement.getAttribute('data-load-state');
const expectedState = 'loaded:' + this.getContentIdentifier(componentElement);

if (currentState === expectedState) {
  // Already showing this exact content, skip reload
  return true;
} else if (currentState && currentState.startsWith('loaded:')) {
  // Showing different content, need to reload
  componentElement.setAttribute('data-load-state', 'not-loaded');
}
```

### URL Parameter Support

#### Client-Side Extraction
```javascript
getCurrentUrlParams() {
  const urlParams = {};
  
  // Regular query string: ?param=value
  const searchParams = new URLSearchParams(window.location.search);
  for (const [key, value] of searchParams) {
    urlParams[key] = value;
  }
  
  // Hash parameters: #path?param=value
  const hash = window.location.hash;
  if (hash && hash.includes('?')) {
    const hashQueryString = hash.split('?')[1];
    const hashParams = new URLSearchParams(hashQueryString);
    for (const [key, value] of hashParams) {
      urlParams[key] = value;
    }
  }
  
  return urlParams;
}
```

#### Server-Side Access
```php
// In endpoints/dynamic_content_t1.php
$urlParams = $requestData['urlParams'] ?? [];

// Set in $_GET superglobal for loader access
if (!empty($urlParams)) {
  foreach ($urlParams as $key => $value) {
    $_GET[$key] = $value;
  }
}

// In component loader
$projectName = $_GET['project'] ?? 'default';
$category = $_GET['category'] ?? 'all';
```

### Caching System

#### Cache Key Generation
```javascript
generateCacheKey(componentElement) {
  const metadata = this.getComponentMetadata(componentElement);
  const urlParams = this.getCurrentUrlParams();
  const urlParamsHash = Object.keys(urlParams).length > 0 
    ? this.hashObject(urlParams) 
    : 'no-params';
  
  return this.cachePrefix + 
         metadata.componentSpec + '_' + 
         metadata.componentId + '_' + 
         this.hashObject(metadata.componentData) + '_' +
         urlParamsHash;
}
```

#### Cache Rules
- **Protected content**: NEVER cached
- **Public content**: Cached for 24 hours
- **Cache key**: Based on component spec + ID + data hash + URL params
- **Invalidation**: Automatic on expiration or manual clear

#### Cache Management
```javascript
// Clear all dynamic content cache
window.dynamicContentLoader.clearCache();

// Hard reset (clear cache and reload)
window.location.href = window.location.pathname + '?hard_reset=true';
```

### Script Execution Optimization

#### Preventing Duplicate Scripts
```javascript
executeScripts(container) {
  const scripts = container.querySelectorAll('script');
  
  scripts.forEach((script) => {
    if (script.src) {
      // Check if external script already loaded
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        console.log('Skipping already loaded script:', script.src);
        return; // Skip duplicate scripts
      }
    }
    
    // Execute new scripts only
    const newScript = document.createElement('script');
    if (script.src) {
      newScript.src = script.src;
    } else {
      newScript.textContent = script.textContent;
    }
    document.head.appendChild(newScript);
  });
}
```

### Init Hook System

#### Purpose
Allows components to rebind DOM event listeners after dynamic HTML injection.

**IMPORTANT:** Init hooks are ONLY for DOM rebinding after HTML injection. They are NOT for:
- Loading component data (use state handler instead)
- Initializing component state (use state handler instead)
- Making API calls (use state handler instead)

The state handler (`data-nav-handler`) is responsible for all initialization logic including data loading. The init hook is a narrow-purpose tool for cases where the behavior JS was loaded before the HTML existed.

#### When Init Hook is Called
- ONLY after dynamic content loader injects new HTML
- Called BEFORE the navigation state handler
- Used to reattach event listeners to newly injected DOM elements

#### Component Implementation
```javascript
function initializeMyComponent(componentElement) {
  console.log('MyComponent: Rebinding DOM after dynamic load...');
  
  // Reattach event listeners to new DOM elements
  const backButton = componentElement.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', handleBackClick);
  }
}

// CRITICAL: Export to global scope
window.initializeMyComponent = initializeMyComponent;
```

#### Shell Configuration
```html
<div class="my-component-component"
     data-init-hook="initializeMyComponent">
```

#### Automatic Triggering
```javascript
// After content injection (in dynamic loader)
triggerPostInjectionHooks(componentElement) {
  const hookName = componentElement.getAttribute('data-init-hook');
  if (hookName && typeof window[hookName] === 'function') {
    console.log('Calling init hook:', hookName);
    window[hookName](componentElement);
  }
}
```

### API Endpoint

#### Request Format
```json
{
  "componentId": "project-details-main",
  "pageDefinition": "project_details_page_t1.json",
  "isSecured": false,
  "urlParams": {
    "project": "AI-Platform"
  }
}
```

#### Response Format
```json
{
  "success": true,
  "content": "<div>...</div>",
  "cacheKey": "abc123...",
  "requestType": "component",
  "objectCount": 1,
  "timestamp": 1234567890
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": 1234567890
}
```

### Security Integration

#### Protected Content Flow
```
1. Component marked as protected in page definition
2. Initial load: renders as shell (dynamic: true)
3. User authenticates via AuthManager
4. User navigates to protected content
5. Dynamic loader checks authentication
6. If authenticated:
   - Makes API request
   - API validates session
   - Content delivered and injected
7. If not authenticated:
   - Skip loading
   - Show login prompt or error
```

#### Authentication Check
```javascript
// In dynamic content loader
if (isProtected && !window.authManager.isAuthenticated) {
  console.log('Skipping protected content - not authenticated');
  return false;
}
```

## Integration Points

### Navigation ↔ Dynamic Loading
```javascript
// In GlobalNavigator.executeNavigation()
async executeNavigation(navigationState) {
  // 1. Save current state
  this.previousState = new Map(this.currentState);
  
  // 2. Load dynamic content BEFORE navigation
  for (const [elementId, stateInfo] of navigationState) {
    if (stateInfo.state === 'visible') {
      await window.topBarSiteDynamicContent.loadContainerContent(elementId);
    }
  }
  
  // 3. Continue with navigation
  this.restorePreviousStates(navigationState);
  this.applyNavigationStates(navigationState);
  this.updateTabHighlighting();
}
```

### Builder ↔ Dynamic Loading
```php
// Builder determines loading mode
if ($object['dynamic'] === true) {
  $loadingMode = 'shell';  // Generate shell
} else {
  $loadingMode = 'full';   // Generate full component
}

// Same builder used for initial load AND API responses
$html = $loader->load($id, $title, $navigationConfig, $loadingMode, $componentMetadata);
```

## Best Practices

### Navigation
- Use clean hash URLs without tab IDs
- Let pages declare their tab association
- Export all navigation handlers to window
- Make handlers idempotent
- Handle missing elements gracefully

### Dynamic Loading
- Mark heavy components as dynamic
- Always mark protected content as protected (not manually dynamic)
- Implement init hooks for components needing reinitialization
- Use URL parameters for context-specific content
- Don't cache protected content

### Performance
- Use smart state tracking to avoid unnecessary reloads
- Skip duplicate script execution
- Cache public content aggressively
- Load content in parallel when possible
- Keep shells minimal

### Security
- Validate authentication before content delivery
- Never cache protected content
- Use session-based authentication
- Implement proper error handling for unauthorized access
- Log security events

### Debugging
- Enable debug mode: `?debug=true`
- Check console for loading events
- Monitor Network tab for API calls
- Use `window.dynamicDebug.status()` for system status
- Clear cache when testing: `window.dynamicContentLoader.clearCache()`
