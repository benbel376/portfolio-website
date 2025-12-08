/**
 * JSON Files List Component Behavior
 * Displays and manages JSON definition files
 */

// Global state
window.jsonFilesListState = window.jsonFilesListState || {
    files: [],
    filteredFiles: [],
    currentFilter: 'all',
    searchQuery: '',
    selectedFile: null,
    currentEditingFile: null
};

/**
 * Initialize the component
 */
function initializeJsonFilesList(componentElement) {
    console.log('JSON Files List: Initializing...');
    
    const component = componentElement || document.querySelector('.json-files-list-component');
    if (!component) {
        console.error('JSON Files List: Component not found');
        return;
    }
    
    setupEventListeners(component);
    loadFiles();
}

/**
 * Setup event listeners
 */
function setupEventListeners(component) {
    // Folder dropdown
    const folderDropdown = component.querySelector('#json-files-folder');
    if (folderDropdown) {
        folderDropdown.addEventListener('change', (e) => {
            window.jsonFilesListState.currentFilter = e.target.value;
            filterFiles();
        });
    }
    
    // Search input
    const searchInput = component.querySelector('#json-files-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            window.jsonFilesListState.searchQuery = e.target.value.toLowerCase();
            filterFiles();
        });
    }
    
    // Edit button
    const editBtn = component.querySelector('#json-files-view-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const selected = window.jsonFilesListState.selectedFile;
            if (selected) {
                editFile(selected.path);
            }
        });
    }
    
    // Delete button
    const deleteBtn = component.querySelector('#json-files-delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const selected = window.jsonFilesListState.selectedFile;
            if (selected) {
                deleteFile(selected.path);
            }
        });
    }
    
    // Editor back button
    const backBtn = component.querySelector('#json-editor-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', closeEditor);
    }
    
    // Editor cancel button
    const cancelBtn = component.querySelector('#json-editor-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditor);
    }
    
    // Editor save button
    const saveBtn = component.querySelector('#json-editor-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveFile);
    }
    
}

/**
 * Render editor lines with line numbers
 */
function renderEditorLines(content) {
    const linesContainer = document.getElementById('json-editor-lines');
    
    if (!linesContainer) {
        console.error('Lines container not found');
        return;
    }
    
    try {
        const lines = content.split('\n');
        
        const html = lines.map((line, index) => {
            const lineNumber = index + 1;
            const escapedLine = escapeHtml(line) || '&nbsp;';
            
            return `
                <div class="json-files-list__editor-line">
                    <div class="json-files-list__editor-line-number">${lineNumber}</div>
                    <div class="json-files-list__editor-line-content" contenteditable="true" data-line="${lineNumber}">${escapedLine}</div>
                </div>
            `;
        }).join('');
        
        linesContainer.innerHTML = html;
        
        // Attach input listeners to all line contents
        setTimeout(() => {
            attachLineContentListeners();
        }, 100);
    } catch (error) {
        console.error('Error rendering editor lines:', error);
        linesContainer.innerHTML = '<div style="padding: 20px; color: red;">Error rendering editor</div>';
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Attach listeners to line content divs
 */
function attachLineContentListeners() {
    const lineContents = document.querySelectorAll('.json-files-list__editor-line-content');
    
    lineContents.forEach(content => {
        content.addEventListener('input', handleEditorInput);
    });
}

/**
 * Handle editor input
 */
function handleEditorInput() {
    // Validate JSON in real-time
    validateEditorJSON();
}

/**
 * Handle editor keydown
 */
function handleEditorKeydown(e) {
    // Allow default behavior for now
    // We'll handle special keys if needed later
}

/**
 * Get current editor content
 */
function getEditorContent() {
    const lineContents = document.querySelectorAll('.json-files-list__editor-line-content');
    const lines = Array.from(lineContents).map(content => content.textContent);
    return lines.join('\n');
}

/**
 * Validate JSON in editor
 */
function validateEditorJSON() {
    const validation = document.getElementById('json-editor-validation');
    
    if (!validation) return;
    
    const content = getEditorContent();
    
    try {
        JSON.parse(content);
        validation.style.display = 'none';
        validation.className = 'json-files-list__editor-validation';
    } catch (error) {
        validation.style.display = 'block';
        validation.className = 'json-files-list__editor-validation error';
        validation.textContent = `Invalid JSON: ${error.message}`;
    }
}

/**
 * Close editor and return to list
 */
function closeEditor() {
    const component = document.querySelector('.json-files-list-component');
    if (component) {
        component.classList.remove('editor-active');
    }
    window.jsonFilesListState.currentEditingFile = null;
}



/**
 * Save file
 */
async function saveFile() {
    const validation = document.getElementById('json-editor-validation');
    const filePath = window.jsonFilesListState.currentEditingFile;
    
    if (!filePath) return;
    
    const content = getEditorContent();
    
    // Validate JSON first
    try {
        JSON.parse(content);
    } catch (error) {
        if (validation) {
            validation.style.display = 'block';
            validation.className = 'json-files-list__editor-validation error';
            validation.textContent = `Cannot save: Invalid JSON - ${error.message}`;
        }
        return;
    }
    
    // Save file
    try {
        const response = await fetch('api.php?endpoint=definition_management&action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: filePath, content: content })
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (validation) {
                validation.style.display = 'block';
                validation.className = 'json-files-list__editor-validation success';
                validation.textContent = 'File saved successfully!';
            }
            
            // Close editor after short delay
            setTimeout(() => {
                closeEditor();
                loadFiles(); // Reload list
            }, 1000);
        } else {
            if (validation) {
                validation.style.display = 'block';
                validation.className = 'json-files-list__editor-validation error';
                validation.textContent = 'Error saving file: ' + data.error;
            }
        }
    } catch (error) {
        console.error('Error saving file:', error);
        if (validation) {
            validation.style.display = 'block';
            validation.className = 'json-files-list__editor-validation error';
            validation.textContent = 'Error saving file';
        }
    }
}

/**
 * Load files from API
 */
async function loadFiles() {
    const loading = document.getElementById('json-files-loading');
    const grid = document.getElementById('json-files-grid');
    const empty = document.getElementById('json-files-empty');
    
    if (loading) loading.style.display = 'block';
    if (grid) grid.style.display = 'none';
    if (empty) empty.style.display = 'none';
    
    try {
        const response = await fetch('api.php?endpoint=definition_management&action=list');
        const data = await response.json();
        
        if (data.success) {
            window.jsonFilesListState.files = data.files || [];
            filterFiles();
        } else {
            console.error('Failed to load files:', data.error);
            showEmpty();
        }
    } catch (error) {
        console.error('Error loading files:', error);
        showEmpty();
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

/**
 * Filter files based on current filter and search
 */
function filterFiles() {
    const { files, currentFilter, searchQuery } = window.jsonFilesListState;
    
    let filtered = files;
    
    // Apply type filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(file => file.type === currentFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(file => 
            file.name.toLowerCase().includes(searchQuery) ||
            file.path.toLowerCase().includes(searchQuery)
        );
    }
    
    window.jsonFilesListState.filteredFiles = filtered;
    renderFiles();
}

/**
 * Render files in list
 */
function renderFiles() {
    const list = document.getElementById('json-files-list');
    const empty = document.getElementById('json-files-empty');
    
    if (!list) return;
    
    const { filteredFiles } = window.jsonFilesListState;
    
    if (filteredFiles.length === 0) {
        list.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    list.style.display = 'block';
    if (empty) empty.style.display = 'none';
    
    list.innerHTML = filteredFiles.map(file => createListItem(file)).join('');
    
    // Attach event listeners to list items
    attachListItemListeners();
}

/**
 * Create list item HTML
 */
function createListItem(file) {
    const iconMap = {
        pages: 'document-text-outline',
        profiles: 'person-outline',
        sites: 'globe-outline'
    };
    
    const icon = iconMap[file.type] || 'document-outline';
    const lastModified = file.lastModified ? new Date(file.lastModified * 1000).toLocaleDateString() : 'Unknown';
    
    return `
        <div class="json-files-list__list-item" data-file-path="${file.path}">
            <ion-icon name="${icon}" class="json-files-list__item-icon"></ion-icon>
            <div class="json-files-list__item-info">
                <div class="json-files-list__item-name">${file.name}</div>
                <div class="json-files-list__item-meta">
                    <span class="json-files-list__item-type">${file.type}</span>
                    <span>Modified: ${lastModified}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners to list items
 */
function attachListItemListeners() {
    const listItems = document.querySelectorAll('.json-files-list__list-item');
    
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            // Deselect all
            listItems.forEach(i => i.classList.remove('selected'));
            
            // Select this one
            item.classList.add('selected');
            
            // Update selected file in state
            const filePath = item.getAttribute('data-file-path');
            const file = window.jsonFilesListState.filteredFiles.find(f => f.path === filePath);
            window.jsonFilesListState.selectedFile = file;
            
            // Enable action buttons
            updateActionButtons();
        });
    });
}

/**
 * Update action buttons state
 */
function updateActionButtons() {
    const editBtn = document.getElementById('json-files-view-btn');
    const deleteBtn = document.getElementById('json-files-delete-btn');
    
    const hasSelection = window.jsonFilesListState.selectedFile !== null;
    
    if (editBtn) editBtn.disabled = !hasSelection;
    if (deleteBtn) deleteBtn.disabled = !hasSelection;
}

/**
 * Edit file (open in JSON editor)
 */
async function editFile(filePath) {
    console.log('Edit file:', filePath);
    
    const component = document.querySelector('.json-files-list-component');
    const editorTitle = document.getElementById('json-editor-title');
    const linesContainer = document.getElementById('json-editor-lines');
    const validation = document.getElementById('json-editor-validation');
    
    if (!component || !linesContainer) return;
    
    // Show loading
    linesContainer.innerHTML = '<div style="padding: 20px;">Loading...</div>';
    
    // Slide to editor
    component.classList.add('editor-active');
    
    // Update title
    const fileName = filePath.split('/').pop();
    if (editorTitle) editorTitle.textContent = `Edit: ${fileName}`;
    
    // Store current file path
    window.jsonFilesListState.currentEditingFile = filePath;
    
    // Load file content
    try {
        const response = await fetch('api.php?endpoint=definition_management&action=read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: filePath })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Format JSON nicely
            const formatted = JSON.stringify(JSON.parse(data.content), null, 2);
            
            // Render editor lines
            renderEditorLines(formatted);
            
            // Hide validation
            if (validation) validation.style.display = 'none';
        } else {
            linesContainer.innerHTML = '<div style="padding: 20px; color: red;">Error loading file: ' + data.error + '</div>';
        }
    } catch (error) {
        console.error('Error loading file:', error);
        linesContainer.innerHTML = '<div style="padding: 20px; color: red;">Error loading file</div>';
    }
}

/**
 * Delete file
 */
async function deleteFile(filePath) {
    const fileName = filePath.split('/').pop();
    
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch('api.php?endpoint=definition_management&action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: filePath })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('File deleted successfully');
            window.jsonFilesListState.selectedFile = null;
            updateActionButtons();
            loadFiles(); // Reload list
        } else {
            alert('Failed to delete file: ' + data.error);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file');
    }
}

/**
 * Show empty state
 */
function showEmpty() {
    const loading = document.getElementById('json-files-loading');
    const grid = document.getElementById('json-files-grid');
    const empty = document.getElementById('json-files-empty');
    
    if (loading) loading.style.display = 'none';
    if (grid) grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
}

/**
 * Navigation handler
 */
function handleJsonFilesListNavigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;
    
    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.add('nav-visible');
            element.classList.remove('nav-hidden');
            // Reload files when component becomes visible
            loadFiles();
            break;
        case 'hidden':
            element.classList.add('nav-hidden');
            element.classList.remove('nav-visible');
            setTimeout(() => {
                if (element.classList.contains('nav-hidden')) {
                    element.style.display = 'none';
                }
            }, 300);
            break;
    }
    return true;
}

// Export to global scope
window.handleJsonFilesListNavigation = handleJsonFilesListNavigation;
window.initializeJsonFilesList = initializeJsonFilesList;

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const component = document.querySelector('.json-files-list-component');
    if (component) {
        initializeJsonFilesList(component);
    }
});

console.log('JSON Files List: Behavior script loaded');
