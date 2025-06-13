// Theme toggle logic for dark/light mode - Type 2

function setThemeClass(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    updateThemeIcon(theme);
}

function getPreferredTheme() {
    // Default to light theme unless 'dark' is in localStorage
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return 'dark';
    return 'light'; // Default is light
}

function applyTheme(theme) {
    setThemeClass(theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    // Check if .theme-dark is currently applied to body
    const isDarkMode = document.body.classList.contains('theme-dark');
    const nextTheme = isDarkMode ? 'light' : 'dark';
    applyTheme(nextTheme);
}

// Export to global scope
window.toggleTheme = toggleTheme;
console.log('Theme toggle function loaded and exported to window.toggleTheme');

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeToggleIcon');
    if (!icon) return;
    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function initTheme() {
    const theme = getPreferredTheme();
    setThemeClass(theme);
}

document.addEventListener('DOMContentLoaded', initTheme);