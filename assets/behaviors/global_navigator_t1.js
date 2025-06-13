/**
 * Global Navigator System
 * Manages state-based navigation across the entire application
 * Parses hash URLs and coordinates with local navigation handlers
 */
class GlobalNavigator {
    constructor() {
        this.currentState = {};
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
    handleHashChange() {
        const hash = window.location.hash.substring(1); // Remove #
        
        if (!hash) {
            // No hash, show default states
            this.showDefaultStates();
            return;
        }
        
        const navigationState = this.parseHash(hash);
        this.executeNavigation(navigationState);
    }
    
    /**
     * Parse hash URL into navigation state
     * Format: #elementId1/state1/param1=value1&param2=value2|elementId2/state2
     */
    parseHash(hash) {
        const navigationState = new Map();
        
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
        
        return navigationState;
    }
    
    /**
     * Execute navigation based on parsed state
     */
    executeNavigation(navigationState) {
        // First, turn off all current states (except those being explicitly set)
        this.turnOffCurrentStates(navigationState);
        
        // Then, turn on new states
        navigationState.forEach((config, elementId) => {
            this.setElementState(elementId, config.state, config.parameters);
        });
        
        // Update current state
        this.currentState = navigationState;
    }
    
    /**
     * Turn off current states for elements not in new navigation state
     */
    turnOffCurrentStates(newNavigationState) {
        this.registeredHandlers.forEach((handlerName, elementId) => {
            if (!newNavigationState.has(elementId)) {
                // Element not in new state, hide it
                this.setElementState(elementId, 'hidden');
            }
        });
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
            const result = handlerFunction(elementId, state, parameters);
            console.log(`Navigation: ${elementId} -> ${state}`, parameters);
            return result;
        } catch (error) {
            console.error(`Error calling handler ${handlerName} for ${elementId}:`, error);
            return false;
        }
    }
    
    /**
     * Show default states for all registered elements
     */
    showDefaultStates() {
        this.registeredHandlers.forEach((handlerName, elementId) => {
            const defaultState = this.defaultStates.get(elementId) || 'visible';
            this.setElementState(elementId, defaultState);
        });
        
        this.currentState = new Map();
    }
    
    /**
     * Navigate to a specific state (programmatic navigation)
     */
    navigate(elementId, state, parameters = {}) {
        const newState = new Map(this.currentState);
        newState.set(elementId, { state, parameters });
        
        // Update hash
        const hashString = this.buildHashFromState(newState);
        window.location.hash = hashString;
    }
    
    /**
     * Navigate to multiple states at once
     */
    navigateMultiple(stateMap) {
        const newState = new Map();
        
        // Convert object to Map if needed
        if (stateMap instanceof Map) {
            stateMap.forEach((config, elementId) => {
                newState.set(elementId, config);
            });
        } else {
            Object.entries(stateMap).forEach(([elementId, config]) => {
                newState.set(elementId, config);
            });
        }
        
        // Update hash
        const hashString = this.buildHashFromState(newState);
        window.location.hash = hashString;
    }
    
    /**
     * Build hash string from navigation state
     */
    buildHashFromState(navigationState) {
        const elementStates = [];
        
        navigationState.forEach((config, elementId) => {
            let stateString = `${elementId}/${config.state}`;
            
            // Add parameters if any
            if (config.parameters && Object.keys(config.parameters).length > 0) {
                const paramPairs = Object.entries(config.parameters)
                    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                stateString += `/${paramPairs.join('&')}`;
            }
            
            elementStates.push(stateString);
        });
        
        return elementStates.join('|');
    }
    
    /**
     * Get current navigation state
     */
    getCurrentState() {
        return new Map(this.currentState);
    }
    
    /**
     * Check if an element is in a specific state
     */
    isElementInState(elementId, state) {
        const currentConfig = this.currentState.get(elementId);
        return currentConfig && currentConfig.state === state;
    }
}

// Create global instance
window.globalNavigator = new GlobalNavigator();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.globalNavigator.init();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalNavigator;
} 