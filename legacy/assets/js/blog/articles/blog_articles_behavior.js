// Blog List Behavior JavaScript

// Global variables
let currentBlogPage = 1;
let blogItemsPerPage = 6;
let filteredBlogData = [];
let appliedBlogFilters = [];
let currentBlogSort = { field: 'publishDate', order: 'desc' };

// Initialize blog functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.blogData !== 'undefined') {
        initializeBlogList();
    }
});

function initializeBlogList() {
    filteredBlogData = [...window.blogData];

    // Initialize event listeners
    setupBlogEventListeners();

    // Initial render
    sortBlogData();
    renderBlogList();
    updateBlogPagination();
}

function setupBlogEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('blogSearchInput');
    const clearSearchBtn = document.getElementById('clearBlogSearchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', handleBlogSearch);
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearBlogSearch);
    }

    // Filter functionality
    const filterTypeSelect = document.getElementById('filterTypeSelect');
    const filterValueSelect = document.getElementById('filterValueSelect');
    const addFilterBtn = document.getElementById('addFilterBtn');
    const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');

    if (filterTypeSelect) {
        filterTypeSelect.addEventListener('change', handleFilterTypeChange);
    }

    if (filterValueSelect) {
        filterValueSelect.addEventListener('change', handleFilterValueChange);
    }

    if (addFilterBtn) {
        addFilterBtn.addEventListener('click', addBlogFilter);
    }

    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', clearAllBlogFilters);
    }

    // Sort functionality
    const sortBySelect = document.getElementById('sortBy');
    const sortOrderBtn = document.getElementById('sortOrderBtn');

    if (sortBySelect) {
        sortBySelect.addEventListener('change', handleBlogSortChange);
    }

    if (sortOrderBtn) {
        sortOrderBtn.addEventListener('click', toggleBlogSortOrder);
    }

    // Pagination functionality
    const prevPageBtn = document.getElementById('prevBlogPageBtn');
    const nextPageBtn = document.getElementById('nextBlogPageBtn');

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => changeBlogPage(currentBlogPage - 1));
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => changeBlogPage(currentBlogPage + 1));
    }

    // No results clear filters
    const clearFiltersBtn = document.getElementById('clearBlogFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllBlogFilters);
    }
}

// Search functionality
function handleBlogSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const clearBtn = document.getElementById('clearBlogSearchBtn');

    if (clearBtn) {
        clearBtn.style.display = searchTerm ? 'flex' : 'none';
    }

    applyBlogFilters();
}

function clearBlogSearch() {
    const searchInput = document.getElementById('blogSearchInput');
    const clearBtn = document.getElementById('clearBlogSearchBtn');

    if (searchInput) {
        searchInput.value = '';
    }

    if (clearBtn) {
        clearBtn.style.display = 'none';
    }

    applyBlogFilters();
}

// Filter functionality
function handleFilterTypeChange(event) {
    const filterType = event.target.value;
    const filterValueSelect = document.getElementById('filterValueSelect');
    const addFilterBtn = document.getElementById('addFilterBtn');

    if (!filterValueSelect || !addFilterBtn) return;

    // Clear previous options
    filterValueSelect.innerHTML = '<option value="">Select value...</option>';

    if (filterType) {
        filterValueSelect.disabled = false;

        let options = [];

        switch (filterType) {
            case 'category':
                options = window.blogCategories || [];
                break;
            case 'author':
                options = window.blogAuthors || [];
                break;
            case 'tag':
                options = window.blogTags || [];
                break;
            case 'featured':
                options = ['true', 'false'];
                break;
        }

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option === 'true' ? 'Featured' : option === 'false' ? 'Not Featured' : option;
            filterValueSelect.appendChild(optionElement);
        });
    } else {
        filterValueSelect.disabled = true;
        addFilterBtn.disabled = true;
    }
}

function handleFilterValueChange(event) {
    const addFilterBtn = document.getElementById('addFilterBtn');
    if (addFilterBtn) {
        addFilterBtn.disabled = !event.target.value;
    }
}

function addBlogFilter() {
    const filterTypeSelect = document.getElementById('filterTypeSelect');
    const filterValueSelect = document.getElementById('filterValueSelect');

    if (!filterTypeSelect || !filterValueSelect) return;

    const filterType = filterTypeSelect.value;
    const filterValue = filterValueSelect.value;

    if (filterType && filterValue) {
        // Check if filter already exists
        const existingFilter = appliedBlogFilters.find(f => f.type === filterType && f.value === filterValue);

        if (!existingFilter) {
            appliedBlogFilters.push({ type: filterType, value: filterValue });
            updateAppliedFiltersDisplay();
            applyBlogFilters();
        }

        // Reset selects
        filterTypeSelect.value = '';
        filterValueSelect.innerHTML = '<option value="">Select value...</option>';
        filterValueSelect.disabled = true;
        document.getElementById('addFilterBtn').disabled = true;
    }
}

function removeBlogFilter(index) {
    appliedBlogFilters.splice(index, 1);
    updateAppliedFiltersDisplay();
    applyBlogFilters();
}

function clearAllBlogFilters() {
    appliedBlogFilters = [];
    updateAppliedFiltersDisplay();
    clearBlogSearch();
    applyBlogFilters();
}

function updateAppliedFiltersDisplay() {
    const appliedFiltersContainer = document.getElementById('appliedFilters');
    const appliedFiltersList = document.getElementById('appliedFiltersList');

    if (!appliedFiltersContainer || !appliedFiltersList) return;

    if (appliedBlogFilters.length === 0) {
        appliedFiltersContainer.style.display = 'none';
        return;
    }

    appliedFiltersContainer.style.display = 'flex';
    appliedFiltersList.innerHTML = '';

    appliedBlogFilters.forEach((filter, index) => {
        const filterTag = document.createElement('div');
        filterTag.className = 'filter-tag';

        const displayValue = filter.value === 'true' ? 'Featured' : filter.value === 'false' ? 'Not Featured' : filter.value;

        filterTag.innerHTML = `
            ${filter.type}: ${displayValue}
            <button onclick="removeBlogFilter(${index})">
                <ion-icon name="close-outline"></ion-icon>
            </button>
        `;

        appliedFiltersList.appendChild(filterTag);
    });
}

// Sort functionality
function handleBlogSortChange(event) {
    currentBlogSort.field = event.target.value;
    sortBlogData();
    renderBlogList();
    updateBlogPagination();
}

function toggleBlogSortOrder() {
    const sortOrderBtn = document.getElementById('sortOrderBtn');

    if (currentBlogSort.order === 'asc') {
        currentBlogSort.order = 'desc';
        sortOrderBtn.innerHTML = '<ion-icon name="arrow-down-outline"></ion-icon>';
        sortOrderBtn.setAttribute('data-order', 'desc');
    } else {
        currentBlogSort.order = 'asc';
        sortOrderBtn.innerHTML = '<ion-icon name="arrow-up-outline"></ion-icon>';
        sortOrderBtn.setAttribute('data-order', 'asc');
    }

    sortBlogData();
    renderBlogList();
    updateBlogPagination();
}

function sortBlogData() {
    filteredBlogData.sort((a, b) => {
        let aValue = a[currentBlogSort.field];
        let bValue = b[currentBlogSort.field];

        // Handle different data types
        if (currentBlogSort.field === 'publishDate') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (currentBlogSort.order === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
}

// Filter application
function applyBlogFilters() {
    const searchInput = document.getElementById('blogSearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    filteredBlogData = window.blogData.filter(post => {
        // Apply search filter
        if (searchTerm) {
            const searchableText = `${post.title} ${post.excerpt} ${post.content} ${post.author} ${post.category} ${post.tags.join(' ')}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }

        // Apply other filters
        for (const filter of appliedBlogFilters) {
            switch (filter.type) {
                case 'category':
                    if (post.category !== filter.value) return false;
                    break;
                case 'author':
                    if (post.author !== filter.value) return false;
                    break;
                case 'tag':
                    if (!post.tags.includes(filter.value)) return false;
                    break;
                case 'featured':
                    if (post.featured.toString() !== filter.value) return false;
                    break;
            }
        }

        return true;
    });

    currentBlogPage = 1;
    sortBlogData();
    renderBlogList();
    updateBlogPagination();
}

// Rendering functions
function renderBlogList() {
    const blogGrid = document.getElementById('blogGrid');
    const noResults = document.getElementById('blogNoResults');

    if (!blogGrid || !noResults) return;

    if (filteredBlogData.length === 0) {
        blogGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    blogGrid.style.display = 'grid';
    noResults.style.display = 'none';

    const startIndex = (currentBlogPage - 1) * blogItemsPerPage;
    const endIndex = startIndex + blogItemsPerPage;
    const pageData = filteredBlogData.slice(startIndex, endIndex);

    blogGrid.innerHTML = '';

    pageData.forEach((post, index) => {
        const blogCard = createBlogCard(post);
        blogGrid.appendChild(blogCard);
    });
}

function createBlogCard(post) {
    const article = document.createElement('article');
    article.className = 'blog-card';
    article.setAttribute('data-post-id', post.id);

    const featuredBadge = post.featured ? `
        <div class="blog-featured-badge">
            <ion-icon name="star"></ion-icon>
            Featured
        </div>
    ` : '';

    article.innerHTML = `
        ${featuredBadge}
        
        <div class="blog-card-image">
            <div class="blog-image-placeholder">
                <ion-icon name="document-text-outline"></ion-icon>
            </div>
        </div>
        
        <div class="blog-card-content">
            <h3 class="blog-title">${post.title}</h3>
            <p class="blog-excerpt">${post.excerpt}</p>
            
            <div class="blog-read-more">
                <a href="#" class="blog-read-more-btn">
                    Read More
                    <ion-icon name="arrow-forward-outline"></ion-icon>
                </a>
            </div>
        </div>
    `;

    return article;
}

// Pagination functions
function updateBlogPagination() {
    const totalPages = Math.ceil(filteredBlogData.length / blogItemsPerPage);
    const prevBtn = document.getElementById('prevBlogPageBtn');
    const nextBtn = document.getElementById('nextBlogPageBtn');
    const pageInfo = document.getElementById('currentBlogPageInfo');
    const paginationDots = document.getElementById('paginationDots');

    if (prevBtn) {
        prevBtn.disabled = currentBlogPage === 1;
    }

    if (nextBtn) {
        nextBtn.disabled = currentBlogPage === totalPages || totalPages === 0;
    }

    if (pageInfo) {
        pageInfo.textContent = `Page ${currentBlogPage} of ${totalPages || 1}`;
    }

    if (paginationDots) {
        paginationDots.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const dot = document.createElement('div');
            dot.className = `pagination-dot ${i === currentBlogPage ? 'active' : ''}`;
            dot.addEventListener('click', () => changeBlogPage(i));
            paginationDots.appendChild(dot);
        }
    }
}

function changeBlogPage(page) {
    const totalPages = Math.ceil(filteredBlogData.length / blogItemsPerPage);

    if (page >= 1 && page <= totalPages) {
        currentBlogPage = page;
        renderBlogList();
        updateBlogPagination();

        // Scroll to top of blog section
        const blogSection = document.getElementById('blog-list-section');
        if (blogSection) {
            blogSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Make functions globally available
window.removeBlogFilter = removeBlogFilter;