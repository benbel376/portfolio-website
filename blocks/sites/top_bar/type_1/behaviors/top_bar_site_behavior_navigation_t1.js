/**
 * Hash-based navigation system
 * Handles URL format: #[page]/[pagination]/[component]/[state]?[arguments]
 * - page: The page ID to navigate to
 * - pagination: The page's pagination number (defaults to 1)
 * - component: The ID of a component to scroll to (optional)
 * - state: The internal state of the component (optional)
 * - arguments: JSON-encoded data for dynamic components (optional)
 */

window.onhashchange = handleHashNavigation;

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded. Initial hash:', location.hash);
    if (!location.hash) {
        console.log('No hash found, setting default to #profile/1');
        location.hash = '#profile/1';
    } else {
        handleHashNavigation();
    }
});

/**
 * Check if the user has access to a specific page
 * @param {HTMLElement} pageElement - The page element to check
 * @returns {boolean} - True if access is allowed, false if blocked
 */
function checkPageAccess(pageElement) {
    console.log('🔐 [Access Check] Checking page access for:', pageElement.id);

    // Check if the page is secured
    if (pageElement.hasAttribute('secured')) {
        console.log('🔐 [Access Check] Page is secured, checking authentication...');

        // Check if the page has the authenticated class
        if (!pageElement.classList.contains('authenticated')) {
            console.log('🔐 [Access Check] ❌ ACCESS DENIED - Page is secured but not authenticated');

            // Show authentication prompt
            showAccessDeniedMessage(pageElement.id);

            // Redirect to a default accessible page (e.g., profile)
            redirectToAccessiblePage();

            return false;
        } else {
            console.log('🔐 [Access Check] ✅ Access granted - Page is secured and authenticated');
            return true;
        }
    } else {
        console.log('🔐 [Access Check] ✅ Access granted - Page is not secured');
        return true;
    }
}

/**
 * Show access denied message to user
 * @param {string} pageId - The ID of the page that was denied
 */
function showAccessDeniedMessage(pageId) {
    console.log('🔐 [Access Denied] Showing access denied message for page:', pageId);

    // You could show a toast notification, modal, or console message
    // For now, we'll just log it and potentially show a simple alert
    const message = `Access denied to ${pageId} page. Please log in to continue.`;

    // Optional: Show a user-friendly notification
    // You could integrate with any notification system you have
    console.warn('🔐 [User Message]', message);

    // Optional: Show login modal if available
    if (window.siteAuth) {
        console.log('🔐 [Access Denied] Showing login modal...');
        // You could automatically show the login modal here
        // showSiteLoginModal(); // Uncomment if you want auto-login prompt
    }
}

/**
 * Redirect to an accessible page when access is denied
 */
function redirectToAccessiblePage() {
    console.log('🔐 [Redirect] Redirecting to accessible page...');

    // Redirect to the profile page using simple format
    // This will be automatically expanded by the existing URL expansion logic
    const defaultPage = 'profile';
    const redirectUrl = `#${defaultPage}`;

    console.log('🔐 [Redirect] Redirecting to:', redirectUrl, '(will trigger navigation)');

    // Use location.hash to trigger the hashchange event and proper navigation
    // This will cause handleHashNavigation() to be called automatically
    location.hash = redirectUrl;
}

async function handleHashNavigation() {
    console.log('--- handleHashNavigation START ---');
    console.log('Current window.location.hash:', window.location.hash);

    const [path, query] = window.location.hash.replace('#', '').split('?');
    const pathParts = path.split('/');
    const page = pathParts[0] || 'home';

    console.log('Parsed path:', path, 'Query:', query);
    console.log('Parsed page ID from pathParts[0]:', page);

    const currentPageElement = document.getElementById(page);
    console.log(`Attempting to find element with ID: "${page}". Found:`, currentPageElement);

    if (!currentPageElement) {
        console.error(`Page element with ID "${page}" not found in the DOM. Navigation aborted.`);
        console.log('--- handleHashNavigation END (aborted) ---');
        return;
    }

    // ✅ SECURITY CHECK: Wait for authentication initialization before checking access
    if (currentPageElement.hasAttribute('secured')) {
        console.log('🔐 [Navigation] Page is secured, waiting for authentication initialization...');

        // Wait for authentication system to complete its initialization
        if (window.siteAuth && typeof window.siteAuth.checkSession === 'function') {
            // Wait for authentication check to complete
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait

            while (attempts < maxAttempts) {
                const authState = window.siteAuth.getAuthState ? window.siteAuth.getAuthState() : null;

                if (authState && authState.initializationComplete === true) {
                    console.log('🔐 [Navigation] Authentication initialization complete, proceeding with access check');
                    break;
                }

                // Wait 100ms before checking again
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (attempts >= maxAttempts) {
                console.warn('🔐 [Navigation] Authentication initialization timeout, proceeding with access check anyway');
            }
        }
    }

    // ✅ SECURITY CHECK: Block navigation to secured pages without authentication
    if (!checkPageAccess(currentPageElement)) {
        console.log('--- handleHashNavigation END (access denied) ---');
        return;
    }

    // Expand simple #page URLs to include pagination and component information
    if (pathParts.length === 1) {
        console.log(`Path has only one part ('${pathParts[0]}'): Attempting to expand URL.`);
        const firstComponent = findFirstComponent(currentPageElement);
        console.log('First component found for expansion:', firstComponent);
        if (firstComponent) {
            const expandedUrl = `#${page}/1/${firstComponent}/1${query ? '?' + query : ''}`;
            console.log(`Expanding URL: ${location.hash} → ${expandedUrl}`);
            history.replaceState(null, '', expandedUrl);
            console.log('URL replaced, re-calling handleHashNavigation for expanded URL.');
            console.log('--- handleHashNavigation END (re-calling for expansion) ---');
            return handleHashNavigation(); // Re-trigger with the new hash
        } else {
            console.log('No first component found, proceeding with simple URL.');
        }
    }

    const pagination = pathParts[1] || '1';
    const component = pathParts[2] || null;
    const componentState = pathParts[3] || null;

    console.log(`Navigation details: Page=${page}, Pagination=${pagination}, Component=${component || 'none'}, State=${componentState || 'default'}`);

    console.log('About to remove "visible" class from all main elements.');
    document.querySelectorAll('main').forEach(el => {
        console.log(`Processing element for class removal: ID=${el.id}, Current classes=${el.className}`);
        el.classList.remove('visible');
        console.log(`After removing 'visible': ID=${el.id}, New classes=${el.className}`);
    });

    console.log(`About to add "visible" class to currentPageElement: ID=${currentPageElement.id}`);
    currentPageElement.classList.add('visible');
    console.log(`After adding 'visible': ID=${currentPageElement.id}, New classes=${currentPageElement.className}`);

    updateNavigationHighlighting(currentPageElement);

    // Legacy support for old pagination-section classes
    const paginationSections = document.querySelectorAll(`.${page}-pagination-section`);
    if (paginationSections.length > 0) {
        console.log(`Found ${paginationSections.length} legacy pagination sections for page ${page}.`);
        paginationSections.forEach((section, index) => {
            section.style.display = index === parseInt(pagination) - 1 ? 'block' : 'none';
        });
    }

    let args = [];
    if (query) {
        try {
            args = JSON.parse(decodeURIComponent(query));
            console.log('Parsed URL query arguments:', args);
        } catch (error) {
            console.error('Error parsing URL query arguments:', error);
        }
    }

    await loadComponents(args);
    initializePageComponents(page);

    if (component) {
        const componentElement = document.getElementById(component);
        console.log(`Attempting to find component element with ID: "${component}". Found:`, componentElement);
        if (componentElement) {
            // --- BEGIN AUTO-EXPAND COLLAPSIBLE PARENT ---
            const parentCollapsible = componentElement.closest('.collapsible-section');
            if (parentCollapsible) {
                console.log(`[AutoExpand] Component "${component}" is inside a collapsible section: ID="${parentCollapsible.id || 'N/A'}"`);
                const header = parentCollapsible.querySelector('.collapsible-section__header');
                const isExpanded = parentCollapsible.classList.contains('expanded') || (header && header.getAttribute('aria-expanded') === 'true');

                if (!isExpanded && header) {
                    console.log(`[AutoExpand] Collapsible section "${parentCollapsible.id || 'N/A'}" is collapsed. Clicking header to expand.`);
                    header.click(); // This will trigger the existing expansion logic
                    // Optional: Consider a small delay if scroll happens before content is fully ready,
                    // but usually, the reflow from click() and class changes is enough.
                } else if (isExpanded) {
                    console.log(`[AutoExpand] Collapsible section "${parentCollapsible.id || 'N/A'}" is already expanded.`);
                } else if (!header) {
                    console.warn(`[AutoExpand] Could not find header for collapsible section: ID="${parentCollapsible.id || 'N/A'}"`);
                }
            } else {
                console.log(`[AutoExpand] Component "${component}" is not inside a collapsible section.`);
            }
            // --- END AUTO-EXPAND COLLAPSIBLE PARENT ---

            console.log('Scrolling to component:');
            componentElement.scrollIntoView({ behavior: 'smooth' });
            if (componentState) {
                applyComponentState(componentElement, componentState);
            }
        } else {
            console.warn(`Component element with ID "${component}" not found for scrolling.`);
        }
    }

    console.log('--- handleHashNavigation END (successful) ---');
}

/**
 * Updates navigation highlighting based on the current page's owner/parent
 * @param {HTMLElement} pageElement - The current page element
 */
function updateNavigationHighlighting(pageElement) {
    console.log('[updateNavigationHighlighting] Called for page:', pageElement ? pageElement.id : 'null');
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    let ownerPageId = pageElement.getAttribute('data-parent') || pageElement.id;
    const navLink = document.querySelector(`nav a[href="#${ownerPageId}"]`);
    if (navLink) {
        navLink.classList.add('active');
        console.log(`[updateNavigationHighlighting] Highlighted nav link for: ${ownerPageId}`);
    } else {
        console.warn(`[updateNavigationHighlighting] No nav link found for: ${ownerPageId}`);
    }
}

/**
 * Find the first component in a page
 * @param {HTMLElement} pageElement - The page element to search
 * @returns {string|null} - ID of the first component found, or null if none found
 */
function findFirstComponent(pageElement) {
    console.log('[findFirstComponent] Called for page:', pageElement ? pageElement.id : 'null');

    // Priority 1: Look for header components first (page-header-anchor pattern)
    const headerComponent = pageElement.querySelector('section[id$="-page-header-anchor"], section[id$="-header-anchor"]');
    if (headerComponent) {
        console.log('[findFirstComponent] Found header component:', headerComponent.id);
        return headerComponent.id;
    }

    // Priority 2: Look for dynamic components
    const dynamicComponent = pageElement.querySelector('[data-dynamic][id]');
    if (dynamicComponent) {
        console.log('[findFirstComponent] Found dynamic component:', dynamicComponent.id);
        return dynamicComponent.id;
    }

    // Priority 3: Look for any other component
    const anyComponent = pageElement.querySelector('section[id], div[id]:not(.pagination-container):not(.pagination-page)');
    if (anyComponent) {
        console.log('[findFirstComponent] Found other component:', anyComponent.id);
        return anyComponent.id;
    }

    console.log('[findFirstComponent] No component found.');
    return null;
}

/**
 * Applies a state to a component
 * This dispatches a custom event that component-specific behaviors can listen for
 */
function applyComponentState(element, state) {
    console.log(`[applyComponentState] Applying state "${state}" to component "${element.id}"`);
    const stateEvent = new CustomEvent('componentStateChange', {
        bubbles: true,
        detail: {
            componentId: element.id,
            state: state
        }
    });
    element.dispatchEvent(stateEvent);
}

// Initialize components specific to the current page
function initializePageComponents(page) {
    console.log(`[initializePageComponents] Initializing components for page: ${page}`);
    switch (page) {
        case 'projects':
            if (typeof initializeProjectCardBehavior === 'function') {
                initializeProjectCardBehavior();
            }
            break;
        case 'contact':
            if (typeof initializeContactFormBehavior === 'function') {
                initializeContactFormBehavior();
            }
            break;
            // Add other pages as needed
    }
}

// ============================================================================
// SITE-LEVEL AUTHENTICATION FUNCTIONS
// ============================================================================

// Initialize site-level authentication
function initializeSiteAuthentication() {
    console.log('🔐 [Site Auth] Initializing site-level authentication...');

    // Listen for global auth state changes
    if (window.siteAuth) {
        window.siteAuth.addAuthStateListener(onSiteAuthStateChange);

        // Initial state update
        updateSiteAuthButton(window.siteAuth.isAuthenticated());

        // Create global login modal
        createSiteLoginModal();
    }

    console.log('✅ [Site Auth] Site-level authentication ready');
}

// Handle site auth button click
function handleSiteAuthClick() {
    console.log('🔐 [Site Auth] Auth button clicked');

    if (window.siteAuth) {
        window.siteAuth.toggleAuth().then(result => {
            if (result.showLogin) {
                showSiteLoginModal();
            }
        });
    } else {
        console.error('🔐 [Site Auth] Global auth system not available');
    }
}

// Update site auth button based on authentication state
function updateSiteAuthButton(isAuthenticated) {
    console.log('🔐 [Site Auth] Updating auth button, authenticated:', isAuthenticated);

    const authBtn = document.getElementById('siteAuthBtn');
    if (!authBtn) {
        console.warn('🔐 [Site Auth] Auth button not found');
        return;
    }

    const icon = authBtn.querySelector('.site-auth-icon');

    if (isAuthenticated) {
        if (icon) icon.setAttribute('name', 'log-out-outline');
        authBtn.classList.add('authenticated');
        authBtn.setAttribute('aria-label', 'Logout');
    } else {
        if (icon) icon.setAttribute('name', 'log-in-outline');
        authBtn.classList.remove('authenticated');
        authBtn.setAttribute('aria-label', 'Login');
    }
}

// Handle global auth state changes at site level
function onSiteAuthStateChange(isAuthenticated, authState) {
    console.log('🔐 [Site Auth] Auth state changed:', isAuthenticated);

    updateSiteAuthButton(isAuthenticated);

    // Show/hide authenticated-only sections across all pages
    const authenticatedSections = document.querySelectorAll('.authenticated-only');
    authenticatedSections.forEach(section => {
        section.style.display = isAuthenticated ? 'block' : 'none';
    });
}

// Create the site-level login modal
function createSiteLoginModal() {
    // Check if modal already exists
    if (document.getElementById('siteLoginModal')) {
        return;
    }

    const modalHTML = `
        <div id="siteLoginModal" class="site-login-modal">
            <div class="site-login-modal-backdrop"></div>
            <div class="site-login-modal-content">
                <button id="siteModalClose" class="site-login-modal-close">
                    <ion-icon name="close-outline"></ion-icon>
                </button>
                
                <div class="site-login-modal-header">
                    <h3 class="site-login-modal-title">Site Authentication</h3>
                    <p class="site-login-modal-subtitle">Access secured features</p>
                </div>
                
                <form id="siteLoginForm" class="site-login-form">
                    <div class="site-form-group">
                        <label class="site-form-label" for="siteUsername">Username</label>
                        <input 
                            type="text" 
                            id="siteUsername" 
                            name="username" 
                            class="site-form-input" 
                            placeholder="Enter username"
                            required 
                            autocomplete="username"
                        >
                    </div>
                    
                    <div class="site-form-group">
                        <label class="site-form-label" for="sitePassword">Password</label>
                        <input 
                            type="password" 
                            id="sitePassword" 
                            name="password" 
                            class="site-form-input" 
                            placeholder="Enter password"
                            required 
                            autocomplete="current-password"
                        >
                    </div>
                    
                    <button type="submit" class="site-login-submit" id="siteLoginSubmit">
                        <div class="site-loading-spinner"></div>
                        <span class="site-button-text">Sign In</span>
                    </button>
                    
                    <div class="site-error-message" id="siteErrorMessage"></div>
                    <div class="site-success-message" id="siteSuccessMessage"></div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    bindSiteModalEvents();
}

// Show the site login modal
function showSiteLoginModal() {
    console.log('🔐 [Site Auth] Showing login modal');

    const modal = document.getElementById('siteLoginModal');
    if (modal) {
        modal.classList.add('visible');

        // Focus on username field
        const usernameInput = document.getElementById('siteUsername');
        if (usernameInput) {
            setTimeout(() => usernameInput.focus(), 100);
        }
    }
}

// Hide the site login modal
function hideSiteLoginModal() {
    const modal = document.getElementById('siteLoginModal');
    if (modal) {
        modal.classList.remove('visible');

        // Reset form
        const form = document.getElementById('siteLoginForm');
        if (form) form.reset();

        hideSiteMessages();
        setSiteLoadingState(false);
    }
}

// Bind site modal event listeners
function bindSiteModalEvents() {
    const modal = document.getElementById('siteLoginModal');
    const closeBtn = document.getElementById('siteModalClose');
    const backdrop = document.querySelector('.site-login-modal-backdrop');
    const form = document.getElementById('siteLoginForm');

    if (closeBtn) {
        closeBtn.addEventListener('click', hideSiteLoginModal);
    }

    if (backdrop) {
        backdrop.addEventListener('click', hideSiteLoginModal);
    }

    if (form) {
        form.addEventListener('submit', handleSiteLoginSubmit);
    }

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('visible')) {
            hideSiteLoginModal();
        }
    });
}

// Handle site login form submission
async function handleSiteLoginSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        showSiteError('Please enter both username and password');
        return;
    }

    setSiteLoadingState(true);
    hideSiteMessages();

    try {
        if (window.siteAuth) {
            const result = await window.siteAuth.login(username, password);

            if (result.success) {
                showSiteSuccess('Login successful!');

                // Hide modal after brief delay
                setTimeout(() => {
                    hideSiteLoginModal();
                }, 1000);
            } else {
                showSiteError(result.message || 'Login failed');
            }
        } else {
            showSiteError('Authentication system not available');
        }
    } catch (error) {
        console.error('🔐 [Site Auth] Login error:', error);
        showSiteError('Connection error. Please try again.');
    } finally {
        setSiteLoadingState(false);
    }
}

// Site modal utility functions
function setSiteLoadingState(loading) {
    const submitBtn = document.getElementById('siteLoginSubmit');
    const usernameInput = document.getElementById('siteUsername');
    const passwordInput = document.getElementById('sitePassword');

    if (submitBtn) {
        submitBtn.disabled = loading;
        submitBtn.classList.toggle('loading', loading);
    }

    if (usernameInput) usernameInput.disabled = loading;
    if (passwordInput) passwordInput.disabled = loading;
}

function showSiteError(message) {
    const errorElement = document.getElementById('siteErrorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    hideSiteSuccess();
}

function showSiteSuccess(message) {
    const successElement = document.getElementById('siteSuccessMessage');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
    hideSiteError();
}

function hideSiteError() {
    const errorElement = document.getElementById('siteErrorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function hideSiteSuccess() {
    const successElement = document.getElementById('siteSuccessMessage');
    if (successElement) {
        successElement.style.display = 'none';
    }
}

function hideSiteMessages() {
    hideSiteError();
    hideSiteSuccess();
}

// Initialize site auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure auth system is loaded
    setTimeout(initializeSiteAuthentication, 100);
});

// Export functions for global use
window.handleSiteAuthClick = handleSiteAuthClick;