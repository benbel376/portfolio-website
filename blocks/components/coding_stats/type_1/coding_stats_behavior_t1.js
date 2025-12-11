/**
 * Coding Stats Component Behavior - Type 1
 * Multi-platform slideshow with fully generic metrics
 */

// Global state
window.codingStatsData = window.codingStatsData || null;
window.codingStatsCurrentSlide = window.codingStatsCurrentSlide || 0;
window.codingStatsContainer = window.codingStatsContainer || null;

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
    
    // Store container reference globally
    window.codingStatsContainer = container;

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
        window.codingStatsContainer = container;
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

    // Render dots (only if more than 1 platform)
    if (dotsContainer) {
        if (data.platforms.length > 1) {
            dotsContainer.innerHTML = data.platforms.map((_, index) => 
                `<div class="coding-stats__dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
            ).join('');
        } else {
            dotsContainer.innerHTML = '';
        }
    }

    // Show/hide nav buttons based on platform count
    const nav = container.querySelector('.coding-stats__nav');
    if (nav) {
        nav.style.display = data.platforms.length > 1 ? 'flex' : 'none';
    }

    // Show first slide
    showSlide(container, 0);
    
    // Animate progress bars after a short delay
    setTimeout(() => animateProgressBars(container), 300);

    console.log('Coding Stats: Rendered', data.platforms.length, 'platforms');
}

/**
 * Render a single platform slide - FULLY GENERIC
 */
function renderPlatformSlide(platform, index) {
    const logoStyle = platform.color ? `background: ${platform.color};` : 'background: linear-gradient(135deg, #FFA116 0%, #FFB800 100%);';
    const logoContent = platform.logo 
        ? `<img src="${escapeHtml(platform.logo)}" alt="${escapeHtml(platform.name)}">`
        : `<ion-icon name="${platform.icon || 'code-working-outline'}"></ion-icon>`;

    // Hero stat - fully configurable
    const heroMetric = platform.heroMetric || { value: '--', label: 'Score' };

    // Progress bars - ONLY from progressBars array (no hardcoded easy/medium/hard)
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

    // Metrics grid - ONLY from metrics array (no hardcoded fallbacks)
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

    // Badges - optional
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
 * Setup navigation controls using direct onclick
 */
function setupNavigation(container) {
    const prevBtn = container.querySelector('#coding-stats-prev');
    const nextBtn = container.querySelector('#coding-stats-next');
    const dotsContainer = container.querySelector('#coding-stats-dots');

    if (prevBtn) {
        prevBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Coding Stats: Prev clicked, current:', window.codingStatsCurrentSlide);
            const platforms = window.codingStatsData?.platforms || [];
            const newIndex = window.codingStatsCurrentSlide - 1;
            if (newIndex >= 0) {
                showSlide(window.codingStatsContainer, newIndex);
            }
        };
    }

    if (nextBtn) {
        nextBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Coding Stats: Next clicked, current:', window.codingStatsCurrentSlide);
            const platforms = window.codingStatsData?.platforms || [];
            const newIndex = window.codingStatsCurrentSlide + 1;
            if (newIndex < platforms.length) {
                showSlide(window.codingStatsContainer, newIndex);
            }
        };
    }

    if (dotsContainer) {
        dotsContainer.onclick = function(e) {
            const dot = e.target.closest('.coding-stats__dot');
            if (dot) {
                const index = parseInt(dot.dataset.index, 10);
                console.log('Coding Stats: Dot clicked, index:', index);
                showSlide(window.codingStatsContainer, index);
            }
        };
    }

    updateNavButtons(container);
    console.log('Coding Stats: Navigation setup complete');
}

/**
 * Show specific slide
 */
function showSlide(container, index) {
    if (!container) container = window.codingStatsContainer;
    if (!container) return;
    
    const slides = container.querySelectorAll('.coding-stats__slide');
    const dots = container.querySelectorAll('.coding-stats__dot');
    
    console.log('Coding Stats: Showing slide', index, 'of', slides.length);
    
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
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
    if (!container) container = window.codingStatsContainer;
    if (!container) return;
    
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
    if (!container) container = window.codingStatsContainer;
    if (!container) return;
    
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
