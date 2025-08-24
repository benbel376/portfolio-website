/**
 * Professional Certifications Component Behavior
 * Handles pagination, expand/collapse functionality, animations, and interactions for certifications component
 */

let currentCertificationIndex = 0;
let totalCertifications = 0;
let certificationsPagination = null;
const certificationsPerPage = 2; // Show 2 certifications at a time

function initializeCertificationsComponent() {
    console.log('Initializing professional certifications component...');

    // Initialize pagination
    initializeCertificationsPagination();

    // Handle expand/collapse functionality for skills
    initializeCertificationsExpandButtons();

    // Add enhanced hover effects to certification cards
    initializeCertificationCardEffects();

    // Initialize scroll-triggered animations
    initializeCertificationsScrollAnimations();

    // Add verification link interactions
    initializeVerificationLinks();

    // Add special effects for certification badges
    initializeCertificationBadgeEffects();

    console.log('Professional certifications component initialized successfully.');
}

/**
 * Initialize pagination functionality
 */
function initializeCertificationsPagination() {
    const grid = document.getElementById('certificationsGrid');
    const prevButton = document.getElementById('prevCertification');
    const nextButton = document.getElementById('nextCertification');
    const currentSpan = document.getElementById('currentCertification');
    const dots = document.querySelectorAll('.pagination-dot');

    if (!grid) return;

    const cards = grid.querySelectorAll('.certification-card');
    totalCertifications = cards.length;

    if (totalCertifications <= certificationsPerPage) {
        // Hide pagination if only one page or less
        const pagination = document.querySelector('.certifications-pagination');
        if (pagination) pagination.style.display = 'none';
        return;
    }

    // Set initial position
    updateCertificationDisplay();

    // Previous button
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentCertificationIndex > 0) {
                currentCertificationIndex -= certificationsPerPage;
                if (currentCertificationIndex < 0) currentCertificationIndex = 0;
                updateCertificationDisplay();
            }
        });
    }

    // Next button
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentCertificationIndex + certificationsPerPage < totalCertifications) {
                currentCertificationIndex += certificationsPerPage;
                updateCertificationDisplay();
            }
        });
    }

    // Dot indicators - each dot represents a page (2 certifications)
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentCertificationIndex = index * certificationsPerPage;
            updateCertificationDisplay();
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentCertificationIndex > 0) {
            currentCertificationIndex -= certificationsPerPage;
            if (currentCertificationIndex < 0) currentCertificationIndex = 0;
            updateCertificationDisplay();
        } else if (e.key === 'ArrowRight' && currentCertificationIndex + certificationsPerPage < totalCertifications) {
            currentCertificationIndex += certificationsPerPage;
            updateCertificationDisplay();
        }
    });

    // Auto-advance (optional - uncomment to enable)
    // startAutoAdvance();
}

/**
 * Update certification display based on current index
 */
function updateCertificationDisplay() {
    const grid = document.getElementById('certificationsGrid');
    const prevButton = document.getElementById('prevCertification');
    const nextButton = document.getElementById('nextCertification');
    const currentSpan = document.getElementById('currentCertification');
    const dots = document.querySelectorAll('.pagination-dot');

    if (!grid) return;

    // Calculate transform based on showing 2 cards at a time
    // Each "page" shows 2 cards, so we need to move by 100% + gap for each page
    const pageIndex = Math.floor(currentCertificationIndex / certificationsPerPage);
    const translateX = -pageIndex * 100;
    grid.style.transform = `translateX(${translateX}%)`;

    // Update pagination info - show current page range
    if (currentSpan) {
        const startIndex = currentCertificationIndex + 1;
        const endIndex = Math.min(currentCertificationIndex + certificationsPerPage, totalCertifications);
        currentSpan.textContent = `${startIndex}-${endIndex}`;
    }

    // Update button states
    if (prevButton) {
        prevButton.disabled = currentCertificationIndex === 0;
    }
    if (nextButton) {
        nextButton.disabled = currentCertificationIndex + certificationsPerPage >= totalCertifications;
    }

    // Update dot indicators - each dot represents a page
    const currentPage = Math.floor(currentCertificationIndex / certificationsPerPage);
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
    });

    // Trigger card entrance animation for visible cards
    const visibleCards = [];
    for (let i = currentCertificationIndex; i < currentCertificationIndex + certificationsPerPage && i < totalCertifications; i++) {
        if (grid.children[i]) {
            visibleCards.push(grid.children[i]);
        }
    }

    visibleCards.forEach((card, index) => {
        setTimeout(() => {
            triggerCardAnimation(card);
        }, index * 200);
    });
}

/**
 * Trigger entrance animation for current card
 */
function triggerCardAnimation(card) {
    // Reset and animate skill tags
    const skillTags = card.querySelectorAll('.skill-tag:not(.hidden)');
    skillTags.forEach((tag, index) => {
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(10px)';

        setTimeout(() => {
            tag.style.transition = 'all 0.3s ease';
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Animate badge
    const badge = card.querySelector('.certification-card__badge');
    if (badge) {
        badge.style.transform = 'scale(0.8) rotate(-10deg)';
        setTimeout(() => {
            badge.style.transition = 'all 0.5s ease';
            badge.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    }

    // Animate status
    const status = card.querySelector('.certification-card__status');
    if (status) {
        status.style.transform = 'translateY(-10px) scale(0.9)';
        status.style.opacity = '0';
        setTimeout(() => {
            status.style.transition = 'all 0.4s ease';
            status.style.transform = 'translateY(0) scale(1)';
            status.style.opacity = '1';
        }, 300);
    }
}

/**
 * Start auto-advance functionality (optional)
 */
function startAutoAdvance() {
    certificationsPagination = setInterval(() => {
        if (currentCertificationIndex + certificationsPerPage < totalCertifications) {
            currentCertificationIndex += certificationsPerPage;
        } else {
            currentCertificationIndex = 0;
        }
        updateCertificationDisplay();
    }, 8000); // Change every 8 seconds
}

/**
 * Stop auto-advance functionality
 */
function stopAutoAdvance() {
    if (certificationsPagination) {
        clearInterval(certificationsPagination);
        certificationsPagination = null;
    }
}

/**
 * Initialize expand/collapse buttons for skills
 */
function initializeCertificationsExpandButtons() {
    document.querySelectorAll('.certifications-component .expand-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const isExpanded = button.getAttribute('data-expanded') === 'true';
            const card = button.closest('.certification-card');
            const hiddenTags = card.querySelectorAll('.skill-tag.hidden');
            const allTags = card.querySelectorAll('.skill-tag');

            if (!isExpanded) {
                // Expanding - show hidden tags with staggered animation
                hiddenTags.forEach((tag, index) => {
                    setTimeout(() => {
                        tag.classList.remove('hidden');
                        tag.style.opacity = '0';
                        tag.style.transform = 'translateY(10px)';

                        // Force reflow
                        void tag.offsetHeight;

                        tag.style.transition = 'all 0.3s ease';
                        tag.style.opacity = '1';
                        tag.style.transform = 'translateY(0)';
                    }, index * 100);
                });

                // Update button state
                button.setAttribute('data-expanded', 'true');
                const btnText = button.querySelector('.btn-text');
                if (btnText) btnText.textContent = 'Show Less';

            } else {
                // Collapsing - hide tags beyond the first 4
                allTags.forEach((tag, index) => {
                    if (index >= 4) {
                        tag.style.transition = 'all 0.2s ease';
                        tag.style.opacity = '0';
                        tag.style.transform = 'translateY(10px)';

                        setTimeout(() => {
                            tag.classList.add('hidden');
                            tag.style.transition = '';
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
 * Initialize certification card hover and interaction effects
 */
function initializeCertificationCardEffects() {
    document.querySelectorAll('.certifications-component .certification-card').forEach(card => {
        // Enhanced hover effect with badge animation
        card.addEventListener('mouseenter', () => {
            // Pause auto-advance on hover
            stopAutoAdvance();

            card.style.transform = 'translateY(-8px)';
            card.style.transition = 'all 0.3s ease';

            // Animate the badge
            const badge = card.querySelector('.certification-card__badge');
            if (badge) {
                badge.style.transform = 'scale(1.1) rotate(5deg)';
                badge.style.transition = 'all 0.3s ease';
            }

            // Enhance status badge
            const status = card.querySelector('.certification-card__status');
            if (status) {
                status.style.transform = 'scale(1.05)';
                status.style.transition = 'all 0.2s ease';
            }

            // Animate skill tags
            const skillTags = card.querySelectorAll('.skill-tag:not(.hidden)');
            skillTags.forEach((tag, index) => {
                setTimeout(() => {
                    tag.style.transform = 'translateY(-2px)';
                }, index * 50);
            });
        });

        card.addEventListener('mouseleave', () => {
            // Resume auto-advance after hover
            // startAutoAdvance();

            card.style.transform = 'translateY(0)';

            // Reset badge
            const badge = card.querySelector('.certification-card__badge');
            if (badge) {
                badge.style.transform = 'scale(1) rotate(0deg)';
            }

            // Reset status
            const status = card.querySelector('.certification-card__status');
            if (status) {
                status.style.transform = 'scale(1)';
            }

            // Reset skill tags
            const skillTags = card.querySelectorAll('.skill-tag');
            skillTags.forEach(tag => {
                tag.style.transform = 'translateY(0)';
            });
        });

        // Add click effect for mobile
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on expand button or verification link
            if (e.target.closest('.expand-button') || e.target.closest('.verification-link')) return;

            card.style.transform = 'translateY(-4px) scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'translateY(0) scale(1)';
            }, 150);

            // Add subtle animation to the badge
            const badge = card.querySelector('.certification-card__badge');
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
 * Initialize scroll-triggered animations for certifications
 */
function initializeCertificationsScrollAnimations() {
    // Create intersection observer for certification cards
    const certificationsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const certificationCard = entry.target;

                // Animate the certification card
                certificationCard.style.opacity = '1';
                certificationCard.style.transform = 'translateY(0)';

                // Add special entrance effect
                certificationCard.style.filter = 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.2))';
                setTimeout(() => {
                    certificationCard.style.filter = 'none';
                }, 1000);

                // Animate skill tags with stagger
                const skillTags = certificationCard.querySelectorAll('.skill-tag:not(.hidden)');
                skillTags.forEach((tag, index) => {
                    setTimeout(() => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'translateY(0)';
                    }, index * 100);
                });

                // Animate the status badge
                const status = certificationCard.querySelector('.certification-card__status');
                if (status) {
                    setTimeout(() => {
                        status.style.transform = 'translateY(0) scale(1)';
                        status.style.opacity = '1';
                    }, 300);
                }

                // Animate the badge
                const badge = certificationCard.querySelector('.certification-card__badge');
                if (badge) {
                    setTimeout(() => {
                        badge.style.transform = 'scale(1) rotate(0deg)';
                        badge.style.opacity = '1';
                    }, 200);
                }

                // Stop observing this item
                certificationsObserver.unobserve(certificationCard);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all certification cards and set initial states
    document.querySelectorAll('.certifications-component .certification-card').forEach(card => {
        // Set initial state for status badges
        const status = card.querySelector('.certification-card__status');
        if (status) {
            status.style.transform = 'translateY(-10px) scale(0.9)';
            status.style.opacity = '0';
            status.style.transition = 'all 0.4s ease';
        }

        // Set initial state for badges
        const badge = card.querySelector('.certification-card__badge');
        if (badge) {
            badge.style.transform = 'scale(0.8) rotate(-10deg)';
            badge.style.opacity = '0';
            badge.style.transition = 'all 0.5s ease';
        }

        certificationsObserver.observe(card);
    });
}

/**
 * Initialize verification link interactions
 */
function initializeVerificationLinks() {
    document.querySelectorAll('.certifications-component .verification-link').forEach(link => {
        // Enhanced hover effect
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-2px)';
            link.style.transition = 'all 0.2s ease';

            // Animate icons
            const icons = link.querySelectorAll('ion-icon');
            icons.forEach((icon, index) => {
                setTimeout(() => {
                    icon.style.transform = 'scale(1.1)';
                    icon.style.transition = 'all 0.2s ease';
                }, index * 50);
            });
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0)';

            // Reset icons
            const icons = link.querySelectorAll('ion-icon');
            icons.forEach(icon => {
                icon.style.transform = 'scale(1)';
            });
        });

        // Click effect
        link.addEventListener('click', (e) => {
            link.style.transform = 'translateY(0) scale(0.95)';
            setTimeout(() => {
                link.style.transform = 'translateY(-2px) scale(1)';
            }, 100);
        });
    });
}

/**
 * Initialize special effects for certification badges and elements
 */
function initializeCertificationBadgeEffects() {
    // Add subtle animations to status badges
    document.querySelectorAll('.certifications-component .certification-card__status').forEach(status => {
        // Add periodic subtle pulse
        setInterval(() => {
            if (!status.matches(':hover')) {
                status.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    status.style.transform = 'scale(1)';
                }, 200);
            }
        }, 10000);

        // Add click effect
        status.addEventListener('click', (e) => {
            e.stopPropagation();
            status.style.transform = 'scale(0.95)';
            setTimeout(() => {
                status.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    status.style.transform = 'scale(1)';
                }, 150);
            }, 100);
        });
    });

    // Add hover effects to skill tags
    document.querySelectorAll('.certifications-component .skill-tag').forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'translateY(-2px) scale(1.05)';
            tag.style.transition = 'all 0.2s ease';
        });

        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'translateY(0) scale(1)';
        });
    });
}

/**
 * Navigate to specific certification
 */
function goToCertification(index) {
    if (index >= 0 && index < totalCertifications) {
        currentCertificationIndex = index;
        updateCertificationDisplay();
    }
}

/**
 * Get current certification index
 */
function getCurrentCertificationIndex() {
    return currentCertificationIndex;
}

/**
 * Utility function to reset certifications animations (useful for dynamic content)
 */
function resetCertificationsAnimations() {
    currentCertificationIndex = 0;
    stopAutoAdvance();

    document.querySelectorAll('.certifications-component .certification-card').forEach(card => {
        // Reset status badges
        const status = card.querySelector('.certification-card__status');
        if (status) {
            status.style.transform = 'translateY(-10px) scale(0.9)';
            status.style.opacity = '0';
        }

        // Reset badges
        const badge = card.querySelector('.certification-card__badge');
        if (badge) {
            badge.style.transform = 'scale(0.8) rotate(-10deg)';
            badge.style.opacity = '0';
        }
    });

    document.querySelectorAll('.certifications-component .skill-tag').forEach(tag => {
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(10px)';
    });
}

/**
 * Utility function to filter certifications by level
 */
function filterCertificationsByLevel(level) {
    document.querySelectorAll('.certifications-component .certification-card').forEach(card => {
        const status = card.querySelector('.certification-card__status');
        if (status && status.textContent.toLowerCase().includes(level.toLowerCase())) {
            card.style.transform = 'translateY(-16px) scale(1.02)';
            card.style.transition = 'all 0.3s ease';
            card.style.border = '2px solid #8b5cf6';

            setTimeout(() => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.border = '';
            }, 2000);
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeCertificationsComponent);

// Make functions globally available for dynamic loading
window.initializeCertificationsComponent = initializeCertificationsComponent;
window.resetCertificationsAnimations = resetCertificationsAnimations;
window.goToCertification = goToCertification;
window.getCurrentCertificationIndex = getCurrentCertificationIndex;
window.filterCertificationsByLevel = filterCertificationsByLevel;

// Listen for component loaded events to reinitialize
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.componentId && event.detail.componentId.includes('certifications')) {
        setTimeout(initializeCertificationsComponent, 100);
    }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCertificationsComponent,
        resetCertificationsAnimations,
        goToCertification,
        getCurrentCertificationIndex,
        filterCertificationsByLevel
    };
}