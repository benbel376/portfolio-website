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

    // Status
    const status = component.querySelector('.project-hero__status');
    if (status) {
        const statusText = data.status || 'Completed';
        status.textContent = statusText;
        status.setAttribute('data-status', statusText.toLowerCase().replace(/\s+/g, '-'));
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

    // Tech badges
    const techBadges = component.querySelector('.project-hero__tech-badges');
    if (techBadges && data.technologies) {
        techBadges.innerHTML = data.technologies.map(tech => 
            `<span class="project-hero__tech-badge">${escapeHtml(tech)}</span>`
        ).join('');
    }

    // Action buttons
    const demoBtn = component.querySelector('.project-hero__action-btn--primary');
    const repoBtn = component.querySelector('.project-hero__action-btn--secondary');

    if (demoBtn) {
        if (data.demoLink) {
            demoBtn.href = data.demoLink;
            demoBtn.style.display = 'inline-flex';
        } else {
            demoBtn.style.display = 'none';
        }
    }

    if (repoBtn) {
        if (data.repoLink) {
            repoBtn.href = data.repoLink;
            repoBtn.style.display = 'inline-flex';
        } else {
            repoBtn.style.display = 'none';
        }
    }

    // Info grid
    const yearEl = component.querySelector('#project-hero-year');
    const durationEl = component.querySelector('#project-hero-duration');
    const statusTextEl = component.querySelector('#project-hero-status-text');

    if (yearEl) yearEl.textContent = data.year || '-';
    if (durationEl) durationEl.textContent = data.duration || '-';
    if (statusTextEl) statusTextEl.textContent = data.status || 'Completed';
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
