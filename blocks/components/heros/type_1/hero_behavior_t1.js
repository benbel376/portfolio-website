/**
 * Navigation state handler for hero component
 * Manages visibility state (hidden/visible)
 * Called by the global navigator system
 */
function handleHeroNavigation(heroId, state, parameters = {}) {
    const hero = document.getElementById(heroId);
    
    if (!hero) {
        console.warn(`Hero component not found: ${heroId}`);
        return false;
    }
    
    // Handle different navigation states
    switch (state) {
        case 'visible':
        case 'show':
            showHero(hero, parameters);
            break;
            
        case 'hidden':
        case 'hide':
            hideHero(hero, parameters);
            break;
            
        case 'toggle':
            toggleHero(hero, parameters);
            break;
            
        default:
            console.warn(`Unknown navigation state for hero: ${state}`);
            return false;
    }
    
    return true;
}

/**
 * Show the hero component
 */
function showHero(hero, parameters = {}) {
    hero.style.display = 'block';
    hero.classList.remove('nav-hidden');
    hero.classList.add('nav-visible');
    
    // Apply any transition effects if specified
    if (parameters.transition) {
        applyHeroTransition(hero, 'show', parameters.transition);
    }
}

/**
 * Hide the hero component
 */
function hideHero(hero, parameters = {}) {
    hero.classList.remove('nav-visible');
    hero.classList.add('nav-hidden');
    
    // Apply any transition effects if specified
    if (parameters.transition) {
        applyHeroTransition(hero, 'hide', parameters.transition);
    } else {
        // Default hide behavior
        hero.style.display = 'none';
    }
}

/**
 * Toggle the hero component visibility
 */
function toggleHero(hero, parameters = {}) {
    const isVisible = !hero.classList.contains('nav-hidden') && 
                     hero.style.display !== 'none';
    
    if (isVisible) {
        hideHero(hero, parameters);
    } else {
        showHero(hero, parameters);
    }
}

/**
 * Apply transition effects to hero component
 */
function applyHeroTransition(hero, action, transitionType) {
    switch (transitionType) {
        case 'fade':
            if (action === 'show') {
                hero.style.opacity = '0';
                hero.style.display = 'block';
                setTimeout(() => {
                    hero.style.transition = 'opacity 0.3s ease-in-out';
                    hero.style.opacity = '1';
                }, 10);
            } else {
                hero.style.transition = 'opacity 0.3s ease-in-out';
                hero.style.opacity = '0';
                setTimeout(() => {
                    hero.style.display = 'none';
                    hero.style.transition = '';
                }, 300);
            }
            break;
            
        default:
            // No transition, immediate show/hide
            if (action === 'hide') {
                hero.style.display = 'none';
            }
    }
}

// Export function to global scope for the navigation system
window.handleHeroNavigation = handleHeroNavigation;
