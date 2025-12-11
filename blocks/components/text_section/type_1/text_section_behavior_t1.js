/**
 * Text Section Component Behavior
 */

window.textSectionData = window.textSectionData || {};

function initializeTextSection(componentElement) {
    const component = componentElement || document.querySelector('.text-section-component');
    if (!component) return;
    console.log('TextSection: Initialized', component.id);
}

function setTextSectionData(componentId, data) {
    window.textSectionData[componentId] = data;
    const component = document.getElementById(componentId);
    if (component) renderTextSection(component, data);
}

function renderTextSection(component, data) {
    if (!component || !data) return;

    const title = data.title || 'Overview';
    const content = data.content || '';
    const icon = data.icon || 'document-text-outline';

    // Set icon
    const iconEl = component.querySelector('.text-section__icon');
    if (iconEl) iconEl.setAttribute('name', icon);

    // Set title
    const titleEl = component.querySelector('.text-section__title');
    if (titleEl) titleEl.textContent = title;

    // Set content (supports HTML)
    const contentEl = component.querySelector('.text-section__content');
    if (contentEl) {
        contentEl.innerHTML = data.html ? data.content : formatTextContent(content);
    }
}

function formatTextContent(text) {
    if (!text) return '';
    
    // Convert markdown-like syntax to HTML
    let html = text
        // Escape HTML first if not already HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Inline code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Line breaks to paragraphs
        .split('\n\n').map(p => p.trim()).filter(p => p).map(p => `<p>${p}</p>`).join('');
    
    return html;
}

function handleTextSectionNavigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initializeTextSection(element);
            break;
        case 'hidden':
            element.classList.remove('nav-visible');
            element.classList.add('nav-hidden');
            setTimeout(() => {
                if (element.classList.contains('nav-hidden')) {
                    element.style.display = 'none';
                }
            }, 300);
            break;
        case 'scrollTo':
            element.scrollIntoView({ behavior: 'smooth' });
            break;
    }
    return true;
}

// Export to global scope
window.initializeTextSection = initializeTextSection;
window.setTextSectionData = setTextSectionData;
window.handleTextSectionNavigation = handleTextSectionNavigation;
