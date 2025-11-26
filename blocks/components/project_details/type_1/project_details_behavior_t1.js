// Project Details Component Behavior
// Use IIFE to avoid redeclaration issues on dynamic reload
(function() {
    'use strict';
    
    function initializeProjectDetails() {
        console.log('Project Details: Initializing component...');
        console.log('Project Details: Component element found:', !!document.querySelector('.project-details'));
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
        window.location.hash = '#projects-main-container/visible';
    }

    // Export initialization function for dynamic loading
    window.initializeProjectDetailsComponent = initializeProjectDetails;

    // Initialize on load
    initializeProjectDetails();
})();

// Export functions for global access (navigation handler only)
window.handleProjectDetailsNavigation = function(elementId, action, config) {
    console.log('Project Details: Navigation handler called', { elementId, action, config });
    
    switch (action) {
        case 'scrollTo':
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
            break;
        case 'show':
            const showElement = document.getElementById(elementId);
            if (showElement) {
                showElement.style.display = 'block';
                showElement.classList.remove('nav-hidden');
                showElement.classList.add('nav-visible');
            }
            break;
        case 'hide':
            const hideElement = document.getElementById(elementId);
            if (hideElement) {
                hideElement.style.display = 'none';
                hideElement.classList.remove('nav-visible');
                hideElement.classList.add('nav-hidden');
            }
            break;
        default:
            console.warn('Project Details: Unknown navigation action:', action);
    }
};

console.log('Project Details: Behavior script loaded');
