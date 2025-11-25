/**
 * Professional Experience Component Behavior
 * Handles expand/collapse functionality, animations, and dynamic content rendering
 */

// Global experience data storage
let experienceData = {};

/**
 * Initialize the experience component
 */
function initializeExperience() {
    console.log('Experience: Initializing component...');
    
    // Find containers
    const timelineContainer = document.getElementById('experience-timeline');
    const emptyState = document.getElementById('experience-empty');
    
    if (!timelineContainer) {
        console.error('Experience: Timeline container not found');
        return;
    }
    
    console.log('Experience: Timeline container found:', !!timelineContainer);
    
    // Check if we have data to render
    if (Object.keys(experienceData).length > 0) {
        console.log('Experience: Rendering with existing data');
        renderExperienceItems();
    } else {
        console.log('Experience: No data available, showing empty state');
        showEmptyState();
    }
}

/**
 * Set experience data from PHP loader
 */
function setExperienceData(data) {
    console.log('Experience: Setting experience data:', data);
    experienceData = data || {};
    
    // If component is already initialized, render the data
    const timelineContainer = document.getElementById('experience-timeline');
    if (timelineContainer) {
        renderExperienceItems();
    }
}

/**
 * Render all experience items
 */
function renderExperienceItems() {
    const timelineContainer = document.getElementById('experience-timeline');
    const emptyState = document.getElementById('experience-empty');
    
    if (!timelineContainer) return;
    
    // Clear existing content
    timelineContainer.innerHTML = '';
    
    // Hide empty state
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Check if we have experience data
    if (!experienceData.experiences || experienceData.experiences.length === 0) {
        showEmptyState();
        return;
    }
    
    // Render each experience item
    experienceData.experiences.forEach((experience, index) => {
        const timelineItem = createExperienceItem(experience, index);
        timelineContainer.appendChild(timelineItem);
    });
    
    // Initialize expand/collapse functionality
    initializeExpandButtons();
    
    // Initialize animations
    initializeScrollAnimations();
    
    console.log('Experience: Rendered', experienceData.experiences.length, 'experience items');
}

/**
 * Create a single experience item
 */
function createExperienceItem(experience, index) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    timelineItem.style.animationDelay = `${(index + 1) * 0.2}s`;
    
    // Calculate years of experience
    const yearsText = calculateYears(experience.startDate, experience.endDate);
    
    timelineItem.innerHTML = `
        <div class="experience-card">
            <!-- Title Row - Number and Title -->
            <div class="experience-card__title-row">
                <div class="experience-card__title-group">
                    <div class="experience-card__title-content">
                        <h3 class="experience-card__title">${escapeHtml(experience.jobTitle || 'N/A')}</h3>
                        <div class="experience-card__company">
                            <ion-icon name="business-outline" aria-hidden="true"></ion-icon>
                            ${escapeHtml(experience.companyName || 'N/A')}
                        </div>
                        <div class="experience-card__meta-left">
                            <div class="experience-card__meta-item">
                                <ion-icon name="calendar-outline" aria-hidden="true"></ion-icon>
                                <span class="experience-card__dates">
                                    ${escapeHtml(experience.dates || 'N/A')}
                                    ${yearsText ? ` <span class="experience-card__years-inline">(${yearsText})</span>` : ''}
                                </span>
                            </div>
                            ${experience.location ? `
                                <div class="experience-card__meta-item">
                                    <ion-icon name="location-outline" aria-hidden="true"></ion-icon>
                                    <span class="experience-card__location">${escapeHtml(experience.location)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="experience-card__right-section">
                    ${experience.logoIcon ? `
                        <div class="experience-card__logo">
                            <ion-icon name="${escapeHtml(experience.logoIcon)}" aria-hidden="true"></ion-icon>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Responsibilities -->
            ${experience.responsibilities && experience.responsibilities.length > 0 ? `
                <div class="experience-card__responsibilities">
                    <div class="experience-responsibilities-title">Key Responsibilities</div>
                    <ul class="responsibilities-list">
                        ${experience.responsibilities.map((responsibility, respIndex) => `
                            <li class="responsibility-item ${respIndex >= 3 ? 'hidden' : ''}" style="animation-delay: ${(respIndex + 1) * 0.1}s">
                                ${responsibility}
                            </li>
                        `).join('')}
                    </ul>
                    
                    ${experience.responsibilities.length > 3 ? `
                        <button class="expand-button" data-expanded="false">
                            <span class="btn-text">Show More</span>
                            <ion-icon name="chevron-down-outline" aria-hidden="true"></ion-icon>
                        </button>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Tags Section -->
            ${experience.tags && experience.tags.length > 0 ? `
                <div class="experience-card__tags">
                    <div class="experience-tags-title">Key Technologies & Tools</div>
                    <ul class="experience-tags-list">
                        ${experience.tags.map(tag => `
                            <li class="experience-tag">${escapeHtml(tag)}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    
    return timelineItem;
}

/**
 * Calculate years of experience
 */
function calculateYears(startDate, endDate = null) {
    if (!startDate) return '';
    
    try {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        
        const diffTime = Math.abs(end - start);
        const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
        const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        
        if (diffYears > 0) {
            return diffYears + (diffYears === 1 ? ' year' : ' years');
        } else {
            return diffMonths + (diffMonths === 1 ? ' month' : ' months');
        }
    } catch (error) {
        console.error('Experience: Error calculating years:', error);
        return '';
    }
}

/**
 * Show empty state
 */
function showEmptyState() {
    const timelineContainer = document.getElementById('experience-timeline');
    const emptyState = document.getElementById('experience-empty');
    
    if (timelineContainer) {
        timelineContainer.innerHTML = '';
    }
    
    if (emptyState) {
        emptyState.style.display = 'block';
    }
}

/**
 * Initialize expand/collapse buttons for responsibilities
 */
function initializeExpandButtons() {
    document.querySelectorAll('.expand-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const isExpanded = button.getAttribute('data-expanded') === 'true';
            const card = button.closest('.experience-card');
            const hiddenItems = card.querySelectorAll('.responsibility-item.hidden');
            const allItems = card.querySelectorAll('.responsibility-item');

            if (!isExpanded) {
                // Expanding - show hidden items with staggered animation
                hiddenItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.remove('hidden');
                        item.style.opacity = '0';
                        item.style.transform = 'translateX(-10px)';

                        // Force reflow
                        void item.offsetHeight;

                        item.style.transition = 'all 0.3s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, index * 100);
                });

                // Update button state
                button.setAttribute('data-expanded', 'true');
                const btnText = button.querySelector('.btn-text');
                if (btnText) btnText.textContent = 'Show Less';

            } else {
                // Collapsing - hide items beyond the first 3
                allItems.forEach((item, index) => {
                    if (index >= 3) {
                        item.style.transition = 'all 0.2s ease';
                        item.style.opacity = '0';
                        item.style.transform = 'translateX(-10px)';

                        setTimeout(() => {
                            item.classList.add('hidden');
                            item.style.transition = '';
                        }, 200);
                    }
                });

                // Update button state
                button.setAttribute('data-expanded', 'false');
                const btnText = button.querySelector('.btn-text');
                if (btnText) btnText.textContent = 'Show More';
            }
        });
    });
}

/**
 * Initialize scroll-triggered animations
 */
function initializeScrollAnimations() {
    // Create intersection observer for timeline items
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const timelineItem = entry.target;

                // Animate the timeline item
                timelineItem.style.opacity = '1';
                timelineItem.style.transform = 'translateY(0)';

                // Animate responsibility items with stagger
                const responsibilityItems = timelineItem.querySelectorAll('.responsibility-item:not(.hidden)');
                responsibilityItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, index * 100);
                });

                // Stop observing this item
                timelineObserver.unobserve(timelineItem);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all timeline items
    document.querySelectorAll('.timeline-item').forEach(item => {
        timelineObserver.observe(item);
    });
}

/**
 * Utility function to escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Reset animations (useful for dynamic content)
 */
function resetExperienceAnimations() {
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
    });

    document.querySelectorAll('.responsibility-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-10px)';
    });
}

// Export functions to global scope for framework integration
window.handleExperienceNavigation = initializeExperience;
window.setExperienceData = setExperienceData;
window.initializeExperience = initializeExperience;
window.resetExperienceAnimations = resetExperienceAnimations;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are ready
    setTimeout(initializeExperience, 100);
});

// Listen for component loaded events
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.componentId && event.detail.componentId.includes('experience')) {
        setTimeout(initializeExperience, 100);
    }
});

console.log('Experience: Behavior script loaded');
