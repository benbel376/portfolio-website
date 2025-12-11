/**
 * Coding Stats Component Behavior - Type 1
 * Handles data rendering and navigation state changes
 */

// Global state
window.codingStatsData = window.codingStatsData || null;

/**
 * Initialize the coding stats component
 */
function initializeCodingStats(componentElement) {
    console.log('Coding Stats: Initializing...');
    
    const container = componentElement || document.querySelector('.coding-stats-component');
    if (!container) {
        console.error('Coding Stats: Container not found');
        return;
    }

    if (window.codingStatsData) {
        renderCodingStats(window.codingStatsData, container);
    } else {
        showEmptyState(container);
    }
}

/**
 * Set data from PHP loader
 */
function setCodingStatsData(data) {
    console.log('Coding Stats: Setting data');
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
    if (!data || !data.platforms || data.platforms.length === 0) {
        showEmptyState(container);
        return;
    }

    const platform = data.platforms[0]; // Use first platform
    const emptyState = container.querySelector('#coding-stats-empty');
    const content = container.querySelector('.coding-stats__content');
    
    if (emptyState) emptyState.style.display = 'none';
    if (content) content.style.display = 'grid';

    // Platform info
    const platformName = container.querySelector('#coding-stats-platform-name');
    const profileLink = container.querySelector('#coding-stats-profile-link');
    const username = container.querySelector('#coding-stats-username');
    
    if (platformName) platformName.textContent = platform.name || 'LeetCode';
    if (profileLink && platform.profileUrl) profileLink.href = platform.profileUrl;
    if (username) username.textContent = '@' + (platform.username || 'user');

    // Total solved
    const totalEl = container.querySelector('#coding-stats-total');
    if (totalEl && platform.stats) {
        animateNumber(totalEl, platform.stats.totalSolved || 0);
    }

    // Difficulty rings
    if (platform.problems) {
        renderRings(container, platform.problems);
    }

    // Quick stats
    renderQuickStats(container, platform.stats);

    // Badges
    renderBadges(container, platform.badges);

    console.log('Coding Stats: Rendered');
}

/**
 * Animate number counting up
 */
function animateNumber(element, target) {
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(start + (target - start) * eased);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Render progress rings
 */
function renderRings(container, problems) {
    const difficulties = ['easy', 'medium', 'hard'];
    
    difficulties.forEach(diff => {
        const data = problems[diff] || { solved: 0, total: 100 };
        const percentage = data.total > 0 ? (data.solved / data.total) * 100 : 0;
        
        // Update count
        const countEl = container.querySelector(`#${diff}-count`);
        if (countEl) countEl.textContent = data.solved;
        
        // Update ring
        const ringFill = container.querySelector(`.coding-stats__ring-fill--${diff}`);
        if (ringFill) {
            setTimeout(() => {
                ringFill.setAttribute('stroke-dasharray', `${percentage}, 100`);
            }, 100);
        }
    });
}

/**
 * Render quick stats
 */
function renderQuickStats(container, stats) {
    if (!stats) return;
    
    const acceptance = container.querySelector('#stat-acceptance');
    const ranking = container.querySelector('#stat-ranking');
    const streak = container.querySelector('#stat-streak');
    const contest = container.querySelector('#stat-contest');
    
    if (acceptance) acceptance.textContent = stats.acceptanceRate || '--';
    if (ranking) ranking.textContent = stats.ranking ? '#' + stats.ranking.toLocaleString() : '--';
    if (streak) streak.textContent = stats.streak ? stats.streak + ' days' : '--';
    if (contest) contest.textContent = stats.contestRating || '--';
}

/**
 * Render badges
 */
function renderBadges(container, badges) {
    const badgesCard = container.querySelector('#coding-stats-badges-card');
    const badgesEl = container.querySelector('#coding-stats-badges');
    
    if (!badges || badges.length === 0) {
        if (badgesCard) badgesCard.style.display = 'none';
        return;
    }
    
    if (badgesCard) badgesCard.style.display = 'block';
    if (badgesEl) {
        badgesEl.innerHTML = badges.map(badge => `
            <span class="coding-stats__badge">
                <ion-icon name="ribbon-outline"></ion-icon>
                ${escapeHtml(badge)}
            </span>
        `).join('');
    }
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
 * Escape HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Navigation handler
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

// Export to global scope
window.handleCodingStatsNavigation = handleCodingStatsNavigation;
window.setCodingStatsData = setCodingStatsData;
window.initializeCodingStats = initializeCodingStats;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeCodingStats, 100);
});

console.log('Coding Stats: Behavior loaded');
