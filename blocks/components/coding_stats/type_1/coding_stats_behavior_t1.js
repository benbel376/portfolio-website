/**
 * Coding Stats Component Behavior - Type 1
 * Handles data rendering and navigation state changes
 */

// Global state to prevent redeclaration on dynamic reload
window.codingStatsData = window.codingStatsData || null;

/**
 * Initialize the coding stats component
 */
function initializeCodingStats(componentElement) {
    console.log('Coding Stats: Initializing component...');
    
    const container = componentElement || document.querySelector('.coding-stats-component');
    if (!container) {
        console.error('Coding Stats: Component container not found');
        return;
    }

    // Check if data is available
    if (window.codingStatsData) {
        console.log('Coding Stats: Rendering with existing data');
        renderCodingStats(window.codingStatsData, container);
    } else {
        console.log('Coding Stats: No data available, showing empty state');
        showEmptyState(container);
    }
}

/**
 * Set coding stats data from PHP loader
 */
function setCodingStatsData(data) {
    console.log('Coding Stats: Setting data:', data);
    window.codingStatsData = data;
    
    const container = document.querySelector('.coding-stats-component');
    if (container) {
        renderCodingStats(data, container);
    }
}

/**
 * Render the coding stats
 */
function renderCodingStats(data, container) {
    if (!data || !container) {
        showEmptyState(container);
        return;
    }

    const emptyState = container.querySelector('#coding-stats-empty');
    const content = container.querySelector('.coding-stats__content');
    
    if (emptyState) emptyState.style.display = 'none';
    if (content) content.style.display = 'grid';

    // Render platform info
    renderPlatformInfo(data, container);
    
    // Render total and breakdown
    renderTotalAndBreakdown(data, container);
    
    // Render additional stats
    renderStatsGrid(data, container);
    
    // Render badges
    renderBadges(data, container);

    console.log('Coding Stats: Rendered successfully');
}

/**
 * Render platform information
 */
function renderPlatformInfo(data, container) {
    const platformName = container.querySelector('#coding-stats-platform-name');
    const profileLink = container.querySelector('#coding-stats-profile-link');
    const logo = container.querySelector('#coding-stats-logo');

    if (platformName) {
        platformName.textContent = data.platform || 'LeetCode';
    }

    if (profileLink && data.profileUrl) {
        profileLink.href = data.profileUrl;
        profileLink.querySelector('span').textContent = `@${data.username || 'View Profile'}`;
    }

    if (logo) {
        if (data.platformLogo) {
            logo.innerHTML = `<img src="${escapeHtml(data.platformLogo)}" alt="${escapeHtml(data.platform)}">`;
        } else {
            // Default LeetCode style logo
            logo.innerHTML = '<ion-icon name="code-slash-outline"></ion-icon>';
        }
    }
}

/**
 * Render total solved and difficulty breakdown
 */
function renderTotalAndBreakdown(data, container) {
    const totalEl = container.querySelector('#coding-stats-total');
    const breakdownEl = container.querySelector('#coding-stats-breakdown');

    if (totalEl && data.stats) {
        totalEl.textContent = data.stats.totalSolved || 0;
    }

    if (breakdownEl && data.stats) {
        const difficulties = [
            { key: 'easy', label: 'Easy', color: 'easy' },
            { key: 'medium', label: 'Medium', color: 'medium' },
            { key: 'hard', label: 'Hard', color: 'hard' }
        ];

        breakdownEl.innerHTML = difficulties.map(diff => {
            const stat = data.stats[diff.key] || { solved: 0, total: 100 };
            const percentage = stat.total > 0 ? (stat.solved / stat.total) * 100 : 0;
            
            return `
                <div class="coding-stats__difficulty">
                    <span class="coding-stats__difficulty-label">${diff.label}</span>
                    <div class="coding-stats__difficulty-bar">
                        <div class="coding-stats__difficulty-fill coding-stats__difficulty-fill--${diff.color}" 
                             style="width: ${percentage}%"></div>
                    </div>
                    <span class="coding-stats__difficulty-count">${stat.solved} / ${stat.total}</span>
                </div>
            `;
        }).join('');
    }
}

/**
 * Render additional stats grid
 */
function renderStatsGrid(data, container) {
    const gridEl = container.querySelector('#coding-stats-grid');
    if (!gridEl || !data.stats) return;

    const statsConfig = [
        { key: 'acceptanceRate', label: 'Acceptance', icon: 'checkmark-circle-outline', format: v => v || 'N/A' },
        { key: 'ranking', label: 'Global Rank', icon: 'trophy-outline', format: v => v ? `#${v.toLocaleString()}` : 'N/A' },
        { key: 'contestRating', label: 'Contest Rating', icon: 'star-outline', format: v => v || 'N/A' },
        { key: 'streak', label: 'Day Streak', icon: 'flame-outline', format: v => v ? `${v} days` : 'N/A' }
    ];

    gridEl.innerHTML = statsConfig.map(stat => {
        const value = data.stats[stat.key];
        return `
            <div class="coding-stats__stat-card">
                <div class="coding-stats__stat-icon">
                    <ion-icon name="${stat.icon}"></ion-icon>
                </div>
                <div class="coding-stats__stat-value">${stat.format(value)}</div>
                <div class="coding-stats__stat-label">${stat.label}</div>
            </div>
        `;
    }).join('');
}

/**
 * Render badges/achievements
 */
function renderBadges(data, container) {
    const badgesSection = container.querySelector('#coding-stats-badges-section');
    const badgesEl = container.querySelector('#coding-stats-badges');
    
    if (!badgesEl) return;

    if (!data.badges || data.badges.length === 0) {
        if (badgesSection) badgesSection.style.display = 'none';
        return;
    }

    if (badgesSection) badgesSection.style.display = 'block';
    
    badgesEl.innerHTML = data.badges.map(badge => `
        <span class="coding-stats__badge">
            <ion-icon name="ribbon-outline"></ion-icon>
            ${escapeHtml(badge)}
        </span>
    `).join('');
}

/**
 * Show empty state
 */
function showEmptyState(container) {
    if (!container) return;
    
    const emptyState = container.querySelector('#coding-stats-empty');
    const content = container.querySelector('.coding-stats__content');
    
    if (emptyState) emptyState.style.display = 'block';
    if (content) content.style.display = 'none';
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
 * Navigation handler for GlobalNavigator integration
 */
function handleCodingStatsNavigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initializeCodingStats(element);
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

// Export functions to global scope
window.handleCodingStatsNavigation = handleCodingStatsNavigation;
window.setCodingStatsData = setCodingStatsData;
window.initializeCodingStats = initializeCodingStats;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeCodingStats, 100);
});

console.log('Coding Stats: Behavior script loaded');
