/**
 * AI Assistant Component Behavior - Type 1
 * Handles chat interactions, API calls, and navigation integration
 */

// Storage key for sessionStorage
const AI_ASSISTANT_STORAGE_KEY = 'ai_assistant_chat_history';

// Global state (avoid redeclaration on dynamic reload)
window.aiAssistantData = window.aiAssistantData || {
    title: 'Portfolio Assistant',
    placeholder: 'Ask me anything about this portfolio...',
    welcomeMessage: 'Hi! I\'m here to help you explore this portfolio. Ask me about skills, projects, experience, or anything else!',
    enableNavigation: true
};

// Load messages from sessionStorage or initialize empty
window.aiAssistantMessages = window.aiAssistantMessages || loadMessagesFromStorage();
window.aiAssistantOpen = window.aiAssistantOpen || false;

/**
 * Load messages from sessionStorage
 */
function loadMessagesFromStorage() {
    try {
        const stored = sessionStorage.getItem(AI_ASSISTANT_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                console.log('AI Assistant: Loaded', parsed.length, 'messages from session');
                return parsed;
            }
        }
    } catch (e) {
        console.warn('AI Assistant: Failed to load from sessionStorage', e);
    }
    return [];
}

/**
 * Save messages to sessionStorage
 */
function saveMessagesToStorage() {
    try {
        sessionStorage.setItem(AI_ASSISTANT_STORAGE_KEY, JSON.stringify(window.aiAssistantMessages));
    } catch (e) {
        console.warn('AI Assistant: Failed to save to sessionStorage', e);
    }
}

/**
 * Initialize the AI Assistant component
 */
function initializeAiAssistant(componentElement) {
    console.log('AI Assistant: Initializing component...');
    
    const container = componentElement || document.getElementById('site-ai-assistant') || document.querySelector('.ai-assistant-component');
    if (!container) {
        console.error('AI Assistant: Component container not found');
        return;
    }
    
    // Ensure the container has the correct class
    if (!container.classList.contains('ai-assistant-component')) {
        container.classList.add('ai-assistant-component');
    }

    // Get elements
    const toggle = container.querySelector('#ai-assistant-toggle');
    const panel = container.querySelector('#ai-assistant-panel');
    const closeBtn = container.querySelector('#ai-assistant-close');
    const form = container.querySelector('#ai-assistant-form');
    const input = container.querySelector('#ai-assistant-input');
    const messagesContainer = container.querySelector('#ai-assistant-messages');
    const sendBtn = container.querySelector('#ai-assistant-send');

    if (!toggle || !panel || !form || !input || !messagesContainer) {
        console.error('AI Assistant: Required elements not found');
        return;
    }

    // Toggle panel
    toggle.addEventListener('click', () => {
        window.aiAssistantOpen = !window.aiAssistantOpen;
        container.classList.toggle('open', window.aiAssistantOpen);
        panel.setAttribute('aria-hidden', !window.aiAssistantOpen);
        
        if (window.aiAssistantOpen) {
            input.focus();
            // Show welcome message if no messages yet
            if (window.aiAssistantMessages.length === 0) {
                addMessage('assistant', window.aiAssistantData.welcomeMessage);
            }
        }
    });

    // Close button
    closeBtn.addEventListener('click', () => {
        window.aiAssistantOpen = false;
        container.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        // Add user message
        addMessage('user', message);
        input.value = '';
        sendBtn.disabled = true;

        // Show typing indicator
        showTypingIndicator();

        try {
            // Send to API
            const response = await sendMessage(message);
            hideTypingIndicator();
            
            // Add assistant response
            addMessage('assistant', response.message, response.navigate);

            // Handle navigation if present
            if (response.navigate && window.aiAssistantData.enableNavigation) {
                handleNavigation(response.navigate);
            }
        } catch (error) {
            hideTypingIndicator();
            addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            console.error('AI Assistant: API error', error);
        }

        sendBtn.disabled = false;
    });

    // Restore previous state
    if (window.aiAssistantOpen) {
        container.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
    }

    // Render existing messages
    renderMessages();

    console.log('AI Assistant: Initialized successfully');
}

/**
 * Add a message to the conversation
 */
function addMessage(role, content, navigate = null) {
    const message = { role, content, navigate, timestamp: Date.now() };
    window.aiAssistantMessages.push(message);
    saveMessagesToStorage(); // Persist to sessionStorage
    renderMessage(message);
    scrollToBottom();
}

/**
 * Render a single message
 */
function renderMessage(message) {
    const messagesContainer = document.querySelector('#ai-assistant-messages');
    if (!messagesContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = `ai-assistant__message ai-assistant__message--${message.role}`;
    
    let html = message.role === 'assistant' ? parseMarkdown(message.content) : escapeHtml(message.content);
    
    // Add navigation link if present
    if (message.navigate && message.role === 'assistant') {
        const navLabel = getNavigationLabel(message.navigate);
        html += `<a href="#${message.navigate}" class="ai-assistant__nav-link" data-nav-target="${message.navigate}">
            <ion-icon name="arrow-forward-outline"></ion-icon>
            Go to ${navLabel}
        </a>`;
    }
    
    messageEl.innerHTML = html;
    
    // Add click handler for nav links
    const navLink = messageEl.querySelector('.ai-assistant__nav-link');
    if (navLink) {
        navLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavigation(message.navigate);
        });
    }
    
    messagesContainer.appendChild(messageEl);
}

/**
 * Render all messages
 */
function renderMessages() {
    const messagesContainer = document.querySelector('#ai-assistant-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    window.aiAssistantMessages.forEach(msg => renderMessage(msg));
    scrollToBottom();
}

/**
 * Clear chat history
 */
function clearAiAssistantHistory() {
    console.log('AI Assistant: Clearing chat history');
    window.aiAssistantMessages = [];
    // Clear from sessionStorage
    try {
        sessionStorage.removeItem(AI_ASSISTANT_STORAGE_KEY);
    } catch (e) {
        console.warn('AI Assistant: Failed to clear sessionStorage', e);
    }
    const messagesContainer = document.querySelector('#ai-assistant-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    // Show welcome message again
    addMessage('assistant', window.aiAssistantData.welcomeMessage);
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const messagesContainer = document.querySelector('#ai-assistant-messages');
    if (!messagesContainer) return;

    const typing = document.createElement('div');
    typing.className = 'ai-assistant__typing';
    typing.id = 'ai-assistant-typing';
    typing.innerHTML = `
        <span class="ai-assistant__typing-dot"></span>
        <span class="ai-assistant__typing-dot"></span>
        <span class="ai-assistant__typing-dot"></span>
    `;
    messagesContainer.appendChild(typing);
    scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const typing = document.querySelector('#ai-assistant-typing');
    if (typing) typing.remove();
}

/**
 * Scroll messages to bottom
 */
function scrollToBottom() {
    const messagesContainer = document.querySelector('#ai-assistant-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

/**
 * Send message to API with conversation history
 */
async function sendMessage(userMessage) {
    // Get last N messages for context (excluding the current one being sent)
    const maxHistoryMessages = 10;
    const historyForApi = window.aiAssistantMessages
        .slice(-maxHistoryMessages)
        .map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    
    const response = await fetch('api.php?endpoint=ai_assistant&action=chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ 
            message: userMessage,
            history: historyForApi
        })
    });

    if (!response.ok) {
        throw new Error('API request failed');
    }

    return await response.json();
}

/**
 * Handle navigation command
 */
function handleNavigation(target) {
    console.log('AI Assistant: Navigating to', target);
    
    // Use global navigator if available
    if (window.globalNavigator && typeof window.globalNavigator.navigate === 'function') {
        window.globalNavigator.navigate(target, 'visible', {});
    } else {
        // Fallback to hash navigation
        window.location.hash = target;
    }

    // Close panel on mobile after navigation
    if (window.innerWidth <= 480) {
        const container = document.querySelector('.ai-assistant-component');
        if (container) {
            window.aiAssistantOpen = false;
            container.classList.remove('open');
        }
    }
}

/**
 * Get human-readable label for navigation target
 */
function getNavigationLabel(target) {
    // Try to find the element and get a label
    const element = document.getElementById(target);
    if (element) {
        // Check for data-parent-tab
        const parentTab = element.getAttribute('data-parent-tab');
        if (parentTab) {
            return parentTab.charAt(0).toUpperCase() + parentTab.slice(1);
        }
    }
    
    // Fallback: convert ID to readable format
    return target
        .replace(/-main-container$/, '')
        .replace(/-container$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Set component data from PHP loader
 */
function setAiAssistantData(data) {
    console.log('AI Assistant: Setting data', data);
    window.aiAssistantData = { ...window.aiAssistantData, ...data };
    
    // Update placeholder if element exists
    const input = document.querySelector('#ai-assistant-input');
    if (input && data.placeholder) {
        input.placeholder = data.placeholder;
    }
    
    // Update title if element exists
    const title = document.querySelector('.ai-assistant__title');
    if (title && data.title) {
        title.textContent = data.title;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Parse simple markdown to HTML (bold, lists)
 */
function parseMarkdown(text) {
    if (!text) return '';
    // Escape HTML first
    let html = escapeHtml(text);
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Bullet lists: lines starting with - or *
    html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    // Clean up extra <br> around lists
    html = html.replace(/<br><ul>/g, '<ul>');
    html = html.replace(/<\/ul><br>/g, '</ul>');
    return html;
}

/**
 * Navigation handler for GlobalNavigator integration
 */
function handleAiAssistantNavigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initializeAiAssistant(element);
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
    }
    return true;
}

// Export functions to global scope
window.handleAiAssistantNavigation = handleAiAssistantNavigation;
window.setAiAssistantData = setAiAssistantData;
window.initializeAiAssistant = initializeAiAssistant;
window.clearAiAssistantHistory = clearAiAssistantHistory;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => initializeAiAssistant(), 100);
});

console.log('AI Assistant: Behavior script loaded');
