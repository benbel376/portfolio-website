/**
 * Professional Certifications Slideshow Component Behavior
 * Handles slideshow navigation, pagination, and dynamic content rendering
 */

// Global certifications data storage (avoid conflicts with multiple script loads)
window.certificationsData = window.certificationsData || [];
window.currentSlideIndex = window.currentSlideIndex || 0;

/**
 * Initialize the certifications slideshow component
 */
function initializeCertifications() {
    console.log('Certifications: Initializing slideshow component...');
    
    // Find containers
    const slideContainer = document.getElementById('certifications-slide-container');
    const emptyState = document.getElementById('certifications-empty');
    
    if (!slideContainer) {
        console.error('Certifications: Slide container not found');
        return;
    }
    
    console.log('Certifications: Slide container found:', !!slideContainer);
    
    // Check if we have data to render
    if (window.certificationsData.length > 0) {
        console.log('Certifications: Rendering with existing data');
        renderCertificationsSlideshow();
    } else {
        console.log('Certifications: No data available, showing empty state');
        showEmptyState();
    }
    
    // Initialize navigation
    initializeNavigation();
}

/**
 * Set certifications data from PHP loader
 */
function setCertificationsData(data) {
    console.log('Certifications: Setting certifications data:', data);
    window.certificationsData = data || [];
    window.currentSlideIndex = 0;
    
    // If component is already initialized, render the data
    const slideContainer = document.getElementById('certifications-slide-container');
    if (slideContainer) {
        renderCertificationsSlideshow();
    }
}

// Make setCertificationsData available globally
window.setCertificationsData = setCertificationsData;

/**
 * Render the certifications slideshow
 */
function renderCertificationsSlideshow() {
    const slideContainer = document.getElementById('certifications-slide-container');
    const emptyState = document.getElementById('certifications-empty');
    
    if (!slideContainer) return;
    
    // Clear existing content
    slideContainer.innerHTML = '';
    
    // Hide empty state
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Check if we have certifications data
    if (!window.certificationsData || window.certificationsData.length === 0) {
        showEmptyState();
        return;
    }
    
    // Render each certification slide
    window.certificationsData.forEach((certification, index) => {
        const slide = createCertificationSlide(certification, index);
        slideContainer.appendChild(slide);
    });
    
    // Show first slide
    showSlide(0);
    
    // Render pagination
    renderPagination();
    
    // Update navigation buttons
    updateNavigationButtons();
    
    console.log('Certifications: Rendered', window.certificationsData.length, 'certification slides');
}

/**
 * Create a single certification slide
 */
function createCertificationSlide(certification, index) {
    const slide = document.createElement('div');
    slide.className = 'certifications__slide';
    slide.setAttribute('data-slide-index', index);
    
    // Format date if available
    const formattedDate = certification.dateIssued ? formatDate(certification.dateIssued) : 'Date not specified';
    
    slide.innerHTML = `
        <div class="certifications__slide-image">
            <div class="certifications__image-container">
                <img class="certifications__image" 
                     src="${escapeHtml(certification.image || '')}" 
                     alt="${escapeHtml(certification.name || 'Certificate')}"
                     loading="lazy">
            </div>
        </div>
        <div class="certifications__slide-details">
            <h3 class="certifications__slide-title">${escapeHtml(certification.name || 'Certificate Name')}</h3>
            <p class="certifications__slide-issuer">${escapeHtml(certification.issuer || 'Issuer')}</p>
            
            <div class="certifications__slide-description">
                ${escapeHtml(certification.description || 'No description available.')}
            </div>
            
            ${certification.link ? `
                <div class="certifications__slide-actions">
                    <a href="${escapeHtml(certification.link)}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="certifications__link-button">
                        <ion-icon name="link-outline"></ion-icon>
                        <span>View Certificate</span>
                    </a>
                </div>
            ` : ''}
        </div>
    `;
    
    return slide;
}

/**
 * Show specific slide
 */
function showSlide(index) {
    const slides = document.querySelectorAll('.certifications__slide');
    
    if (slides.length === 0) return;
    
    // Ensure index is within bounds
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    window.window.currentSlideIndex = index;
    
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show current slide
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    
    // Update pagination
    updatePagination();
    
    // Update navigation buttons
    updateNavigationButtons();
}

/**
 * Initialize navigation controls
 */
function initializeNavigation() {
    const prevButton = document.getElementById('certifications-prev');
    const nextButton = document.getElementById('certifications-next');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            showSlide(window.currentSlideIndex - 1);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            showSlide(window.currentSlideIndex + 1);
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (document.activeElement && document.activeElement.closest('.certifications-component')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                showSlide(window.currentSlideIndex - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                showSlide(window.currentSlideIndex + 1);
            }
        }
    });
}

/**
 * Render pagination dots
 */
function renderPagination() {
    const paginationContainer = document.getElementById('certifications-pagination');
    
    if (!paginationContainer || window.certificationsData.length === 0) return;
    
    // Clear existing pagination
    paginationContainer.innerHTML = '';
    
    // Create pagination dots
    window.certificationsData.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'certifications__pagination-dot';
        dot.setAttribute('data-slide-index', index);
        dot.setAttribute('aria-label', `Go to certificate ${index + 1}`);
        
        dot.addEventListener('click', () => {
            showSlide(index);
        });
        
        paginationContainer.appendChild(dot);
    });
}

/**
 * Update pagination dots
 */
function updatePagination() {
    const dots = document.querySelectorAll('.certifications__pagination-dot');
    
    dots.forEach((dot, index) => {
        if (index === window.currentSlideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

/**
 * Update navigation buttons
 */
function updateNavigationButtons() {
    const prevButton = document.getElementById('certifications-prev');
    const nextButton = document.getElementById('certifications-next');
    
    if (!prevButton || !nextButton) return;
    
    // Enable/disable buttons based on current position
    prevButton.disabled = window.currentSlideIndex === 0;
    nextButton.disabled = window.currentSlideIndex === window.certificationsData.length - 1;
}

/**
 * Show empty state
 */
function showEmptyState() {
    const slideContainer = document.getElementById('certifications-slide-container');
    const emptyState = document.getElementById('certifications-empty');
    const navigation = document.querySelector('.certifications__navigation');
    
    if (slideContainer) {
        slideContainer.innerHTML = '';
    }
    
    if (navigation) {
        navigation.style.display = 'none';
    }
    
    if (emptyState) {
        emptyState.style.display = 'block';
    }
}

/**
 * Format date string
 */
function formatDate(dateString) {
    if (!dateString) return 'Date not specified';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    } catch (error) {
        console.warn('Certifications: Error formatting date:', error);
        return dateString;
    }
}

/**
 * Utility function to escape HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Auto-advance slideshow (optional)
 */
function startAutoAdvance(interval = 8000) {
    return setInterval(() => {
        if (window.certificationsData.length > 1) {
            showSlide(window.currentSlideIndex + 1);
        }
    }, interval);
}

/**
 * Reset slideshow animations
 */
function resetCertificationsAnimations() {
    const slides = document.querySelectorAll('.certifications__slide');
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    window.currentSlideIndex = 0;
    if (slides.length > 0) {
        showSlide(0);
    }
}

// Export functions to global scope for framework integration
window.handleCertificationsNavigation = initializeCertifications;
window.setCertificationsData = setCertificationsData;
window.initializeCertifications = initializeCertifications;
window.resetCertificationsAnimations = resetCertificationsAnimations;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are ready
    setTimeout(initializeCertifications, 100);
});

// Listen for component loaded events
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.componentId && event.detail.componentId.includes('certifications')) {
        setTimeout(initializeCertifications, 100);
    }
});

console.log('Certifications: Slideshow behavior script loaded');
console.log('Certifications: Slideshow behavior script loaded');