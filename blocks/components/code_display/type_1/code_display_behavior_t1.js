/**
 * Code Display Component Behavior
 * Handles code rendering, syntax highlighting, and copy functionality
 */

// Global state
window.codeDisplayData = window.codeDisplayData || {};

/**
 * Initialize the Code Display component
 */
function initializeCodeDisplay(componentElement) {
    console.log('Code Display: Initializing...');
    
    const component = componentElement || document.querySelector('.code-display-component');
    if (!component) {
        console.error('Code Display: Component not found');
        return;
    }

    setupCopyButton(component);
}

/**
 * Setup copy button functionality
 */
function setupCopyButton(component) {
    const copyBtn = component.querySelector('.code-display__copy-btn');
    if (copyBtn && !copyBtn.hasAttribute('data-listener-attached')) {
        copyBtn.addEventListener('click', () => handleCopy(component, copyBtn));
        copyBtn.setAttribute('data-listener-attached', 'true');
    }
}

/**
 * Handle copy to clipboard
 */
async function handleCopy(component, btn) {
    // Get code from all code lines
    const codeLines = component.querySelectorAll('.code-display__code-line');
    if (!codeLines.length) return;

    const code = Array.from(codeLines).map(line => line.textContent).join('\n');
    
    try {
        await navigator.clipboard.writeText(code);
        
        // Show copied state
        btn.classList.add('copied');
        const icon = btn.querySelector('ion-icon');
        const span = btn.querySelector('span');
        
        if (icon) icon.setAttribute('name', 'checkmark-outline');
        if (span) span.textContent = 'Copied!';
        
        // Reset after 2 seconds
        setTimeout(() => {
            btn.classList.remove('copied');
            if (icon) icon.setAttribute('name', 'copy-outline');
            if (span) span.textContent = 'Copy';
        }, 2000);
        
    } catch (err) {
        console.error('Code Display: Failed to copy:', err);
    }
}

/**
 * Set code display data from PHP loader
 */
function setCodeDisplayData(componentId, data) {
    console.log('Code Display: Setting data for', componentId, data);
    window.codeDisplayData[componentId] = data;

    const component = document.getElementById(componentId);
    if (component) {
        renderCodeDisplay(component, data);
    }
}

/**
 * Render code display with data
 */
function renderCodeDisplay(component, data) {
    if (!component || !data) return;

    // Title
    const title = component.querySelector('.code-display__title');
    if (title) {
        title.textContent = data.title || 'Code Snippet';
    }

    // Language badge
    const language = component.querySelector('.code-display__language');
    if (language) {
        language.textContent = data.language || 'text';
    }

    // Code table with line numbers
    const codeTable = component.querySelector('.code-display__code-table');
    if (codeTable && data.code) {
        const lines = data.code.split('\n');
        const rows = lines.map((line, i) => {
            const highlightedLine = highlightSyntax(line, data.language);
            return `<div class="code-display__code-row">
                <div class="code-display__line-number">${i + 1}</div>
                <div class="code-display__code-line">${highlightedLine || '&nbsp;'}</div>
            </div>`;
        }).join('');
        codeTable.innerHTML = rows;
    }

    // Description
    const description = component.querySelector('.code-display__description');
    if (description) {
        description.textContent = data.description || '';
    }

    // Setup copy button
    setupCopyButton(component);
}

/**
 * Basic syntax highlighting
 */
function highlightSyntax(code, language) {
    if (!code) return '';
    
    // Escape HTML first
    let escaped = escapeHtml(code);
    
    // Apply language-specific highlighting
    const lang = (language || '').toLowerCase();
    
    if (['javascript', 'js', 'typescript', 'ts'].includes(lang)) {
        escaped = highlightJS(escaped);
    } else if (['python', 'py'].includes(lang)) {
        escaped = highlightPython(escaped);
    } else if (['json'].includes(lang)) {
        escaped = highlightJSON(escaped);
    } else if (['bash', 'shell', 'sh'].includes(lang)) {
        escaped = highlightBash(escaped);
    } else if (['sql'].includes(lang)) {
        escaped = highlightSQL(escaped);
    }
    
    return escaped;
}

/**
 * JavaScript/TypeScript highlighting
 */
function highlightJS(code) {
    // Keywords
    const keywords = /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|from|async|await|try|catch|throw|new|this|super|static|get|set|typeof|instanceof)\b/g;
    code = code.replace(keywords, '<span class="keyword">$1</span>');
    
    // Strings
    code = code.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="string">$&</span>');
    
    // Numbers
    code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
    
    // Comments
    code = code.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    
    // Functions
    code = code.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="function">$1</span>(');
    
    return code;
}

/**
 * Python highlighting
 */
function highlightPython(code) {
    // Keywords
    const keywords = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|lambda|yield|pass|break|continue|and|or|not|in|is|True|False|None|self)\b/g;
    code = code.replace(keywords, '<span class="keyword">$1</span>');
    
    // Strings
    code = code.replace(/(["'])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="string">$&</span>');
    code = code.replace(/("""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\')/g, '<span class="string">$&</span>');
    
    // Numbers
    code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
    
    // Comments
    code = code.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
    
    // Functions/decorators
    code = code.replace(/(@\w+)/g, '<span class="function">$1</span>');
    code = code.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="function">$1</span>(');
    
    return code;
}

/**
 * JSON highlighting
 */
function highlightJSON(code) {
    // Keys
    code = code.replace(/"([^"]+)":/g, '<span class="keyword">"$1"</span>:');
    
    // String values
    code = code.replace(/:\s*"([^"]*)"/g, ': <span class="string">"$1"</span>');
    
    // Numbers
    code = code.replace(/:\s*(\d+\.?\d*)/g, ': <span class="number">$1</span>');
    
    // Booleans and null
    code = code.replace(/:\s*(true|false|null)\b/g, ': <span class="keyword">$1</span>');
    
    return code;
}

/**
 * Bash/Shell highlighting
 */
function highlightBash(code) {
    // Comments
    code = code.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
    
    // Strings
    code = code.replace(/(["'])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="string">$&</span>');
    
    // Variables
    code = code.replace(/(\$\w+|\$\{[^}]+\})/g, '<span class="function">$1</span>');
    
    // Commands at start of line
    code = code.replace(/^(\s*)(\w+)/gm, '$1<span class="keyword">$2</span>');
    
    return code;
}

/**
 * SQL highlighting
 */
function highlightSQL(code) {
    // Keywords (case insensitive)
    const keywords = /\b(SELECT|FROM|WHERE|AND|OR|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|DROP|ALTER|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MAX|MIN|NULL|NOT|IN|LIKE|BETWEEN)\b/gi;
    code = code.replace(keywords, '<span class="keyword">$1</span>');
    
    // Strings
    code = code.replace(/(["'])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="string">$&</span>');
    
    // Numbers
    code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
    
    // Comments
    code = code.replace(/(--.*$)/gm, '<span class="comment">$1</span>');
    
    return code;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Navigation handler for the component
 */
function handleCodeDisplayNavigation(elementId, state, parameters = {}) {
    console.log('Code Display: Navigation handler called', { elementId, state, parameters });

    const element = document.getElementById(elementId);
    if (!element) {
        console.warn('Code Display: Element not found:', elementId);
        return false;
    }

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initializeCodeDisplay(element);
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
        default:
            console.warn('Code Display: Unknown state:', state);
            return false;
    }
    return true;
}

// Export to global scope
window.initializeCodeDisplay = initializeCodeDisplay;
window.setCodeDisplayData = setCodeDisplayData;
window.handleCodeDisplayNavigation = handleCodeDisplayNavigation;

console.log('Code Display: Behavior script loaded');
