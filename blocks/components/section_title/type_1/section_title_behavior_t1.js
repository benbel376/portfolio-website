/**
 * Section Title Component Behavior
 */

window.sectionTitleData = window.sectionTitleData || {};

function initializeSectionTitle(componentElement) {
    const component = componentElement || document.querySelector('.section-title-component');
    if (!component) return;
    console.log('SectionTitle: Initialized', component.id);
}

function setSectionTitleData(componentId, data) {
    window.sectionTitleData[componentId] = data;
    const component = document.getElementById(componentId);
    if (component) renderSectionTitle(component, data);
}

function renderSectionTitle(component, data) {
    if (!component || !data) return;

    const title = data.title || '';
    const subtitle = data.subtitle || '';
    const icon = data.icon || '';
    const size = data.size || 'md';

    // Set icon
    const iconEl = component.querySelector('.section-title__icon');
    if (iconEl) {
        iconEl.setAttribute('name', icon);
        iconEl.style.display = icon ? 'block' : 'none';
    }

    // Set title
    const titleEl = component.querySelector('.section-title__text');
    if (titleEl) titleEl.textContent = title;

    // Set subtitle
    const subtitleEl = component.querySelector('.section-title__subtitle');
    if (subtitleEl) subtitleEl.textContent = subtitle;

    // Set size variant
    component.classList.remove('section-title--sm', 'section-title--md', 'section-title--lg');
    if (size !== 'md') {
        component.classList.add(`section-title--${size}`);
    }
}

function handleSectionTitleNavigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initializeSectionTitle(element);
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
    }
    return true;
}

// Export to global scope
window.initializeSectionTitle = initializeSectionTitle;
window.setSectionTitleData = setSectionTitleData;
window.handleSectionTitleNavigation = handleSectionTitleNavigation;
