/**
 * Coding Stats Slideshow - Simplified v9
 */

// Global state
window.codingStatsData = window.codingStatsData || [];
window.codingStatsCurrentSlide = 0;

/**
 * Set data from PHP
 */
function setCodingStatsData(data) {
    console.log('CodingStats v9: setCodingStatsData');
    
    // Extract platforms array
    if (data && data.platforms) {
        window.codingStatsData = data.platforms;
    } else if (Array.isArray(data)) {
        window.codingStatsData = data;
    } else {
        window.codingStatsData = [];
    }
    
    window.codingStatsCurrentSlide = 0;
    renderCodingStats();
}

/**
 * Render the slideshow
 */
function renderCodingStats() {
    const container = document.getElementById('coding-stats-slide-container');
    const pagination = document.getElementById('coding-stats-pagination');
    
    if (!container) {
        console.log('CodingStats v9: Container not found');
        return;
    }
    
    if (!window.codingStatsData || window.codingStatsData.length === 0) {
        console.log('CodingStats v9: No data');
        return;
    }
    
    console.log('CodingStats v9: Rendering', window.codingStatsData.length, 'platforms');
    
    // Clear and render slides
    container.innerHTML = '';
    window.codingStatsData.forEach((platform, i) => {
        const div = document.createElement('div');
        div.className = 'coding-stats__slide' + (i === 0 ? ' active' : '');
        div.style.display = i === 0 ? 'flex' : 'none';
        const logoContent = platform.logo 
            ? `<img src="${platform.logo}" alt="${platform.name}" />`
            : `<ion-icon name="${platform.icon || 'code-outline'}"></ion-icon>`;
        
        div.innerHTML = `
            <div class="coding-stats__slide-left">
                <div class="coding-stats__slide-logo">
                    ${logoContent}
                </div>
                <div class="coding-stats__slide-info">
                    <h3 class="coding-stats__slide-name">${platform.name}</h3>
                    <a class="coding-stats__slide-link" href="${platform.profileUrl || '#'}" target="_blank">
                        @${platform.username || 'profile'} <ion-icon name="open-outline"></ion-icon>
                    </a>
                    <p class="coding-stats__slide-desc">Coding challenges & competitions</p>
                </div>
            </div>
            <div class="coding-stats__slide-divider"></div>
            <div class="coding-stats__slide-right">
                <div class="coding-stats__slide-stats">
                    ${(platform.stats || []).map(s => `
                        <div class="coding-stats__stat">
                            <div class="coding-stats__stat-value">${s.value}</div>
                            <div class="coding-stats__stat-label">${s.label}</div>
                        </div>
                    `).join('')}
                </div>
                <p class="coding-stats__slide-stats-desc">Performance metrics</p>
            </div>
        `;
        container.appendChild(div);
    });
    
    // Render pagination dots
    if (pagination) {
        pagination.innerHTML = '';
        window.codingStatsData.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'coding-stats__pagination-dot' + (i === 0 ? ' active' : '');
            dot.onclick = () => goToSlide(i);
            pagination.appendChild(dot);
        });
    }
    
    // Setup nav buttons
    const prev = document.getElementById('coding-stats-prev');
    const next = document.getElementById('coding-stats-next');
    if (prev) prev.onclick = () => goToSlide(window.codingStatsCurrentSlide - 1);
    if (next) next.onclick = () => goToSlide(window.codingStatsCurrentSlide + 1);
    
    updateButtons();
    console.log('CodingStats v9: Render complete');
}

/**
 * Go to specific slide
 */
function goToSlide(index) {
    const slides = document.querySelectorAll('#coding-stats-slide-container .coding-stats__slide');
    const dots = document.querySelectorAll('#coding-stats-pagination .coding-stats__pagination-dot');
    
    if (slides.length === 0) return;
    
    // Wrap around
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    window.codingStatsCurrentSlide = index;
    
    // Update slides
    slides.forEach((s, i) => {
        if (i === index) {
            s.classList.add('active');
            s.style.display = 'flex';
        } else {
            s.classList.remove('active');
            s.style.display = 'none';
        }
    });
    
    // Update dots
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
    });
    
    updateButtons();
    console.log('CodingStats v9: Showing slide', index + 1);
}

/**
 * Update prev/next button states
 */
function updateButtons() {
    const prev = document.getElementById('coding-stats-prev');
    const next = document.getElementById('coding-stats-next');
    const total = window.codingStatsData.length;
    
    if (prev) prev.disabled = window.codingStatsCurrentSlide === 0;
    if (next) next.disabled = window.codingStatsCurrentSlide >= total - 1;
}

/**
 * Initialize component
 */
function initializeCodingStats() {
    console.log('CodingStats v9: Initialize');
    
    // Check for pending data
    if (window.codingStatsDataPending) {
        setCodingStatsData(window.codingStatsDataPending);
        delete window.codingStatsDataPending;
    } else if (window.codingStatsData && window.codingStatsData.length > 0) {
        renderCodingStats();
    }
}

/**
 * Navigation handler
 */
function handleCodingStatsNavigation(elementId, state) {
    const el = document.getElementById(elementId);
    if (!el) return false;
    
    if (state === 'visible') {
        el.style.display = 'block';
        el.classList.remove('nav-hidden');
        el.classList.add('nav-visible');
        initializeCodingStats();
    } else if (state === 'hidden') {
        el.classList.add('nav-hidden');
        el.classList.remove('nav-visible');
        setTimeout(() => el.style.display = 'none', 300);
    }
    return true;
}

// Exports
window.setCodingStatsData = setCodingStatsData;
window.initializeCodingStats = initializeCodingStats;
window.handleCodingStatsNavigation = handleCodingStatsNavigation;

// Auto-init
document.addEventListener('DOMContentLoaded', () => setTimeout(initializeCodingStats, 100));

console.log('CodingStats v9: Script loaded');
