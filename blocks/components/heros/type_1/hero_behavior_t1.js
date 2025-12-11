function handleHeroNavigation(elementId, state) {
    const el = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
    if (!el) return false;
    switch (state) {
        case 'visible':
        case 'show':
            el.style.display = 'block';
            el.classList.add('nav-visible');
            el.classList.remove('nav-hidden');
            break;
        case 'hidden':
        case 'hide':
            el.classList.add('nav-hidden');
            el.classList.remove('nav-visible');
            el.style.display = 'none';
            break;
        default:
            break;
    }
    return true;
}

if (typeof window !== 'undefined') {
    window.handleHeroNavigation = handleHeroNavigation;
}


