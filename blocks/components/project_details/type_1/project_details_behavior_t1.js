// Project Details Component Behavior
class ProjectDetailsBehavior {
    constructor() {
        this.projectData = null;
        this.init();
    }

    init() {
        console.log('Project Details: Initializing component...');
        console.log('Project Details: Component element found:', !!document.querySelector('.project-details'));
        this.setupEventListeners();
        
        // Check if data is already available
        if (window.projectDetailsData) {
            console.log('Project Details: Setting data from global variable:', window.projectDetailsData);
            this.setProjectDetailsData(window.projectDetailsData);
        } else {
            console.log('Project Details: No global data found yet');
        }
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

    setProjectDetailsData(data) {
        console.log('Project Details: Setting project data:', data);
        this.projectData = data;
        this.renderProjectDetails();
    }

    renderProjectDetails() {
        if (!this.projectData) {
            console.warn('Project Details: No project data available');
            return;
        }

        console.log('Project Details: Rendering project details');

        // Update banner image
        const bannerImage = document.getElementById('project-banner-image');
        if (bannerImage && this.projectData.bannerImage) {
            bannerImage.src = this.projectData.bannerImage;
            bannerImage.alt = `${this.projectData.title} Banner`;
        }

        // Update title
        const title = document.getElementById('project-title');
        if (title && this.projectData.title) {
            title.textContent = this.projectData.title;
        }

        // Update meta information
        const category = document.getElementById('project-category');
        if (category && this.projectData.category) {
            category.textContent = this.projectData.category;
        }

        const status = document.getElementById('project-status');
        if (status && this.projectData.status) {
            status.textContent = this.projectData.status;
        }

        const year = document.getElementById('project-year');
        if (year && this.projectData.year) {
            year.textContent = this.projectData.year;
        }

        // Update description
        const description = document.getElementById('project-description');
        if (description && this.projectData.description) {
            description.innerHTML = `<p>${this.projectData.description}</p>`;
        }

        // Update technologies
        this.renderTechnologies();

        // Update project info
        this.renderProjectInfo();
    }

    renderTechnologies() {
        const technologiesContainer = document.getElementById('project-technologies');
        if (!technologiesContainer || !this.projectData.technologies) {
            return;
        }

        technologiesContainer.innerHTML = '';
        
        this.projectData.technologies.forEach(tech => {
            const techTag = document.createElement('span');
            techTag.className = 'project-details__tech-tag';
            techTag.textContent = tech;
            technologiesContainer.appendChild(techTag);
        });
    }

    renderProjectInfo() {
        // Update duration
        const duration = document.getElementById('project-duration');
        if (duration && this.projectData.duration) {
            duration.textContent = this.projectData.duration;
        }

        // Update status in info section
        const infoStatus = document.getElementById('project-info-status');
        if (infoStatus && this.projectData.status) {
            infoStatus.textContent = this.projectData.status;
        }

        // Update category in info section
        const infoCategory = document.getElementById('project-info-category');
        if (infoCategory && this.projectData.category) {
            infoCategory.textContent = this.projectData.category;
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

// Export functions for global access
window.setProjectDetailsData = function(data) {
    console.log('Project Details: Global setProjectDetailsData called');
    projectDetailsBehavior.setProjectDetailsData(data);
};

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
