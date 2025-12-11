/**
 * Coding Stats Component Behavior - Type 1
 * Multi-platform slideshow with generic metrics
 */

// Global state
window.codingStatsData = window.codingStatsData || null;
window.codingStatsCurrentSlide = window.codingStatsCurrentSlide || 0;

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

    if (window.codingStatsData && window.codingStatsData.platforms && window.codingStatsData.platforms.length > 0) {
        renderCodingStats(window.codingStatsData, container);
        setupNavigation(container);
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
    window.codingStatsCurrentSlide = 0;
    
    const container = document.querySelector('.coding-stats-component');
    if (container) {
        renderCodingStats(data, container);
        setupNavigation(container);
    }
}

/**
 * Render all platform slides
 */
function renderCodingStats(data, container) {
    if (!data || !data.platforms || data.platforms.length === 0) {
        showEmptyState(container);
        return;
    }

    const emptyState = container.querySelector('#coding-stats-empty');
    const slideshow = container.querySelector('.coding-stats__slideshow');
    const slidesContainer = container.querySelector('#coding-stats-slides');
    const dotsContainer = container.querySelector('#coding-stats-dots');
    
    if (emptyState) emptyState.style.display = 'none';
    if (slideshow) slideshow.style.display = 'block';

    // Render slides
    if (slidesContainer) {
        slidesContainer.innerHTML = data.platforms.map((platform, index) => 
            renderPlatformSlide(platform, index)
        ).join('');
    }

    // Render dots
    if (dotsContainer) {
        dotsContainer.innerHTML = data.platforms.map((_, index) => 
            `<div class="coding-stats__dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
        ).join('');
    }

    // Show first slide
    showSlide(container, 0);
    
    // Animate progress bars after a short delay
    setTimeout(() => animateProgressBars(container), 300);

    console.log('Coding Stats: Rendered', data.platforms.length, 'platforms');
}

/**
 * Render a single platform slide
 */
function renderPlatformSlide(platform, index) {
    const logoStyle = platform.color ? `background: ${platform.color};` : 'background: linear-gradient(135deg, #FFA116 0%, #FFB800 100%);';
    const logoContent = platform.logo 
        ? `<img src="${escapeHtml(platform.logo)}" alt="${escapeHtml(platform.name)}">`
        : `<ion-icon name="${platform.icon || 'code-working-outline'}"></ion-icon>`;

    // Hero stat (first metric or totalSolved)
    const heroMetric = platform.heroMetric || { value: platform.stats?.totalSolved || 0, label: 'Problems Solved' };

    // Progress bars (from progressBars array or problems object)
    let progressBarsHtml = '';
    if (platform.progressBars && platform.progressBars.length > 0) {
        progressBarsHtml = platform.progressBars.map((bar, i) => {
            const percentage = bar.total > 0 ? (bar.value / bar.total) * 100 : 0;
            return `
                <div class="coding-stats__progress-item">
                    <span class="coding-stats__progress-label">${escapeHtml(bar.label)}</span>
                    <div class="coding-stats__progress-bar">
                        <div class="coding-stats__progress-fill coding-stats__progress-fill--${(i % 5) + 1}" 
                             data-width="${percentage}" style="width: 0%"></div>
                    </div>
                    <span class="coding-stats__progress-count">${bar.value} / ${bar.total}</span>
                </div>
            `;
        }).join('');
    } else if (platform.problems) {
        const difficulties = [
            { key: 'easy', label: 'Easy' },
            { key: 'medium', label: 'Medium' },
            { key: 'hard', label: 'Hard' }
        ];
        progressBarsHtml = difficulties.map((diff, i) => {
            const data = platform.problems[diff.key];
            if (!data) return '';
            const percentage = data.total > 0 ? (data.solved / data.total) * 100 : 0;
            return `
                <div class="coding-stats__progress-item">
                    <span class="coding-stats__progress-label">${diff.label}</span>
                    <div class="coding-stats__progress-bar">
                        <div class="coding-stats__progress-fill coding-stats__progress-fill--${i + 1}" 
                             data-width="${percentage}" style="width: 0%"></div>
                    </div>
                    <span class="coding-stats__progress-count">${data.solved} / ${data.total}</span>
                </div>
            `;
        }).join('');
    }

    // Metrics grid
    let metricsHtml = '';
    if (platform.metrics && platform.metrics.length > 0) {
        metricsHtml = platform.metrics.map(metric => `
            <div class="coding-stats__metric">
                <div class="coding-stats__metric-icon">
                    <ion-icon name="${metric.icon || 'stats-chart-outline'}"></ion-icon>
                </div>
                <div class="coding-stats__metric-value">${escapeHtml(String(metric.value))}</div>
                <div class="coding-stats__metric-label">${escapeHtml(metric.label)}</div>
            </div>
        `).join('');
    } else if (platform.stats) {
        // Fallback to stats object
        const defaultMetrics = [
            { key: 'acceptanceRate', label: 'Acceptance', icon: 'checkmark-done-outline' },
            { key: 'ranking', label: 'Global Rank', icon: 'trophy-outline', format: v => v ? '#' + v.toLocaleString() : '--' },
            { key: 'streak', label: 'Max Streak', icon: 'flame-outline', format: v => v ? v + ' days' : '--' },
            { key: 'contestRating', label: 'Contest Rating', icon: 'star-outline' }
        ];
        metricsHtml = defaultMetrics.map(m => {
            const value = platform.stats[m.key];
            const displayValue = m.format ? m.format(value) : (value || '--');
            return `
                <div class="coding-stats__metric">
                    <div class="coding-stats__metric-icon">
                        <ion-icon name="${m.icon}"></ion-icon>
                    </div>
                    <div class="coding-stats__metric-value">${displayValue}</div>
                    <div class="coding-stats__metric-label">${m.label}</div>
                </div>
            `;
        }).join('');
    }

    // Badges
    let badgesHtml = '';
    if (platform.badges && platform.badges.length > 0) {
        badgesHtml = `
            <div class="coding-stats__badges-row">
                <h4 class="coding-stats__badges-title">
                    <ion-icon name="ribbon-outline"></ion-icon>
                    Achievements
                </h4>
                <div class="coding-stats__badges">
                    ${platform.badges.map(badge => `
                        <span class="coding-stats__badge">
                            <ion-icon name="ribbon-outline"></ion-icon>
                            ${escapeHtml(badge)}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    return `
        <div class="coding-stats__slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <div class="coding-stats__platform-card">
                <!-- Platform Header -->
                <div class="coding-stats__platform-header">
                    <div class="coding-stats__platform-logo" style="${logoStyle}">
                        ${logoContent}
                    </div>
                    <div class="coding-stats__platform-info">
                        <h3 class="coding-stats__platform-name">${escapeHtml(platform.name)}</h3>
                        ${platform.profileUrl ? `
                            <a class="coding-stats__profile-link" href="${escapeHtml(platform.profileUrl)}" target="_blank" rel="noopener noreferrer">
                                <span>@${escapeHtml(platform.username || 'profile')}</span>
                                <ion-icon name="open-outline"></ion-icon>
                            </a>
                        ` : ''}
                    </div>
                </div>

                <!-- Left: Main Stats -->
                <div class="coding-stats__main-stats">
                    <div class="coding-stats__hero-stat">
                        <div class="coding-stats__hero-number">${escapeHtml(String(heroMetric.value))}</div>
                        <div class="coding-stats__hero-label">${escapeHtml(heroMetric.label)}</div>
                    </div>
                    ${progressBarsHtml ? `<div class="coding-stats__progress-section">${progressBarsHtml}</div>` : ''}
                </div>

                <!-- Right: Metrics Grid -->
                <div class="coding-stats__metrics">
                    ${metricsHtml}
                </div>

                <!-- Badges -->
                ${badgesHtml}
            </div>
        </div>
    `;
}

/**
 * Setup navigation controls
 */
function setupNavigation(container) {
    // Use event delegation on the container itself
    // Remove previous handler if exists
    if (container._codingStatsNavHandler) {
        container.removeEventListener('click', container._codingStatsNavHandler);
    }
    
    // Create new handler
    container._codingStatsNavHandler = function(e) {
        const target = e.target;
        
        // Check for prev button
        if (target.closest('#coding-stats-prev')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Coding Stats: Prev clicked');
            navigateSlide(container, -1);
            return;
        }
        
        // Check for next button
        if (target.closest('#coding-stats-next')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Coding Stats: Next clicked');
            navigateSlide(container, 1);
            return;
        }
        
        // Check for dot click
        const dot = target.closest('.coding-stats__dot');
        if (dot) {
            e.preventDefault();
            const index = parseInt(dot.dataset.index, 10);
            console.log('Coding Stats: Dot clicked, index:', index);
            showSlide(container, index);
            return;
        }
    };
    
    container.addEventListener('click', container._codingStatsNavHandler);
    updateNavButtons(container);
    console.log('Coding Stats: Navigation setup complete');
}

/**
 * Navigate to next/prev slide
 */
function navigateSlide(container, direction) {
    const platforms = window.codingStatsData?.platforms || [];
    const newIndex = window.codingStatsCurrentSlide + direction;
    
    if (newIndex >= 0 && newIndex < platforms.length) {
        showSlide(container, newIndex);
    }
}

/**
 * Show specific slide
 */
function showSlide(container, index) {
    const slides = container.querySelectorAll('.coding-stats__slide');
    const dots = container.querySelectorAll('.coding-stats__dot');
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    window.codingStatsCurrentSlide = index;
    updateNavButtons(container);
    
    // Animate progress bars for this slide
    setTimeout(() => animateProgressBars(container), 100);
}

/**
 * Update nav button states
 */
function updateNavButtons(container) {
    const platforms = window.codingStatsData?.platforms || [];
    const prevBtn = container.querySelector('#coding-stats-prev');
    const nextBtn = container.querySelector('#coding-stats-next');
    
    if (prevBtn) prevBtn.disabled = window.codingStatsCurrentSlide === 0;
    if (nextBtn) nextBtn.disabled = window.codingStatsCurrentSlide >= platforms.length - 1;
}

/**
 * Animate progress bars
 */
function animateProgressBars(container) {
    const activeSlide = container.querySelector('.coding-stats__slide.active');
    if (!activeSlide) return;
    
    const fills = activeSlide.querySelectorAll('.coding-stats__progress-fill');
    fills.forEach(fill => {
        const width = fill.dataset.width || 0;
        fill.style.width = width + '%';
    });
}

/**
 * Show empty state
 */
function showEmptyState(container) {
    if (!container) return;
    const emptyState = container.querySelector('#coding-stats-empty');
    const slideshow = container.querySelector('.coding-stats__slideshow');
    if (emptyState) emptyState.style.display = 'block';
    if (slideshow) slideshow.style.display = 'none';
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
