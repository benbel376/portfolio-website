/**
 * Tech Stack Component Behavior
 */

window.techStackData = window.techStackData || {};

function initializeTechStack(componentElement) {
    const component = componentElement || document.querySelector('.tech-stack-component');
    if (!component) return;
    console.log('TechStack: Initialized', component.id);
}

function setTechStackData(componentId, data) {
    window.techStackData[componentId] = data;
    const component = document.getElementById(componentId);
    if (component) renderTechStack(component, data);
}

function renderTechStack(component, data) {
    if (!component || !data) return;

    const title = data.title || 'Technology Stack';
    const categories = data.categories || [];

    // Set title
    const titleEl = component.querySelector('.tech-stack__title');
    if (titleEl) titleEl.textContent = title;

    // Render categories as clean two-column list
    const container = component.querySelector('.tech-stack__categories');
    if (container) {
        container.innerHTML = categories.map(category => `
            <div class="tech-stack__category">
                <div class="tech-stack__category-header">
                    <ion-icon name="${category.icon || 'cube-outline'}" class="tech-stack__category-icon"></ion-icon>
                    <h4 class="tech-stack__category-name">${escapeHtml(category.name)}</h4>
                </div>
                <div class="tech-stack__techs">
                    ${(category.technologies || []).map(tech => `
                        <div class="tech-stack__tech">
                            ${tech.icon 
                                ? `<img src="${tech.icon}" alt="${escapeHtml(tech.name)}" class="tech-stack__tech-icon" />`
                                : `<span class="tech-stack__tech-bullet"><ion-icon name="checkmark-outline"></ion-icon></span>`
                            }
                            <span class="tech-stack__tech-name">${escapeHtml(tech.name)}${tech.version ? `<span class="tech-stack__tech-version">${escapeHtml(tech.version)}</span>` : ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleTechStackNavigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initializeTechStack(element);
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
window.initializeTechStack = initializeTechStack;
window.setTechStackData = setTechStackData;
window.handleTechStackNavigation = handleTechStackNavigation;
