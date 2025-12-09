// Testimonials Component Behavior
// Use global state to prevent redeclaration issues on dynamic reload
window.testimonialsState = window.testimonialsState || {
    currentSlide: 0,
    testimonialsData: [],
    slideInterval: null,
    autoPlayDelay: 6000
};

class TestimonialsBehavior {
    constructor() {
        this.state = window.testimonialsState;
        this.init();
    }

    init() {
        this.bindEvents();
        
        // Check if data is already available
        if (this.state.testimonialsData && this.state.testimonialsData.length > 0) {
            this.renderTestimonials();
        }
    }

    bindEvents() {
        // Navigation buttons
        const prevBtn = document.getElementById('testimonials-prev');
        const nextBtn = document.getElementById('testimonials-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Quote expand/collapse on click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('testimonials__quote')) {
                e.target.classList.toggle('expanded');
            }
        });

        // Auto-play disabled - no hover listeners needed
    }

    setTestimonialsData(data) {
        console.log('Testimonials: Setting testimonials data:', data);
        this.state.testimonialsData = data || [];
        this.renderTestimonials();
        // Auto-play disabled per user request
        // this.startAutoPlay();
    }

    renderTestimonials() {
        console.log('Testimonials: Rendering testimonials...');
        const slidesContainer = document.getElementById('testimonials-slides');
        const indicatorsContainer = document.getElementById('testimonials-indicators');
        const emptyState = document.getElementById('testimonials-empty');

        if (!slidesContainer) {
            console.log('Testimonials: Slides container not found');
            return;
        }

        if (this.state.testimonialsData.length === 0) {
            console.log('Testimonials: No data available');
            slidesContainer.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        console.log('Testimonials: Rendering', this.state.testimonialsData.length, 'testimonials');
        if (emptyState) emptyState.style.display = 'none';
        slidesContainer.style.display = 'block';

        // Clear existing content
        slidesContainer.innerHTML = '';
        if (indicatorsContainer) indicatorsContainer.innerHTML = '';

        // Create slides
        this.state.testimonialsData.forEach((testimonial, index) => {
            const slide = this.createSlide(testimonial, index);
            slidesContainer.appendChild(slide);

            // Create indicator
            if (indicatorsContainer) {
                const indicator = this.createIndicator(index);
                indicatorsContainer.appendChild(indicator);
            }
        });

        // Show first slide
        this.state.currentSlide = 0;
        
        // Ensure first slide is immediately visible without animation
        setTimeout(() => {
            this.showSlide(this.state.currentSlide);
            this.updateNavigationButtons();
        }, 50);
    }

    createSlide(testimonial, index) {
        const slide = document.createElement('div');
        slide.className = 'testimonials__slide';
        slide.setAttribute('data-slide', index);

        // Create colored placeholder avatar with initials
        const initial = testimonial.name ? testimonial.name.charAt(0).toUpperCase() : 'A';
        const colors = ['#FF8F00', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#607D8B'];
        const colorIndex = index % colors.length;
        const avatarColor = colors[colorIndex];

        slide.innerHTML = `
            <div class="testimonials__top-section">
                <div class="testimonials__avatar testimonials__avatar-placeholder" style="background-color: ${avatarColor};">
                    <span class="testimonials__avatar-initial">${initial}</span>
                </div>
                <div class="testimonials__author">
                    <h4 class="testimonials__author-name">${testimonial.name || 'Anonymous'}${testimonial.title ? ` (${testimonial.title})` : ''}</h4>
                    <p class="testimonials__author-company">${testimonial.company || ''}</p>
                </div>
            </div>
            <blockquote class="testimonials__quote">${testimonial.quote || 'No testimonial text provided.'}</blockquote>
        `;

        return slide;
    }

    createIndicator(index) {
        const indicator = document.createElement('div');
        indicator.className = 'testimonials__indicator';
        indicator.setAttribute('data-slide', index);
        
        indicator.addEventListener('click', () => {
            this.goToSlide(index);
        });

        return indicator;
    }

    showSlide(index) {
        console.log('Testimonials: Showing slide', index);
        const slides = document.querySelectorAll('.testimonials__slide');
        const indicators = document.querySelectorAll('.testimonials__indicator');

        console.log('Testimonials: Found', slides.length, 'slides');

        // Hide all slides
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev');
            if (i < index) {
                slide.classList.add('prev');
            }
        });

        // Show current slide
        if (slides[index]) {
            slides[index].classList.add('active');
            console.log('Testimonials: Activated slide', index);
        }

        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    nextSlide() {
        if (this.state.testimonialsData.length === 0) return;
        
        this.state.currentSlide = (this.state.currentSlide + 1) % this.state.testimonialsData.length;
        this.showSlide(this.state.currentSlide);
        this.updateNavigationButtons();
        this.restartAutoPlay();
    }

    previousSlide() {
        if (this.state.testimonialsData.length === 0) return;
        
        this.state.currentSlide = this.state.currentSlide === 0 ? 
            this.state.testimonialsData.length - 1 : this.state.currentSlide - 1;
        this.showSlide(this.state.currentSlide);
        this.updateNavigationButtons();
        this.restartAutoPlay();
    }

    goToSlide(index) {
        if (index >= 0 && index < this.state.testimonialsData.length) {
            this.state.currentSlide = index;
            this.showSlide(this.state.currentSlide);
            this.updateNavigationButtons();
            this.restartAutoPlay();
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('testimonials-prev');
        const nextBtn = document.getElementById('testimonials-next');

        if (this.state.testimonialsData.length <= 1) {
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
        } else {
            if (prevBtn) prevBtn.disabled = false;
            if (nextBtn) nextBtn.disabled = false;
        }
    }

    startAutoPlay() {
        this.pauseAutoPlay(); // Clear any existing interval
        
        if (this.state.testimonialsData.length > 1) {
            this.state.slideInterval = setInterval(() => {
                this.nextSlide();
            }, this.state.autoPlayDelay);
        }
    }

    pauseAutoPlay() {
        if (this.state.slideInterval) {
            clearInterval(this.state.slideInterval);
            this.state.slideInterval = null;
        }
    }

    restartAutoPlay() {
        this.startAutoPlay();
    }
}

// Global functions for external integration
function setTestimonialsData(data) {
    console.log('Testimonials: setTestimonialsData called with data:', data);
    window.testimonialsState.testimonialsData = data || [];
    
    if (window.testimonialsBehavior) {
        window.testimonialsBehavior.setTestimonialsData(data);
    }
}
window.setTestimonialsData = setTestimonialsData;

// Navigation handler for global navigator integration
function handleTestimonialsNavigation(elementId, state, parameters = {}) {
    console.log('Testimonials: Navigation handler called', { elementId, state, parameters });
    const element = document.getElementById(elementId);
    if (!element) return false;
    
    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
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
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
        default:
            console.log('Testimonials: Unknown navigation state:', state);
            return false;
    }
    return true;
}
window.handleTestimonialsNavigation = handleTestimonialsNavigation;

// Init hook for dynamic content loading
function initializeTestimonials(componentElement) {
    console.log('Testimonials: Initializing after dynamic load...');
    
    // Reinitialize the behavior if needed
    if (!window.testimonialsBehavior) {
        window.testimonialsBehavior = new TestimonialsBehavior();
    } else {
        // Rebind events
        window.testimonialsBehavior.bindEvents();
        
        // Re-render if data exists
        if (window.testimonialsState.testimonialsData && window.testimonialsState.testimonialsData.length > 0) {
            window.testimonialsBehavior.renderTestimonials();
        }
    }
}
window.initializeTestimonials = initializeTestimonials;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Testimonials: Behavior script loaded');
    window.testimonialsBehavior = new TestimonialsBehavior();
});

// Also initialize if script loads after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.testimonialsBehavior) {
            window.testimonialsBehavior = new TestimonialsBehavior();
        }
    });
} else {
    if (!window.testimonialsBehavior) {
        window.testimonialsBehavior = new TestimonialsBehavior();
    }
}
