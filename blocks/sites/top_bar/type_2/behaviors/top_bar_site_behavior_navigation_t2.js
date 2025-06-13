/**
 * Top Bar Site Navigation Behavior - Type 2
 * Integrates with Global Navigator System
 */

// Navigation state management
let currentActiveTab = null;

/**
 * Initialize navigation system
 */
function initializeNavigation() {
    console.log('Initializing Top Bar Navigation Type 2');
    
    // Set up navigation link click handlers
    setupNavigationLinks();
    
    // Set up mobile menu toggle
    setupMobileMenu();
    
    // Listen for global navigator events
    setupGlobalNavigatorIntegration();
}

/**
 * Set up navigation link click handlers
 */
function setupNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Let the browser handle the hash navigation
            // The global navigator will pick it up via hashchange event
            
            // Update active state immediately for better UX
            updateActiveTab(this);
        });
    });
}

/**
 * Set up mobile menu toggle functionality
 */
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggleBtn');
    const navLinksList = document.querySelector('.nav-links-list');
    
    if (mobileMenuToggle && navLinksList) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle mobile menu visibility
            navLinksList.classList.toggle('mobile-open');
            
            // Update icon
            const icon = this.querySelector('ion-icon');
            if (icon) {
                icon.setAttribute('name', isExpanded ? 'menu-outline' : 'close-outline');
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !navLinksList.contains(e.target)) {
                navLinksList.classList.remove('mobile-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                
                const icon = mobileMenuToggle.querySelector('ion-icon');
                if (icon) {
                    icon.setAttribute('name', 'menu-outline');
                }
            }
        });
    }
}

/**
 * Set up integration with global navigator
 */
function setupGlobalNavigatorIntegration() {
    // Listen for navigation events from global navigator
    window.addEventListener('globalNavigator:stateChanged', function(e) {
        const { elementId, state, parameters } = e.detail;
        updateNavigationForState(elementId, state);
    });
    
    // Listen for hash changes to update active tab
    window.addEventListener('hashchange', function() {
        updateActiveTabFromHash();
    });
    
    // Initial update
    updateActiveTabFromHash();
}

/**
 * Update active tab based on current hash
 */
function updateActiveTabFromHash() {
    const hash = window.location.hash.substring(1); // Remove #
    
    if (!hash) {
        // No hash, clear active states
        clearActiveStates();
        return;
    }
    
    // Parse hash to get target element
    const parts = hash.split('/');
    const targetId = parts[0];
    
    // Find and activate corresponding nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkTarget = link.getAttribute('data-target');
        if (linkTarget === targetId) {
            updateActiveTab(link);
        }
    });
}

/**
 * Update active tab styling
 */
function updateActiveTab(activeLink) {
    // Remove active class from all links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    if (activeLink) {
        activeLink.classList.add('active');
        currentActiveTab = activeLink;
    }
}

/**
 * Clear all active states
 */
function clearActiveStates() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    currentActiveTab = null;
}

/**
 * Update navigation based on global navigator state
 */
function updateNavigationForState(elementId, state) {
    // Update tab states based on element visibility
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkTarget = link.getAttribute('data-target');
        
        if (linkTarget === elementId) {
            // Update link appearance based on state
            if (state === 'visible') {
                link.classList.add('active');
            } else if (state === 'hidden') {
                link.classList.remove('active');
            }
        }
    });
}

/**
 * Programmatically navigate to a tab
 */
function navigateToTab(targetId, state = 'visible', parameters = {}) {
    if (window.globalNavigator) {
        window.globalNavigator.navigate(targetId, state, parameters);
    } else {
        console.warn('Global Navigator not available');
    }
}

/**
 * Get current active tab
 */
function getCurrentActiveTab() {
    return currentActiveTab;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

// Export functions for external use
window.topBarNavigation = {
    navigateToTab,
    getCurrentActiveTab,
    updateActiveTab,
    clearActiveStates
}; 