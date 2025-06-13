// Login/Authentication behavior for Top Bar Site - Type 2

function handleSiteAuthClick() {
    console.log('Site authentication clicked - Type 2');
    
    // Simple authentication toggle for demo purposes
    const authBtn = document.getElementById('siteAuthBtn');
    const authIcon = authBtn.querySelector('.site-auth-icon');
    
    if (authIcon) {
        const isLoggedIn = authIcon.getAttribute('name') === 'log-out-outline';
        
        if (isLoggedIn) {
            // Log out
            authIcon.setAttribute('name', 'log-in-outline');
            authBtn.setAttribute('aria-label', 'Site authentication');
            console.log('User logged out');
        } else {
            // Log in
            authIcon.setAttribute('name', 'log-out-outline');
            authBtn.setAttribute('aria-label', 'Log out');
            console.log('User logged in');
        }
    }
}

// Make function globally available
window.handleSiteAuthClick = handleSiteAuthClick; 