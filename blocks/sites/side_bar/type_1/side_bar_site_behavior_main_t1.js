/* Side Bar Site - Main Behavior */
import "./behaviors/side_bar_site_behavior_theme_t1.js";
import "./behaviors/side_bar_site_behavior_navigation_t1.js";
import "./behaviors/side_bar_site_behavior_auto_navigation_t1.js";

/**
 * Mobile Menu Toggle Functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggleBtn');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (mobileMenuToggle && sidebarNav) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebarNav.classList.toggle('open');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
            
            // Update aria-expanded
            const isOpen = sidebarNav.classList.contains('open');
            mobileMenuToggle.setAttribute('aria-expanded', isOpen);
            
            // Change icon
            const icon = mobileMenuToggle.querySelector('ion-icon');
            if (icon) {
                icon.setAttribute('name', isOpen ? 'close-outline' : 'menu-outline');
            }
        });
    }
    
    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            if (sidebarNav) {
                sidebarNav.classList.remove('open');
            }
            sidebarOverlay.classList.remove('active');
            
            if (mobileMenuToggle) {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                const icon = mobileMenuToggle.querySelector('ion-icon');
                if (icon) {
                    icon.setAttribute('name', 'menu-outline');
                }
            }
        });
    }
    
    // Close sidebar when clicking a nav link (mobile)
    const navLinks = document.querySelectorAll('.sidebar-links .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                if (sidebarNav) {
                    sidebarNav.classList.remove('open');
                }
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
                if (mobileMenuToggle) {
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    const icon = mobileMenuToggle.querySelector('ion-icon');
                    if (icon) {
                        icon.setAttribute('name', 'menu-outline');
                    }
                }
            }
        });
    });
});
