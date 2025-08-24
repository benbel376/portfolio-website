/**
 * Dynamic component loading system
 * Handles loading components via the API endpoint
 */

// Function to load components based on URL parameters
async function loadComponents(args) {
    // Wait for authentication to complete before loading secured components
    await waitForAuthentication();

    // Load from URL args if available
    if (args && args.length) {
        const urlComponents = parseNavigationArgs(args);
        await loadFromConfig(urlComponents);
    }

    // Only load components on the visible page
    // Find the currently visible page
    const visiblePage = document.querySelector('main.visible');
    if (!visiblePage) {
        console.log('No visible page found, skipping component loading');
        return;
    }

    // Find components only within the visible page
    const fallbackComponents = visiblePage.querySelectorAll(
        '[data-dynamic][data-fallback]:not([data-loaded])'
    );

    if (fallbackComponents.length > 0) {
        console.log(`Found ${fallbackComponents.length} fallback components to load on visible page`);
        await loadFallbacks(fallbackComponents);
    } else {
        console.log('No dynamic components found on visible page');
    }

    console.log('Components loaded for current page');
}

// Wait for authentication system to be ready
async function waitForAuthentication() {
    console.log('🔐 [waitForAuthentication] Starting authentication wait...');

    // If no auth system, proceed immediately
    if (!window.siteAuth) {
        console.log('🔐 [waitForAuthentication] No auth system found, proceeding immediately');
        return;
    }

    console.log('🔐 [waitForAuthentication] Auth system found, checking state...');

    // Check if auth initialization is complete by waiting for checkExistingSession
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait

    while (attempts < maxAttempts) {
        const authState = window.siteAuth.getAuthState ? window.siteAuth.getAuthState() : null;
        console.log(`🔐 [waitForAuthentication] Attempt ${attempts + 1}, Auth state:`, authState);

        // ✅ Check the initializationComplete flag instead of isAuthenticated
        if (authState && authState.initializationComplete === true) {
            console.log('🔐 [waitForAuthentication] Authentication check complete!');
            console.log('🔐 [waitForAuthentication] Is authenticated:', authState.isAuthenticated);
            console.log('🔐 [waitForAuthentication] Token available:', !!authState.token);
            return;
        }

        // Wait 100ms before checking again
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    console.warn('🔐 [waitForAuthentication] Authentication check timeout, proceeding anyway');
}

// Parse navigation arguments from URL
function parseNavigationArgs(rawArgs) {
    if (!rawArgs || typeof rawArgs !== 'object') return [];

    return rawArgs.map(arg => {
        const [componentId, config] = Object.entries(arg)[0];
        return { componentId, config };
    });
}

// Load components specified in URL
async function loadFromConfig(components) {
    for (const { componentId, config }
        of components) {
        const container = document.getElementById(componentId);
        if (!container) continue;

        // Check if the component is on the visible page
        const visiblePage = document.querySelector('main.visible');
        if (!visiblePage || !visiblePage.contains(container)) {
            console.log(`Skipping component ${componentId} as it's not on the visible page`);
            continue;
        }

        // ✅ SECURITY CHECK: Check if component should be loaded
        if (!shouldLoadComponent(container)) {
            console.log(`🔐 [Component Security] Skipping secured component: ${componentId}`);
            // Show access denied message in the component
            showSecuredComponentPlaceholder(container);
            continue;
        }

        try {
            container.innerHTML = await fetchComponent(config);
            container.dataset.loaded = 'true';
            console.log(`Loaded component: ${componentId}`);

            // Dispatch a custom event when a component is loaded
            dispatchComponentLoadedEvent(componentId, config);
        } catch (error) {
            console.error(`Error loading component ${componentId}:`, error);
        }
    }
}

// Load fallback content for components with data-fallback attribute
async function loadFallbacks(containers) {
    for (const container of containers) {
        // ✅ SECURITY CHECK: Check if component should be loaded
        if (!shouldLoadComponent(container)) {
            console.log(`🔐 [Component Security] Skipping secured component: ${container.id}`);
            // Show access denied message in the component
            showSecuredComponentPlaceholder(container);
            continue;
        }

        try {
            console.log(`Loading fallback for: ${container.id}, data:`, container.dataset.fallback);
            const config = JSON.parse(container.dataset.fallback);
            container.innerHTML = await fetchComponent(config);
            container.dataset.loaded = 'true';
            console.log(`Loaded fallback for: ${container.id}`);

            // Dispatch a custom event when a component is loaded
            dispatchComponentLoadedEvent(container.id, config);
        } catch (error) {
            console.error(`Error loading fallback for ${container.id}:`, error);
            console.error(error);
        }
    }
}

/**
 * Check if a component should be loaded based on its security attributes
 * @param {HTMLElement} element - The component element to check
 * @returns {boolean} - True if component should be loaded, false if access denied
 */
function shouldLoadComponent(element) {
    console.log('🔐 [Component Security] Checking component access for:', element.id);
    console.log('🔐 [Component Security] Element attributes:', {
        secured: element.hasAttribute('secured'),
        dataSecured: element.getAttribute('data-secured'),
        classes: element.className
    });

    // Check if the component is secured
    if (element.hasAttribute('secured') || element.getAttribute('data-secured') === 'true') {
        console.log('🔐 [Component Security] Component is secured, checking authentication...');

        // Check if the component has the authenticated class
        if (!element.classList.contains('authenticated')) {
            console.log('🔐 [Component Security] ❌ ACCESS DENIED - Component is secured but not authenticated');
            console.log('🔐 [Component Security] Current classes:', element.className);
            return false;
        } else {
            console.log('🔐 [Component Security] ✅ Access granted - Component is secured and authenticated');
            console.log('🔐 [Component Security] Current classes:', element.className);
            return true;
        }
    } else {
        console.log('🔐 [Component Security] ✅ Access granted - Component is not secured');
        return true;
    }
}

/**
 * Show a placeholder message for secured components that cannot be loaded
 * @param {HTMLElement} container - The component container
 */
function showSecuredComponentPlaceholder(container) {
    console.log('🔐 [Component Security] Showing secured component placeholder for:', container.id);

    const placeholderHTML = `
        <div class="secured-component-placeholder">
            <ion-icon name="lock-closed-outline" class="secured-placeholder-icon"></ion-icon>
            <p class="secured-placeholder-title">Authentication Required</p>
            <p class="secured-placeholder-subtitle">Please log in to access this content</p>
        </div>
    `;

    container.innerHTML = placeholderHTML;
    container.dataset.securityBlocked = 'true';
}

// Dispatch a custom event when a component is loaded
function dispatchComponentLoadedEvent(componentId, config) {
    document.dispatchEvent(new CustomEvent('componentLoaded', {
        detail: {
            componentId: componentId,
            config: config
        }
    }));
}

// Fetch component HTML from API endpoint
async function fetchComponent({ loader, content, page, component }) {
    console.log('🔐 [fetchComponent] Starting component fetch...');
    console.log('🔐 [fetchComponent] Parameters:', { loader, content, page, component });

    let apiUrl;

    // Check if we have page and component parameters (new format)
    if (page && component) {
        // Use the component loader endpoint with page/component structure
        apiUrl = `./api.php?endpoint=loaders&loader=component&page=${encodeURIComponent(page)}&component=${encodeURIComponent(component)}`;
        if (content) {
            apiUrl += `&content=${encodeURIComponent(content)}`;
        }
    } else {
        // Fallback to old format for backward compatibility
        apiUrl = `./api.php?endpoint=loaders&loader=${encodeURIComponent(loader)}&content=${encodeURIComponent(content)}`;
    }

    // Always add authentication token if available
    const token = window.siteAuth && window.siteAuth.getToken ? window.siteAuth.getToken() : null;
    console.log('🔐 [fetchComponent] Auth system available:', !!window.siteAuth);
    console.log('🔐 [fetchComponent] getToken function available:', !!(window.siteAuth && window.siteAuth.getToken));
    console.log('🔐 [fetchComponent] Token retrieved:', token ? 'YES (hidden for security)' : 'NO');

    if (token) {
        apiUrl += `&token=${encodeURIComponent(token)}`;
        console.log('🔐 [fetchComponent] Token added to URL');
    } else {
        console.log('🔐 [fetchComponent] No token available, proceeding without token');
    }

    console.log(`🔐 [fetchComponent] Final URL (token hidden):`, apiUrl.replace(/&token=[^&]+/, '&token=***'));

    const response = await fetch(apiUrl);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    // Parse the JSON response
    const responseText = await response.text();
    try {
        const jsonResponse = JSON.parse(responseText);
        return jsonResponse.html || responseText;
    } catch (error) {
        // If not JSON, return the text directly
        return responseText;
    }
}

// Make functions globally available
window.loadComponents = loadComponents;