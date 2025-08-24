/**
 * Navigation state handler for vertical container
 * Manages visibility state (hidden/visible)
 * Called by the main navigator system
 */
function handleVerticalContainerNavigation(containerId, state, parameters = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Vertical container not found: ${containerId}`);
        return false;
    }
    
    // Handle different navigation states
    switch (state) {
        case 'visible':
        case 'show':
            showVerticalContainer(container);
            break;
            
        case 'hidden':
        case 'hide':
            hideVerticalContainer(container);
            break;
            
        case 'scrollTo':
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
            
        default:
            console.warn(`Unknown navigation state for vertical container: ${state}`);
            return false;
    }
    
    return true;
}

/**
 * Show the vertical container
 */
function showVerticalContainer(container) {
    container.style.display = 'block';
    container.classList.remove('nav-hidden');
    container.classList.add('nav-visible');
    
    // Trigger custom event for other components to listen to
    container.dispatchEvent(new CustomEvent('verticalContainer:shown', {
        detail: { containerId: container.id }
    }));
}

/**
 * Hide the vertical container
 */
function hideVerticalContainer(container) {
    container.classList.remove('nav-visible');
    container.classList.add('nav-hidden');
    container.style.display = 'none';
    
    // Trigger custom event for other components to listen to
    container.dispatchEvent(new CustomEvent('verticalContainer:hidden', {
        detail: { containerId: container.id }
    }));
}

/**
 * Initialize vertical container navigation
 * Set up default state and any initial configuration
 */
function initializeVerticalContainerNavigation(containerId, config = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Cannot initialize navigation for vertical container: ${containerId}`);
        return;
    }
    
    // Set default state
    const defaultState = config.defaultState || 'visible';
    const initialParameters = config.initialParameters || {};
    
    // Apply default state
    handleVerticalContainerNavigation(containerId, defaultState, initialParameters);
    
    // Store navigation config on the element for future reference
    container.setAttribute('data-nav-config', JSON.stringify(config));
    
    console.log(`Vertical container navigation initialized: ${containerId} (default: ${defaultState})`);
}

// Export functions to global scope for the navigation system
window.handleVerticalContainerNavigation = handleVerticalContainerNavigation;
window.initializeVerticalContainerNavigation = initializeVerticalContainerNavigation;
