/**
 * Professional Skills Component Behavior
 * Handles search, filtering, and modal functionality for skills grid
 */

let skillsData = [];
let filteredSkills = [];
let currentFilters = {
    search: '',
    category: ''
};

function initializeSkillsComponent() {
    console.log('Initializing professional skills component...');

    // Extract skills data from DOM and window
    extractSkillsData();

    // Initialize search functionality
    initializeSkillsSearch();

    // Initialize filtering
    initializeSkillsFiltering();

    // Initialize modal functionality
    initializeSkillModal();

    // Initialize animations
    initializeSkillsAnimations();

    // Set initial filtered skills
    filteredSkills = [...skillsData];
    updateSkillsDisplay();
    updateStatistics();

    console.log('Professional skills component initialized successfully.');
}

/**
 * Extract skills data from DOM elements
 */
function extractSkillsData() {
    const skillItems = document.querySelectorAll('.skill-item');
    skillsData = Array.from(skillItems).map(item => ({
        element: item,
        name: item.dataset.skillName,
        category: item.dataset.category,
        type: item.dataset.type,
        proficiency: item.dataset.proficiency,
        experience: parseInt(item.dataset.experience) || 0,
        index: parseInt(item.dataset.index)
    }));
}

/**
 * Initialize search functionality
 */
function initializeSkillsSearch() {
    const searchInput = document.getElementById('skillsSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (!searchInput) return;

    // Search input event with debouncing
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = e.target.value.toLowerCase().trim();

            // Show/hide clear button
            if (clearSearchBtn) {
                clearSearchBtn.style.display = currentFilters.search ? 'block' : 'none';
            }

            applyFilters();
        }, 300);
    });

    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentFilters.search = '';
            clearSearchBtn.style.display = 'none';
            searchInput.focus();
            applyFilters();
        });
    }

    // Search input focus effects
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.style.borderColor = 'var(--vegas-gold)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.style.borderColor = '';
    });
}

/**
 * Initialize filtering functionality
 */
function initializeSkillsFiltering() {
    const categoryFilter = document.getElementById('categoryFilter');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    // Category filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            applyFilters();
        });
    }

    // Clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            resetAllFilters();
        });
    }
}

/**
 * Initialize animations and scroll effects
 */
function initializeSkillsAnimations() {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe skill items
    document.querySelectorAll('.skill-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });
}

/**
 * Apply all filters
 */
function applyFilters() {
    // Start with all skills
    filteredSkills = [...skillsData];

    // Apply search filter
    if (currentFilters.search) {
        filteredSkills = filteredSkills.filter(skill =>
            skill.name.includes(currentFilters.search) ||
            skill.category.toLowerCase().includes(currentFilters.search) ||
            skill.type.toLowerCase().includes(currentFilters.search)
        );
    }

    // Apply category filter
    if (currentFilters.category) {
        filteredSkills = filteredSkills.filter(skill =>
            skill.category === currentFilters.category
        );
    }

    // Update display and statistics
    updateSkillsDisplay();
    updateStatistics();
}

/**
 * Update skills display with animations
 */
function updateSkillsDisplay() {
    const skillsList = document.getElementById('skillsList');
    const noResultsDiv = document.getElementById('skillsNoResults');

    if (!skillsList) return;

    // Hide all skill items first
    skillsData.forEach(skill => {
        skill.element.style.display = 'none';
        skill.element.style.opacity = '0';
        skill.element.style.transform = 'translateY(20px)';
    });

    if (filteredSkills.length > 0) {
        // Hide no results message
        if (noResultsDiv) {
            noResultsDiv.style.display = 'none';
        }

        // Show filtered items with staggered animation
        filteredSkills.forEach((skill, index) => {
            skill.element.style.display = 'flex';

            setTimeout(() => {
                skill.element.style.opacity = '1';
                skill.element.style.transform = 'translateY(0)';
            }, index * 100);
        });

    } else {
        // Show no results message
        if (noResultsDiv) {
            noResultsDiv.style.display = 'block';
        }
    }
}

/**
 * Update statistics display
 */
function updateStatistics() {
    const totalSkillsCount = document.getElementById('totalSkillsCount');

    if (totalSkillsCount) {
        // Animate count change
        const currentCount = parseInt(totalSkillsCount.textContent) || 0;
        const targetCount = filteredSkills.length;

        if (currentCount !== targetCount) {
            animateNumber(totalSkillsCount, currentCount, targetCount, 500);
        }
    }
}

/**
 * Animate number changes
 */
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = Math.round(start + (end - start) * progress);
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Reset all filters
 */
function resetAllFilters() {
    // Reset filter values
    currentFilters = {
        search: '',
        category: ''
    };

    // Reset form elements
    const searchInput = document.getElementById('skillsSearchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
        searchInput.value = '';
    }
    if (categoryFilter) {
        categoryFilter.value = '';
    }
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }

    // Apply filters (which will show all skills)
    applyFilters();

    // Focus search input
    if (searchInput) {
        searchInput.focus();
    }
}

/**
 * Initialize modal functionality
 */
function initializeSkillModal() {
    const modalOverlay = document.getElementById('skillModalOverlay');

    if (!modalOverlay) return;

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
            closeSkillModal();
        }
    });
}

/**
 * Open skill modal with details
 */
function openSkillModal(skillIndex) {
    const modalOverlay = document.getElementById('skillModalOverlay');
    const skillsModalData = window.skillsModalData;

    if (!modalOverlay || !skillsModalData || !skillsModalData[skillIndex]) return;

    const skill = skillsModalData[skillIndex];

    // Update modal content
    const modalSkillName = document.getElementById('modalSkillName');
    const modalSkillCategory = document.getElementById('modalSkillCategory');
    const modalSkillType = document.getElementById('modalSkillType');
    const modalSkillLevel = document.getElementById('modalSkillLevel');
    const modalSkillDescription = document.getElementById('modalSkillDescription');

    if (modalSkillName) modalSkillName.textContent = skill.skillName;
    if (modalSkillCategory) modalSkillCategory.textContent = skill.category;
    if (modalSkillType) modalSkillType.textContent = skill.type;
    if (modalSkillLevel) modalSkillLevel.textContent = skill.proficiency;
    if (modalSkillDescription) modalSkillDescription.textContent = skill.description;

    // Update modal icon
    const modalIcon = document.getElementById('modalSkillIcon');
    if (modalIcon && skill.icon) {
        const iconElement = modalIcon.querySelector('ion-icon');
        if (iconElement) {
            iconElement.setAttribute('name', skill.icon);
            modalIcon.style.color = skill.color || 'var(--vegas-gold)';
        }
    }

    // Handle projects section
    const projectsSection = document.getElementById('modalProjectsSection');
    const projectsContainer = document.getElementById('modalProjects');

    if (skill.projects && skill.projects.length > 0) {
        if (projectsSection) projectsSection.style.display = 'block';
        if (projectsContainer) {
            projectsContainer.innerHTML = skill.projects
                .map(project => `<span>${project}</span>`)
                .join('');
        }
    } else {
        if (projectsSection) projectsSection.style.display = 'none';
    }

    // Handle certifications section
    const certificationsSection = document.getElementById('modalCertificationsSection');
    const certificationsContainer = document.getElementById('modalCertifications');

    if (skill.certifications && skill.certifications.length > 0) {
        if (certificationsSection) certificationsSection.style.display = 'block';
        if (certificationsContainer) {
            certificationsContainer.innerHTML = skill.certifications
                .map(cert => `<span>${cert}</span>`)
                .join('');
        }
    } else {
        if (certificationsSection) certificationsSection.style.display = 'none';
    }

    // Show modal with animation
    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Add modal animation
    const modal = document.getElementById('skillModal');
    if (modal) {
        modal.style.transform = 'scale(0.9) translateY(20px)';
        setTimeout(() => {
            modal.style.transform = 'scale(1) translateY(0)';
        }, 50);
    }
}

/**
 * Close skill modal
 */
function closeSkillModal() {
    const modalOverlay = document.getElementById('skillModalOverlay');

    if (!modalOverlay) return;

    modalOverlay.classList.remove('show');
    document.body.style.overflow = '';

    // Reset modal animation
    const modal = document.getElementById('skillModal');
    if (modal) {
        modal.style.transform = 'scale(0.9) translateY(20px)';
    }
}

// Utility functions for external access

/**
 * Search skills programmatically
 */
function searchSkills(query) {
    const searchInput = document.getElementById('skillsSearchInput');
    if (searchInput) {
        searchInput.value = query;
        currentFilters.search = query.toLowerCase().trim();
        applyFilters();
    }
}

/**
 * Filter by category programmatically
 */
function filterByCategory(category) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
        currentFilters.category = category;
        applyFilters();
    }
}

/**
 * Get current filters
 */
function getCurrentFilters() {
    return {...currentFilters };
}

/**
 * Get filtered skills
 */
function getFilteredSkills() {
    return [...filteredSkills];
}

/**
 * Get skills statistics
 */
function getSkillsStatistics() {
    return {
        total: skillsData.length,
        filtered: filteredSkills.length,
        categories: [...new Set(skillsData.map(s => s.category))].length,
        avgExperience: skillsData.length > 0 ?
            (skillsData.reduce((sum, s) => sum + s.experience, 0) / skillsData.length).toFixed(1) : 0
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSkillsComponent);
} else {
    initializeSkillsComponent();
}