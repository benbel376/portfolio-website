/**
 * Coding Stats Slideshow Component
 * Based on certifications pattern
 */

window.codingStatsData = window.codingStatsData || [];
window.codingStatsCurrentSlide = 0;
window.codingStatsContainer = null;

function initializeCodingStats(componentElement) {
    console.log('CodingStats: Initializing...');
    
    // Find container within this component or globally
    let slideContainer;
    if (componentElement) {
        slideContainer = componentElement.querySelector('#coding-stats-slide-container') ||
                        componentElement.querySelector('.coding-stats__slide-container');
    }
    if (!slideContainer) {
        slideContainer = document.getElementById('coding-stats-slide-container');
    }
    
    if (!slideContainer) {
        console.error('CodingStats: Slide container not found');
        return;
    }
    
    // Store reference for later use
    window.codingStatsContainer = slideContainer;
    
    // Check for pending data from PHP
    if (window.codingStatsDataPending) {
        console.log('CodingStats: Found pending data from PHP');
        setCodingStatsData(window.codingStatsDataPending);
        delete window.codingStatsDataPending;
        return;
    }
    
    // Check if already rendered
    if (slideContainer.querySelectorAll('.coding-stats__slide').length > 0) {
        console.log('CodingStats: Already rendered');
        showSlide(window.codingStatsCurrentSlide);
        return;
    }
    
    // Check if we have data
    if (window.codingStatsData && window.codingStatsData.length > 0) {
        console.log('CodingStats: Rendering with existing data:', window.codingStatsData.length);
        renderSlideshow();
    } else {
        console.log('CodingStats: No data available');
        showEmptyState();
    }
    
    initializeNavigation();
}

function setCodingStatsData(data) {
    console.log('CodingStats: setCodingStatsData called with:', data);
    
    // Handle both {platforms: [...]} object and direct array
    if (data && data.platforms && Array.isArray(data.platforms)) {
        window.codingStatsData = data.platforms;
        console.log('CodingStats: Extracted platforms array:', window.codingStatsData.length);
    } else if (Array.isArray(data)) {
        window.codingStatsData = data;
    } else {
        window.codingStatsData = [];
    }
    
    window.codingStatsCurrentSlide = 0;
    
    // Find container if not already set
    if (!window.codingStatsContainer) {
        window.codingStatsContainer = document.getElementById('coding-stats-slide-container');
    }
    
    if (window.codingStatsContainer) {
        renderSlideshow();
        initializeNavigation();
    }
}

function renderSlideshow() {
    const slideContainer = window.codingStatsContainer || document.getElementById('coding-stats-slide-container');
    const emptyState = document.getElementById('coding-stats-empty');
    const paginationContainer = document.querySelector('.coding-stats__pagination-container');
    
    if (!slideContainer) {
        console.error('CodingStats: Slide container not found in renderSlideshow');
        return;
    }
    
    slideContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'none';
    if (paginationContainer) paginationContainer.style.display = 'flex';
    
    if (!window.codingStatsData || window.codingStatsData.length === 0) {
        console.log('CodingStats: No data to render');
        showEmptyState();
        return;
    }
    
    console.log('CodingStats: Rendering', window.codingStatsData.length, 'slides');
    
    // Create slides
    window.codingStatsData.forEach((platform, index) => {
        const slide = createSlide(platform, index);
        slideContainer.appendChild(slide);
    });
    
    // Show first slide - pass container directly
    console.log('CodingStats: Calling showSlide(0), container children:', slideContainer.children.length);
    console.log('CodingStats: typeof showSlide:', typeof showSlide);
    try {
        showSlide(0, slideContainer);
        console.log('CodingStats: showSlide completed');
    } catch (err) {
        console.error('CodingStats: showSlide ERROR:', err.message, err.stack);
    }
    
    // Render pagination dots
    console.log('CodingStats: Calling renderPagination');
    try {
        renderPagination();
        console.log('CodingStats: renderPagination completed');
    } catch (err) {
        console.error('CodingStats: renderPagination ERROR:', err.message, err.stack);
    }
    
    console.log('CodingStats: Rendered', window.codingStatsData.length, 'slides successfully');
}

function createSlide(platform, index) {
    const slide = document.createElement('div');
    slide.className = 'coding-stats__slide';
    slide.setAttribute('data-slide-index', index);
    
    // Ensure color has 'background:' prefix
    let logoStyle = platform.color || 'linear-gradient(135deg, #FFA116 0%, #FFB800 100%)';
    if (!logoStyle.startsWith('background')) {
        logoStyle = 'background: ' + logoStyle;
    }
    const logoContent = platform.logo 
        ? `<img src="${escapeHtml(platform.logo)}" alt="${escapeHtml(platform.name)}">`
        : `<ion-icon name="${platform.icon || 'code-working-outline'}"></ion-icon>`;
    
    const stats = (platform.stats || []).slice(0, 3);
    const statsHtml = stats.map(stat => `
        <div class="coding-stats__stat">
            <div class="coding-stats__stat-value">${escapeHtml(String(stat.value))}</div>
            <div class="coding-stats__stat-label">${escapeHtml(stat.label)}</div>
        </div>
    `).join('');
    
    slide.innerHTML = `
        <div class="coding-stats__slide-logo" style="${logoStyle}">
            ${logoContent}
        </div>
        <div class="coding-stats__slide-content">
            <h3 class="coding-stats__slide-name">${escapeHtml(platform.name)}</h3>
            ${platform.profileUrl ? `
                <a class="coding-stats__slide-link" href="${escapeHtml(platform.profileUrl)}" target="_blank">
                    @${escapeHtml(platform.username || 'profile')}
                    <ion-icon name="open-outline"></ion-icon>
                </a>
            ` : ''}
            <div class="coding-stats__slide-stats">
                ${statsHtml}
            </div>
        </div>
    `;
    
    return slide;
}

function showSlide(index, containerOverride) {
    console.log('CodingStats: showSlide ENTERED, index:', index, 'containerOverride:', !!containerOverride);
    
    const container = containerOverride || window.codingStatsContainer || document.getElementById('coding-stats-slide-container');
    console.log('CodingStats: showSlide container:', !!container);
    
    if (!container) {
        console.log('CodingStats: showSlide - container not found');
        return;
    }
    
    const slides = container.querySelectorAll('.coding-stats__slide');
    console.log('CodingStats: showSlide called, index:', index, 'total slides:', slides.length);
    
    if (slides.length === 0) {
        console.log('CodingStats: No slides found in container');
        return;
    }
    
    // Bounds check with wrap
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    window.codingStatsCurrentSlide = index;
    
    // Hide all, show current
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
            slide.style.display = 'flex';  // Force display
            slide.style.opacity = '1';     // Force opacity
            console.log('CodingStats: Activated slide', i, 'classes:', slide.className);
        } else {
            slide.classList.remove('active');
            slide.style.display = 'none';
        }
    });
    
    updatePagination();
    updateNavigationButtons();
    
    console.log('CodingStats: Now showing slide', index + 1, 'of', slides.length);
}

function initializeNavigation() {
    const prevBtn = document.getElementById('coding-stats-prev');
    const nextBtn = document.getElementById('coding-stats-next');
    
    console.log('CodingStats: initializeNavigation - prev:', !!prevBtn, 'next:', !!nextBtn);
    
    if (prevBtn && !prevBtn.hasAttribute('data-initialized')) {
        prevBtn.setAttribute('data-initialized', 'true');
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('CodingStats: Prev clicked, current:', window.codingStatsCurrentSlide);
            showSlide(window.codingStatsCurrentSlide - 1);
        });
        console.log('CodingStats: Prev button listener attached');
    }
    
    if (nextBtn && !nextBtn.hasAttribute('data-initialized')) {
        nextBtn.setAttribute('data-initialized', 'true');
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('CodingStats: Next clicked, current:', window.codingStatsCurrentSlide);
            showSlide(window.codingStatsCurrentSlide + 1);
        });
        console.log('CodingStats: Next button listener attached');
    }
}

function renderPagination() {
    const container = document.getElementById('coding-stats-pagination');
    if (!container) {
        console.log('CodingStats: Pagination container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (!window.codingStatsData || window.codingStatsData.length === 0) return;
    
    console.log('CodingStats: Creating', window.codingStatsData.length, 'pagination dots');
    
    window.codingStatsData.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'coding-stats__pagination-dot';
        dot.setAttribute('data-slide-index', index);
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('CodingStats: Dot clicked:', index);
            showSlide(index);
        });
        container.appendChild(dot);
    });
    
    updatePagination();
}

function updatePagination() {
    const paginationContainer = document.getElementById('coding-stats-pagination');
    if (!paginationContainer) return;
    
    const dots = paginationContainer.querySelectorAll('.coding-stats__pagination-dot');
    dots.forEach((dot, i) => {
        if (i === window.codingStatsCurrentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('coding-stats-prev');
    const nextBtn = document.getElementById('coding-stats-next');
    const total = window.codingStatsData ? window.codingStatsData.length : 0;
    
    if (prevBtn) prevBtn.disabled = window.codingStatsCurrentSlide === 0;
    if (nextBtn) nextBtn.disabled = window.codingStatsCurrentSlide === total - 1;
}

function showEmptyState() {
    const slideContainer = window.codingStatsContainer || document.getElementById('coding-stats-slide-container');
    const emptyState = document.getElementById('coding-stats-empty');
    const pagination = document.querySelector('.coding-stats__pagination-container');
    
    if (slideContainer) slideContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (pagination) pagination.style.display = 'none';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeCodingStats, 100);
});

console.log('CodingStats: Behavior loaded v8');
