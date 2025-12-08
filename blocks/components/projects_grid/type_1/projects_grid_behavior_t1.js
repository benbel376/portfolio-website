/**
 * Projects Grid Component Behavior
 * Handles filtering, searching, sorting, and dynamic rendering
 */

// Global projects data storage
let projectsData = [];
let filteredProjects = [];
let currentFilters = {
    search: '',
    category: 'all'
};
let currentPage = 1;
const itemsPerPage = 9;

/**
 * Initialize the projects grid component
 */
function initializeProjectsGrid() {
    console.log('Projects Grid: Initializing component...');
    
    // Find containers
    const gridContainer = document.getElementById('projects-grid');
    const emptyState = document.getElementById('projects-empty');
    
    if (!gridContainer) {
        console.error('Projects Grid: Grid container not found');
        return;
    }
    
    console.log('Projects Grid: Grid container found:', !!gridContainer);
    
    // Initialize controls
    initializeControls();
    
    // Check if we have data to render
    if (projectsData.length > 0) {
        console.log('Projects Grid: Rendering with existing data');
        renderProjectsGrid();
        updateResultsCount();
        updatePaginationControls();
    } else {
        console.log('Projects Grid: No data available, showing empty state');
        showEmptyState();
    }
}

/**
 * Set projects data from PHP loader
 */
function setProjectsData(data) {
    console.log('Projects Grid: Setting projects data:', data);
    projectsData = data || [];
    filteredProjects = [...projectsData];
    
    // If component is already initialized, render the data
    const gridContainer = document.getElementById('projects-grid');
    if (gridContainer) {
        populateFilterOptions();
        renderProjectsGrid();
        updateResultsCount();
        updatePaginationControls();
    }
}

/**
 * Initialize control event listeners
 */
function initializeControls() {
    // Search input
    const searchInput = document.getElementById('projects-search');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Filter dropdown
    const filterSelect = document.getElementById('projects-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', handleFilter);
    }
    
    // Pagination buttons
    const prevBtn = document.getElementById('projects-pagination-prev');
    const nextBtn = document.getElementById('projects-pagination-next');
    console.log('Projects Grid: Pagination buttons found - Prev:', !!prevBtn, 'Next:', !!nextBtn);
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Projects Grid: Previous button clicked, going to page', currentPage - 1);
            goToPage(currentPage - 1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Projects Grid: Next button clicked, going to page', currentPage + 1);
            goToPage(currentPage + 1);
        });
    }
    
    // Clear filters button
    const clearButton = document.getElementById('projects-clear-filters');
    if (clearButton) {
        clearButton.addEventListener('click', clearAllFilters);
    }
}

/**
 * Handle search functionality
 */
function handleSearch(event) {
    currentFilters.search = event.target.value.toLowerCase().trim();
    applyFiltersAndSort();
    updateClearButtonVisibility();
}

/**
 * Handle category filtering
 */
function handleFilter(event) {
    currentFilters.category = event.target.value;
    applyFiltersAndSort();
    updateClearButtonVisibility();
}

/**
 * Handle pagination
 */
function goToPage(page) {
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    console.log('Projects Grid: goToPage called with page:', page, 'totalPages:', totalPages, 'currentPage:', currentPage);
    
    if (page < 1 || page > totalPages) {
        console.log('Projects Grid: Page out of bounds, ignoring');
        return;
    }
    
    currentPage = page;
    console.log('Projects Grid: Setting current page to:', currentPage);
    
    renderProjectsGrid();
    updatePaginationControls();
    updateResultsCount();
    
    // Scroll to top of grid
    const gridContainer = document.getElementById('projects-grid');
    if (gridContainer) {
        gridContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Apply all filters
 */
function applyFiltersAndSort() {
    // Start with all projects
    filteredProjects = [...projectsData];
    
    // Apply search filter
    if (currentFilters.search) {
        filteredProjects = filteredProjects.filter(project => {
            return (
                project.name.toLowerCase().includes(currentFilters.search) ||
                project.description.toLowerCase().includes(currentFilters.search) ||
                (project.category && project.category.toLowerCase().includes(currentFilters.search))
            );
        });
    }
    
    // Apply category filter
    if (currentFilters.category !== 'all') {
        filteredProjects = filteredProjects.filter(project => 
            project.category === currentFilters.category
        );
    }
    
    // Sort by date (newest first) by default
    filteredProjects.sort((a, b) => new Date(b.date || '1900-01-01') - new Date(a.date || '1900-01-01'));
    
    // Reset to first page when filters change
    currentPage = 1;
    
    // Re-render grid
    renderProjectsGrid();
    updateResultsCount();
    updatePaginationControls();
}



/**
 * Populate filter dropdown options
 */
function populateFilterOptions() {
    const filterSelect = document.getElementById('projects-filter');
    if (!filterSelect) return;
    
    // Get unique categories
    const categories = [...new Set(projectsData.map(project => project.category).filter(Boolean))];
    
    // Clear existing options (except "All")
    const allOption = filterSelect.querySelector('option[value="all"]');
    filterSelect.innerHTML = '';
    filterSelect.appendChild(allOption);
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        filterSelect.appendChild(option);
    });
}

/**
 * Render the projects grid with pagination
 */
function renderProjectsGrid() {
    const gridContainer = document.getElementById('projects-grid');
    const emptyState = document.getElementById('projects-empty');
    const paginationContainer = document.getElementById('projects-pagination-container');
    
    if (!gridContainer) return;
    
    // Clear existing content
    gridContainer.innerHTML = '';
    
    // Hide empty state and pagination
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    if (paginationContainer) {
        paginationContainer.style.display = 'none';
    }
    
    // Check if we have projects to display
    if (!filteredProjects || filteredProjects.length === 0) {
        showEmptyState();
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const projectsToShow = filteredProjects.slice(startIndex, endIndex);
    
    // Render projects for current page
    projectsToShow.forEach((project, index) => {
        const projectCard = createProjectCard(project, startIndex + index);
        gridContainer.appendChild(projectCard);
    });
    
    // Show pagination if needed
    if (totalPages > 1 && paginationContainer) {
        paginationContainer.style.display = 'block';
    }
    
    console.log('Projects Grid: Rendered', projectsToShow.length, 'of', filteredProjects.length, 'projects (page', currentPage, 'of', totalPages, ')');
}

/**
 * Create a single project card
 */
function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-project-index', index);
    
    // Use placeholder image if no image provided
    const imageSrc = project.image || 'blocks/components/projects_grid/type_1/assets/defaults/project-placeholder.svg';
    
    card.innerHTML = `
        <img class="project-card__image" 
             src="${escapeHtml(imageSrc)}" 
             alt="${escapeHtml(project.name)}"
             loading="lazy">
        
        <div class="project-card__content">
            ${project.category ? `
                <span class="project-card__category">${escapeHtml(project.category)}</span>
            ` : ''}
            <h3 class="project-card__title">${escapeHtml(project.name || 'Untitled Project')}</h3>
            <p class="project-card__description">${escapeHtml(project.description || 'No description available.')}</p>
        </div>
    `;
    
    // Add click event to navigate to project details
    card.addEventListener('click', () => {
        console.log('Project clicked:', project.name);
        navigateToProjectDetails(project, index);
    });
    
    return card;
}

/**
 * Navigate to project details page
 */
function navigateToProjectDetails(project, index) {
    console.log('Projects Grid: Navigating to project details for:', project.name);
    
    // Use the detailUrl from the project data
    // Each project now has its own dedicated page
    if (project.detailUrl) {
        window.location.hash = project.detailUrl;
    } else {
        console.warn('Projects Grid: No detailUrl found for project:', project.name);
    }
}

/**
 * Update results count display
 */
function updateResultsCount() {
    const resultsCount = document.getElementById('projects-results-count');
    if (!resultsCount) return;
    
    const total = projectsData.length;
    const filtered = filteredProjects.length;
    const totalPages = Math.ceil(filtered / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filtered);
    
    if (filtered === 0) {
        resultsCount.textContent = 'No projects found';
    } else if (filtered === total && totalPages === 1) {
        resultsCount.textContent = `Showing ${total} project${total !== 1 ? 's' : ''}`;
    } else if (totalPages === 1) {
        resultsCount.textContent = `Showing ${filtered} of ${total} project${total !== 1 ? 's' : ''}`;
    } else {
        resultsCount.textContent = `Showing ${startIndex}-${endIndex} of ${filtered} project${filtered !== 1 ? 's' : ''}`;
    }
}

/**
 * Update clear filters button visibility
 */
function updateClearButtonVisibility() {
    const clearButton = document.getElementById('projects-clear-filters');
    if (!clearButton) return;
    
    const hasActiveFilters = currentFilters.search || currentFilters.category !== 'all';
    clearButton.style.display = hasActiveFilters ? 'flex' : 'none';
}

/**
 * Update pagination controls
 */
function updatePaginationControls() {
    const prevBtn = document.getElementById('projects-pagination-prev');
    const nextBtn = document.getElementById('projects-pagination-next');
    const paginationInfo = document.getElementById('projects-pagination-info');
    const paginationDots = document.getElementById('projects-pagination-dots');
    
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    console.log('Projects Grid: Updating pagination controls - currentPage:', currentPage, 'totalPages:', totalPages);
    console.log('Projects Grid: Pagination elements found - Prev:', !!prevBtn, 'Next:', !!nextBtn, 'Info:', !!paginationInfo, 'Dots:', !!paginationDots);
    
    // Update buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
        console.log('Projects Grid: Previous button disabled:', prevBtn.disabled);
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        console.log('Projects Grid: Next button disabled:', nextBtn.disabled);
    }
    
    // Update info
    if (paginationInfo) {
        paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    // Update pagination dots
    if (paginationDots) {
        paginationDots.innerHTML = '';
        
        // Only show dots if there are multiple pages and not too many
        if (totalPages > 1 && totalPages <= 10) {
            for (let i = 1; i <= totalPages; i++) {
                const dot = document.createElement('div');
                dot.className = `projects-grid__pagination-dot ${i === currentPage ? 'active' : ''}`;
                dot.addEventListener('click', () => goToPage(i));
                paginationDots.appendChild(dot);
            }
            console.log('Projects Grid: Created', totalPages, 'pagination dots');
        }
    }
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    // Reset filter values
    currentFilters.search = '';
    currentFilters.category = 'all';
    currentPage = 1;
    
    // Update UI controls
    const searchInput = document.getElementById('projects-search');
    const filterSelect = document.getElementById('projects-filter');
    
    if (searchInput) searchInput.value = '';
    if (filterSelect) filterSelect.value = 'all';
    
    // Apply filters and update display
    applyFiltersAndSort();
    updateClearButtonVisibility();
}

/**
 * Show empty state
 */
function showEmptyState() {
    const gridContainer = document.getElementById('projects-grid');
    const emptyState = document.getElementById('projects-empty');
    
    if (gridContainer) {
        gridContainer.innerHTML = '';
    }
    
    if (emptyState) {
        emptyState.style.display = 'block';
    }
    
    updateResultsCount();
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
 * Reset projects grid animations
 */
function resetProjectsGridAnimations() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
    });
}

// Export functions to global scope for framework integration
window.handleProjectsGridNavigation = initializeProjectsGrid;
window.setProjectsData = setProjectsData;
window.initializeProjectsGrid = initializeProjectsGrid;
window.resetProjectsGridAnimations = resetProjectsGridAnimations;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are ready
    setTimeout(initializeProjectsGrid, 100);
});

// Listen for component loaded events
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.componentId && event.detail.componentId.includes('projects-grid')) {
        setTimeout(initializeProjectsGrid, 100);
    }
});

console.log('Projects Grid: Component behavior script loaded');
