/**
 * Top Bar Site Auto Navigation Behavior - Type 2
 * Handles automatic navigation on first load based on default navigation configuration
 */

/**
 * Initialize auto navigation on first load
 */
function initializeAutoNavigation() {
    console.log('Initializing Auto Navigation for Top Bar Site Type 2');
    
    // Only trigger auto navigation if there's no hash already
    if (window.location.hash) {
        console.log('Hash already present, skipping auto navigation');
        return;
    }
    
    // Get default navigation configuration from site container
    const siteContainer = document.querySelector('.site-container');
    if (!siteContainer) {
        console.warn('Site container not found for auto navigation');
        return;
    }
    
    const defaultNavConfig = siteContainer.getAttribute('data-default-navigation');
    if (!defaultNavConfig) {
        console.log('No default navigation configuration found');
        return;
    }
    
    try {
        const navConfig = JSON.parse(defaultNavConfig);
        
        if (navConfig.hash) {
            console.log('Applying default navigation:', navConfig.hash);
            
            // Set the hash to trigger navigation
            window.location.hash = navConfig.hash;
            
            console.log('Auto navigation applied successfully');
        } else {
            console.warn('Default navigation configuration missing hash property');
        }
        
    } catch (error) {
        console.error('Error parsing default navigation configuration:', error);
    }
}

/**
 * Check if this is the first load (no hash and no previous navigation)
 */
function isFirstLoad() {
    // Check if there's no hash
    if (window.location.hash) {
        return false;
    }
    
    // Check if global navigator has any current state
    if (window.globalNavigator && window.globalNavigator.getCurrentState) {
        const currentState = window.globalNavigator.getCurrentState();
        return currentState.size === 0;
    }
    
    return true;
}

// Initialize auto navigation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure global navigator is initialized
    setTimeout(() => {
        if (isFirstLoad()) {
            initializeAutoNavigation();
        }
    }, 100);
});

// Export for external use
window.topBarAutoNavigation = {
    initializeAutoNavigation,
    isFirstLoad
}; 