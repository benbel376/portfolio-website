function handleNavTestNavigation(elementId, state, parameters = {}) {
    const el = document.getElementById(elementId);
    if (!el) return false;
    switch (state) {
        case 'visible':
        case 'show':
            el.style.display = 'block';
            el.classList.remove('nav-hidden');
            el.classList.add('nav-visible');
            return true;
        case 'hidden':
        case 'hide':
            el.classList.remove('nav-visible');
            el.classList.add('nav-hidden');
            el.style.display = 'none';
            return true;
        default:
            return false;
    }
}

// Wire up test controls after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('.nav-test');
    if (!root) return;

    // Configure target ids (defaults assume placeholders exist)
    const samePageTargetId = root.getAttribute('data-same-target') || 'summary-placeholder';
    const samePageState = root.getAttribute('data-same-state') || 'visible';
    const samePageTab = root.getAttribute('data-same-tab') || 'about';

    const crossPageContainerId = root.getAttribute('data-cross-container') || 'skills-main-container';
    const crossPageTargetId = root.getAttribute('data-cross-target') || 'skills-frontend-placeholder';
    const crossPageState = root.getAttribute('data-cross-state') || 'scrollTo';
    const crossPageTab = root.getAttribute('data-cross-tab') || 'skills';

    // Link: same page
    const linkSame = document.getElementById('navTestLinkSame');
    if (linkSame) {
        // Include the container in the hash so the router knows the page context
        let containerId = root.getAttribute('data-same-container') || '';
        if (!containerId) {
            // Derive from DOM: find target and its parent container
            const targetEl = document.getElementById(samePageTargetId);
            const parentContainer = targetEl && targetEl.closest('[data-nav-handler="handleVerticalContainerNavigation"]');
            if (parentContainer && parentContainer.id) {
                containerId = parentContainer.id;
            }
        }
        const parts = [];
        if (containerId) parts.push(`${containerId}/visible`);
        parts.push(`${samePageTargetId}/${samePageState}`);
        linkSame.href = `#${parts.join('|')}.${samePageTab}`;

        // Force correct navigation on click regardless of initial href
        linkSame.addEventListener('click', (e) => {
            e.preventDefault();
            const targets = {};
            if (containerId) targets[containerId] = { state: 'visible', parameters: {} };
            targets[samePageTargetId] = { state: samePageState, parameters: {} };
            if (window.globalNavigator) {
                window.globalNavigator.navigateMultiple(targets, samePageTab);
            } else {
                window.location.hash = `${Object.entries(targets).map(([id,cfg])=>`${id}/${cfg.state}`).join('|')}.${samePageTab}`;
            }
        });
    }

    // Link: cross page (container + component)
    const linkCross = document.getElementById('navTestLinkCross');
    if (linkCross) {
        linkCross.href = `#${crossPageContainerId}/visible|${crossPageTargetId}/${crossPageState}.${crossPageTab}`;

        linkCross.addEventListener('click', (e) => {
            e.preventDefault();
            const targets = {};
            targets[crossPageContainerId] = { state: 'visible', parameters: {} };
            targets[crossPageTargetId] = { state: crossPageState, parameters: {} };
            if (window.globalNavigator) {
                window.globalNavigator.navigateMultiple(targets, crossPageTab);
            } else {
                window.location.hash = `${Object.entries(targets).map(([id,cfg])=>`${id}/${cfg.state}`).join('|')}.${crossPageTab}`;
            }
        });
    }

    // Button: same page
    const btnSame = document.getElementById('navTestBtnSame');
    if (btnSame) {
        btnSame.addEventListener('click', () => {
            if (window.globalNavigator) {
                window.globalNavigator.navigate(samePageTargetId, samePageState, {}, samePageTab);
            } else {
                window.location.hash = `${samePageTargetId}/${samePageState}.${samePageTab}`;
            }
        });
    }

    // Button: cross page
    const btnCross = document.getElementById('navTestBtnCross');
    if (btnCross) {
        btnCross.addEventListener('click', () => {
            if (window.globalNavigator) {
                const targets = {};
                targets[crossPageContainerId] = { state: 'visible', parameters: {} };
                targets[crossPageTargetId] = { state: crossPageState, parameters: {} };
                window.globalNavigator.navigateMultiple(targets, crossPageTab);
            } else {
                window.location.hash = `${crossPageContainerId}/visible|${crossPageTargetId}/${crossPageState}.${crossPageTab}`;
            }
        });
    }
});

window.handleNavTestNavigation = handleNavTestNavigation;


