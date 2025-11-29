/**
 * Dynamic Content Loader System
 * Handles client-side dynamic component loading with caching and state management
 * 
 * LOAD STATE FORMAT:
 * - "not-loaded" → Component needs loading
 * - "loading" → Currently fetching content
 * - "loaded:{identifier}" → Loaded with specific content (e.g., "loaded:project-name")
 * 
 * The identifier allows smart reload detection:
 * - If requested content matches loaded identifier → Skip reload
 * - If different → Reload with new content
 */
class DynamicContentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.cachePrefix = 'dynamic_content_';
        this.apiEndpoint = 'api.php?endpoint=dynamic_content';
        
        console.log('Dynamic Content Loader initialized');
    }
    
    /**
     * Load dynamic content for all components in a container
     * Supports both page-level and component-level loading
     */
    async loadContainerContent(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container not found: ${containerId}`);
            return false;
        }
        
        // Check if the container itself is marked for dynamic loading (page-level loading)
        if (container.getAttribute('data-dynamic') === 'true') {
            console.log(`Loading entire page content for container: ${containerId}`);
            return await this.loadPageContent(container);
        }
        
        // Find all dynamic components in the container (component-level loading)
        const dynamicComponents = container.querySelectorAll('[data-dynamic="true"]');
        
        if (dynamicComponents.length === 0) {
            console.log(`No dynamic components found in container: ${containerId}`);
            return true;
        }
        
        console.log(`Loading ${dynamicComponents.length} dynamic components in container: ${containerId}`);
        
        // Load all components in parallel
        const loadPromises = Array.from(dynamicComponents).map(component => 
            this.loadComponentContent(component)
        );
        
        try {
            await Promise.all(loadPromises);
            console.log(`All dynamic components loaded in container: ${containerId}`);
            return true;
        } catch (error) {
            console.error(`Error loading dynamic components in container ${containerId}:`, error);
            return false;
        }
    }
    
    /**
     * Load entire page content for a container (page-level loading)
     */
    async loadPageContent(containerElement) {
        const containerId = containerElement.id;
        const loadState = containerElement.getAttribute('data-load-state');
        
        // Skip if already loaded or currently loading
        if (loadState === 'loaded') {
            console.log(`Page content already loaded for container: ${containerId}`);
            return true;
        }
        
        if (loadState === 'loading') {
            // Wait for existing loading promise
            if (this.loadingPromises.has(containerId)) {
                return await this.loadingPromises.get(containerId);
            }
        }
        
        // Start loading process
        const loadingPromise = this.performPageLoad(containerElement);
        this.loadingPromises.set(containerId, loadingPromise);
        
        try {
            const result = await loadingPromise;
            this.loadingPromises.delete(containerId);
            return result;
        } catch (error) {
            this.loadingPromises.delete(containerId);
            throw error;
        }
    }
    
    /**
     * Perform page-level dynamic loading
     */
    async performPageLoad(containerElement) {
        const containerId = containerElement.id;
        
        try {
            // Set loading state
            this.setLoadingState(containerElement, 'loading');
            this.showLoadingIndicator(containerElement);
            
            // Get container metadata for page identification
            const metadata = this.getComponentMetadata(containerElement);
            if (!metadata) {
                throw new Error('Container metadata not found for page loading');
            }
            
            // Prepare request payload for page-level loading (no componentId)
            const requestPayload = {
                pageDefinition: metadata.pageDefinition,
                containerId: containerId, // Send container ID as top-level identifier
                urlParams: this.getCurrentUrlParams()
            };
            
            console.log('Loading page content:', requestPayload);
            
            // Make API request
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown API error');
            }
            
            // Replace container with new content
            this.injectContent(containerElement, data.content);
            
            console.log('Page content loaded successfully:', containerId);
            return true;
            
        } catch (error) {
            console.error(`Failed to load page content for ${containerId}:`, error);
            this.setLoadingState(containerElement, 'error');
            this.showErrorPlaceholder(containerElement, error.message);
            throw error;
        }
    }
    
    /**
     * Load content for a specific dynamic component
     */
    async loadComponentContent(componentElement) {
        const componentId = componentElement.id;
        const loadState = componentElement.getAttribute('data-load-state');

        // Protection: do not load if component is protected and user not authenticated
        const isProtected = componentElement.getAttribute('data-protected') === 'true';
        const authed = !!(window.authManager && window.authManager.isAuthenticated);
        if (isProtected && !authed) {
            console.warn(`Skipping load for protected component without auth: ${componentId}`);
            return false;
        }
        
        // Get content identifier from URL parameters
        const contentIdentifier = this.getContentIdentifier(componentElement);
        const expectedLoadState = `loaded:${contentIdentifier}`;
        
        // Check if already loaded with the same content
        if (loadState === expectedLoadState) {
            console.log(`Component ${componentId} already loaded with: ${contentIdentifier}`);
            return true;
        }
        
        // If loaded with different content, need to reload
        if (loadState && loadState.startsWith('loaded:')) {
            const previousContent = loadState.substring(7); // Remove "loaded:" prefix
            console.log(`Component ${componentId} loaded with different content (${previousContent} → ${contentIdentifier}), reloading...`);
            componentElement.setAttribute('data-load-state', 'not-loaded');
        }
        
        // If currently loading, wait for it
        if (loadState === 'loading') {
            if (this.loadingPromises.has(componentId)) {
                return await this.loadingPromises.get(componentId);
            }
        }
        
        // Check cache first
        const cacheKey = this.generateCacheKey(componentElement);
        const cachedContent = this.getCachedContent(cacheKey);
        
        if (cachedContent) {
            console.log(`Loading component from cache: ${componentId}`);
            this.injectContent(componentElement, cachedContent, contentIdentifier);
            return true;
        }
        
        // Start loading process
        const loadingPromise = this.performDynamicLoad(componentElement, contentIdentifier);
        this.loadingPromises.set(componentId, loadingPromise);
        
        try {
            const result = await loadingPromise;
            this.loadingPromises.delete(componentId);
            return result;
        } catch (error) {
            this.loadingPromises.delete(componentId);
            throw error;
        }
    }
    
    /**
     * Perform the actual dynamic loading
     */
    async performDynamicLoad(componentElement, contentIdentifier) {
        const componentId = componentElement.id;
        // Re-evaluate protection within this scope for caching and behavior decisions
        const isProtected = componentElement.getAttribute('data-protected') === 'true';
        
        try {
            // Set loading state
            this.setLoadingState(componentElement, 'loading');
            this.showLoadingIndicator(componentElement);
            
            // Get component metadata
            const metadata = this.getComponentMetadata(componentElement);
            if (!metadata) {
                throw new Error('Component metadata not found');
            }
            
            // Prepare simplified request payload
            const requestPayload = {
                componentId: metadata.componentId,
                pageDefinition: metadata.pageDefinition,
                isSecured: isProtected, // Client hint for security
                urlParams: this.getCurrentUrlParams() // Include current URL parameters
            };

            // Make API request
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown API error');
            }
            
            // Cache the content (skip caching for protected content)
            if (!isProtected) {
                this.cacheContent(data.cacheKey, data.content);
            }
            
            // Inject content with identifier
            this.injectContent(componentElement, data.content, contentIdentifier);
            
            console.log(`Dynamic content loaded successfully: ${componentId} (${contentIdentifier})`);
            return true;
            
        } catch (error) {
            console.error(`Failed to load dynamic content for ${componentId}:`, error);
            this.setLoadingState(componentElement, 'failed');
            this.showErrorPlaceholder(componentElement);
            return false;
        }
    }
    
    /**
     * Get component metadata from element attributes
     */
    getComponentMetadata(componentElement) {
        try {
            const metadataJson = componentElement.getAttribute('data-component-metadata');
            if (!metadataJson) {
                console.error('No component metadata found');
                return null;
            }
            
            const metadata = JSON.parse(metadataJson);
            
            // Validate required fields
            const required = ['componentSpec', 'componentId', 'componentData', 'pageDefinition'];
            for (const field of required) {
                if (!metadata[field]) {
                    console.error(`Missing required metadata field: ${field}`);
                    return null;
                }
            }
            
            return metadata;
        } catch (error) {
            console.error('Error parsing component metadata:', error);
            return null;
        }
    }
    
    /**
     * Replace component shell with full populated content
     */
    injectContent(componentElement, content, contentIdentifier) {
        // Hide loading and error indicators
        this.hideLoadingIndicator(componentElement);
        this.hideErrorPlaceholder(componentElement);
        
        // Create a temporary container to parse the new content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Get the new component element from the content
        const newComponentElement = tempDiv.firstElementChild;
        if (!newComponentElement) {
            console.error('Invalid content received for component replacement');
            return;
        }
        
        // Preserve important attributes from the shell
        const shellId = componentElement.id;
        const shellNavHandler = componentElement.getAttribute('data-nav-handler');
        const shellNavConfig = componentElement.getAttribute('data-nav-config');
        const shellMetadata = componentElement.getAttribute('data-component-metadata');
        const shellInitHook = componentElement.getAttribute('data-init-hook');
        const wasDynamic = componentElement.getAttribute('data-dynamic') === 'true';
        
        // Ensure the new element has the correct attributes
        if (shellId) newComponentElement.id = shellId;
        if (shellNavHandler) newComponentElement.setAttribute('data-nav-handler', shellNavHandler);
        if (shellNavConfig) newComponentElement.setAttribute('data-nav-config', shellNavConfig);
        if (shellInitHook) newComponentElement.setAttribute('data-init-hook', shellInitHook);
        
        // Keep component dynamic if it was originally dynamic
        if (wasDynamic) {
            newComponentElement.setAttribute('data-dynamic', 'true');
            newComponentElement.setAttribute('data-component-metadata', shellMetadata);
        }
        
        // Mark as loaded with specific content identifier
        const loadState = contentIdentifier ? `loaded:${contentIdentifier}` : 'loaded';
        newComponentElement.setAttribute('data-load-state', loadState);
        
        // Replace the shell with the new content
        componentElement.parentNode.replaceChild(newComponentElement, componentElement);
        
        // Execute any scripts in the new content
        this.executeScripts(newComponentElement);

        // Trigger post-injection hooks
        this.triggerPostInjectionHooks(newComponentElement);
        
        console.log('Dynamic component replaced:', shellId, 'with state:', loadState);
    }
    
    /**
     * Execute scripts in injected content
     * Skips scripts that are already loaded to avoid redeclaration errors
     */
    executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        console.log('Dynamic Loader: Found', scripts.length, 'scripts to execute');
        
        scripts.forEach((script, index) => {
            // Skip external scripts that are already loaded (check if script with same src exists)
            if (script.src) {
                const existingScript = document.querySelector(`script[src="${script.src}"]`);
                if (existingScript) {
                    console.log('Dynamic Loader: Skipping already loaded script:', script.src);
                    return; // Skip this script
                }
                console.log('Dynamic Loader: Loading new script:', script.src);
            }
            
            console.log('Dynamic Loader: Executing script', index + 1);
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
                console.log('Dynamic Loader: Inline script, length:', script.textContent.length);
            }
            
            // Add type attribute if present
            if (script.type) {
                newScript.type = script.type;
            }
            
            document.head.appendChild(newScript);
        });
    }

    /**
     * Trigger component-level hooks after content injection
     * - Dispatch a CustomEvent 'component:contentLoaded' on the component element
     * - If the component declares a data-init-hook, call window[hookName](element)
     */
    triggerPostInjectionHooks(componentElement) {
        try {
            // Dispatch event for event-based listeners
            const evt = new CustomEvent('component:contentLoaded', {
                bubbles: true,
                detail: { element: componentElement, id: componentElement.id }
            });
            componentElement.dispatchEvent(evt);

            // Optional hook function name
            const hookName = componentElement.getAttribute('data-init-hook');
            console.log(`Dynamic Loader: Checking init hook for ${componentElement.id}: ${hookName}`);
            
            if (hookName && typeof window[hookName] === 'function') {
                console.log(`Dynamic Loader: Calling init hook: ${hookName}`);
                try {
                    window[hookName](componentElement);
                } catch (hookErr) {
                    console.warn(`Init hook '${hookName}' threw an error for ${componentElement.id}:`, hookErr);
                }
            } else if (hookName) {
                console.warn(`Init hook function '${hookName}' not found for ${componentElement.id}`);
            }
        } catch (e) {
            console.warn('Failed to trigger post-injection hooks:', e);
        }
    }
    
    /**
     * Set component loading state
     */
    setLoadingState(componentElement, state) {
        componentElement.setAttribute('data-load-state', state);
    }
    
    /**
     * Show loading indicator
     */
    showLoadingIndicator(componentElement) {
        const indicator = componentElement.querySelector('.loading-indicator');
        if (indicator) {
            indicator.style.display = 'block';
        }
    }
    
    /**
     * Hide loading indicator
     */
    hideLoadingIndicator(componentElement) {
        const indicator = componentElement.querySelector('.loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    /**
     * Show error placeholder
     */
    showErrorPlaceholder(componentElement) {
        this.hideLoadingIndicator(componentElement);
        const placeholder = componentElement.querySelector('.error-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }
    }
    
    /**
     * Hide error placeholder
     */
    hideErrorPlaceholder(componentElement) {
        const placeholder = componentElement.querySelector('.error-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    }
    
    /**
     * Generate cache key for component
     */
    generateCacheKey(componentElement) {
        const metadata = this.getComponentMetadata(componentElement);
        if (!metadata) return null;
        
        // Include URL parameters in cache key for context-specific content
        const urlParams = this.getCurrentUrlParams();
        const urlParamsHash = Object.keys(urlParams).length > 0 ? this.hashObject(urlParams) : 'no-params';
        
        return this.cachePrefix + metadata.componentSpec + '_' + 
               metadata.componentId + '_' + 
               this.hashObject(metadata.componentData) + '_' +
               urlParamsHash;
    }

    /**
     * Get current URL parameters
     * Checks both regular query string and hash-based parameters
     */
    getCurrentUrlParams() {
        const urlParams = {};
        
        // First, check regular query string
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams) {
            urlParams[key] = value;
        }
        
        // Also check hash for parameters (format: #path?param=value)
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
    
    /**
     * Get content identifier from URL parameters
     * This creates a unique identifier for the current content being requested
     */
    getContentIdentifier(componentElement) {
        const urlParams = this.getCurrentUrlParams();
        
        // If no URL params, use a default identifier
        if (Object.keys(urlParams).length === 0) {
            return 'default';
        }
        
        // Create identifier from URL params (sorted for consistency)
        const sortedParams = Object.keys(urlParams).sort().map(key => `${key}=${urlParams[key]}`).join('&');
        return sortedParams;
    }
    
    /**
     * Cache content in localStorage
     */
    cacheContent(cacheKey, content) {
        try {
            const cacheData = {
                content: content,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache content:', error);
        }
    }
    
    /**
     * Get cached content from localStorage
     */
    getCachedContent(cacheKey) {
        if (!cacheKey) return null;
        
        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            
            // Check if cache is still valid (24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (Date.now() - cacheData.timestamp > maxAge) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return cacheData.content;
        } catch (error) {
            console.warn('Failed to retrieve cached content:', error);
            return null;
        }
    }
    
    /**
     * Clear all cached content
     */
    clearCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.cachePrefix)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('Dynamic content cache cleared');
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }
    
    /**
     * Simple hash function for objects
     */
    hashObject(obj) {
        const str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}

// Create global instance
window.dynamicContentLoader = new DynamicContentLoader();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicContentLoader;
} 