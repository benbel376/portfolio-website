/**
 * Text Section Component Behavior
 * Pure text block with markdown support
 * 
 * Markdown syntax supported:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - `inline code`
 * - [link text](url)
 * - {{highlight}}text{{/highlight}} for highlighted text
 * - \n\n for paragraph breaks
 * - \n for line breaks within paragraphs
 * - > blockquote
 * - - or * for bullet lists
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

    const content = data.content || '';

    // Set content (supports HTML or markdown)
    const contentEl = component.querySelector('.text-section__content');
    if (contentEl) {
        contentEl.innerHTML = data.html ? content : formatTextContent(content);
    }
}

function formatTextContent(text) {
    if (!text) return '';
    
    // Split into blocks by double newlines
    const blocks = text.split('\n\n').map(b => b.trim()).filter(b => b);
    
    let html = blocks.map(block => {
        // Check for blockquote
        if (block.startsWith('>')) {
            const quoteText = block.replace(/^>\s*/gm, '');
            return '<blockquote>' + formatInlineMarkdown(quoteText) + '</blockquote>';
        }
        
        // Check for bullet list
        if (block.match(/^[-*]\s/m)) {
            const items = block.split('\n')
                .filter(line => line.match(/^[-*]\s/))
                .map(line => '<li>' + formatInlineMarkdown(line.replace(/^[-*]\s/, '')) + '</li>')
                .join('');
            return '<ul>' + items + '</ul>';
        }
        
        // Regular paragraph - convert single newlines to <br>
        const paraContent = block.split('\n').map(line => formatInlineMarkdown(line)).join('<br>');
        return '<p>' + paraContent + '</p>';
    }).join('');
    
    return html;
}

function formatInlineMarkdown(text) {
    if (!text) return '';
    
    return text
        // Escape HTML entities
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Links: [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // Highlight: {{highlight}}text{{/highlight}}
        .replace(/\{\{highlight\}\}(.*?)\{\{\/highlight\}\}/g, '<mark>$1</mark>')
        // Bold: **text** or __text__
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        // Italic: *text* or _text_
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        // Inline code: `text`
        .replace(/`([^`]+)`/g, '<code>$1</code>');
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
