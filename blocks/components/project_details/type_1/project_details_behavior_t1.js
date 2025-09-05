// Project Details Component Behavior
class ProjectDetailsBehavior {
    constructor() {
        this.init();
    }

    init() {
        console.log('Project Details: Initializing component...');
        console.log('Project Details: Component element found:', !!document.querySelector('.project-details'));
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Back button
        const backBtn = document.getElementById('project-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('Project Details: Back button clicked');
                this.handleBackToProjects();
            });
        }
    }




    handleBackToProjects() {
        console.log('Project Details: Navigating back to projects');
        
        // Hide the project details container
        if (window.handleVerticalContainerNavigation) {
            window.handleVerticalContainerNavigation('project-details-main-container', 'hide');
        }
        
        // Show the projects container
        if (window.handleVerticalContainerNavigation) {
            window.handleVerticalContainerNavigation('projects-main-container', 'show');
        }
        
        // Update URL hash
        window.location.hash = '#projects-main-container/visible.projects';
    }
}

// Initialize the behavior
const projectDetailsBehavior = new ProjectDetailsBehavior();

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
