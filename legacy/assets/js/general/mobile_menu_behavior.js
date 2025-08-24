function initializeMobileMenu() {
    const menuToggleBtn = document.getElementById('mobileMenuToggleBtn');
    const navLinksList = document.querySelector('.main-nav .nav-links-list');

    if (menuToggleBtn && navLinksList) {
        menuToggleBtn.addEventListener('click', () => {
            const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
            menuToggleBtn.setAttribute('aria-expanded', String(!isExpanded)); // Ensure string value
            navLinksList.classList.toggle('nav-ul-open');

            const icon = menuToggleBtn.querySelector('ion-icon');
            if (icon) {
                icon.setAttribute('name', !isExpanded ? 'close-outline' : 'menu-outline');
            }
        });

        navLinksList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinksList.classList.contains('nav-ul-open')) {
                    menuToggleBtn.setAttribute('aria-expanded', 'false');
                    navLinksList.classList.remove('nav-ul-open');
                    const icon = menuToggleBtn.querySelector('ion-icon');
                    if (icon) {
                        icon.setAttribute('name', 'menu-outline');
                    }
                }
            });
        });
        console.log('Mobile menu behavior initialized.');
    } else {
        console.warn('Mobile menu toggle button or nav links list not found for mobile_menu_behavior.js');
    }
}

document.addEventListener('DOMContentLoaded', initializeMobileMenu);