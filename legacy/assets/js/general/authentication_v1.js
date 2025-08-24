/**
 * Global Site Authentication System v1
 * Provides universal authentication functionality across the entire site
 * Interfaces with existing api.php auth endpoints
 */

// Global authentication state
let globalAuthState = {
    isAuthenticated: false,
    token: null,
    user: null,
    loginTime: null,
    sessionId: null,
    initializationComplete: false, // ✅ Flag to track when auth check is done
    listeners: []
};

// Authentication event listeners
const authEventListeners = new Set();

// Initialize global authentication system
function initializeGlobalAuth() {
    console.log('🔐 Global Auth: Initializing...');

    // Initialize secured navigation links as hidden by default
    initializeSecuredNavigationLinks();

    // Check existing session on page load
    checkExistingSession();

    // Set up event listeners for storage changes (cross-tab sync)
    window.addEventListener('storage', handleStorageChange);

    console.log('✅ Global Auth: Ready');
}

/**
 * Initialize secured navigation links as hidden by default
 */
function initializeSecuredNavigationLinks() {
    console.log('🔐 [Init] Initializing secured navigation links as hidden...');

    // Find all secured pages and hide their corresponding nav links
    const securedPages = document.querySelectorAll('main[secured]');

    securedPages.forEach(page => {
        const pageId = page.id;
        const navLink = document.querySelector(`nav a[href="#${pageId}"]`);

        if (navLink) {
            navLink.classList.add('secured-hidden');
            console.log('🔐 [Init] Hidden nav link for secured page:', pageId);
        }
    });

    console.log('🔐 [Init] Secured navigation initialization complete');
}

// Check for existing session
async function checkExistingSession() {
    try {
        const response = await fetch('./api.php?endpoint=auth&action=check_auth');
        const data = await response.json();

        if (data.success && data.authenticated) {
            // Session exists, update global state
            globalAuthState.isAuthenticated = true;
            globalAuthState.user = data.user || 'Admin';
            globalAuthState.sessionId = data.sessionId || null;
            globalAuthState.token = data.token || null; // ✅ Get JWT token from server
            globalAuthState.loginTime = new Date().toISOString();

            // Store in sessionStorage for cross-tab sync
            updateSessionStorage();

            console.log('✅ Existing session found:', globalAuthState.user);
            if (globalAuthState.token) {
                console.log('🔐 JWT token retrieved from session');
            } else {
                console.log('⚠️ No JWT token in session');
            }
        } else {
            // No session, ensure clean state
            clearAuthState();
        }
    } catch (error) {
        console.error('🔐 Error checking existing session:', error);
        clearAuthState();
    } finally {
        // ✅ Mark initialization as complete regardless of success/failure
        globalAuthState.initializationComplete = true;
        console.log('🔐 Authentication initialization complete');

        // ✅ Always scan and update secured elements on every page load
        console.log('🔐 Performing initial secured elements scan...');
        updateSecuredElementsState(globalAuthState.isAuthenticated);

        // ✅ Notify other auth components after secured elements are updated
        authEventListeners.forEach(callback => {
            try {
                callback(globalAuthState.isAuthenticated, globalAuthState);
            } catch (error) {
                console.error('🔐 Error in auth state listener:', error);
            }
        });
    }
}

// Login function
async function login(username, password) {
    console.log('🔐 Attempting login...');

    try {
        const response = await fetch('./api.php?endpoint=auth&action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            // Update global state
            globalAuthState.isAuthenticated = true;
            globalAuthState.user = data.user || username;
            globalAuthState.sessionId = data.sessionId || null;
            globalAuthState.token = data.token || null; // JWT token if provided
            globalAuthState.loginTime = new Date().toISOString();

            // Store in sessionStorage
            updateSessionStorage();

            console.log('✅ Login successful:', globalAuthState.user);

            // Simple approach: reload the page to refresh all components
            // This ensures all secured components get reloaded with the new auth token
            setTimeout(() => {
                window.location.reload();
            }, 1000); // Small delay for success message

            return { success: true, message: 'Login successful' };
        } else {
            console.log('❌ Login failed:', data.message);
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('🔐 Login error:', error);
        return { success: false, message: 'Connection error. Please try again.' };
    }
}

// Logout function
async function logout() {
    console.log('🔐 Logging out...');

    try {
        const response = await fetch('./api.php?endpoint=auth&action=logout', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            // Check if we're currently on a secured page before clearing state
            const currentPageElement = document.querySelector('main.visible[secured]');
            const needsRedirect = currentPageElement && currentPageElement.hasAttribute('secured');

            console.log('🔐 Current page is secured:', needsRedirect);

            // Clear global state
            clearAuthState();

            // Clear secured components
            invalidateSecuredComponents();

            // Notify all auth components
            notifyAuthStateChange(false);

            console.log('✅ Logout successful');

            // If we were on a secured page, redirect to an accessible page
            if (needsRedirect) {
                console.log('🔐 Redirecting from secured page after logout...');
                // Use a slight delay to ensure all logout cleanup is complete
                setTimeout(() => {
                    location.hash = '#profile';
                }, 100);
            } else {
                // If we're not on a secured page, just reload to refresh the UI
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }

            return { success: true, message: 'Logout successful' };
        } else {
            console.error('Logout failed:', data.message);
            return { success: false, message: data.message || 'Logout failed' };
        }
    } catch (error) {
        console.error('🔐 Logout error:', error);
        return { success: false, message: 'Logout error occurred' };
    }
}

// Clear authentication state
function clearAuthState() {
    globalAuthState = {
        isAuthenticated: false,
        token: null,
        user: null,
        loginTime: null,
        sessionId: null,
        initializationComplete: false, // ✅ Reset the flag when clearing state
        listeners: []
    };

    // Clear sessionStorage
    sessionStorage.removeItem('authState');
}

// Update sessionStorage for cross-tab sync
function updateSessionStorage() {
    const authData = {
        isAuthenticated: globalAuthState.isAuthenticated,
        user: globalAuthState.user,
        loginTime: globalAuthState.loginTime,
        sessionId: globalAuthState.sessionId,
        token: globalAuthState.token
    };

    sessionStorage.setItem('authState', JSON.stringify(authData));
}

// Handle storage changes for cross-tab sync
function handleStorageChange(event) {
    if (event.key === 'authState') {
        const newAuthData = event.newValue ? JSON.parse(event.newValue) : null;

        if (newAuthData) {
            // Sync global state with storage
            globalAuthState.isAuthenticated = newAuthData.isAuthenticated;
            globalAuthState.user = newAuthData.user;
            globalAuthState.loginTime = newAuthData.loginTime;
            globalAuthState.sessionId = newAuthData.sessionId;
            globalAuthState.token = newAuthData.token;
        } else {
            // Storage cleared, clear local state
            clearAuthState();
        }

        // Notify components of change
        notifyAuthStateChange(globalAuthState.isAuthenticated);
    }
}

// Toggle authentication (for universal auth buttons)
async function toggleAuth() {
    if (globalAuthState.isAuthenticated) {
        return await logout();
    } else {
        // Return false to indicate login modal should be shown
        return { success: false, showLogin: true };
    }
}

// Invalidate all secured components across all pages
function invalidateSecuredComponents() {
    console.log('🔐 Invalidating secured components...');

    // Find all secured components using DOM scanning
    const securedComponents = document.querySelectorAll('[data-secured="true"]');

    securedComponents.forEach(component => {
        // Clear component content
        component.innerHTML = '<div class="secured-component-cleared">Authentication required</div>';

        // Mark as invalidated
        component.setAttribute('data-auth-invalidated', 'true');
    });

    console.log(`🔐 Invalidated ${securedComponents.length} secured components`);
}

// Add auth state change listener
function addAuthStateListener(callback) {
    authEventListeners.add(callback);
}

// Remove auth state change listener
function removeAuthStateListener(callback) {
    authEventListeners.delete(callback);
}

// Notify all listeners of auth state change
function notifyAuthStateChange(isAuthenticated) {
    authEventListeners.forEach(callback => {
        try {
            callback(isAuthenticated, globalAuthState);
        } catch (error) {
            console.error('🔐 Error in auth state listener:', error);
        }
    });

    // Trigger auth state change listeners
    globalAuthState.listeners.forEach(listener => listener(isAuthenticated, globalAuthState));

    // Update secured elements state
    updateSecuredElementsState(isAuthenticated);
}

/**
 * Update the authenticated state of all secured elements
 * This function scans the DOM for elements with 'secured' attribute
 * and adds/removes 'authenticated' class based on current auth state
 */
function updateSecuredElementsState(isAuthenticated) {
    console.log('🔐 [Secured Elements] Updating secured elements state, authenticated:', isAuthenticated);

    // Find all secured pages and components (both secured attribute and data-secured attribute)
    const securedElements = document.querySelectorAll('[secured], [data-secured="true"]');
    console.log('🔐 [Secured Elements] Found', securedElements.length, 'secured elements');

    securedElements.forEach(element => {
        if (isAuthenticated) {
            element.classList.add('authenticated');
            console.log('🔐 [Secured Elements] Added authenticated class to:', element.id || element.tagName);
        } else {
            element.classList.remove('authenticated');
            console.log('🔐 [Secured Elements] Removed authenticated class from:', element.id || element.tagName);
        }
    });

    // Update corresponding navigation links for secured pages
    updateSecuredNavigationLinks(isAuthenticated);
}

/**
 * Update navigation links that correspond to secured pages
 */
function updateSecuredNavigationLinks(isAuthenticated) {
    console.log('🔐 [Secured Nav] Updating navigation links for secured pages, authenticated:', isAuthenticated);

    // Find all secured pages
    const securedPages = document.querySelectorAll('main[secured]');
    console.log('🔐 [Secured Nav] Found secured pages:', securedPages.length);

    securedPages.forEach(page => {
        const pageId = page.id;
        const navLink = document.querySelector(`nav a[href="#${pageId}"]`);

        console.log('🔐 [Secured Nav] Processing page:', pageId, 'navLink found:', !!navLink);

        if (navLink) {
            if (isAuthenticated) {
                navLink.classList.add('authenticated');
                navLink.classList.remove('secured-hidden'); // Show the link
                console.log('🔐 [Secured Nav] ✅ Enabled nav link for:', pageId);
            } else {
                navLink.classList.remove('authenticated');
                navLink.classList.add('secured-hidden'); // Hide the link
                console.log('🔐 [Secured Nav] ❌ Disabled nav link for:', pageId);
            }

            // Debug: show current classes
            console.log('🔐 [Secured Nav] Link classes for', pageId, ':', navLink.className);
        } else {
            console.warn('🔐 [Secured Nav] ⚠️ No nav link found for secured page:', pageId);
        }
    });
}

// Get current authentication state
function getAuthState() {
    return {...globalAuthState };
}

// Check if user is authenticated
function isAuthenticated() {
    return globalAuthState.isAuthenticated;
}

// Get current user
function getUser() {
    return globalAuthState.user;
}

// Get authentication token
function getToken() {
    return globalAuthState.token;
}

// Export global authentication API
window.siteAuth = {
    // Core functions
    login: login,
    logout: logout,
    toggleAuth: toggleAuth,

    // State functions
    isAuthenticated: isAuthenticated,
    getAuthState: getAuthState,
    getUser: getUser,
    getToken: getToken,

    // Event functions
    addAuthStateListener: addAuthStateListener,
    removeAuthStateListener: removeAuthStateListener,

    // Utility functions
    checkSession: checkExistingSession,
    invalidateSecured: invalidateSecuredComponents
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeGlobalAuth);

// Export initialization function
window.initializeGlobalAuth = initializeGlobalAuth;