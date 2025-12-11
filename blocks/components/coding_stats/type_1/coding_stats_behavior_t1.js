/**
 * Coding Stats Component Behavior - Type 1
 * Multi-platform slideshow with fully generic metrics
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
        renderCodingStats(window.codingStatsData);
        initializeNavigation();
    } else {
        showEmptyState();
    }
}

/**
 * Set data from PHP loader
 */
function setCodingStatsData(data) {
    console.log('Coding Stats: Setting data');
    window.codingStatsData = data;
    window.codingStatsCurrentSlide = 0;
    
    renderCodingStats(data);
    initializeNavigation();
}

/**
 * Render all platform slides
 */
function renderCodingStats(data) {
    const container = document.querySelector('.coding-stats-component');
    if (!container) return;
    
    if (!data || !data.platforms || data.platforms.length === 0) {
        showEmptyState();
        return;
    }

    const emptyState = container.querySelector('#coding-stats-empty');
    const slideshow = container.querySelector('.coding-stats__slideshow');
    const slidesContainer = container.querySelector('#coding-stats-slides');
    
    if (emptyState) emptyState.style.display = 'none';
    if (slideshow) slideshow.style.display = 'block';

    // Render slides
    if (slidesContainer) {
        slidesContainer.innerHTML = data.platforms.map((platform, index) => 
            renderPlatformSlide(platform, index)
        ).join('');
    }

    // Render pagination dots
    renderPagination();

    // Show/hide nav based on platform count
    const nav = container.querySelector('.coding-stats__nav');
    if (nav) {
        nav.style.display = data.platforms.length > 1 ? 'flex' : 'none';
    }

    // Show first slide
    showSlide(0);

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

    const heroMetric = platform.heroMetric || { value: '--', label: 'Score' };

    // Progress bars
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
                    <span class="coding-stats__progress-count">${bar.value}/${bar.total}</span>
                </div>
            `;
        }).join('');
    }

    // Metrics
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
                <div class="coding-stats__platform-header">
                    <div class="coding-stats__platform-logo" style="${logoStyle}">
                        ${logoContent}
                    </div>
                    <div class="coding-stats__platform-info">
                        <h3 class="coding-stats__platform-name">${escapeHtml(platform.name)}</h3>
                        ${platform.profileUrl ? `
                            <a class="coding-stats__profile-link" href="${escapeHtml(platform.profileUrl)}" target="_blank" rel="noopener noreferrer">
                                @${escapeHtml(platform.username || 'profile')}
                                <ion-icon name="open-outline"></ion-icon>
                            </a>
                        ` : ''}
                    </div>
                    <div class="coding-stats__hero-stat">
                        <div class="coding-stats__hero-number">${escapeHtml(String(heroMetric.value))}</div>
                        <div class="coding-stats__hero-label">${escapeHtml(heroMetric.label)}</div>
                    </div>
                </div>
                ${progressBarsHtml ? `<div class="coding-stats__main-stats"><div class="coding-stats__progress-section">${progressBarsHtml}</div></div>` : ''}
                ${metricsHtml ? `<div class="coding-stats__metrics">${metricsHtml}</div>` : ''}
                ${badgesHtml}
            </div>
        </div>
    `;
}

/**
 * Initialize navigation controls
 */
function initializeNavigation() {
    const prevButton = document.getElementById('coding-stats-prev');
    const nextButton = document.getElementById('coding-stats-next');
    
    if (prevButton) {
        // Clone to remove old listeners
        const newPrevButton = prevButton.cloneNode(true);
        prevButton.parentNode.replaceChild(newPrevButton, prevButton);
        newPrevButton.addEventListener('click', function() {
            console.log('Coding Stats: Prev clicked');
            showSlide(window.codingStatsCurrentSlide - 1);
        });
    }
    
    if (nextButton) {
        // Clone to remove old listeners
        const newNextButton = nextButton.cloneNode(true);
        nextButton.parentNode.replaceChild(newNextButton, nextButton);
        newNextButton.addEventListener('click', function() {
            console.log('Coding Stats: Next clicked');
            showSlide(window.codingStatsCurrentSlide + 1);
        });
    }
    
    console.log('Coding Stats: Navigation initialized');
}

/**
 * Render pagination dots
 */
function renderPagination() {
    const paginationContainer = document.getElementById('coding-stats-dots');
    if (!paginationContainer || !window.codingStatsData?.platforms) return;
    
    paginationContainer.innerHTML = '';
    
    window.codingStatsData.platforms.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'coding-stats__dot';
        dot.setAttribute('data-index', index);
        dot.addEventListener('click', function() {
            console.log('Coding Stats: Dot clicked', index);
            showSlide(index);
        });
        paginationContainer.appendChild(dot);
    });
}

/**
 * Show specific slide
 */
function showSlide(index) {
    const platforms = window.codingStatsData?.platforms || [];
    
    // Bounds check
    if (index < 0) index = 0;
    if (index >= platforms.length) index = platforms.length - 1;
    
    console.log('Coding Stats: Showing slide', index, 'of', platforms.length);
    
    const slides = document.querySelectorAll('.coding-stats__slide');
    const dots = document.querySelectorAll('.coding-stats__dot');
    
    // Update slides
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    // Update dots
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    window.codingStatsCurrentSlide = index;
    updateNavigationButtons();
    
    // Animate progress bars
    setTimeout(animateProgressBars, 100);
}

/**
 * Update navigation buttons
 */
function updateNavigationButtons() {
    const platforms = window.codingStatsData?.platforms || [];
    const prevBtn = document.getElementById('coding-stats-prev');
    const nextBtn = document.getElementById('coding-stats-next');
    
    if (prevBtn) prevBtn.disabled = window.codingStatsCurrentSlide === 0;
    if (nextBtn) nextBtn.disabled = window.codingStatsCurrentSlide >= platforms.length - 1;
}

/**
 * Animate progress bars
 */
function animateProgressBars() {
    const activeSlide = document.querySelector('.coding-stats__slide.active');
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
function showEmptyState() {
    const container = document.querySelector('.coding-stats-component');
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
 * Navigation handler for GlobalNavigator
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
