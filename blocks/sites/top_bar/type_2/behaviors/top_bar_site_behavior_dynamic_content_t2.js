/**
 * Top Bar Site Dynamic Content Behavior
 * Site-specific dynamic content loading integration
 */
class TopBarSiteDynamicContent {
    constructor() {
        this.isInitialized = false;
        this.loadingQueue = new Map();
        
        console.log('Top Bar Site Dynamic Content initialized');
    }
    
    /**
     * Initialize the dynamic content system
     */
    async init() {
        if (this.isInitialized) {
            return;
        }
        
        // Wait for global dynamic content loader to be available
        await this.waitForDynamicContentLoader();
        
        // Setup site-specific configurations
        this.setupSiteConfiguration();
        
        this.isInitialized = true;
        console.log('Top Bar Site Dynamic Content system ready');
    }
    
    /**
     * Wait for the global dynamic content loader to be available
     */
    async waitForDynamicContentLoader() {
        return new Promise((resolve) => {
            const checkLoader = () => {
                if (window.dynamicContentLoader) {
                    resolve();
                } else {
                    setTimeout(checkLoader, 100);
                }
            };
            checkLoader();
        });
    }
    
    /**
     * Setup site-specific configuration for dynamic loading
     */
    setupSiteConfiguration() {
        // Configure API endpoint if different for this site
        if (window.dynamicContentLoader) {
            // Site-specific configurations can be set here
            // For example, different API endpoints, cache settings, etc.
        }
    }
    
    /**
     * Load dynamic content for containers that will become visible
     * This is the main function called by the global navigator
     */
    async loadContainerContent(navigationState) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        if (!window.dynamicContentLoader) {
            console.warn('Dynamic content loader not available');
            return false;
        }
        
        const loadingPromises = [];
        
        // Process each element in the navigation state
        navigationState.forEach((config, elementId) => {
            // Check if element will become visible and might contain dynamic content
            if (config.state === 'visible') {
                console.log(`Checking for dynamic content in container: ${elementId}`);
                
                // Add to loading queue to prevent duplicate requests
                if (!this.loadingQueue.has(elementId)) {
                    const loadPromise = this.loadContainerContentInternal(elementId);
                    this.loadingQueue.set(elementId, loadPromise);
                    loadingPromises.push(loadPromise);
                    
                    // Clean up queue after completion
                    loadPromise.finally(() => {
                        this.loadingQueue.delete(elementId);
                    });
                } else {
                    // Use existing promise
                    loadingPromises.push(this.loadingQueue.get(elementId));
                }
            }
        });
        
        if (loadingPromises.length > 0) {
            console.log(`Waiting for ${loadingPromises.length} dynamic content loading operations...`);
            try {
                const results = await Promise.all(loadingPromises);
                const successCount = results.filter(result => result === true).length;
                console.log(`Dynamic content loading completed: ${successCount}/${results.length} successful`);
                return successCount === results.length;
            } catch (error) {
                console.error('Error during dynamic content loading:', error);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Internal method to load content for a specific container
     */
    async loadContainerContentInternal(containerId) {
        try {
            // Use the global dynamic content loader
            const result = await window.dynamicContentLoader.loadContainerContent(containerId);
            
            // Site-specific post-processing if needed
            if (result) {
                await this.postProcessContainer(containerId);
            }
            
            return result;
        } catch (error) {
            console.error(`Error loading content for container ${containerId}:`, error);
            return false;
        }
    }
    
    /**
     * Post-process container after dynamic content loading
     */
    async postProcessContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }
        
        // Site-specific post-processing
        // For example: initialize site-specific components, apply themes, etc.
        
        // Initialize any newly loaded components that need site-specific setup
        this.initializeNewComponents(container);
        
        // Apply site theme to newly loaded content
        this.applySiteTheme(container);
        
        // Setup site-specific event listeners
        this.setupContainerEventListeners(container);
    }
    
    /**
     * Initialize newly loaded components with site-specific setup
     */
    initializeNewComponents(container) {
        // Find newly loaded dynamic components
        const dynamicComponents = container.querySelectorAll('[data-dynamic="true"][data-load-state="loaded"]');
        
        dynamicComponents.forEach(component => {
            // Apply site-specific initialization
            this.initializeComponent(component);
        });
    }
    
    /**
     * Initialize a specific component with site-specific setup
     */
    initializeComponent(component) {
        const componentId = component.id;
        
        // Add site-specific classes or attributes
        component.classList.add('site-initialized');
        
        // Setup component-specific behaviors
        // This could include theme integration, animation setup, etc.
        
        console.log(`Site-specific initialization completed for component: ${componentId}`);
    }
    
    /**
     * Apply site theme to newly loaded content
     */
    applySiteTheme(container) {
        // Apply current theme to newly loaded content
        if (window.currentTheme) {
            container.setAttribute('data-theme', window.currentTheme);
        }
        
        // Apply any site-specific styling
        const dynamicContent = container.querySelectorAll('.dynamic-content-container');
        dynamicContent.forEach(content => {
            content.classList.add('site-themed-content');
        });
    }
    
    /**
     * Setup event listeners for newly loaded container content
     */
    setupContainerEventListeners(container) {
        // Setup site-specific event listeners for newly loaded content
        // For example: click handlers, hover effects, etc.
        
        const interactiveElements = container.querySelectorAll('[data-interactive="true"]');
        interactiveElements.forEach(element => {
            this.setupElementInteractions(element);
        });
    }
    
    /**
     * Setup interactions for a specific element
     */
    setupElementInteractions(element) {
        // Site-specific interaction setup
        // This could include hover effects, click animations, etc.
        
        element.addEventListener('click', (event) => {
            // Site-specific click handling
            console.log('Site-specific click handler:', element.id);
        });
    }
    
    /**
     * Check if a container has dynamic content that needs loading
     */
    hasUnloadedDynamicContent(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            return false;
        }
        
        const unloadedComponents = container.querySelectorAll('[data-dynamic="true"][data-load-state="not-loaded"]');
        return unloadedComponents.length > 0;
    }
    
    /**
     * Get loading statistics for debugging
     */
    getLoadingStats() {
        return {
            isInitialized: this.isInitialized,
            activeLoadingOperations: this.loadingQueue.size,
            queuedContainers: Array.from(this.loadingQueue.keys())
        };
    }
    
    /**
     * Force reload dynamic content for a container (bypass cache)
     */
    async forceReloadContainer(containerId) {
        if (!window.dynamicContentLoader) {
            console.warn('Dynamic content loader not available');
            return false;
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container not found: ${containerId}`);
            return false;
        }
        
        // Reset all dynamic components in the container
        const dynamicComponents = container.querySelectorAll('[data-dynamic="true"]');
        dynamicComponents.forEach(component => {
            component.setAttribute('data-load-state', 'not-loaded');
            
            // Clear content
            const contentContainer = component.querySelector('.dynamic-content-container');
            if (contentContainer) {
                contentContainer.innerHTML = '';
            }
            
            // Hide loading/error indicators
            const loadingIndicator = component.querySelector('.loading-indicator');
            const errorPlaceholder = component.querySelector('.error-placeholder');
            
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (errorPlaceholder) errorPlaceholder.style.display = 'none';
        });
        
        // Force reload
        return await this.loadContainerContentInternal(containerId);
    }
}

// Create global instance for the site
window.topBarSiteDynamicContent = new TopBarSiteDynamicContent();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TopBarSiteDynamicContent;
} 