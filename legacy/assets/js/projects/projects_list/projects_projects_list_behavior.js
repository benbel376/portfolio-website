// Projects List Component Behavior
class ProjectsListManager {
    constructor() {
        // Find the component in the DOM
        this.componentElement = document.querySelector('.projects-list-component');

        if (!this.componentElement) {
            console.error('Projects list component not found in DOM');
            return;
        }

        // Extract project data from DOM project cards
        this.extractProjectDataFromDOM();

        // Extract filter options from the project data
        this.extractFilterOptionsFromProjects();

        this.filteredProjects = [...this.projectsData];
        this.currentPage = 1;
        this.projectsPerPage = 9; // 3x3 grid
        this.currentSort = { field: 'title', order: 'asc' };
        this.appliedFilters = new Map(); // Store applied filters
        this.observer = null; // Initialize observer property

        this.init();
    }

    extractProjectDataFromDOM() {
        const projectCards = this.componentElement.querySelectorAll('.project-card');
        this.projectsData = [];

        console.log(`Found ${projectCards.length} project cards in DOM`);

        projectCards.forEach((card, index) => {
            const project = {
                id: parseInt(card.dataset.projectId),
                title: card.dataset.title,
                category: card.dataset.category,
                status: card.dataset.status,
                difficulty: card.dataset.difficulty,
                technologies: card.dataset.technologies ? card.dataset.technologies.split(',') : [],
                startDate: card.dataset.startDate,
                duration: card.dataset.duration,
                featured: card.dataset.featured === 'true',
                // Extract additional data from the card content
                description: card.querySelector('.project-description') ? card.querySelector('.project-description').textContent : '',
                // Store the original index for modal functionality
                originalIndex: index
            };
            this.projectsData.push(project);
        });

        console.log(`Extracted data for ${this.projectsData.length} projects from DOM`);
    }

    extractFilterOptionsFromProjects() {
        // Extract unique filter options from the project data
        const categories = new Set();
        const statuses = new Set();
        const difficulties = new Set();
        const technologies = new Set();

        this.projectsData.forEach(project => {
            if (project.category) categories.add(project.category);
            if (project.status) statuses.add(project.status);
            if (project.difficulty) difficulties.add(project.difficulty);
            if (project.technologies) {
                project.technologies.forEach(tech => technologies.add(tech.trim()));
            }
        });

        this.filterData = {
            categories: Array.from(categories).sort(),
            statuses: Array.from(statuses).sort(),
            difficulties: Array.from(difficulties).sort(),
            technologies: Array.from(technologies).sort()
        };

        console.log('Extracted filter options:', this.filterData);
    }

    init() {
        console.log(`Initializing ProjectsListManager with ${this.projectsData.length} projects`);
        this.bindEvents();
        this.updateDisplay();
        this.initializeAnimations();
    }

    bindEvents() {
        console.log('ProjectsListManager: Starting to bind events...');

        // Search functionality
        const searchInput = document.getElementById('projectsSearchInput');
        const clearSearchBtn = document.getElementById('clearProjectsSearchBtn');

        console.log('Search elements found:', { searchInput, clearSearchBtn });

        if (searchInput) {
            console.log('Binding search input events');
            searchInput.addEventListener('input', (e) => {
                console.log('Search input changed:', e.target.value);
                this.handleSearch(e.target.value);
                this.toggleClearButton();
            });
        } else {
            console.error('Search input not found!');
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                console.log('Clear search button clicked');
                searchInput.value = '';
                this.handleSearch('');
                this.toggleClearButton();
            });
        } else {
            console.error('Clear search button not found!');
        }

        // Unified filter functionality
        const filterTypeSelect = document.getElementById('filterTypeSelect');
        const filterValueSelect = document.getElementById('filterValueSelect');
        const addFilterBtn = document.getElementById('addFilterBtn');

        console.log('Filter elements found:', { filterTypeSelect, filterValueSelect, addFilterBtn });

        if (filterTypeSelect) {
            console.log('Binding filter type select events');
            filterTypeSelect.addEventListener('change', (e) => {
                console.log('Filter type changed:', e.target.value);
                this.updateFilterValues(e.target.value);
            });
        } else {
            console.error('Filter type select not found!');
        }

        if (addFilterBtn) {
            addFilterBtn.addEventListener('click', () => {
                console.log('Add filter button clicked');
                this.addFilter();
            });
        } else {
            console.error('Add filter button not found!');
        }

        // Sort functionality
        const sortBy = document.getElementById('sortBy');
        const sortOrderBtn = document.getElementById('sortOrderBtn');

        console.log('Sort elements found:', { sortBy, sortOrderBtn });

        if (sortBy) {
            console.log('Binding sort select events');
            sortBy.addEventListener('change', (e) => {
                console.log('Sort field changed:', e.target.value);
                this.currentSort.field = e.target.value;
                this.applySorting();
            });
        } else {
            console.error('Sort select not found!');
        }

        if (sortOrderBtn) {
            sortOrderBtn.addEventListener('click', () => {
                console.log('Sort order button clicked, current order:', this.currentSort.order);
                this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
                sortOrderBtn.setAttribute('data-order', this.currentSort.order);
                console.log('New sort order:', this.currentSort.order);
                this.applySorting();
            });
        } else {
            console.error('Sort order button not found!');
        }

        // Pagination
        const prevBtn = document.getElementById('prevProjectsPageBtn');
        const nextBtn = document.getElementById('nextProjectsPageBtn');

        console.log('Pagination elements found:', { prevBtn, nextBtn });

        if (prevBtn) {
            console.log('Binding previous page button');
            prevBtn.addEventListener('click', () => {
                console.log('Previous page clicked, current page:', this.currentPage);
                this.previousPage();
            });
        } else {
            console.error('Previous page button not found!');
        }

        if (nextBtn) {
            console.log('Binding next page button');
            nextBtn.addEventListener('click', () => {
                console.log('Next page clicked, current page:', this.currentPage);
                this.nextPage();
            });
        } else {
            console.error('Next page button not found!');
        }

        // Clear all filters
        const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
        if (clearAllFiltersBtn) {
            clearAllFiltersBtn.addEventListener('click', () => {
                console.log('Clear all filters clicked');
                this.clearAllFilters();
            });
        } else {
            console.error('Clear all filters button not found!');
        }

        // Clear filters from no results
        const clearFiltersBtn = document.getElementById('clearProjectsFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                console.log('Clear filters from no results clicked');
                this.clearAllFilters();
            });
        } else {
            console.error('Clear filters button not found!');
        }

        // Modal events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeProjectModal();
            }
        });

        console.log('ProjectsListManager: Event binding completed');
    }

    handleSearch(searchTerm) {
        if (searchTerm.trim()) {
            this.appliedFilters.set('search', {
                type: 'search',
                value: searchTerm.trim(),
                label: `Search: "${searchTerm.trim()}"`
            });
        } else {
            this.appliedFilters.delete('search');
        }
        this.updateAppliedFiltersDisplay();
        this.applyFilters();
    }

    updateFilterValues(filterType) {
        const filterValueSelect = document.getElementById('filterValueSelect');
        const addFilterBtn = document.getElementById('addFilterBtn');

        if (!filterValueSelect || !addFilterBtn) return;

        // Clear previous options
        filterValueSelect.innerHTML = '<option value="">Select value...</option>';

        if (!filterType) {
            filterValueSelect.disabled = true;
            addFilterBtn.disabled = true;
            return;
        }

        // Populate options based on filter type
        let options = [];
        switch (filterType) {
            case 'category':
                options = this.filterData.categories || [];
                break;
            case 'status':
                options = this.filterData.statuses || [];
                break;
            case 'difficulty':
                options = this.filterData.difficulties || [];
                break;
            case 'technology':
                options = this.filterData.technologies || [];
                break;
        }

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            filterValueSelect.appendChild(optionElement);
        });

        filterValueSelect.disabled = false;

        // Enable add button when value is selected
        filterValueSelect.addEventListener('change', () => {
            addFilterBtn.disabled = !filterValueSelect.value;
        });
    }

    addFilter() {
        const filterTypeSelect = document.getElementById('filterTypeSelect');
        const filterValueSelect = document.getElementById('filterValueSelect');

        if (!filterTypeSelect.value || !filterValueSelect.value) return;

        const filterKey = `${filterTypeSelect.value}:${filterValueSelect.value}`;

        // Don't add duplicate filters
        if (this.appliedFilters.has(filterKey)) return;

        this.appliedFilters.set(filterKey, {
            type: filterTypeSelect.value,
            value: filterValueSelect.value,
            label: `${filterTypeSelect.options[filterTypeSelect.selectedIndex].text}: ${filterValueSelect.value}`
        });

        // Reset selects
        filterTypeSelect.value = '';
        filterValueSelect.innerHTML = '<option value="">Select value...</option>';
        filterValueSelect.disabled = true;
        document.getElementById('addFilterBtn').disabled = true;

        this.updateAppliedFiltersDisplay();
        this.applyFilters();
    }

    removeFilter(filterKey) {
        this.appliedFilters.delete(filterKey);

        // If removing search filter, clear search input
        if (filterKey === 'search') {
            const searchInput = document.getElementById('projectsSearchInput');
            if (searchInput) {
                searchInput.value = '';
                this.toggleClearButton();
            }
        }

        this.updateAppliedFiltersDisplay();
        this.applyFilters();
    }

    updateAppliedFiltersDisplay() {
        const appliedFiltersContainer = document.getElementById('appliedFilters');
        const appliedFiltersList = document.getElementById('appliedFiltersList');

        if (!appliedFiltersContainer || !appliedFiltersList) return;

        if (this.appliedFilters.size === 0) {
            appliedFiltersContainer.style.display = 'none';
            return;
        }

        appliedFiltersContainer.style.display = 'flex';
        appliedFiltersList.innerHTML = '';

        this.appliedFilters.forEach((filter, key) => {
            const filterTag = document.createElement('div');
            filterTag.className = 'filter-tag';
            filterTag.innerHTML = `
                <span>${filter.label}</span>
                <ion-icon name="close-outline"></ion-icon>
            `;

            filterTag.addEventListener('click', () => this.removeFilter(key));
            appliedFiltersList.appendChild(filterTag);
        });
    }

    toggleClearButton() {
        const clearBtn = document.getElementById('clearProjectsSearchBtn');
        const searchInput = document.getElementById('projectsSearchInput');

        if (clearBtn && searchInput) {
            clearBtn.style.display = searchInput.value ? 'block' : 'none';
        }
    }

    applyFilters() {
        this.filteredProjects = this.projectsData.filter(project => {
            // Apply all filters
            for (const [key, filter] of this.appliedFilters) {
                if (filter.type === 'search') {
                    const searchTerm = filter.value.toLowerCase();
                    const searchableText = `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase();
                    if (!searchableText.includes(searchTerm)) {
                        return false;
                    }
                } else if (filter.type === 'category' && project.category !== filter.value) {
                    return false;
                } else if (filter.type === 'status' && project.status !== filter.value) {
                    return false;
                } else if (filter.type === 'difficulty' && project.difficulty !== filter.value) {
                    return false;
                } else if (filter.type === 'technology' && !project.technologies.includes(filter.value)) {
                    return false;
                }
            }
            return true;
        });

        this.currentPage = 1;
        this.applySorting();
    }

    applySorting() {
        this.filteredProjects.sort((a, b) => {
            let aValue = a[this.currentSort.field];
            let bValue = b[this.currentSort.field];

            // Handle special cases
            if (this.currentSort.field === 'featured') {
                aValue = a.featured ? 1 : 0;
                bValue = b.featured ? 1 : 0;
            } else if (this.currentSort.field === 'startDate') {
                aValue = new Date(a.startDate);
                bValue = new Date(b.startDate);
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            let comparison = 0;
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;

            return this.currentSort.order === 'desc' ? -comparison : comparison;
        });

        this.updateDisplay();
    }

    updateDisplay() {
        this.renderProjects();
        this.updatePagination();

        if (this.filteredProjects.length === 0) {
            this.showNoResults();
        } else {
            this.hideNoResults();
        }
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;

        const startIndex = (this.currentPage - 1) * this.projectsPerPage;
        const endIndex = startIndex + this.projectsPerPage;
        const projectsToShow = this.filteredProjects.slice(startIndex, endIndex);

        // Hide all projects first
        const allProjectCards = projectsGrid.querySelectorAll('.project-card');
        allProjectCards.forEach(card => {
            card.style.display = 'none';
        });

        // Show projects for current page
        projectsToShow.forEach((project, index) => {
            const projectIndex = this.projectsData.findIndex(p => p.id === project.id);
            const projectCard = projectsGrid.querySelector(`[data-project-id="${project.id}"]`);

            if (projectCard) {
                projectCard.style.display = 'flex';

                // Add staggered animation
                setTimeout(() => {
                    projectCard.style.opacity = '1';
                    projectCard.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredProjects.length / this.projectsPerPage);
        const prevBtn = document.getElementById('prevProjectsPageBtn');
        const nextBtn = document.getElementById('nextProjectsPageBtn');
        const pageInfo = document.getElementById('currentProjectsPageInfo');
        const paginationDots = document.getElementById('paginationDots');

        // Update buttons
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }

        // Update page info
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }

        // Update dots
        if (paginationDots) {
            paginationDots.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const dot = document.createElement('div');
                dot.className = `pagination-dot ${i === this.currentPage ? 'active' : ''}`;
                dot.addEventListener('click', () => this.goToPage(i));
                paginationDots.appendChild(dot);
            }
        }
    }

    showNoResults() {
        const noResults = document.getElementById('projectsNoResults');
        const projectsGrid = document.getElementById('projectsGrid');
        const pagination = document.getElementById('projectsPagination');

        if (noResults) noResults.style.display = 'block';
        if (projectsGrid) projectsGrid.style.display = 'none';
        if (pagination) pagination.style.display = 'none';
    }

    hideNoResults() {
        const noResults = document.getElementById('projectsNoResults');
        const projectsGrid = document.getElementById('projectsGrid');
        const pagination = document.getElementById('projectsPagination');

        if (noResults) noResults.style.display = 'none';
        if (projectsGrid) projectsGrid.style.display = 'grid';
        if (pagination) pagination.style.display = 'flex';
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplay();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredProjects.length / this.projectsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updateDisplay();
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProjects.length / this.projectsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.updateDisplay();
        }
    }

    clearAllFilters() {
        // Clear applied filters
        this.appliedFilters.clear();

        // Clear search input
        const searchInput = document.getElementById('projectsSearchInput');
        if (searchInput) {
            searchInput.value = '';
            this.toggleClearButton();
        }

        // Reset filter selects
        const filterTypeSelect = document.getElementById('filterTypeSelect');
        const filterValueSelect = document.getElementById('filterValueSelect');
        const addFilterBtn = document.getElementById('addFilterBtn');

        if (filterTypeSelect) filterTypeSelect.value = '';
        if (filterValueSelect) {
            filterValueSelect.innerHTML = '<option value="">Select value...</option>';
            filterValueSelect.disabled = true;
        }
        if (addFilterBtn) addFilterBtn.disabled = true;

        this.updateAppliedFiltersDisplay();
        this.applyFilters();
    }

    initializeAnimations() {
        // Set initial state for project cards
        const projectCards = document.querySelectorAll('.projects-list-component .project-card');
        projectCards.forEach(card => {
            // Only set initial styles if not already set
            if (!card.style.opacity) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.3s ease';
            }
        });

        // Intersection Observer for scroll animations
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        projectCards.forEach(card => {
            this.observer.observe(card);
        });

        // Enhanced hover effects using event delegation
        const projectsComponent = document.querySelector('.projects-list-component');
        if (projectsComponent && !projectsComponent.hasAttribute('data-hover-initialized')) {
            projectsComponent.setAttribute('data-hover-initialized', 'true');

            projectsComponent.addEventListener('mouseenter', (e) => {
                if (e.target.closest('.project-card')) {
                    const card = e.target.closest('.project-card');
                    card.style.transform = 'translateY(-8px) scale(1.02)';
                }
            }, true);

            projectsComponent.addEventListener('mouseleave', (e) => {
                if (e.target.closest('.project-card')) {
                    const card = e.target.closest('.project-card');
                    if (card.classList.contains('animate-in')) {
                        card.style.transform = 'translateY(0) scale(1)';
                    }
                }
            }, true);
        }
    }

    // Modal functionality
    openProjectModal(projectIndex) {
        // Find project by original index or current index
        let project = this.projectsData.find(p => p.originalIndex === projectIndex);
        if (!project && this.projectsData[projectIndex]) {
            project = this.projectsData[projectIndex];
        }

        if (!project) {
            console.error('Project not found for index:', projectIndex);
            return;
        }

        const modal = document.getElementById('projectModalOverlay');
        if (modal) {
            this.populateModalContent(project);
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    populateModalContent(project) {
        // Update modal content
        const elements = {
            title: document.getElementById('modalProjectTitle'),
            status: document.getElementById('modalProjectStatus'),
            difficulty: document.getElementById('modalProjectDifficulty'),
            category: document.getElementById('modalProjectCategory'),
            duration: document.getElementById('modalProjectDuration'),
            team: document.getElementById('modalProjectTeam'),
            description: document.getElementById('modalProjectDescription'),
            technologies: document.getElementById('modalProjectTechnologies'),
            role: document.getElementById('modalProjectRole'),
            startDate: document.getElementById('modalProjectStartDate'),
            endDate: document.getElementById('modalProjectEndDate'),
            githubLink: document.getElementById('modalGithubLink'),
            liveLink: document.getElementById('modalLiveLink')
        };

        if (elements.title) elements.title.textContent = project.title;
        if (elements.status) {
            elements.status.textContent = project.status;
            elements.status.className = `project-modal-status project-status-${project.status.toLowerCase().replace(' ', '-')}`;
        }
        if (elements.difficulty) {
            elements.difficulty.textContent = project.difficulty;
            elements.difficulty.className = `project-modal-difficulty project-difficulty-${project.difficulty.toLowerCase()}`;
        }
        if (elements.category) elements.category.textContent = project.category;
        if (elements.duration) elements.duration.textContent = project.duration;
        if (elements.team) elements.team.textContent = project.teamSize || 'Solo';
        if (elements.description) elements.description.textContent = project.description;
        if (elements.role) elements.role.textContent = project.role || 'Developer';
        if (elements.startDate) elements.startDate.textContent = project.startDate;
        if (elements.endDate) elements.endDate.textContent = project.endDate || 'Ongoing';

        // Technologies
        if (elements.technologies) {
            elements.technologies.innerHTML = '';
            project.technologies.forEach(tech => {
                const techSpan = document.createElement('span');
                techSpan.textContent = tech;
                elements.technologies.appendChild(techSpan);
            });
        }

        // Links
        if (elements.githubLink) {
            if (project.githubUrl) {
                elements.githubLink.href = project.githubUrl;
                elements.githubLink.style.display = 'flex';
            } else {
                elements.githubLink.style.display = 'none';
            }
        }

        if (elements.liveLink) {
            if (project.liveUrl) {
                elements.liveLink.href = project.liveUrl;
                elements.liveLink.style.display = 'flex';
            } else {
                elements.liveLink.style.display = 'none';
            }
        }
    }

    closeProjectModal() {
        const modal = document.getElementById('projectModalOverlay');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Add cleanup method
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

// Global functions for modal (called from PHP)
function openProjectModal(projectIndex) {
    if (window.projectsManager) {
        window.projectsManager.openProjectModal(projectIndex);
    }
}

function closeProjectModal() {
    if (window.projectsManager) {
        window.projectsManager.closeProjectModal();
    }
}

// Initialize when DOM is loaded OR when component is dynamically loaded
function initializeProjectsListComponent() {
    console.log('=== ProjectsListComponent Initialization Debug ===');
    console.log('Looking for .projects-list-component in DOM...');

    // Check if the component exists in DOM
    const projectsComponent = document.querySelector('.projects-list-component');
    console.log('Projects component found:', projectsComponent);

    if (projectsComponent) {
        console.log('Checking for project cards in component...');
        const projectCards = projectsComponent.querySelectorAll('.project-card');

        console.log(`Found ${projectCards.length} project cards in component`);

        if (projectCards.length > 0) {
            console.log('✅ Component and project cards found');

            // Clean up existing manager if it exists
            if (window.projectsManager && typeof window.projectsManager.cleanup === 'function') {
                console.log('Cleaning up existing manager...');
                window.projectsManager.cleanup();
            }

            // Create new manager instance
            console.log('Creating new ProjectsListManager instance...');
            window.projectsManager = new ProjectsListManager();

            if (window.projectsManager.projectsData && window.projectsManager.projectsData.length > 0) {
                console.log('✅ ProjectsListManager created successfully');
            } else {
                console.log('❌ ProjectsListManager created but no data found');
            }
        } else {
            console.log('❌ No project cards found in component');
        }
    } else {
        console.log('❌ Projects component not found in DOM');
    }
    console.log('=== End Initialization Debug ===');
}

// Initialize on DOM ready (for server-side rendered components)
document.addEventListener('DOMContentLoaded', initializeProjectsListComponent);

// Initialize on component loaded (for dynamically loaded components)
document.addEventListener('componentLoaded', (event) => {
    console.log('🎯 componentLoaded event received!');
    console.log('Event detail:', event.detail);

    const { componentId, config } = event.detail;
    console.log('Component ID:', componentId);
    console.log('Config:', config);

    // Check if this is the projects list component
    const isProjectsListComponent = componentId === 'projects-list-section' ||
        (config && config.loader && config.loader.includes('projects_list'));

    console.log('Is projects list component?', isProjectsListComponent);

    if (isProjectsListComponent) {
        console.log('🚀 Projects List Component dynamically loaded, initializing...');

        // Small delay to ensure DOM is fully updated
        setTimeout(() => {
            console.log('Timeout reached, calling initializeProjectsListComponent...');
            initializeProjectsListComponent();
        }, 100);
    } else {
        console.log('❌ Not a projects list component, ignoring');
    }
});

// Enhanced hover effects and interactions - only run once
let enhancedEffectsInitialized = false;

function initializeEnhancedEffects() {
    if (enhancedEffectsInitialized) return;
    enhancedEffectsInitialized = true;

    // Smooth scroll to top when changing pages
    document.addEventListener('click', function(e) {
        if (e.target.closest('.pagination-btn, .pagination-dot')) {
            const projectsComponent = document.querySelector('.projects-list-component');
            if (projectsComponent) {
                projectsComponent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    // Enhanced search experience
    document.addEventListener('input', function(e) {
        if (e.target.id === 'projectsSearchInput') {
            let searchTimeout;
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // Add subtle animation to indicate search is happening
                e.target.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    e.target.style.transform = 'scale(1)';
                }, 150);
            }, 300);
        }
    });

    // Keyboard navigation for modal
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('projectModalOverlay');
        if (modal && modal.classList.contains('show')) {
            if (e.key === 'Escape') {
                closeProjectModal();
            }
        }
    });
}

// Initialize enhanced effects once
document.addEventListener('DOMContentLoaded', initializeEnhancedEffects);