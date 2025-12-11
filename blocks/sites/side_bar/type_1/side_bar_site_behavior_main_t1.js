/**
 * Side Bar Site - Main Behavior
 * Handles mobile menu, navigation highlighting, and initialization
 */

// Mobile menu toggle
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobileMenuToggleBtn');
    const sidebar = document.querySelector('.sidebar-nav');
    
    if (!toggleBtn || !sidebar) return;
    
    // Create overlay
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.querySelector('.site-container').appendChild(overlay);
    }
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        toggleBtn.setAttribute('aria-expanded', sidebar.classList.contains('open'));
    });
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
    });
    
    // Close on nav link click (mobile)
    document.querySelectorAll('.sidebar-links .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });
    });
}

// Tab highlighting based on visible container
function updateTabHighlighting() {
    const visibleContainers = document.querySelectorAll('[data-parent-tab]:not([style*="display: none"])');
    const allLinks = document.querySelectorAll('.sidebar-links .nav-link');
    
    // Remove all active states
    allLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('data-active');
    });
    
    // Find visible container and highlight its tab
    visibleContainers.forEach(container => {
        if (container.classList.contains('nav-visible') || 
            (container.style.display !== 'none' && !container.classList.contains('nav-hidden'))) {
            const tabId = container.getAttribute('data-parent-tab');
            if (tabId) {
                const link = document.querySelector(`.sidebar-links .nav-link[data-tab-id="${tabId}"]`);
                if (link) {
                    link.classList.add('active');
                    link.setAttribute('data-active', 'true');
                }
            }
        }
    });
}

// Auto-navigation on page load
function handleAutoNavigation() {
    const siteContainer = document.querySelector('.site-container');
    const defaultNavRaw = siteContainer?.getAttribute('data-default-navigation');
    
    // If no hash, use default navigation
    if (!window.location.hash && defaultNavRaw) {
        try {
            const config = JSON.parse(defaultNavRaw);
            if (config.hash) {
                window.location.hash = config.hash;
            }
        } catch (e) {
            console.error('SideBar: Failed to parse default navigation', e);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    handleAutoNavigation();
    
    // Update highlighting on hash change
    window.addEventListener('hashchange', () => {
        setTimeout(updateTabHighlighting, 100);
    });
    
    // Initial highlighting
    setTimeout(updateTabHighlighting, 200);
});

// Listen for navigation events
document.addEventListener('navigation:complete', updateTabHighlighting);

console.log('SideBar Site: Main behavior loaded');
