/**
 * General pagination behavior 
 * Automatically handles pagination for any container with pagination-page children
 */

function initializePagination() {
    console.log('Initializing dynamic pagination system');

    // Find all pagination containers
    const paginationContainers = document.querySelectorAll('.pagination-container');

    // Process each container
    paginationContainers.forEach((container, containerIndex) => {
        // Find all pagination pages in this container
        const pages = container.querySelectorAll('.pagination-page');

        if (pages.length <= 1) {
            console.log('Pagination container has only one or zero pages, skipping');
            return; // Skip if there's only one page or none
        }

        console.log(`Found pagination container with ${pages.length} pages`);

        // Create pagination controls
        const paginationControls = document.createElement('nav');
        paginationControls.className = 'pagination-controls';

        const pagesList = document.createElement('ul');
        paginationControls.appendChild(pagesList);

        // Get the page and main container
        const mainElement = container.closest('main');
        if (!mainElement) {
            console.error('Pagination container not inside a main element');
            return;
        }

        const pageId = mainElement.id;

        // Generate page links with expanded URLs
        for (let i = 0; i < pages.length; i++) {
            const pageNum = i + 1;
            const pageItem = document.createElement('li');

            // Find the first component in the page
            const firstComponent = findFirstComponentInPage(pages[i]);

            // Create the expanded URL with component and state
            const expandedUrl = firstComponent ?
                `#${pageId}/${pageNum}/${firstComponent}/1` :
                `#${pageId}/${pageNum}`;

            const pageLink = document.createElement('a');
            pageLink.href = expandedUrl;
            pageLink.className = 'pagination-link';
            pageLink.setAttribute('data-page', pageNum);
            pageLink.setAttribute('data-container', containerIndex);
            pageLink.textContent = `Page ${pageNum}`;

            pageItem.appendChild(pageLink);
            pagesList.appendChild(pageItem);

            // Add page number as a data attribute to the page div
            pages[i].setAttribute('data-page-num', pageNum);
        }

        // Insert pagination controls at the beginning of the main element
        if (mainElement) {
            mainElement.insertBefore(paginationControls, container.nextSibling);
        }

        // Initially hide all pages except the first one
        pages.forEach((page, index) => {
            if (index === 0) {
                page.style.display = 'block';
            } else {
                page.style.display = 'none';
            }
        });
    });

    // Function to find the first component in a pagination page
    function findFirstComponentInPage(pageElement) {
        // Look for sections with IDs first
        const firstSection = pageElement.querySelector('section[id]');
        if (firstSection) {
            return firstSection.id;
        }
        return null;
    }

    // Function to update pagination based on URL
    function updateActivePage() {
        const hash = window.location.hash;
        let pageParts = ['', '1']; // Default to first page

        // Extract page info from hash
        if (hash.includes('/')) {
            pageParts = hash.replace('#', '').split('/');
        }

        const pageId = pageParts[0];
        const pageNum = parseInt(pageParts[1]) || 1;

        // Find all pagination containers in the current page
        const currentPage = document.getElementById(pageId);
        if (!currentPage) return;

        const containers = currentPage.querySelectorAll('.pagination-container');

        // Update each container
        containers.forEach((container) => {
            // Skip containers with only one page
            const pages = container.querySelectorAll('.pagination-page');
            if (pages.length <= 1) return;

            // Update active state of pagination links
            const paginationLinks = currentPage.querySelectorAll('.pagination-link');
            paginationLinks.forEach(link => {
                const linkPage = parseInt(link.getAttribute('data-page'));
                if (linkPage === pageNum) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Show active page, hide others
            pages.forEach(page => {
                const pageNumber = parseInt(page.getAttribute('data-page-num'));
                if (pageNumber === pageNum) {
                    page.style.display = 'block';
                } else {
                    page.style.display = 'none';
                }
            });
        });

        console.log(`Pagination updated: Page ID=${pageId}, Page Number=${pageNum}`);
    }

    // Initialize with current URL
    updateActivePage();

    // Listen for hash changes
    window.addEventListener('hashchange', updateActivePage);
}

// Make the function globally available
window.initializePagination = initializePagination;

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initializePagination);