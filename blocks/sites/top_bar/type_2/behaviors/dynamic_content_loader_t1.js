/**
 * Dynamic Content Loader System
 * Handles client-side dynamic component loading with caching and state management
 */
class DynamicContentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.cachePrefix = 'dynamic_content_';
        this.apiEndpoint = 'endpoints/dynamic_content_t1.php';
        
        console.log('Dynamic Content Loader initialized');
    }
    
    /**
     * Load dynamic content for all components in a container
     */
    async loadContainerContent(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container not found: ${containerId}`);
            return false;
        }
        
        // Find all dynamic components in the container
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
        
        // Skip if already loaded or currently loading
        if (loadState === 'loaded') {
            console.log(`Component already loaded: ${componentId}`);
            return true;
        }
        
        if (loadState === 'loading') {
            // Wait for existing loading promise
            if (this.loadingPromises.has(componentId)) {
                return await this.loadingPromises.get(componentId);
            }
        }
        
        // Check cache first
        const cacheKey = this.generateCacheKey(componentElement);
        const cachedContent = this.getCachedContent(cacheKey);
        
        if (cachedContent) {
            console.log(`Loading component from cache: ${componentId}`);
            this.injectContent(componentElement, cachedContent);
            return true;
        }
        
        // Start loading process
        const loadingPromise = this.performDynamicLoad(componentElement);
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
    async performDynamicLoad(componentElement) {
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
            
            // Inject content
            this.injectContent(componentElement, data.content);
            
            console.log(`Dynamic content loaded successfully: ${componentId}`);
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
     * Inject content into component shell
     */
    injectContent(componentElement, content) {
        const contentContainer = componentElement.querySelector('.dynamic-content-container');
        if (!contentContainer) {
            console.error('Content container not found in component shell');
            return;
        }
        
        // Hide loading and error indicators
        this.hideLoadingIndicator(componentElement);
        this.hideErrorPlaceholder(componentElement);
        
        // Safety check: strip wrapper if somehow it wasn't removed by API
        let finalContent = content;
        const wrapperMatch = content.match(/<div\s+data-component-wrapper="true"[^>]*>(.*?)<\/div>/s);
        if (wrapperMatch) {
            console.warn('Wrapper detected in content, stripping it');
            finalContent = wrapperMatch[1];
        }
        
        // Inject content
        contentContainer.innerHTML = finalContent;
        
        // Set loaded state
        this.setLoadingState(componentElement, 'loaded');
        
        // Execute any scripts in the injected content
        this.executeScripts(contentContainer);

        // Trigger post-injection hooks
        this.triggerPostInjectionHooks(componentElement);
    }
    
    /**
     * Execute scripts in injected content
     */
    executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
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
            if (hookName && typeof window[hookName] === 'function') {
                try {
                    window[hookName](componentElement);
                } catch (hookErr) {
                    console.warn(`Init hook '${hookName}' threw an error for ${componentElement.id}:`, hookErr);
                }
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
        
        return this.cachePrefix + metadata.componentSpec + '_' + 
               metadata.componentId + '_' + 
               this.hashObject(metadata.componentData);
    }

    /**
     * Get current URL parameters
     */
    getCurrentUrlParams() {
        const urlParams = {};
        const searchParams = new URLSearchParams(window.location.search);
        
        // Convert URLSearchParams to plain object
        for (const [key, value] of searchParams) {
            urlParams[key] = value;
        }
        
        return urlParams;
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