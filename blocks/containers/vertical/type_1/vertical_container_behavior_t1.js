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
            showVerticalContainer(container, parameters);
            break;
            
        case 'hidden':
        case 'hide':
            hideVerticalContainer(container, parameters);
            break;
            
        case 'toggle':
            toggleVerticalContainer(container, parameters);
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
function showVerticalContainer(container, parameters = {}) {
    container.style.display = 'flex';
    container.classList.remove('nav-hidden');
    container.classList.add('nav-visible');
    
    // Apply any transition effects if specified
    if (parameters.transition) {
        applyTransition(container, 'show', parameters.transition);
    }
    
    // Trigger custom event for other components to listen to
    container.dispatchEvent(new CustomEvent('verticalContainer:shown', {
        detail: { containerId: container.id, parameters }
    }));
}

/**
 * Hide the vertical container
 */
function hideVerticalContainer(container, parameters = {}) {
    container.classList.remove('nav-visible');
    container.classList.add('nav-hidden');
    
    // Apply any transition effects if specified
    if (parameters.transition) {
        applyTransition(container, 'hide', parameters.transition);
    } else {
        // Default hide behavior
        container.style.display = 'none';
    }
    
    // Trigger custom event for other components to listen to
    container.dispatchEvent(new CustomEvent('verticalContainer:hidden', {
        detail: { containerId: container.id, parameters }
    }));
}

/**
 * Toggle the vertical container visibility
 */
function toggleVerticalContainer(container, parameters = {}) {
    const isVisible = !container.classList.contains('nav-hidden') && 
                     container.style.display !== 'none';
    
    if (isVisible) {
        hideVerticalContainer(container, parameters);
    } else {
        showVerticalContainer(container, parameters);
    }
}

/**
 * Apply transition effects
 */
function applyTransition(container, action, transitionType) {
    switch (transitionType) {
        case 'fade':
            if (action === 'show') {
                container.style.opacity = '0';
                container.style.display = 'flex';
                setTimeout(() => {
                    container.style.transition = 'opacity 0.3s ease-in-out';
                    container.style.opacity = '1';
                }, 10);
            } else {
                container.style.transition = 'opacity 0.3s ease-in-out';
                container.style.opacity = '0';
                setTimeout(() => {
                    container.style.display = 'none';
                    container.style.transition = '';
                }, 300);
            }
            break;
            
        case 'slide':
            if (action === 'show') {
                container.style.transform = 'translateY(-20px)';
                container.style.display = 'flex';
                setTimeout(() => {
                    container.style.transition = 'transform 0.3s ease-in-out';
                    container.style.transform = 'translateY(0)';
                }, 10);
            } else {
                container.style.transition = 'transform 0.3s ease-in-out';
                container.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    container.style.display = 'none';
                    container.style.transition = '';
                    container.style.transform = '';
                }, 300);
            }
            break;
            
        default:
            // No transition, immediate show/hide
            if (action === 'hide') {
                container.style.display = 'none';
            }
    }
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
