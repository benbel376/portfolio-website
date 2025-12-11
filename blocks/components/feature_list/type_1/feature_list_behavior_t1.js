/**
 * Feature List Component Behavior
 */

window.featureListData = window.featureListData || {};

function initializeFeatureList(componentElement) {
    const component = componentElement || document.querySelector('.feature-list-component');
    if (!component) return;
    console.log('FeatureList: Initialized', component.id);
}

function setFeatureListData(componentId, data) {
    window.featureListData[componentId] = data;
    const component = document.getElementById(componentId);
    if (component) renderFeatureList(component, data);
}

function renderFeatureList(component, data) {
    if (!component || !data) return;

    const features = data.features || [];
    const title = data.title || 'Key Features';

    // Set title
    const titleEl = component.querySelector('.feature-list__title');
    if (titleEl) titleEl.textContent = title;

    // Set count
    const countEl = component.querySelector('.feature-list__count');
    if (countEl) countEl.textContent = features.length + ' features';

    // Render features grid
    const grid = component.querySelector('.feature-list__grid');
    if (grid) {
        grid.innerHTML = features.map(feature => `
            <div class="feature-list__item">
                <div class="feature-list__item-icon">
                    <ion-icon name="${feature.icon || 'checkmark-circle-outline'}"></ion-icon>
                </div>
                <div class="feature-list__item-content">
                    <h4 class="feature-list__item-title">${escapeHtml(feature.title)}</h4>
                    <p class="feature-list__item-description">${escapeHtml(feature.description)}</p>
                </div>
            </div>
        `).join('');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleFeatureListNavigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initializeFeatureList(element);
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
window.initializeFeatureList = initializeFeatureList;
window.setFeatureListData = setFeatureListData;
window.handleFeatureListNavigation = handleFeatureListNavigation;
