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
 * Navigation links should only modify the hash - global navigator handles the rest
 */
function setupNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only modify the hash - global navigator will handle everything else
            // The hash format includes the tab ID for highlighting: #elementId/state.tabId
            const targetId = this.getAttribute('data-target');
            const tabId = this.getAttribute('data-tab-id') || targetId;
            
            if (targetId) {
                // Build hash with tab highlighting signal
                window.location.hash = `${targetId}/visible.${tabId}`;
            }
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
 * This component acts as a local navigator for tab highlighting
 */
function setupGlobalNavigatorIntegration() {
    // No need to listen to hashchange - global navigator handles that
    // This component will receive tab highlighting updates via updateTabHighlighting()
}

/**
 * Update tab highlighting - called by global navigator
 * This is the local navigator function for tab highlighting
 */
function updateTabHighlighting(activeTabId) {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Clear all active states first
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Highlight the specified tab if provided
    if (activeTabId) {
        navLinks.forEach(link => {
            const tabId = link.getAttribute('data-tab-id') || link.getAttribute('data-target');
            if (tabId === activeTabId) {
                link.classList.add('active');
                currentActiveTab = link;
            }
        });
    } else {
        currentActiveTab = null;
    }
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
    clearActiveStates,
    updateTabHighlighting
}; 