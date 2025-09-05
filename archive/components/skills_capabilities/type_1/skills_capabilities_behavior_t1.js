export function handleSkillsCapabilitiesNavigation(elementId, state, params = {}) {
    const el = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
    if (!el) return false;
    switch (state) {
        case 'visible':
            if (el.style.display === 'none') el.style.display = '';
            el.classList.add('nav-visible');
            el.classList.remove('nav-hidden');
            break;
        case 'hidden':
            el.classList.add('nav-hidden');
            el.classList.remove('nav-visible');
            el.style.display = 'none';
            break;
        default: break;
    }
    return true;
}

export function initSkillsCapabilities(elementOrId) {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;
    const list = el.querySelector('.skills-capabilities__list');
    if (!list) return;

    // Modal handlers
    const modal = el.querySelector('[data-modal-root]');
    const modalCloseEls = el.querySelectorAll('[data-modal-close]');
    const titleEl = el.querySelector('.cap-modal__title');
    const descEl = el.querySelector('.cap-modal__description');
    const linkEl = el.querySelector('.cap-modal__link');

    function openModal(payload) {
        if (!modal) return;
        titleEl.textContent = payload.title || '';
        descEl.textContent = payload.description || '';
        if (payload.link && payload.link.href) {
            linkEl.href = payload.link.href;
            linkEl.textContent = payload.link.label || 'Open project';
            linkEl.style.display = '';
        } else if (linkEl) {
            linkEl.style.display = 'none';
        }
        modal.hidden = false;
        modal.querySelector('.cap-modal__close')?.focus();
    }

    function closeModal() { if (modal) modal.hidden = true; }

    modalCloseEls.forEach(btn => btn.addEventListener('click', closeModal));
    modal?.addEventListener('click', (e) => { if (e.target?.hasAttribute('data-modal-close')) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // Item click handlers
    list.querySelectorAll('.skills-capabilities__item').forEach(item => {
        item.addEventListener('click', () => {
            const payload = {
                title: item.getAttribute('data-title') || '',
                description: item.getAttribute('data-description') || '',
                link: JSON.parse(item.getAttribute('data-link') || 'null') || null
            };
            openModal(payload);
        });
    });
}

if (typeof window !== 'undefined') {
    window.handleSkillsCapabilitiesNavigation = handleSkillsCapabilitiesNavigation;
    window.initSkillsCapabilities = initSkillsCapabilities;
    window.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-init-hook="initSkillsCapabilities"]').forEach(el => {
            try { initSkillsCapabilities(el); } catch (e) {}
        });
    });
}


