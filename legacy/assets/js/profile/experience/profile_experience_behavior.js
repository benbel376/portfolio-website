/**
 * Professional Experience Timeline Behavior
 * Handles expand/collapse functionality, animations, and interactions
 */

function initializeExperienceTimeline() {
    console.log('Initializing professional experience timeline...');

    // Handle expand/collapse functionality for responsibilities
    initializeExpandButtons();

    // Add enhanced hover effects to timeline nodes
    initializeTimelineNodeEffects();

    // Initialize scroll-triggered animations
    initializeScrollAnimations();

    // Add card hover effects
    initializeCardEffects();

    console.log('Professional experience timeline initialized successfully.');
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
 * Initialize enhanced timeline node effects
 */
function initializeTimelineNodeEffects() {
    document.querySelectorAll('.timeline-node').forEach(node => {
        // Hover effect with scale and glow
        node.addEventListener('mouseenter', () => {
            node.style.transform = 'scale(1.1)';
            node.style.transition = 'all 0.3s ease';
        });

        node.addEventListener('mouseleave', () => {
            node.style.transform = 'scale(1)';
        });

        // Click effect for mobile
        node.addEventListener('click', () => {
            node.style.transform = 'scale(0.95)';
            setTimeout(() => {
                node.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    node.style.transform = 'scale(1)';
                }, 150);
            }, 100);
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

    // Create observer for the header
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const header = entry.target;

                // Animate header elements
                const icon = header.querySelector('.experience-header__icon');
                const title = header.querySelector('.experience-header__title');
                const subtitle = header.querySelector('.experience-header__subtitle');

                if (icon) {
                    icon.style.opacity = '1';
                    icon.style.transform = 'translateY(0) scale(1)';
                }

                setTimeout(() => {
                    if (title) {
                        title.style.opacity = '1';
                        title.style.transform = 'translateY(0)';
                    }
                }, 200);

                setTimeout(() => {
                    if (subtitle) {
                        subtitle.style.opacity = '1';
                        subtitle.style.transform = 'translateY(0)';
                    }
                }, 400);

                headerObserver.unobserve(header);
            }
        });
    }, {
        threshold: 0.3
    });

    // Observe the header
    const header = document.querySelector('.experience-header');
    if (header) {
        // Set initial state
        const icon = header.querySelector('.experience-header__icon');
        const title = header.querySelector('.experience-header__title');
        const subtitle = header.querySelector('.experience-header__subtitle');

        if (icon) {
            icon.style.opacity = '0';
            icon.style.transform = 'translateY(30px) scale(0.8)';
            icon.style.transition = 'all 0.6s ease';
        }

        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(20px)';
            title.style.transition = 'all 0.5s ease';
        }

        if (subtitle) {
            subtitle.style.opacity = '0';
            subtitle.style.transform = 'translateY(15px)';
            subtitle.style.transition = 'all 0.4s ease';
        }

        headerObserver.observe(header);
    }
}

/**
 * Initialize card hover effects
 */
function initializeCardEffects() {
    document.querySelectorAll('.experience-card').forEach(card => {
        // Enhanced hover effect
        card.addEventListener('mouseenter', () => {
            // Remove card movement
            // card.style.transform = 'translateY(-8px)';
            // card.style.transition = 'all 0.3s ease';

            // Add subtle glow to the timeline node
            const timelineNode = card.parentElement.querySelector('.timeline-node');
            if (timelineNode) {
                timelineNode.style.boxShadow = timelineNode.style.boxShadow.replace('0.3)', '0.5)');
            }
        });

        card.addEventListener('mouseleave', () => {
            // Remove card movement reset
            // card.style.transform = 'translateY(0)';

            // Reset timeline node glow
            const timelineNode = card.parentElement.querySelector('.timeline-node');
            if (timelineNode) {
                timelineNode.style.boxShadow = timelineNode.style.boxShadow.replace('0.5)', '0.3)');
            }
        });

        // Add click effect for mobile
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on expand button
            if (e.target.closest('.expand-button')) return;

            // Remove click movement
            // card.style.transform = 'translateY(-2px)';
            // setTimeout(() => {
            //     card.style.transform = 'translateY(0)';
            // }, 150);
        });
    });
}

/**
 * Utility function to reset animations (useful for dynamic content)
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeExperienceTimeline);

// Make functions globally available for dynamic loading
window.initializeExperienceTimeline = initializeExperienceTimeline;
window.resetExperienceAnimations = resetExperienceAnimations;

// Listen for component loaded events to reinitialize
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.componentId && event.detail.componentId.includes('experience')) {
        setTimeout(initializeExperienceTimeline, 100);
    }
});