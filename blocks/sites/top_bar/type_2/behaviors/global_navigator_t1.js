/**
 * Global Navigator System
 * Manages state-based navigation across the entire application
 * Parses hash URLs and coordinates with local navigation handlers
 */
class GlobalNavigator {
    constructor() {
        this.currentState = new Map();
        this.previousState = new Map(); // Track previous state
        this.registeredHandlers = new Map();
        this.defaultStates = new Map();
        this.isInitialized = false;
        
        // Bind methods to maintain context
        this.handleHashChange = this.handleHashChange.bind(this);
        this.navigate = this.navigate.bind(this);
        
        console.log('Global Navigator initialized');
    }
    
    /**
     * Initialize the global navigator
     */
    init() {
        if (this.isInitialized) {
            console.warn('Global Navigator already initialized');
            return;
        }
        
        // Discover and register all navigation handlers
        this.discoverNavigationHandlers();
        
        // Set up hash change listener
        window.addEventListener('hashchange', this.handleHashChange);
        
        // Handle initial hash on page load
        this.handleHashChange();
        
        this.isInitialized = true;
        console.log('Global Navigator ready');
    }
    
    /**
     * Discover all elements with navigation handlers
     */
    discoverNavigationHandlers() {
        const navigableElements = document.querySelectorAll('[data-nav-handler]');
        
        navigableElements.forEach(element => {
            const handlerName = element.getAttribute('data-nav-handler');
            const elementId = element.id;
            
            if (elementId && handlerName) {
                this.registerHandler(elementId, handlerName);
                
                // Store default state if available
                const navConfig = element.getAttribute('data-nav-config');
                if (navConfig) {
                    try {
                        const config = JSON.parse(navConfig);
                        this.defaultStates.set(elementId, config.defaultState || 'visible');
                    } catch (e) {
                        console.warn(`Invalid nav config for ${elementId}:`, e);
                    }
                }
            }
        });
        
        console.log(`Discovered ${this.registeredHandlers.size} navigation handlers`);
    }
    
    /**
     * Register a navigation handler for an element
     */
    registerHandler(elementId, handlerFunction) {
        if (typeof window[handlerFunction] === 'function') {
            this.registeredHandlers.set(elementId, handlerFunction);
            console.log(`Registered handler: ${elementId} -> ${handlerFunction}`);
        } else {
            console.warn(`Handler function not found: ${handlerFunction} for element ${elementId}`);
        }
    }
    
    /**
     * Handle hash change events
     */
    async handleHashChange() {
        const hash = window.location.hash.substring(1); // Remove #
        
        if (!hash) {
            // No hash, restore all to default states
            this.restoreAllToDefaults();
            this.updateTabHighlighting(null);
            return;
        }
        
        const { navigationState, activeTab } = this.parseHash(hash);
        await this.executeNavigation(navigationState);
        this.updateTabHighlighting(activeTab);
    }
    
    /**
     * Parse hash URL into navigation state
     * Format: #elementId1/state1/param1=value1&param2=value2|elementId2/state2.tabId
     */
    parseHash(hash) {
        const navigationState = new Map();
        let activeTab = null;
        
        // Check for tab highlighting signal at the end (after final .)
        const tabSplit = hash.split('.');
        if (tabSplit.length > 1) {
            activeTab = tabSplit.pop(); // Get the tab ID
            hash = tabSplit.join('.'); // Rejoin in case there were other dots
        }
        
        // Split by | for multiple element states
        const elementStates = hash.split('|');
        
        elementStates.forEach(elementState => {
            const parts = elementState.split('/');
            
            if (parts.length >= 2) {
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
            }
        });
        
        return { navigationState, activeTab };
    }
    
    /**
     * Execute navigation based on parsed state
     */
    async executeNavigation(navigationState) {
        // 1) Save current as previous
        this.previousState = new Map(this.currentState);
        
        // 2) Load dynamic content for elements to be shown
        await this.handleDynamicContentLoading(navigationState);
        
        // 3) Restore previous elements to defaults, but skip elements under the next page container
        this.restorePreviousElementsToDefaults(navigationState);
        
        // 4) Apply new navigation states
        navigationState.forEach((config, elementId) => {
            const element = document.getElementById(elementId);
            const isProtected = element && element.getAttribute('data-protected') === 'true';
            const authed = !!(window.authManager && window.authManager.isAuthenticated);
            if (isProtected && !authed) {
                console.warn(`Blocked navigation to protected element without auth: ${elementId}`);
                return;
            }
            this.setElementState(elementId, config.state, config.parameters);
        });
        
        // 5) Update current state
        this.currentState = navigationState;
    }
    
    /**
     * Handle dynamic content loading for containers that will become visible
     */
    async handleDynamicContentLoading(navigationState) {
        if (window.topBarSiteDynamicContent && typeof window.topBarSiteDynamicContent.loadContainerContent === 'function') {
            console.log('Using site-specific dynamic content loader');
            try {
                const authed = !!(window.authManager && window.authManager.isAuthenticated);
                const filteredState = new Map();
                navigationState.forEach((cfg, elementId) => {
                    const el = document.getElementById(elementId);
                    const isProtected = el && el.getAttribute('data-protected') === 'true';
                    if (isProtected && !authed) return;
                    filteredState.set(elementId, cfg);
                });
                await window.topBarSiteDynamicContent.loadContainerContent(filteredState);
            } catch (error) {
                console.error('Error in site-specific dynamic content loading:', error);
            }
        }
    }
    
    /**
     * Restore previous elements to default states, skipping elements under the next page container
     */
    restorePreviousElementsToDefaults(nextNavigationState = null) {
        let nextContainerId = null;
        const containerSelector = '[data-nav-handler="handleVerticalContainerNavigation"], [data-nav-handler="handleHorizontalContainerNavigation"]';
        if (nextNavigationState && nextNavigationState.size > 0) {
            for (const [elementId] of nextNavigationState) {
                const el = document.getElementById(elementId);
                if (el) {
                    const parentContainer = el.closest(containerSelector);
                    if (parentContainer) {
                        nextContainerId = parentContainer.id;
                        break;
                    }
                }
            }
        }

        this.previousState.forEach((config, elementId) => {
            if (nextContainerId) {
                const el = document.getElementById(elementId);
                if (el) {
                    const parentContainer = el.closest(containerSelector);
                    if (parentContainer && parentContainer.id === nextContainerId) {
                        return; // same-page; do not reset
                    }
                }
            }

            const defaultState = this.defaultStates.get(elementId) || 'visible';
            this.setElementState(elementId, defaultState);
        });
    }

    /**
     * Restore all registered elements to their default states
     */
    restoreAllToDefaults() {
        this.registeredHandlers.forEach((handlerName, elementId) => {
            const defaultState = this.defaultStates.get(elementId) || 'visible';
            this.setElementState(elementId, defaultState);
        });
        
        this.currentState = new Map();
        this.previousState = new Map();
    }
    
    /**
     * Set state for a specific element
     */
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
        
        try {
            const siteParameters = this.getSiteParametersForElement(elementId, state);
            const combinedParameters = { ...siteParameters, ...parameters };
            const result = handlerFunction(elementId, state, combinedParameters);
            return result;
        } catch (error) {
            console.error(`Error calling handler ${handlerName} for ${elementId}:`, error);
            return false;
        }
    }
    
    getSiteParametersForElement(elementId, state) {
        return {};
    }
    
    navigate(elementId, state, parameters = {}, activeTab = null) {
        const newState = new Map();
        newState.set(elementId, { state, parameters });
        const hashString = this.buildHashFromState(newState, activeTab);
        window.location.hash = hashString;
    }
    
    navigateMultiple(stateMap, activeTab = null) {
        const newState = new Map();
        if (stateMap instanceof Map) {
            stateMap.forEach((config, elementId) => newState.set(elementId, config));
        } else {
            Object.entries(stateMap).forEach(([elementId, config]) => newState.set(elementId, config));
        }
        const hashString = this.buildHashFromState(newState, activeTab);
        window.location.hash = hashString;
    }
    
    buildHashFromState(navigationState, activeTab = null) {
        const elementStates = [];
        navigationState.forEach((config, elementId) => {
            let stateString = `${elementId}/${config.state}`;
            if (config.parameters && Object.keys(config.parameters).length > 0) {
                const paramPairs = Object.entries(config.parameters).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                stateString += `/${paramPairs.join('&')}`;
            }
            elementStates.push(stateString);
        });
        let hashString = elementStates.join('|');
        if (activeTab) hashString += `.${activeTab}`;
        return hashString;
    }
    
    getCurrentState() { return new Map(this.currentState); }
    isElementInState(elementId, state) { const currentConfig = this.currentState.get(elementId); return currentConfig && currentConfig.state === state; }
    
    updateTabHighlighting(activeTab) {
        if (window.topBarNavigation && typeof window.topBarNavigation.updateTabHighlighting === 'function') {
            window.topBarNavigation.updateTabHighlighting(activeTab);
        } else {
            this.directUpdateTabHighlighting(activeTab);
        }
    }
    
    directUpdateTabHighlighting(activeTab) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        if (activeTab) {
            navLinks.forEach(link => {
                const tabId = link.getAttribute('data-tab-id') || link.getAttribute('data-target');
                if (tabId === activeTab) link.classList.add('active');
            });
        }
    }
}

window.globalNavigator = new GlobalNavigator();
document.addEventListener('DOMContentLoaded', function() { window.globalNavigator.init(); });
if (typeof module !== 'undefined' && module.exports) { module.exports = GlobalNavigator; } 