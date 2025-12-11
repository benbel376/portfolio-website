// Project Details Component Behavior
// Use IIFE to avoid redeclaration issues on dynamic reload
(function() {
    'use strict';
    
    function initializeProjectDetails() {
        console.log('Project Details: Initializing component...');
        console.log('Project Details: Component element found:', !!document.querySelector('.project-details-component'));
        setupEventListeners();
    }

    function setupEventListeners() {
        // Use event delegation on document for all back buttons
        document.addEventListener('click', function(e) {
            const backBtn = e.target.closest('.project-details__back-btn');
            if (backBtn) {
                e.preventDefault();
                console.log('Project Details: Back button clicked');
                handleBackToProjects();
            }
        });
        console.log('Project Details: Back button listener attached via delegation');
    }

    function handleBackToProjects() {
        console.log('Project Details: Navigating back to projects');
        
        // Update URL hash - tab highlighting is automatic via data-parent-tab
        window.location.hash = '#projects-main-container';
    }

    // Export initialization function for dynamic loading
    window.initializeProjectDetailsComponent = initializeProjectDetails;

    // Initialize on load
    initializeProjectDetails();
})();

// Export functions for global access (navigation handler only)
window.handleProjectDetailsNavigation = function(elementId, state, parameters = {}) {
    console.log('Project Details: Navigation handler called', { elementId, state, parameters });
    
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn('Project Details: Element not found:', elementId);
        return false;
    }
    
    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            break;
        case 'hidden':
            element.classList.remove('nav-visible');
            element.classList.add('nav-hidden');
            setTimeout(() => {
                if (element.classList.contains('nav-hidden')) {
                    element.style.display = 'none';
                }
            }, 300);
            break;
        case 'scrollTo':
            element.scrollIntoView({ behavior: 'smooth' });
            break;
        default:
            console.warn('Project Details: Unknown state:', state);
            return false;
    }
    return true;
};

console.log('Project Details: Behavior script loaded');
