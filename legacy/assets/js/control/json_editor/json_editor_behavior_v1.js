/**
 * JSON Editor Component Behavior v1
 * Handles JSON file loading, editing, validation, and saving
 */

// Global state for the JSON editor
let jsonEditorState = {
    currentFile: null,
    originalContent: null,
    hasUnsavedChanges: false,
    isAuthenticated: false,
    validationTimer: null,
    isModalOpen: false
};

// Initialize JSON Editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('json-editor-component')) {
        initializeJsonEditor();
    }
});

// Also listen for dynamic component loading
document.addEventListener('componentLoaded', (event) => {
    console.log('📦 Component loaded event received:', event.detail);

    // Check if this is the JSON editor component
    if (event.detail.componentId === 'json-editor-anchor' ||
        (event.detail.config && event.detail.config.component === 'json_editor')) {
        console.log('🎯 JSON Editor component detected, initializing...');

        // Wait a moment for the DOM to be fully updated
        setTimeout(() => {
            if (document.getElementById('json-editor-component')) {
                initializeJsonEditor();
            } else {
                console.error('❌ JSON Editor component not found after loading');
            }
        }, 100);
    }
});

function initializeJsonEditor() {
    console.log('📝 JSON Editor: Initializing...');

    // Check authentication status
    checkAuthentication();

    // Bind event listeners
    bindEditorEvents();
    bindModalEvents();

    // Initialize file tree
    initializeFileTree();

    console.log('✅ JSON Editor: Ready');
}

function checkAuthentication() {
    if (window.siteAuth && window.siteAuth.isAuthenticated()) {
        jsonEditorState.isAuthenticated = true;
        enableEditorFeatures();
    } else {
        jsonEditorState.isAuthenticated = false;
        disableEditorFeatures();
    }
}

function bindEditorEvents() {
    // Editor actions
    const formatBtn = document.getElementById('formatJson');
    const validateBtn = document.getElementById('validateJson');
    const saveBtn = document.getElementById('saveJson');
    const textarea = document.getElementById('jsonTextarea');

    if (formatBtn) {
        formatBtn.addEventListener('click', formatJsonContent);
    }

    if (validateBtn) {
        validateBtn.addEventListener('click', () => {
            console.log('🔍 Validate button clicked');
            validateJsonContentManually();
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveJsonFile);
    }

    if (textarea) {
        textarea.addEventListener('input', onEditorChange);
        textarea.addEventListener('keydown', onEditorKeyDown);
        textarea.addEventListener('scroll', updateCursorPosition);
        textarea.addEventListener('click', updateCursorPosition);
        textarea.addEventListener('keyup', updateCursorPosition);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function bindModalEvents() {
    // Modal open buttons
    const openModalBtn = document.getElementById('openFileModal');
    console.log('🔍 Browse button found:', openModalBtn);

    if (openModalBtn) {
        console.log('✅ Binding click event to browse button');
        openModalBtn.addEventListener('click', () => {
            console.log('🖱️ Browse button clicked!');
            openFileModal();
        });
    } else {
        console.error('❌ Browse button not found!');
    }

    // Modal close elements
    const closeModalBtn = document.getElementById('closeFileModal');
    const modalBackdrop = document.querySelector('.control-json-editor-modal-backdrop');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeFileModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeFileModal);
    }

    // Modal actions
    const refreshBtn = document.getElementById('refreshFiles');
    const expandAllBtn = document.getElementById('expandAll');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshFileList);
    }

    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', toggleExpandAll);
    }

    // ESC key to close modal
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && jsonEditorState.isModalOpen) {
            closeFileModal();
        }
    });
}

function openFileModal() {
    console.log('📂 Opening file modal...');

    // Create modal if it doesn't exist, or ensure it's in document.body
    let modal = document.getElementById('fileBrowserModal');
    if (!modal || modal.parentNode !== document.body) {
        if (modal) {
            modal.remove(); // Remove existing modal
        }
        createFileModal(); // Create new modal in document.body
        modal = document.getElementById('fileBrowserModal');
    }

    if (modal) {
        console.log('Adding active class to modal');
        modal.classList.add('active');
        jsonEditorState.isModalOpen = true;

        console.log('Modal classes after adding active:', modal.className);

        // Load files dynamically from API
        loadFileListFromAPI();
    } else {
        console.error('❌ Modal element not found after creation!');
    }
}

function createFileModal() {
    const modalHTML = `
        <div id="fileBrowserModal" class="control-json-editor-file-browser-modal">
            <div class="control-json-editor-modal-backdrop"></div>
            <div class="control-json-editor-modal-content">
                <!-- Modal Header -->
                <div class="control-json-editor-modal-header">
                    <div class="control-json-editor-modal-title-area">
                        <h4 class="control-json-editor-modal-title">
                            <ion-icon name="folder-outline"></ion-icon>
                            Project Files
                        </h4>
                        <div class="control-json-editor-modal-stats">
                            <span class="control-json-editor-modal-stat-item">
                                <ion-icon name="document-text-outline"></ion-icon>
                                Loading...
                            </span>
                        </div>
                    </div>
                    <div class="control-json-editor-modal-actions">
                        <button id="refreshFiles" class="control-json-editor-action-btn" title="Refresh file list">
                            <ion-icon name="refresh-outline"></ion-icon>
                        </button>
                        <button id="expandAll" class="control-json-editor-action-btn" title="Expand all">
                            <ion-icon name="chevron-down-outline"></ion-icon>
                        </button>
                        <button id="closeFileModal" class="control-json-editor-close-modal-btn" title="Close">
                            <ion-icon name="close-outline"></ion-icon>
                        </button>
                    </div>
                </div>

                <!-- Modal Body -->
                <div class="control-json-editor-modal-body">
                    <div class="control-json-editor-file-tree">
                        <!-- Content will be loaded dynamically -->
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    bindModalEvents();
}

async function loadFileListFromAPI() {
    if (!jsonEditorState.isAuthenticated) {
        showEditorStatus('Authentication required', 'error');
        return;
    }

    try {
        showEditorStatus('Loading files...', 'info');

        // Get JWT token from global auth state
        const token = window.siteAuth ? window.siteAuth.getToken() : null;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await fetch('./api.php?endpoint=json_editor&action=browse', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to load files');
        }

        // Update modal with dynamic content
        updateFileModal(result.data);
        showEditorStatus(`Loaded ${result.data.total_files} files`, 'success');

    } catch (error) {
        console.error('Failed to load files:', error);
        showEditorStatus(`Error: ${error.message}`, 'error');
    }
}

function updateFileModal(data) {
    const modalBody = document.querySelector('.control-json-editor-modal-body .control-json-editor-file-tree');
    if (!modalBody) return;

    // Update stats
    const statsContainer = document.querySelector('.control-json-editor-modal-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <span class="control-json-editor-modal-stat-item">
                <ion-icon name="document-text-outline"></ion-icon>
                ${data.total_files} files
            </span>
            <span class="control-json-editor-modal-stat-item">
                <ion-icon name="layers-outline"></ion-icon>
                ${data.total_pages} pages
            </span>
        `;
    }

    // Build file tree HTML
    let html = '';
    Object.entries(data.grouped).forEach(([page, components]) => {
        html += `
            <div class="control-json-editor-page-group" data-page="${page}">
                <div class="control-json-editor-page-header" onclick="togglePageGroup(this)">
                    <ion-icon name="chevron-forward-outline" class="control-json-editor-expand-icon"></ion-icon>
                    <ion-icon name="folder-outline" class="control-json-editor-page-icon"></ion-icon>
                    <span class="control-json-editor-page-name">${page}</span>
                    <span class="control-json-editor-file-count">${Object.values(components).flat().length}</span>
                </div>
                <div class="control-json-editor-page-files">
        `;

        Object.entries(components).forEach(([component, files]) => {
            html += `
                <div class="control-json-editor-component-group">
                    <div class="control-json-editor-component-header">
                        <ion-icon name="cube-outline" class="control-json-editor-component-icon"></ion-icon>
                        <span class="control-json-editor-component-name">${component}</span>
                    </div>
            `;

            files.forEach(file => {
                html += `
                    <div class="control-json-editor-file-item" 
                         data-path="${file.path}"
                         data-page="${file.page}"
                         data-component="${file.component}"
                         onclick="selectJsonFile(this)">
                        <div class="control-json-editor-file-info">
                            <ion-icon name="document-outline" class="control-json-editor-file-icon"></ion-icon>
                            <span class="control-json-editor-file-name">${file.filename}</span>
                        </div>
                        <div class="control-json-editor-file-meta">
                            <span class="control-json-editor-file-size">${(file.size / 1024).toFixed(1)}KB</span>
                            ${!file.writable ? '<ion-icon name="lock-closed-outline" class="control-json-editor-readonly-icon" title="Read-only"></ion-icon>' : ''}
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        });

        html += '</div></div>';
    });

    modalBody.innerHTML = html;
}

function closeFileModal() {
    const modal = document.getElementById('fileBrowserModal');
    if (modal) {
        modal.classList.remove('active');
        jsonEditorState.isModalOpen = false;
    }
}

function initializeFileTree() {
    // Expand first page group by default
    const firstPageGroup = document.querySelector('.control-json-editor-page-group');
    if (firstPageGroup) {
        firstPageGroup.classList.add('expanded');
    }
}

// File tree functions
function togglePageGroup(headerElement) {
    const pageGroup = headerElement.closest('.control-json-editor-page-group');
    pageGroup.classList.toggle('expanded');
}

function toggleExpandAll() {
    const pageGroups = document.querySelectorAll('.control-json-editor-page-group');
    const isAnyExpanded = [...pageGroups].some(group => group.classList.contains('expanded'));

    pageGroups.forEach(group => {
        if (isAnyExpanded) {
            group.classList.remove('expanded');
        } else {
            group.classList.add('expanded');
        }
    });

    // Update button icon
    const expandBtn = document.getElementById('expandAll');
    const icon = expandBtn ? expandBtn.querySelector('ion-icon') : null;
    if (icon) {
        icon.setAttribute('name', isAnyExpanded ? 'chevron-down-outline' : 'chevron-up-outline');
    }
}

async function selectJsonFile(fileElement) {
    if (!jsonEditorState.isAuthenticated) {
        showEditorStatus('Please login to edit files', 'error');
        return;
    }

    // Check for unsaved changes
    if (jsonEditorState.hasUnsavedChanges) {
        const proceed = confirm('You have unsaved changes. Do you want to discard them?');
        if (!proceed) return;
    }

    const filePath = fileElement.dataset.path;
    if (!filePath) return;

    try {
        showEditorStatus('Loading file...', 'info');

        // Get JWT token
        const token = window.siteAuth ? window.siteAuth.getToken() : null;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await fetch(`./api.php?endpoint=json_editor&action=load&file=${encodeURIComponent(filePath)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to load file');
        }

        // Update editor
        jsonEditorState.currentFile = filePath;
        jsonEditorState.originalContent = result.content;
        jsonEditorState.hasUnsavedChanges = false;

        displayFileContent(result.content);
        updateFileInfo(result.file, filePath);
        enableEditorActions();

        closeFileModal();
        showEditorStatus(`Loaded ${result.file}`, 'success');

    } catch (error) {
        console.error('Failed to load file:', error);
        showEditorStatus(`Error: ${error.message}`, 'error');
    }
}

function displayFileContent(content) {
    const emptyState = document.getElementById('jsonEditorEmpty');
    const editorContainer = document.getElementById('jsonEditorContainer');
    const textarea = document.getElementById('jsonTextarea');

    if (emptyState) emptyState.style.display = 'none';
    if (editorContainer) editorContainer.style.display = 'flex';

    if (textarea) {
        textarea.value = content;
        updateDocumentStats();
        validateJsonContent();
        updateCursorPosition();
        updateLineNumbers();
    }
}

function updateLineNumbers() {
    const textarea = document.getElementById('jsonTextarea');
    if (!textarea) return;

    // Create line numbers container if it doesn't exist
    let lineNumbers = document.getElementById('editorLineNumbers');
    if (!lineNumbers) {
        lineNumbers = document.createElement('div');
        lineNumbers.id = 'editorLineNumbers';
        lineNumbers.className = 'control-json-editor-line-numbers';

        // Insert before textarea
        textarea.parentNode.insertBefore(lineNumbers, textarea);

        // Add event listeners for scroll sync
        textarea.addEventListener('scroll', syncLineNumbersScroll);
        textarea.addEventListener('input', updateLineNumbers);
    }

    const lines = textarea.value.split('\n');
    const lineCount = lines.length;

    // Generate line numbers
    let lineNumbersHTML = '';
    for (let i = 1; i <= lineCount; i++) {
        lineNumbersHTML += `<div class="line-number">${i}</div>`;
    }

    lineNumbers.innerHTML = lineNumbersHTML;

    // Sync scroll position
    syncLineNumbersScroll();
}

function syncLineNumbersScroll() {
    const textarea = document.getElementById('jsonTextarea');
    const lineNumbers = document.getElementById('editorLineNumbers');

    if (textarea && lineNumbers) {
        lineNumbers.scrollTop = textarea.scrollTop;
    }
}

function updateFileInfo(fileName, filePath) {
    const fileNameElement = document.getElementById('currentFileName');
    const filePathElement = document.getElementById('currentFilePath');

    if (fileNameElement) fileNameElement.textContent = fileName;
    if (filePathElement) filePathElement.textContent = filePath;
}

function enableEditorActions() {
    const buttons = ['formatJson', 'validateJson', 'saveJson'];
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = false;
    });
}

function disableEditorActions() {
    const buttons = ['formatJson', 'validateJson', 'saveJson'];
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
}

function enableEditorFeatures() {
    // Enable file loading and editing
    document.querySelectorAll('.control-json-editor-file-item').forEach(item => {
        item.style.pointerEvents = 'auto';
        item.style.opacity = '1';
    });
}

function disableEditorFeatures() {
    // Disable file loading and editing
    document.querySelectorAll('.control-json-editor-file-item').forEach(item => {
        item.style.pointerEvents = 'none';
        item.style.opacity = '0.6';
    });
    disableEditorActions();
}

// Editor functionality
function onEditorChange() {
    if (!jsonEditorState.currentFile) return;

    const textarea = document.getElementById('jsonTextarea');
    const hasChanges = textarea.value !== jsonEditorState.originalContent;

    jsonEditorState.hasUnsavedChanges = hasChanges;
    updateSaveButtonState();

    // Clear validation timer and set new one
    if (jsonEditorState.validationTimer) {
        clearTimeout(jsonEditorState.validationTimer);
    }

    jsonEditorState.validationTimer = setTimeout(() => {
        validateJsonContent();
        updateDocumentStats();
    }, 500);
}

function onEditorKeyDown(event) {
    const textarea = event.target;

    // Handle tab key for indentation
    if (event.key === 'Tab') {
        event.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Insert 2 spaces
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
    }
}

function updateCursorPosition() {
    const textarea = document.getElementById('jsonTextarea');
    const cursorElement = document.getElementById('cursorPosition');

    if (!textarea || !cursorElement) return;

    const content = textarea.value;
    const position = textarea.selectionStart;

    // Calculate line and column
    const lines = content.substring(0, position).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    cursorElement.textContent = `Ln ${line}, Col ${column}`;
}

function updateDocumentStats() {
    const textarea = document.getElementById('jsonTextarea');
    const statsElement = document.getElementById('documentStats');

    if (!textarea || !statsElement) return;

    const content = textarea.value;
    const lines = content.split('\n').length;
    const chars = content.length;
    const bytes = new Blob([content]).size;

    statsElement.textContent = `${lines} lines, ${chars} chars, ${bytes} bytes`;
}

function formatJsonContent() {
    const textarea = document.getElementById('jsonTextarea');
    if (!textarea) return;

    try {
        const parsed = JSON.parse(textarea.value);
        const formatted = JSON.stringify(parsed, null, 2);
        textarea.value = formatted;
        onEditorChange();
        showEditorStatus('JSON formatted successfully', 'success');
    } catch (error) {
        showEditorStatus(`Format error: ${error.message}`, 'error');
    }
}

function validateJsonContent() {
    const textarea = document.getElementById('jsonTextarea');
    const validationElement = document.getElementById('jsonValidation');

    if (!textarea || !validationElement) {
        console.warn('JSON Editor: Textarea or validation element not found');
        return false;
    }

    // If no content, show neutral state
    if (!textarea.value.trim()) {
        validationElement.textContent = 'No content to validate';
        validationElement.className = 'validation-status';
        return false;
    }

    try {
        JSON.parse(textarea.value);
        validationElement.textContent = 'Valid JSON';
        validationElement.className = 'validation-status valid';
        return true;
    } catch (error) {
        validationElement.textContent = `Invalid: ${error.message}`;
        validationElement.className = 'validation-status invalid';
        return false;
    }
}

function validateJsonContentManually() {
    const textarea = document.getElementById('jsonTextarea');

    if (!textarea) {
        showEditorStatus('Editor not available', 'error');
        return;
    }

    if (!textarea.value.trim()) {
        showEditorStatus('No content to validate', 'info');
        return;
    }

    const isValid = validateJsonContent();

    if (isValid) {
        showEditorStatus('JSON is valid ✓', 'success');
    } else {
        showEditorStatus('JSON validation failed - check the status bar for details', 'error');
    }
}

async function saveJsonFile() {
    if (!jsonEditorState.currentFile || !jsonEditorState.hasUnsavedChanges) return;

    const textarea = document.getElementById('jsonTextarea');
    if (!textarea) return;

    // Validate before saving
    if (!validateJsonContent()) {
        showEditorStatus('Cannot save invalid JSON', 'error');
        return;
    }

    showEditorStatus('Saving file...', 'loading');

    try {
        const response = await fetch('./api.php?endpoint=json_editor&action=save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file: jsonEditorState.currentFile,
                content: textarea.value
            })
        });

        const data = await response.json();

        if (data.success) {
            jsonEditorState.originalContent = textarea.value;
            jsonEditorState.hasUnsavedChanges = false;
            updateSaveButtonState();
            showEditorStatus('File saved successfully', 'success');
        } else {
            showEditorStatus(`Save failed: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error saving file:', error);
        showEditorStatus('Network error saving file', 'error');
    }
}

function updateSaveButtonState() {
    const saveBtn = document.getElementById('saveJson');
    if (!saveBtn) return;

    if (jsonEditorState.hasUnsavedChanges) {
        saveBtn.classList.add('has-changes');
        saveBtn.title = 'Save changes (Ctrl+S)';
    } else {
        saveBtn.classList.remove('has-changes');
        saveBtn.title = 'No changes to save';
    }
}

function refreshFileList() {
    // Reload the page to refresh file list
    window.location.reload();
}

function showEditorStatus(message, type = 'info') {
    const statusElement = document.getElementById('editorStatus');
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.className = `status-text ${type}`;

    // Clear status after 3 seconds for success/error messages
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusElement.textContent = 'Ready';
            statusElement.className = 'status-text';
        }, 3000);
    }
}

function handleKeyboardShortcuts(event) {
    // Only handle shortcuts when editor is active
    if (!jsonEditorState.currentFile) return;

    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 's':
                event.preventDefault();
                saveJsonFile();
                break;
            case 'f':
                event.preventDefault();
                formatJsonContent();
                break;
        }
    }
}

// Export for external use
window.jsonEditor = {
    loadFile: selectJsonFile,
    save: saveJsonFile,
    format: formatJsonContent,
    validate: validateJsonContent,
    getState: () => jsonEditorState,
    openModal: openFileModal,
    closeModal: closeFileModal
};

// Export initialization function
window.initializeJsonEditor = initializeJsonEditor;

// Make functions globally available for HTML onclick handlers
window.selectJsonFile = selectJsonFile;
window.togglePageGroup = togglePageGroup;