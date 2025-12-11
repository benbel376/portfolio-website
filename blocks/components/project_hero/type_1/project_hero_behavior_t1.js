/**
 * Project Hero Component Behavior
 * Handles navigation and data population
 */

// Global state
window.projectHeroData = window.projectHeroData || null;

/**
 * Initialize the Project Hero component
 */
function initializeProjectHero(componentElement) {
    console.log('Project Hero: Initializing...');
    
    const component = componentElement || document.querySelector('.project-hero-component');
    if (!component) {
        console.error('Project Hero: Component not found');
        return;
    }

    // Setup back button
    setupBackButton(component);

    // Render data if available
    if (window.projectHeroData) {
        renderProjectHero(component, window.projectHeroData);
    }
}

/**
 * Setup back button event listener
 */
function setupBackButton(component) {
    const backBtn = component.querySelector('#project-hero-back');
    if (backBtn && !backBtn.hasAttribute('data-listener-attached')) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Project Hero: Navigating back to projects');
            window.location.hash = '#projects-main-container';
        });
        backBtn.setAttribute('data-listener-attached', 'true');
    }
}

/**
 * Set project hero data from PHP loader
 */
function setProjectHeroData(data) {
    console.log('Project Hero: Setting data:', data);
    window.projectHeroData = data;

    const component = document.querySelector('.project-hero-component');
    if (component) {
        renderProjectHero(component, data);
    }
}

/**
 * Render project hero with data
 */
function renderProjectHero(component, data) {
    if (!component || !data) return;

    // Banner image
    const bannerImg = component.querySelector('.project-hero__banner-image');
    if (bannerImg && data.bannerImage) {
        bannerImg.src = data.bannerImage;
        bannerImg.alt = data.title || 'Project Banner';
    }

    // Category
    const category = component.querySelector('.project-hero__category');
    if (category) {
        category.textContent = data.category || 'Project';
    }

    // Title
    const title = component.querySelector('.project-hero__title');
    if (title) {
        title.textContent = data.title || 'Untitled Project';
    }

    // Description
    const description = component.querySelector('.project-hero__description');
    if (description) {
        description.textContent = data.description || '';
    }

    // Info row - Year
    const yearEl = component.querySelector('#project-hero-year');
    if (yearEl) yearEl.textContent = data.year || '-';

    // Info row - Duration
    const durationEl = component.querySelector('#project-hero-duration');
    if (durationEl) durationEl.textContent = data.duration || '-';

    // Info row - Status
    const statusEl = component.querySelector('#project-hero-status');
    if (statusEl) statusEl.textContent = data.status || 'Completed';

    // Links in info row
    const demoLink = component.querySelector('#project-hero-demo');
    const repoLink = component.querySelector('#project-hero-repo');

    if (demoLink) {
        if (data.demoLink) {
            demoLink.href = data.demoLink;
            demoLink.style.display = 'inline-flex';
        } else {
            demoLink.style.display = 'none';
        }
    }

    if (repoLink) {
        if (data.repoLink) {
            repoLink.href = data.repoLink;
            repoLink.style.display = 'inline-flex';
        } else {
            repoLink.style.display = 'none';
        }
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Navigation handler for the component
 */
function handleProjectHeroNavigation(elementId, state, parameters = {}) {
    console.log('Project Hero: Navigation handler called', { elementId, state, parameters });

    const element = document.getElementById(elementId);
    if (!element) {
        console.warn('Project Hero: Element not found:', elementId);
        return false;
    }

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            // Initialize on visible
            initializeProjectHero(element);
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
            console.warn('Project Hero: Unknown state:', state);
            return false;
    }
    return true;
}

// Export to global scope
window.initializeProjectHero = initializeProjectHero;
window.setProjectHeroData = setProjectHeroData;
window.handleProjectHeroNavigation = handleProjectHeroNavigation;

console.log('Project Hero: Behavior script loaded');
