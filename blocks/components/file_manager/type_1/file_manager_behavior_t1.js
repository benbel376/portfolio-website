/**
 * File Manager Component Behavior
 * Full-featured file management for definitions folder
 */

// Global state
window.fileManagerState = window.fileManagerState || {
    currentPath: 'definitions',
    files: [],
    filteredFiles: [],
    selectedFiles: [],
    viewMode: 'list',
    filter: 'all',
    searchQuery: '',
    currentEditingFile: null,
    folderTree: null,
    pendingUploads: []
};

/**
 * Initialize the File Manager component
 */
function initializeFileManager(componentElement) {
    console.log('File Manager: Initializing...');
    
    const component = componentElement || document.querySelector('.file-manager-component');
    if (!component) {
        console.error('File Manager: Component not found');
        return;
    }
    
    // Prevent re-initialization of event listeners, but always refresh data
    if (component.hasAttribute('data-fm-initialized')) {
        console.log('File Manager: Already initialized, refreshing data...');
        // Reload both tree and files (user may have just authenticated)
        loadFolderTree();
        loadFiles(window.fileManagerState.currentPath);
        return;
    }
    
    component.setAttribute('data-fm-initialized', 'true');
    setupEventListeners(component);
    loadFolderTree();
    loadFiles(window.fileManagerState.currentPath);
}

/**
 * Setup all event listeners
 */
function setupEventListeners(component) {
    // Header buttons
    const newFolderBtn = component.querySelector('#fm-new-folder-btn');
    const newFileBtn = component.querySelector('#fm-new-file-btn');
    const uploadBtn = component.querySelector('#fm-upload-btn');
    
    if (newFolderBtn) newFolderBtn.addEventListener('click', () => showNewModal('folder'));
    if (newFileBtn) newFileBtn.addEventListener('click', () => showNewModal('file'));
    if (uploadBtn) uploadBtn.addEventListener('click', showUploadModal);
    
    // Search
    const searchInput = component.querySelector('#fm-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            window.fileManagerState.searchQuery = e.target.value.toLowerCase();
            filterFiles();
        });
    }
    
    // Filter dropdown
    const filterSelect = component.querySelector('#fm-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            window.fileManagerState.filter = e.target.value;
            filterFiles();
        });
    }
    
    // View toggle
    const listViewBtn = component.querySelector('#fm-view-list');
    const gridViewBtn = component.querySelector('#fm-view-grid');
    
    if (listViewBtn) listViewBtn.addEventListener('click', () => setViewMode('list'));
    if (gridViewBtn) gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    
    // Editor buttons
    const editorBack = component.querySelector('#fm-editor-back');
    const editorCancel = component.querySelector('#fm-editor-cancel');
    const editorSave = component.querySelector('#fm-editor-save');
    const editorFormat = component.querySelector('#fm-editor-format');
    const editorValidate = component.querySelector('#fm-editor-validate');
    
    if (editorBack) editorBack.addEventListener('click', closeEditor);
    if (editorCancel) editorCancel.addEventListener('click', closeEditor);
    if (editorSave) editorSave.addEventListener('click', saveFile);
    if (editorFormat) editorFormat.addEventListener('click', formatJSON);
    if (editorValidate) editorValidate.addEventListener('click', validateJSON);
    
    // Close editor when clicking backdrop
    const editorPanel = component.querySelector('#fm-editor-panel');
    if (editorPanel) {
        editorPanel.addEventListener('click', (e) => {
            if (e.target === editorPanel) {
                closeEditor();
            }
        });
    }
    
    // Editor textarea
    const textarea = component.querySelector('#fm-editor-textarea');
    if (textarea) {
        textarea.addEventListener('input', handleEditorInput);
        textarea.addEventListener('scroll', syncGutterScroll);
        textarea.addEventListener('keydown', handleEditorKeydown);
    }
    
    setupModalListeners(component);
    setupContextMenu(component);
    document.addEventListener('click', hideContextMenu);
}

/**
 * Setup modal event listeners
 */
function setupModalListeners(component) {
    // Upload modal
    const uploadClose = component.querySelector('#fm-upload-close');
    const uploadCancel = component.querySelector('#fm-upload-cancel');
    const uploadConfirm = component.querySelector('#fm-upload-confirm');
    const fileInput = component.querySelector('#fm-file-input');
    const dropzone = component.querySelector('#fm-dropzone');
    
    if (uploadClose) uploadClose.addEventListener('click', hideUploadModal);
    if (uploadCancel) uploadCancel.addEventListener('click', hideUploadModal);
    if (uploadConfirm) uploadConfirm.addEventListener('click', uploadFiles);
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    
    if (dropzone) {
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('drop', handleDrop);
    }
    
    // New file/folder modal
    const newClose = component.querySelector('#fm-new-close');
    const newCancel = component.querySelector('#fm-new-cancel');
    const newConfirm = component.querySelector('#fm-new-confirm');
    
    if (newClose) newClose.addEventListener('click', hideNewModal);
    if (newCancel) newCancel.addEventListener('click', hideNewModal);
    if (newConfirm) newConfirm.addEventListener('click', createNewItem);
    
    // Modal backdrop clicks
    const modals = component.querySelectorAll('.file-manager__modal-backdrop');
    modals.forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            hideUploadModal();
            hideNewModal();
        });
    });
}

/**
 * Setup context menu
 */
function setupContextMenu(component) {
    const contextMenu = component.querySelector('#fm-context-menu');
    if (!contextMenu) return;
    
    const items = contextMenu.querySelectorAll('.file-manager__context-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            handleContextAction(action);
            hideContextMenu();
        });
    });
}

/**
 * Load folder tree
 */
async function loadFolderTree() {
    try {
        const response = await fetch('api.php?endpoint=file_manager&action=tree');
        
        // Handle authentication error
        if (response.status === 401) {
            console.log('File Manager: Not authenticated, showing basic tree');
            renderBasicTree();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            window.fileManagerState.folderTree = data.tree;
            renderFolderTree(data.tree);
        } else {
            renderBasicTree();
        }
    } catch (error) {
        console.error('File Manager: Error loading folder tree:', error);
        renderBasicTree();
    }
}

/**
 * Render basic fallback tree
 */
function renderBasicTree() {
    console.log('File Manager: Rendering basic fallback tree');
    const basicTree = {
        name: 'definitions',
        path: 'definitions',
        type: 'folder',
        children: [
            { name: 'media', path: 'definitions/media', type: 'folder', children: [] },
            { name: 'pages', path: 'definitions/pages', type: 'folder', children: [] },
            { name: 'profiles', path: 'definitions/profiles', type: 'folder', children: [] },
            { name: 'sites', path: 'definitions/sites', type: 'folder', children: [] }
        ]
    };
    renderFolderTree(basicTree);
}

/**
 * Render folder tree
 */
function renderFolderTree(tree) {
    console.log('File Manager: Rendering folder tree', tree);
    const treeContainer = document.getElementById('fm-tree');
    if (!treeContainer) {
        console.error('File Manager: Tree container not found');
        return;
    }
    
    const html = renderTreeNode(tree, 0, true);
    console.log('File Manager: Tree HTML generated, length:', html.length);
    treeContainer.innerHTML = html;
    
    // Attach click listeners for folder selection
    const treeLabels = treeContainer.querySelectorAll('.file-manager__tree-label');
    treeLabels.forEach(label => {
        label.addEventListener('click', (e) => {
            e.stopPropagation();
            const path = label.getAttribute('data-path');
            navigateToFolder(path);
        });
    });
    
    // Attach click listeners for expand/collapse toggles
    const toggles = treeContainer.querySelectorAll('.file-manager__tree-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const node = toggle.closest('.file-manager__tree-node');
            if (node) {
                node.classList.toggle('collapsed');
                const icon = toggle.querySelector('ion-icon');
                if (icon) {
                    icon.setAttribute('name', node.classList.contains('collapsed') ? 'chevron-forward-outline' : 'chevron-down-outline');
                }
            }
        });
    });
}

/**
 * Render a tree node recursively
 */
function renderTreeNode(node, depth, isRoot = false) {
    if (!node) return '';
    
    const isActive = node.path === window.fileManagerState.currentPath;
    const activeClass = isActive ? 'active' : '';
    const hasChildren = node.children && node.children.filter(c => c.type === 'folder').length > 0;
    const expandedClass = isRoot || depth < 2 ? '' : 'collapsed'; // Auto-expand first 2 levels
    
    let html = `<div class="file-manager__tree-node ${expandedClass}" data-path="${node.path}">`;
    
    // Tree item row
    html += `<div class="file-manager__tree-row" style="padding-left: ${depth * 16}px">`;
    
    // Toggle button (only if has children)
    if (hasChildren) {
        const toggleIcon = expandedClass ? 'chevron-forward-outline' : 'chevron-down-outline';
        html += `<button class="file-manager__tree-toggle"><ion-icon name="${toggleIcon}"></ion-icon></button>`;
    } else {
        html += `<span class="file-manager__tree-spacer"></span>`;
    }
    
    // Folder label
    html += `
        <div class="file-manager__tree-label ${activeClass}" data-path="${node.path}">
            <ion-icon name="${isActive ? 'folder-open-outline' : 'folder-outline'}"></ion-icon>
            <span>${node.name}</span>
        </div>
    `;
    
    html += `</div>`; // Close tree-row
    
    // Children container
    if (hasChildren) {
        html += '<div class="file-manager__tree-children">';
        node.children.forEach(child => {
            if (child.type === 'folder') {
                html += renderTreeNode(child, depth + 1);
            }
        });
        html += '</div>';
    }
    
    html += `</div>`; // Close tree-node
    
    return html;
}

/**
 * Navigate to folder
 */
function navigateToFolder(path) {
    window.fileManagerState.currentPath = path;
    window.fileManagerState.selectedFiles = [];
    loadFiles(path);
    updateBreadcrumb(path);
    updateTreeSelection(path);
}

/**
 * Update breadcrumb
 */
function updateBreadcrumb(path) {
    const breadcrumb = document.getElementById('fm-breadcrumb');
    if (!breadcrumb) return;
    
    const parts = path.split('/');
    let currentPath = '';
    
    const html = parts.map((part, index) => {
        currentPath += (index > 0 ? '/' : '') + part;
        const pathAttr = currentPath;
        
        return `
            ${index > 0 ? '<ion-icon name="chevron-forward-outline" class="file-manager__breadcrumb-separator"></ion-icon>' : ''}
            <span class="file-manager__breadcrumb-item" data-path="${pathAttr}">
                ${index === 0 ? '<ion-icon name="home-outline"></ion-icon>' : ''}
                <span>${part}</span>
            </span>
        `;
    }).join('');
    
    breadcrumb.innerHTML = html;
    
    const items = breadcrumb.querySelectorAll('.file-manager__breadcrumb-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            navigateToFolder(item.getAttribute('data-path'));
        });
    });
}

/**
 * Update tree selection and expand parent folders
 */
function updateTreeSelection(path) {
    // Remove active from all labels
    const treeLabels = document.querySelectorAll('.file-manager__tree-label');
    treeLabels.forEach(label => {
        label.classList.remove('active');
        const icon = label.querySelector('ion-icon');
        if (icon) icon.setAttribute('name', 'folder-outline');
    });
    
    // Find and activate the selected folder
    const activeLabel = document.querySelector(`.file-manager__tree-label[data-path="${path}"]`);
    if (activeLabel) {
        activeLabel.classList.add('active');
        const icon = activeLabel.querySelector('ion-icon');
        if (icon) icon.setAttribute('name', 'folder-open-outline');
        
        // Expand all parent nodes
        let parent = activeLabel.closest('.file-manager__tree-node');
        while (parent) {
            parent.classList.remove('collapsed');
            const toggle = parent.querySelector(':scope > .file-manager__tree-row > .file-manager__tree-toggle ion-icon');
            if (toggle) toggle.setAttribute('name', 'chevron-down-outline');
            parent = parent.parentElement?.closest('.file-manager__tree-node');
        }
    }
}

/**
 * Load files from API
 */
async function loadFiles(path) {
    console.log('File Manager: Loading files for path:', path);
    const loading = document.getElementById('fm-loading');
    const filesContainer = document.getElementById('fm-files');
    const empty = document.getElementById('fm-empty');
    
    console.log('File Manager: Elements found - loading:', !!loading, 'files:', !!filesContainer, 'empty:', !!empty);
    
    if (loading) loading.style.display = 'flex';
    if (filesContainer) filesContainer.style.display = 'none';
    if (empty) empty.style.display = 'none';
    
    try {
        console.log('File Manager: Fetching from API...');
        const response = await fetch('api.php?endpoint=file_manager&action=list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: path })
        });
        
        console.log('File Manager: Response status:', response.status);
        
        // Handle authentication error
        if (response.status === 401) {
            console.log('File Manager: Not authenticated (401)');
            showAuthRequired();
            return;
        }
        
        const data = await response.json();
        console.log('File Manager: Response data:', data);
        
        if (data.success) {
            window.fileManagerState.files = data.files || [];
            console.log('File Manager: Loaded', window.fileManagerState.files.length, 'items');
            filterFiles();
        } else {
            console.error('File Manager: API error:', data.error);
            showEmpty();
        }
    } catch (error) {
        console.error('File Manager: Fetch error:', error);
        showEmpty();
    } finally {
        console.log('File Manager: Hiding loading spinner');
        if (loading) loading.style.display = 'none';
    }
}

/**
 * Show authentication required message
 */
function showAuthRequired() {
    const loading = document.getElementById('fm-loading');
    const filesContainer = document.getElementById('fm-files');
    const empty = document.getElementById('fm-empty');
    
    if (loading) loading.style.display = 'none';
    if (filesContainer) filesContainer.style.display = 'none';
    if (empty) {
        empty.style.display = 'flex';
        empty.innerHTML = `
            <ion-icon name="lock-closed-outline"></ion-icon>
            <p>Authentication required</p>
            <p style="font-size: var(--font-size-sm);">Please log in to access the file manager</p>
        `;
    }
}

/**
 * Filter files based on current filter and search
 * NOTE: Folders are shown in the sidebar tree, not in the main panel
 */
function filterFiles() {
    const { files, filter, searchQuery } = window.fileManagerState;
    
    // Exclude folders - they're shown in the sidebar tree
    let filtered = files.filter(file => file.type !== 'folder');
    
    if (filter !== 'all') {
        filtered = filtered.filter(file => {
            if (filter === 'json') return file.extension === 'json';
            if (filter === 'images') return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(file.extension);
            if (filter === 'videos') return ['mp4', 'webm', 'mov', 'avi'].includes(file.extension);
            if (filter === 'documents') return ['pdf', 'doc', 'docx', 'txt'].includes(file.extension);
            return true;
        });
    }
    
    if (searchQuery) {
        filtered = filtered.filter(file => file.name.toLowerCase().includes(searchQuery));
    }
    
    // Sort alphabetically (no need to sort folders first since they're excluded)
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    window.fileManagerState.filteredFiles = filtered;
    renderFiles();
    updateStatus();
}

/**
 * Render files
 */
function renderFiles() {
    const filesContainer = document.getElementById('fm-files');
    const empty = document.getElementById('fm-empty');
    
    if (!filesContainer) return;
    
    const { filteredFiles, viewMode } = window.fileManagerState;
    
    if (filteredFiles.length === 0) {
        filesContainer.style.display = 'none';
        if (empty) empty.style.display = 'flex';
        return;
    }
    
    filesContainer.style.display = viewMode === 'grid' ? 'grid' : 'flex';
    filesContainer.className = `file-manager__files ${viewMode === 'grid' ? 'grid-view' : ''}`;
    if (empty) empty.style.display = 'none';
    
    filesContainer.innerHTML = filteredFiles.map(file => createFileItem(file)).join('');
    attachFileItemListeners();
}

/**
 * Create file item HTML
 */
function createFileItem(file) {
    const iconInfo = getFileIcon(file);
    const isSelected = window.fileManagerState.selectedFiles.includes(file.path);
    const selectedClass = isSelected ? 'selected' : '';
    const sizeStr = file.type === 'folder' ? '' : formatFileSize(file.size);
    const dateStr = file.modified ? new Date(file.modified * 1000).toLocaleDateString() : '';
    
    return `
        <div class="file-manager__file-item ${selectedClass}" 
             data-path="${file.path}" 
             data-type="${file.type}"
             data-name="${file.name}">
            <div class="file-manager__file-icon ${iconInfo.class}">
                <ion-icon name="${iconInfo.icon}"></ion-icon>
            </div>
            <div class="file-manager__file-info">
                <div class="file-manager__file-name">${escapeHtml(file.name)}</div>
                <div class="file-manager__file-meta">
                    ${sizeStr ? `<span>${sizeStr}</span>` : ''}
                    ${dateStr ? `<span>${dateStr}</span>` : ''}
                </div>
            </div>
            <div class="file-manager__file-actions">
                <button class="file-manager__file-action-btn" data-action="menu" title="More">
                    <ion-icon name="ellipsis-vertical-outline"></ion-icon>
                </button>
            </div>
        </div>
    `;
}

/**
 * Get file icon based on type/extension
 */
function getFileIcon(file) {
    if (file.type === 'folder') {
        return { icon: 'folder-outline', class: 'folder' };
    }
    
    const ext = file.extension?.toLowerCase();
    
    if (ext === 'json') return { icon: 'code-slash-outline', class: 'json' };
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(ext)) {
        return { icon: 'image-outline', class: 'image' };
    }
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
        return { icon: 'videocam-outline', class: 'video' };
    }
    if (ext === 'pdf') return { icon: 'document-outline', class: 'document' };
    
    return { icon: 'document-outline', class: '' };
}

/**
 * Attach file item event listeners
 */
function attachFileItemListeners() {
    const items = document.querySelectorAll('.file-manager__file-item');
    
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.file-manager__file-action-btn')) return;
            handleFileClick(item, e);
        });
        
        item.addEventListener('dblclick', () => {
            openFile(item.getAttribute('data-path'), item.getAttribute('data-type'));
        });
        
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            selectFile(item);
            showContextMenu(e.clientX, e.clientY, item);
        });
        
        const actionBtn = item.querySelector('.file-manager__file-action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectFile(item);
                const rect = actionBtn.getBoundingClientRect();
                showContextMenu(rect.left, rect.bottom, item);
            });
        }
    });
}

/**
 * Handle file click
 */
function handleFileClick(item, e) {
    if (e.ctrlKey || e.metaKey) {
        toggleFileSelection(item);
    } else {
        selectFile(item);
    }
}

/**
 * Select a single file
 */
function selectFile(item) {
    const items = document.querySelectorAll('.file-manager__file-item');
    items.forEach(i => i.classList.remove('selected'));
    
    item.classList.add('selected');
    window.fileManagerState.selectedFiles = [item.getAttribute('data-path')];
    updateStatus();
}

/**
 * Toggle file selection
 */
function toggleFileSelection(item) {
    const path = item.getAttribute('data-path');
    const index = window.fileManagerState.selectedFiles.indexOf(path);
    
    if (index > -1) {
        window.fileManagerState.selectedFiles.splice(index, 1);
        item.classList.remove('selected');
    } else {
        window.fileManagerState.selectedFiles.push(path);
        item.classList.add('selected');
    }
    updateStatus();
}

/**
 * Open file or folder
 */
function openFile(path, type) {
    if (type === 'folder') {
        navigateToFolder(path);
    } else {
        editFile(path);
    }
}


/**
 * Edit file - open in editor panel
 */
async function editFile(path) {
    console.log('File Manager: Editing file:', path);
    
    const component = document.querySelector('.file-manager-component');
    const editorTitle = document.getElementById('fm-editor-title');
    const editorIcon = document.getElementById('fm-editor-icon');
    const textarea = document.getElementById('fm-editor-textarea');
    const jsonEditor = document.getElementById('fm-json-editor');
    const mediaPreview = document.getElementById('fm-media-preview');
    const validation = document.getElementById('fm-validation');
    const formatBtn = document.getElementById('fm-editor-format');
    const validateBtn = document.getElementById('fm-editor-validate');
    
    if (!component) return;
    
    // Store current file
    window.fileManagerState.currentEditingFile = path;
    
    // Get file extension
    const fileName = path.split('/').pop();
    const ext = fileName.split('.').pop().toLowerCase();
    
    // Update title
    if (editorTitle) editorTitle.textContent = fileName;
    
    // Show editor panel
    component.classList.add('editor-active');
    
    // Reset validation
    if (validation) {
        validation.style.display = 'none';
        validation.className = 'file-manager__validation';
    }
    
    // Handle different file types
    if (ext === 'json') {
        // JSON file - show editor
        if (jsonEditor) jsonEditor.style.display = 'flex';
        if (mediaPreview) mediaPreview.style.display = 'none';
        if (formatBtn) formatBtn.style.display = 'flex';
        if (validateBtn) validateBtn.style.display = 'flex';
        if (editorIcon) editorIcon.setAttribute('name', 'code-slash-outline');
        
        await loadFileContent(path);
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(ext)) {
        // Image file - show preview
        if (jsonEditor) jsonEditor.style.display = 'none';
        if (mediaPreview) mediaPreview.style.display = 'flex';
        if (formatBtn) formatBtn.style.display = 'none';
        if (validateBtn) validateBtn.style.display = 'none';
        if (editorIcon) editorIcon.setAttribute('name', 'image-outline');
        
        showImagePreview(path);
    } else if (['mp4', 'webm', 'mov'].includes(ext)) {
        // Video file - show preview
        if (jsonEditor) jsonEditor.style.display = 'none';
        if (mediaPreview) mediaPreview.style.display = 'flex';
        if (formatBtn) formatBtn.style.display = 'none';
        if (validateBtn) validateBtn.style.display = 'none';
        if (editorIcon) editorIcon.setAttribute('name', 'videocam-outline');
        
        showVideoPreview(path);
    } else if (ext === 'pdf') {
        // PDF file - show download
        if (jsonEditor) jsonEditor.style.display = 'none';
        if (mediaPreview) mediaPreview.style.display = 'flex';
        if (formatBtn) formatBtn.style.display = 'none';
        if (validateBtn) validateBtn.style.display = 'none';
        if (editorIcon) editorIcon.setAttribute('name', 'document-outline');
        
        showPdfPreview(path);
    }
}

/**
 * Load file content for editing
 */
async function loadFileContent(path) {
    const textarea = document.getElementById('fm-editor-textarea');
    const gutter = document.getElementById('fm-editor-gutter');
    
    if (!textarea) return;
    
    textarea.value = 'Loading...';
    
    try {
        const response = await fetch('api.php?endpoint=file_manager&action=read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: path })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Format JSON nicely
            try {
                const formatted = JSON.stringify(JSON.parse(data.content), null, 2);
                textarea.value = formatted;
            } catch {
                textarea.value = data.content;
            }
            updateLineNumbers();
        } else {
            textarea.value = 'Error loading file: ' + data.error;
        }
    } catch (error) {
        console.error('Error loading file:', error);
        textarea.value = 'Error loading file';
    }
}

/**
 * Show image preview
 */
function showImagePreview(path) {
    const previewImage = document.getElementById('fm-preview-image');
    const previewVideo = document.getElementById('fm-preview-video');
    const previewPdf = document.getElementById('fm-preview-pdf');
    
    if (previewImage) {
        previewImage.src = path;
        previewImage.style.display = 'block';
    }
    if (previewVideo) previewVideo.style.display = 'none';
    if (previewPdf) previewPdf.style.display = 'none';
}

/**
 * Show video preview
 */
function showVideoPreview(path) {
    const previewImage = document.getElementById('fm-preview-image');
    const previewVideo = document.getElementById('fm-preview-video');
    const previewPdf = document.getElementById('fm-preview-pdf');
    
    if (previewVideo) {
        previewVideo.src = path;
        previewVideo.style.display = 'block';
    }
    if (previewImage) previewImage.style.display = 'none';
    if (previewPdf) previewPdf.style.display = 'none';
}

/**
 * Show PDF preview
 */
function showPdfPreview(path) {
    const previewImage = document.getElementById('fm-preview-image');
    const previewVideo = document.getElementById('fm-preview-video');
    const previewPdf = document.getElementById('fm-preview-pdf');
    const pdfIframe = document.getElementById('fm-pdf-iframe');
    const pdfDownload = document.getElementById('fm-pdf-download');
    const pdfOpen = document.getElementById('fm-pdf-open');
    
    if (previewPdf) previewPdf.style.display = 'flex';
    if (previewImage) previewImage.style.display = 'none';
    if (previewVideo) previewVideo.style.display = 'none';
    
    // Set iframe source for PDF preview
    if (pdfIframe) {
        pdfIframe.src = path;
    }
    
    // Set download link
    if (pdfDownload) {
        pdfDownload.href = path;
        pdfDownload.download = path.split('/').pop();
    }
    
    // Set open in new tab link
    if (pdfOpen) {
        pdfOpen.href = path;
    }
}

/**
 * Close editor panel
 */
function closeEditor() {
    const component = document.querySelector('.file-manager-component');
    if (component) {
        component.classList.remove('editor-active');
    }
    window.fileManagerState.currentEditingFile = null;
}

/**
 * Save file
 */
async function saveFile() {
    const textarea = document.getElementById('fm-editor-textarea');
    const validation = document.getElementById('fm-validation');
    const filePath = window.fileManagerState.currentEditingFile;
    
    if (!filePath || !textarea) return;
    
    const content = textarea.value;
    
    // Validate JSON first
    try {
        JSON.parse(content);
    } catch (error) {
        showValidation('error', 'Cannot save: Invalid JSON - ' + error.message);
        return;
    }
    
    try {
        const response = await fetch('api.php?endpoint=file_manager&action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: filePath, content: content })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showValidation('success', 'File saved successfully!');
            setTimeout(() => {
                closeEditor();
                loadFiles(window.fileManagerState.currentPath);
            }, 1000);
        } else {
            showValidation('error', 'Error saving file: ' + data.error);
        }
    } catch (error) {
        console.error('Error saving file:', error);
        showValidation('error', 'Error saving file');
    }
}

/**
 * Format JSON in editor
 */
function formatJSON() {
    const textarea = document.getElementById('fm-editor-textarea');
    if (!textarea) return;
    
    try {
        const parsed = JSON.parse(textarea.value);
        textarea.value = JSON.stringify(parsed, null, 2);
        updateLineNumbers();
        showValidation('success', 'JSON formatted successfully');
    } catch (error) {
        showValidation('error', 'Cannot format: Invalid JSON - ' + error.message);
    }
}

/**
 * Validate JSON in editor - syntax + schema validation
 */
async function validateJSON() {
    const textarea = document.getElementById('fm-editor-textarea');
    if (!textarea) return;
    
    const filePath = window.fileManagerState.currentEditingFile;
    
    // Step 1: Basic JSON syntax validation
    let parsed;
    try {
        parsed = JSON.parse(textarea.value);
    } catch (error) {
        showValidation('error', 'Invalid JSON syntax: ' + error.message);
        return;
    }
    
    // Step 2: Schema validation based on file type
    const schemaResult = await validateAgainstSchema(parsed, filePath);
    
    if (schemaResult.valid) {
        showValidation('success', schemaResult.message || 'Valid JSON!');
    } else {
        showValidation('warning', schemaResult.message);
    }
}

/**
 * Validate JSON against appropriate schema based on file path
 */
async function validateAgainstSchema(data, filePath) {
    if (!filePath) return { valid: true, message: 'Valid JSON!' };
    
    // Determine file type and validate accordingly
    if (filePath.includes('definitions/pages/')) {
        return validatePageDefinition(data);
    } else if (filePath.includes('definitions/sites/')) {
        return validateSiteDefinition(data);
    } else if (filePath.includes('definitions/profiles/')) {
        return validateProfileDefinition(data);
    } else if (filePath.includes('blocks/components/')) {
        // Try to load schema from same folder
        const pathParts = filePath.split('/');
        const componentFolder = pathParts.slice(0, -1).join('/');
        const schemaPath = await findComponentSchema(componentFolder);
        if (schemaPath) {
            return await validateWithSchema(data, schemaPath);
        }
    }
    
    return { valid: true, message: 'Valid JSON! (No schema available)' };
}

/**
 * Find component schema file in folder
 */
async function findComponentSchema(folderPath) {
    try {
        const response = await fetch('api.php?endpoint=file_manager&action=list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: folderPath })
        });
        const data = await response.json();
        
        if (data.success && data.files) {
            const schemaFile = data.files.find(f => f.name.includes('schema') && f.extension === 'json');
            if (schemaFile) return schemaFile.path;
        }
    } catch (e) {
        console.log('Could not find schema:', e);
    }
    return null;
}

/**
 * Validate data against a schema file
 */
async function validateWithSchema(data, schemaPath) {
    try {
        const response = await fetch('api.php?endpoint=file_manager&action=read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: schemaPath })
        });
        const result = await response.json();
        
        if (!result.success) return { valid: true, message: 'Valid JSON!' };
        
        const schema = JSON.parse(result.content);
        const errors = validateDataAgainstSchema(data, schema);
        
        if (errors.length === 0) {
            return { valid: true, message: 'Valid JSON! Schema passed ✓' };
        }
        return { valid: false, message: 'Schema: ' + errors.slice(0, 2).join('; ') };
    } catch (e) {
        return { valid: true, message: 'Valid JSON!' };
    }
}

/**
 * Validate data against schema fields
 */
function validateDataAgainstSchema(data, schema) {
    const errors = [];
    if (!schema.fields) return errors;
    
    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
        if (fieldDef.required && data[fieldName] === undefined) {
            errors.push(`Missing: ${fieldName}`);
        }
        if (data[fieldName] !== undefined && fieldDef.type) {
            const actualType = Array.isArray(data[fieldName]) ? 'array' : typeof data[fieldName];
            if (fieldDef.type !== actualType) {
                errors.push(`${fieldName}: expected ${fieldDef.type}`);
            }
        }
    }
    return errors;
}

/**
 * Validate page definition structure (recursive)
 */
function validatePageDefinition(data) {
    const errors = [];
    
    if (!data.objects) {
        errors.push('Missing "objects" array');
    } else if (!Array.isArray(data.objects)) {
        errors.push('"objects" must be an array');
    } else {
        validateObjectsRecursive(data.objects, 'objects', errors);
    }
    
    if (errors.length === 0) return { valid: true, message: 'Valid page definition! ✓' };
    return { valid: false, message: errors.slice(0, 3).join('; ') };
}

/**
 * Recursively validate objects array
 */
function validateObjectsRecursive(objects, path, errors) {
    objects.forEach((obj, i) => {
        const objPath = `${path}[${i}]`;
        
        // Required fields for all objects
        if (!obj.type) errors.push(`${objPath}: missing "type"`);
        if (!obj.component) errors.push(`${objPath}: missing "component"`);
        if (!obj.id) errors.push(`${objPath}: missing "id"`);
        
        // Container-specific validation
        if (obj.type === 'container') {
            if (obj.objects && Array.isArray(obj.objects)) {
                validateObjectsRecursive(obj.objects, `${objPath}.objects`, errors);
            }
        }
        
        // Component-specific validation
        if (obj.type === 'component') {
            if (!obj.variant && !obj.data) {
                errors.push(`${objPath}: needs "variant" or "data"`);
            }
        }
    });
}

/**
 * Validate site definition structure
 */
function validateSiteDefinition(data) {
    const errors = [];
    if (!data.type) errors.push('Missing "type" field');
    
    if (errors.length === 0) return { valid: true, message: 'Valid site definition! ✓' };
    return { valid: false, message: errors.join('; ') };
}

/**
 * Validate profile definition structure
 */
function validateProfileDefinition(data) {
    const errors = [];
    if (!data.site) errors.push('Missing "site" field');
    if (!data.pages || !Array.isArray(data.pages)) errors.push('Missing "pages" array');
    
    if (errors.length === 0) return { valid: true, message: 'Valid profile definition! ✓' };
    return { valid: false, message: errors.join('; ') };
}

/**
 * Show validation message
 */
function showValidation(type, message) {
    const validation = document.getElementById('fm-validation');
    if (!validation) return;
    
    validation.textContent = message;
    validation.className = 'file-manager__validation ' + type;
    validation.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            validation.style.display = 'none';
        }, 3000);
    }
}

/**
 * Handle editor input
 */
function handleEditorInput() {
    updateLineNumbers();
    // Real-time validation (debounced)
    clearTimeout(window.fileManagerValidationTimeout);
    window.fileManagerValidationTimeout = setTimeout(() => {
        const textarea = document.getElementById('fm-editor-textarea');
        if (!textarea) return;
        
        try {
            JSON.parse(textarea.value);
            const validation = document.getElementById('fm-validation');
            if (validation) validation.style.display = 'none';
        } catch (error) {
            // Don't show error while typing, only on explicit validate
        }
    }, 500);
}

/**
 * Handle editor keydown
 */
function handleEditorKeydown(e) {
    const textarea = e.target;
    
    // Tab key - insert spaces
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateLineNumbers();
    }
    
    // Ctrl+S - save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFile();
    }
}

/**
 * Sync gutter scroll with textarea
 */
function syncGutterScroll() {
    const textarea = document.getElementById('fm-editor-textarea');
    const gutter = document.getElementById('fm-editor-gutter');
    if (textarea && gutter) {
        gutter.scrollTop = textarea.scrollTop;
    }
}

/**
 * Update line numbers in gutter
 */
function updateLineNumbers() {
    const textarea = document.getElementById('fm-editor-textarea');
    const gutter = document.getElementById('fm-editor-gutter');
    const lineInfo = document.getElementById('fm-editor-line-info');
    
    if (!textarea || !gutter) return;
    
    const lines = textarea.value.split('\n');
    const lineCount = lines.length;
    
    let gutterHtml = '';
    for (let i = 1; i <= lineCount; i++) {
        gutterHtml += `<div class="file-manager__editor-gutter-line">${i}</div>`;
    }
    gutter.innerHTML = gutterHtml;
    
    // Update line info
    if (lineInfo) {
        const pos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, pos);
        const lineNum = textBefore.split('\n').length;
        const colNum = pos - textBefore.lastIndexOf('\n');
        lineInfo.textContent = `Ln ${lineNum}, Col ${colNum}`;
    }
}


/**
 * Context Menu Functions
 */
function showContextMenu(x, y, item) {
    const contextMenu = document.getElementById('fm-context-menu');
    if (!contextMenu) return;
    
    // Store reference to item
    contextMenu.setAttribute('data-target-path', item.getAttribute('data-path'));
    contextMenu.setAttribute('data-target-type', item.getAttribute('data-type'));
    
    // Position menu
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
    
    // Adjust if off screen
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (y - rect.height) + 'px';
    }
}

function hideContextMenu() {
    const contextMenu = document.getElementById('fm-context-menu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

function handleContextAction(action) {
    const contextMenu = document.getElementById('fm-context-menu');
    const path = contextMenu?.getAttribute('data-target-path');
    const type = contextMenu?.getAttribute('data-target-type');
    
    if (!path) return;
    
    switch (action) {
        case 'open':
            openFile(path, type);
            break;
        case 'rename':
            renameFile(path);
            break;
        case 'duplicate':
            duplicateFile(path);
            break;
        case 'delete':
            deleteFile(path);
            break;
    }
}

/**
 * Rename file
 */
async function renameFile(path) {
    const fileName = path.split('/').pop();
    const newName = prompt('Enter new name:', fileName);
    
    if (!newName || newName === fileName) return;
    
    try {
        const response = await fetch('api.php?endpoint=file_manager&action=rename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: path, newName: newName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadFiles(window.fileManagerState.currentPath);
            loadFolderTree();
        } else {
            alert('Error renaming: ' + data.error);
        }
    } catch (error) {
        console.error('Error renaming:', error);
        alert('Error renaming file');
    }
}

/**
 * Duplicate file
 */
async function duplicateFile(path) {
    try {
        const response = await fetch('api.php?endpoint=file_manager&action=duplicate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: path })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadFiles(window.fileManagerState.currentPath);
        } else {
            alert('Error duplicating: ' + data.error);
        }
    } catch (error) {
        console.error('Error duplicating:', error);
        alert('Error duplicating file');
    }
}

/**
 * Delete file
 */
async function deleteFile(path) {
    const fileName = path.split('/').pop();
    
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch('api.php?endpoint=file_manager&action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: path })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.fileManagerState.selectedFiles = [];
            loadFiles(window.fileManagerState.currentPath);
            loadFolderTree();
        } else {
            alert('Error deleting: ' + data.error);
        }
    } catch (error) {
        console.error('Error deleting:', error);
        alert('Error deleting file');
    }
}

/**
 * Modal Functions
 */
function showNewModal(type) {
    const modal = document.getElementById('fm-new-modal');
    const title = document.getElementById('fm-new-modal-title');
    const templateGroup = document.getElementById('fm-template-group');
    const nameInput = document.getElementById('fm-new-name');
    
    if (!modal) return;
    
    modal.setAttribute('data-type', type);
    
    if (title) {
        title.textContent = type === 'folder' ? 'New Folder' : 'New File';
    }
    
    if (templateGroup) {
        templateGroup.style.display = type === 'file' ? 'block' : 'none';
    }
    
    if (nameInput) {
        nameInput.value = '';
        nameInput.placeholder = type === 'folder' ? 'folder_name' : 'filename.json';
    }
    
    modal.style.display = 'flex';
    
    setTimeout(() => nameInput?.focus(), 100);
}

function hideNewModal() {
    const modal = document.getElementById('fm-new-modal');
    if (modal) modal.style.display = 'none';
}

async function createNewItem() {
    const modal = document.getElementById('fm-new-modal');
    const nameInput = document.getElementById('fm-new-name');
    const templateSelect = document.getElementById('fm-new-template');
    
    const type = modal?.getAttribute('data-type');
    const name = nameInput?.value.trim();
    const template = templateSelect?.value || 'empty';
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    const currentPath = window.fileManagerState.currentPath;
    const fullPath = currentPath + '/' + name;
    
    try {
        const response = await fetch('api.php?endpoint=file_manager&action=create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: fullPath,
                type: type,
                template: template
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            hideNewModal();
            loadFiles(currentPath);
            if (type === 'folder') {
                loadFolderTree();
            }
        } else {
            alert('Error creating: ' + data.error);
        }
    } catch (error) {
        console.error('Error creating:', error);
        alert('Error creating item');
    }
}

/**
 * Upload Modal Functions
 */
function showUploadModal() {
    const modal = document.getElementById('fm-upload-modal');
    const uploadList = document.getElementById('fm-upload-list');
    const confirmBtn = document.getElementById('fm-upload-confirm');
    
    if (modal) modal.style.display = 'flex';
    if (uploadList) uploadList.innerHTML = '';
    if (confirmBtn) confirmBtn.disabled = true;
    
    window.fileManagerState.pendingUploads = [];
}

function hideUploadModal() {
    const modal = document.getElementById('fm-upload-modal');
    if (modal) modal.style.display = 'none';
    window.fileManagerState.pendingUploads = [];
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    addFilesToUpload(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFilesToUpload(files);
}

function addFilesToUpload(files) {
    const uploadList = document.getElementById('fm-upload-list');
    const confirmBtn = document.getElementById('fm-upload-confirm');
    
    files.forEach(file => {
        window.fileManagerState.pendingUploads.push(file);
        
        if (uploadList) {
            const item = document.createElement('div');
            item.className = 'file-manager__upload-item';
            item.innerHTML = `
                <ion-icon name="${getFileIcon({ extension: file.name.split('.').pop() }).icon}"></ion-icon>
                <span>${file.name}</span>
                <span class="file-manager__upload-size">${formatFileSize(file.size)}</span>
            `;
            uploadList.appendChild(item);
        }
    });
    
    if (confirmBtn) {
        confirmBtn.disabled = window.fileManagerState.pendingUploads.length === 0;
    }
}

async function uploadFiles() {
    const files = window.fileManagerState.pendingUploads;
    if (files.length === 0) return;
    
    const currentPath = window.fileManagerState.currentPath;
    
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', currentPath);
        
        try {
            const response = await fetch('api.php?endpoint=file_manager&action=upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (!data.success) {
                console.error('Upload failed:', file.name, data.error);
            }
        } catch (error) {
            console.error('Upload error:', file.name, error);
        }
    }
    
    hideUploadModal();
    loadFiles(currentPath);
}

/**
 * View Mode
 */
function setViewMode(mode) {
    window.fileManagerState.viewMode = mode;
    
    const listBtn = document.getElementById('fm-view-list');
    const gridBtn = document.getElementById('fm-view-grid');
    
    if (listBtn) listBtn.classList.toggle('active', mode === 'list');
    if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
    
    renderFiles();
}

/**
 * Update status bar
 */
function updateStatus() {
    const itemCount = document.getElementById('fm-item-count');
    const selectedCount = document.getElementById('fm-selected-count');
    
    const { filteredFiles, selectedFiles } = window.fileManagerState;
    
    if (itemCount) {
        itemCount.textContent = `${filteredFiles.length} item${filteredFiles.length !== 1 ? 's' : ''}`;
    }
    
    if (selectedCount) {
        if (selectedFiles.length > 0) {
            selectedCount.textContent = `${selectedFiles.length} selected`;
        } else {
            selectedCount.textContent = '';
        }
    }
}

/**
 * Show empty state
 */
function showEmpty() {
    const loading = document.getElementById('fm-loading');
    const filesContainer = document.getElementById('fm-files');
    const empty = document.getElementById('fm-empty');
    
    if (loading) loading.style.display = 'none';
    if (filesContainer) filesContainer.style.display = 'none';
    if (empty) empty.style.display = 'flex';
}

/**
 * Utility Functions
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Navigation handler
 */
function handleFileManagerNavigation(elementId, state, parameters = {}) {
    console.log('File Manager: Navigation handler called', elementId, state);
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('File Manager: Element not found:', elementId);
        return false;
    }
    
    switch (state) {
        case 'visible':
            console.log('File Manager: Setting visible');
            element.style.display = 'block';
            element.classList.add('nav-visible');
            element.classList.remove('nav-hidden');
            // Initialize when visible
            initializeFileManager(element);
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
window.handleFileManagerNavigation = handleFileManagerNavigation;
window.initializeFileManager = initializeFileManager;

// NOTE: No auto-initialize on DOMContentLoaded
// File Manager initialization happens via the navigation state handler:
// - When parent container becomes visible, GlobalNavigator triggers child defaults
// - handleFileManagerNavigation('visible') is called
// - This calls initializeFileManager() which sets up listeners and loads data via API
// - initializeFileManager() is idempotent - if already initialized, just refreshes data

console.log('File Manager: Behavior script loaded');
