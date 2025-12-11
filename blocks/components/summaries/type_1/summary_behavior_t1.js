// Minimal navigation handler to align with framework expectations
function handleSummaryNavigation(elementId, state, params = {}) {
	const element = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
	if (!element) return false;
	switch (state) {
		case 'visible':
			if (element.style.display === 'none') element.style.display = '';
			element.classList.add('nav-visible');
			element.classList.remove('nav-hidden');
			break;
		case 'hidden':
			element.classList.add('nav-hidden');
			element.classList.remove('nav-visible');
			element.style.display = 'none';
			break;
		default:
			break;
	}
	return true;
}

// Expose globally for GlobalNavigator discovery via data-nav-handler
if (typeof window !== 'undefined') {
	window.handleSummaryNavigation = handleSummaryNavigation;
}

// Optional automatic initializer; safe to call before or after inner HTML is present
function initSummaryComponent(elementOrId) {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;
    // If inner content not yet present (shell-only), bail quietly; dynamic loader will re-trigger later
    const hasMain = !!el.querySelector('.summary-component__main-content');
    if (!hasMain) return;
    // Place any one-time DOM adjustments or measurements here (idempotent)
}

if (typeof window !== 'undefined') {
    window.initSummaryComponent = initSummaryComponent;
    // Auto-init on static load for elements declaring this init hook
    window.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-init-hook="initSummaryComponent"]').forEach(el => {
            try { initSummaryComponent(el); } catch (e) { /* no-op */ }
        });
    });
}


