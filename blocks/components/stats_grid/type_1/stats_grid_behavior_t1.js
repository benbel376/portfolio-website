/**
 * Stats Grid Component Behavior
 */

window.statsGridData = window.statsGridData || {};

function initializeStatsGrid(componentElement) {
    const component = componentElement || document.querySelector('.stats-grid-component');
    if (!component) return;
    console.log('StatsGrid: Initialized', component.id);
}

function setStatsGridData(componentId, data) {
    window.statsGridData[componentId] = data;
    const component = document.getElementById(componentId);
    if (component) renderStatsGrid(component, data);
}

function renderStatsGrid(component, data) {
    if (!component || !data) return;

    const stats = data.stats || [];
    const title = data.title || '';

    // Set header visibility and title
    const header = component.querySelector('.stats-grid__header');
    const titleEl = component.querySelector('.stats-grid__title');
    if (header) header.style.display = title ? 'flex' : 'none';
    if (titleEl) titleEl.textContent = title;

    // Render stats grid
    const grid = component.querySelector('.stats-grid__grid');
    if (grid) {
        grid.innerHTML = stats.map(stat => {
            const trendClass = stat.trend > 0 ? 'up' : stat.trend < 0 ? 'down' : 'neutral';
            const trendIcon = stat.trend > 0 ? 'trending-up' : stat.trend < 0 ? 'trending-down' : 'remove';
            const trendText = stat.trend ? `${stat.trend > 0 ? '+' : ''}${stat.trend}%` : '';
            
            return `
                <div class="stats-grid__card">
                    ${stat.icon ? `
                        <div class="stats-grid__card-icon">
                            <ion-icon name="${stat.icon}"></ion-icon>
                        </div>
                    ` : ''}
                    <div class="stats-grid__card-value">${escapeHtml(stat.value)}</div>
                    <p class="stats-grid__card-label">${escapeHtml(stat.label)}</p>
                    ${stat.trend !== undefined ? `
                        <span class="stats-grid__card-trend stats-grid__card-trend--${trendClass}">
                            <ion-icon name="${trendIcon}-outline"></ion-icon>
                            ${trendText}
                        </span>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleStatsGridNavigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initializeStatsGrid(element);
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
window.initializeStatsGrid = initializeStatsGrid;
window.setStatsGridData = setStatsGridData;
window.handleStatsGridNavigation = handleStatsGridNavigation;
