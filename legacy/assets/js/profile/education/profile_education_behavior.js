/**
 * Professional Education Timeline Behavior
 * Handles expand/collapse functionality, animations, and interactions for education component
 */

function initializeEducationTimeline() {
    console.log('Initializing professional education timeline...');

    // Handle expand/collapse functionality for achievements
    initializeEducationExpandButtons();

    // Add enhanced hover effects to timeline nodes
    initializeEducationTimelineNodeEffects();

    // Initialize scroll-triggered animations
    initializeEducationScrollAnimations();

    // Add card hover effects
    initializeEducationCardEffects();

    // Add special effects for different education types
    initializeEducationTypeEffects();

    console.log('Professional education timeline initialized successfully.');
}

/**
 * Initialize expand/collapse buttons for achievements
 */
function initializeEducationExpandButtons() {
    document.querySelectorAll('.education-component .expand-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const isExpanded = button.getAttribute('data-expanded') === 'true';
            const card = button.closest('.education-card');
            const hiddenItems = card.querySelectorAll('.education-achievement-item.hidden');
            const allItems = card.querySelectorAll('.education-achievement-item');

            if (!isExpanded) {
                // Expanding - show hidden items
                hiddenItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.remove('hidden');
                    }, index * 50);
                });

                // Update button state
                button.setAttribute('data-expanded', 'true');
                const btnText = button.querySelector('.btn-text');
                if (btnText) btnText.textContent = 'Show Less';

            } else {
                // Collapsing - hide items beyond the first 3
                allItems.forEach((item, index) => {
                    if (index >= 3) {
                        setTimeout(() => {
                            item.classList.add('hidden');
                        }, index * 20);
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
 * Initialize enhanced timeline node effects with education-specific animations
 */
function initializeEducationTimelineNodeEffects() {
    document.querySelectorAll('.education-component .timeline-node').forEach(node => {
        const timelineItem = node.closest('.timeline-item');
        const educationType = timelineItem.getAttribute('data-type');

        // Enhanced hover effect with type-specific animations
        node.addEventListener('mouseenter', () => {
            node.style.transform = 'scale(1.15)';
            node.style.transition = 'all 0.3s ease';

            // Add special glow effect for certifications
            if (educationType === 'certification') {
                node.style.filter = 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))';
            } else {
                node.style.filter = 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))';
            }
        });

        node.addEventListener('mouseleave', () => {
            node.style.transform = 'scale(1)';
            node.style.filter = 'none';
        });

        // Click effect with education-specific feedback
        node.addEventListener('click', () => {
            node.style.transform = 'scale(0.9)';

            // Add pulse effect
            setTimeout(() => {
                node.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    node.style.transform = 'scale(1)';
                }, 150);
            }, 100);

            // Add subtle badge animation
            const badge = timelineItem.querySelector('.education-card__type-badge');
            if (badge) {
                badge.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    badge.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
}

/**
 * Initialize scroll-triggered animations for education content
 */
function initializeEducationScrollAnimations() {
    // Create intersection observer for timeline items
    const educationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const timelineItem = entry.target;
                const educationType = timelineItem.getAttribute('data-type');

                // Animate the timeline item with type-specific effects
                timelineItem.style.opacity = '1';
                timelineItem.style.transform = 'translateY(0)';

                // Add special entrance effect for certifications
                if (educationType === 'certification') {
                    timelineItem.style.filter = 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.2))';
                    setTimeout(() => {
                        timelineItem.style.filter = 'none';
                    }, 1000);
                }

                // Animate achievement items with stagger
                const achievementItems = timelineItem.querySelectorAll('.education-achievement-item:not(.hidden)');
                achievementItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, index * 100);
                });

                // Animate the type badge
                const badge = timelineItem.querySelector('.education-card__type-badge');
                if (badge) {
                    setTimeout(() => {
                        badge.style.transform = 'translateY(0) scale(1)';
                        badge.style.opacity = '1';
                    }, 300);
                }

                // Stop observing this item
                educationObserver.unobserve(timelineItem);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all timeline items and set initial states
    document.querySelectorAll('.education-component .timeline-item').forEach(item => {
        // Set initial state for badges
        const badge = item.querySelector('.education-card__type-badge');
        if (badge) {
            badge.style.transform = 'translateY(-10px) scale(0.9)';
            badge.style.opacity = '0';
            badge.style.transition = 'all 0.4s ease';
        }

        educationObserver.observe(item);
    });
}

/**
 * Initialize card hover effects with education-specific enhancements
 */
function initializeEducationCardEffects() {
    document.querySelectorAll('.education-component .education-card').forEach(card => {
        const timelineItem = card.closest('.timeline-item');
        const educationType = timelineItem.getAttribute('data-type');

        // Enhanced hover effect with type-specific styling
        card.addEventListener('mouseenter', () => {
            // card.style.transform = 'translateX(12px)';
            // card.style.transition = 'all 0.3s ease';

            // Add type-specific glow to the timeline node
            const timelineNode = timelineItem.querySelector('.timeline-node');
            if (timelineNode) {
                if (educationType === 'certification') {
                    timelineNode.style.boxShadow = timelineNode.style.boxShadow.replace('0.3)', '0.6)');
                    timelineNode.style.filter = 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))';
                } else {
                    timelineNode.style.boxShadow = timelineNode.style.boxShadow.replace('0.3)', '0.6)');
                    timelineNode.style.filter = 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))';
                }
            }

            // Enhance badge on hover
            const badge = card.querySelector('.education-card__type-badge');
            if (badge) {
                badge.style.transform = 'scale(1.05)';
                badge.style.transition = 'all 0.2s ease';
            }
        });

        card.addEventListener('mouseleave', () => {
            // card.style.transform = 'translateX(0)';

            // Reset timeline node effects
            const timelineNode = timelineItem.querySelector('.timeline-node');
            if (timelineNode) {
                timelineNode.style.boxShadow = timelineNode.style.boxShadow.replace('0.6)', '0.3)');
                timelineNode.style.filter = 'none';
            }

            // Reset badge
            const badge = card.querySelector('.education-card__type-badge');
            if (badge) {
                badge.style.transform = 'scale(1)';
            }
        });

        // Add click effect for mobile with type-specific feedback
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on expand button
            if (e.target.closest('.expand-button')) return;

            card.style.transform = 'translateX(6px) scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'translateX(0) scale(1)';
            }, 150);

            // Add subtle animation to the badge
            const badge = card.querySelector('.education-card__type-badge');
            if (badge) {
                badge.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    badge.style.transform = 'scale(1)';
                }, 100);
            }
        });
    });
}

/**
 * Initialize special effects for different education types
 */
function initializeEducationTypeEffects() {
    // Add subtle animations to type badges
    document.querySelectorAll('.education-component .education-card__type-badge').forEach(badge => {
        const timelineItem = badge.closest('.timeline-item');
        const educationType = timelineItem.getAttribute('data-type');

        // Add periodic subtle pulse for certifications
        if (educationType === 'certification') {
            setInterval(() => {
                if (!badge.matches(':hover')) {
                    badge.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        badge.style.transform = 'scale(1)';
                    }, 200);
                }
            }, 8000);
        }
    });

    // Add special interaction for GPA display
    document.querySelectorAll('.education-component .education-card__gpa').forEach(gpaElement => {
        gpaElement.addEventListener('mouseenter', () => {
            gpaElement.style.transform = 'scale(1.1)';
            gpaElement.style.transition = 'all 0.2s ease';
        });

        gpaElement.addEventListener('mouseleave', () => {
            gpaElement.style.transform = 'scale(1)';
        });
    });
}

/**
 * Utility function to reset education animations (useful for dynamic content)
 */
function resetEducationAnimations() {
    document.querySelectorAll('.education-component .timeline-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';

        // Reset badges
        const badge = item.querySelector('.education-card__type-badge');
        if (badge) {
            badge.style.transform = 'translateY(-10px) scale(0.9)';
            badge.style.opacity = '0';
        }
    });

    document.querySelectorAll('.education-component .education-achievement-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-10px)';
    });
}

/**
 * Utility function to highlight education by type
 */
function highlightEducationType(type) {
    document.querySelectorAll('.education-component .timeline-item').forEach(item => {
        const itemType = item.getAttribute('data-type');
        if (itemType === type) {
            item.style.transform = 'translateX(16px) scale(1.02)';
            item.style.transition = 'all 0.3s ease';

            setTimeout(() => {
                item.style.transform = 'translateX(0) scale(1)';
            }, 2000);
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeEducationTimeline);

// Make functions globally available for dynamic loading
window.initializeEducationTimeline = initializeEducationTimeline;
window.resetEducationAnimations = resetEducationAnimations;
window.highlightEducationType = highlightEducationType;

// Listen for component loaded events to reinitialize
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.componentId && event.detail.componentId.includes('education')) {
        setTimeout(initializeEducationTimeline, 100);
    }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeEducationTimeline,
        resetEducationAnimations,
        highlightEducationType
    };
}