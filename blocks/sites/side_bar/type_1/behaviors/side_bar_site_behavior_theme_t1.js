/**
 * Side Bar Site - Theme Behavior
 * Handles light/dark theme switching
 */
(function() {
    const THEME_KEY = 'site-theme';
    
    function getStoredTheme() {
        return localStorage.getItem(THEME_KEY);
    }
    
    function setStoredTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }
    
    function applyTheme(theme) {
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('theme-dark');
        } else {
            html.classList.remove('theme-dark');
        }
        updateThemeIcon(theme);
    }
    
    function updateThemeIcon(theme) {
        const icons = document.querySelectorAll('#themeToggleIcon, #mobileThemeIcon');
        icons.forEach(icon => {
            if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        });
    }
    
    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('theme-dark');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        setStoredTheme(newTheme);
    }
    
    function initTheme() {
        const stored = getStoredTheme();
        if (stored) {
            applyTheme(stored);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
        }
    }
    
    // Initialize on load
    initTheme();
    
    // Export to global
    window.toggleTheme = toggleTheme;
    window.setTheme = applyTheme;
})();
