/**
 * Media Manager Component Behavior v1
 * Handles media file management with lazy loading by page-component groups
 */

console.log('📸 Media Manager loaded');

let mediaManagerState = {
    currentFiles: [], // All files (when fully loaded)
    groupedFiles: {}, // Loaded group data
    selectedFile: null,
    selectedGroup: null,
    viewMode: 'grid',
    searchTerm: '',
    typeFilter: 'all',
    sortFilter: 'name',
    isEditing: false,
    availableGroups: [], // List of all available groups
    groupsMetadata: {}, // Metadata for all groups (file counts, etc.)
    loadedGroups: new Set(), // Track which groups have been loaded
    isLoading: false, // Global loading state
    isGroupLoading: false, // Group-specific loading state
    initialGroupLoaded: false // Track if initial group is loaded
};

async function loadMediaFiles() {
    try {
        mediaManagerState.isLoading = true;
        updateStatus('Loading media groups...', 'loading');
        showMainLoadingAnimation();

        console.log('🖼️ Media Manager: Starting to load groups list...');

        const authState = getGlobalAuthState();
        console.log('🖼️ Media Manager: Auth state:', authState);

        if (!authState.isAuthenticated) {
            updateStatus('Authentication required', 'error');
            console.log('🖼️ Media Manager: Not authenticated');
            hideMainLoadingAnimation();
            mediaManagerState.isLoading = false;
            return;
        }

        // First, get the list of available groups
        await loadAvailableGroups();

        if (mediaManagerState.availableGroups.length > 0) {
            // Load only the first group initially
            mediaManagerState.selectedGroup = mediaManagerState.availableGroups[0];
            await loadGroupData(mediaManagerState.selectedGroup);
            mediaManagerState.initialGroupLoaded = true;

            console.log(`🖼️ Media Manager: Loaded initial group: ${mediaManagerState.selectedGroup}`);
            updateStatus(`Loaded group: ${getGroupDisplayName(mediaManagerState.selectedGroup)}`, 'success');

            // Update header with initial group info
            updateMainHeaderGroupInfo();
        } else {
            updateStatus('No media groups found', 'info');
            updateMainHeaderGroupInfo(); // Update header to show "no group"
        }

        hideMainLoadingAnimation();
        mediaManagerState.isLoading = false;

        // Apply initial filters and render content
        applyFilters();

    } catch (error) {
        console.error('🖼️ Media Manager: Error loading files:', error);
        updateStatus(`Error: ${error.message}`, 'error');
        hideMainLoadingAnimation();
        mediaManagerState.isLoading = false;
        updateMainHeaderGroupInfo(); // Update header even on error
    }
}

async function loadAvailableGroups() {
    console.log('🖼️ Loading available groups list...');

    try {
        const authState = getGlobalAuthState();
        const headers = {
            'Content-Type': 'application/json'
        };

        if (authState.token) {
            headers['Authorization'] = `Bearer ${authState.token}`;
        }

        const apiPort = '8000';
        const apiUrl = `${window.location.protocol}//${window.location.hostname}:${apiPort}/api.php?endpoint=media_manager&action=list_groups`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            mediaManagerState.availableGroups = data.groups || [];
            mediaManagerState.groupsMetadata = data.groupsMetadata || {};
            console.log('🖼️ Available groups:', mediaManagerState.availableGroups);
            console.log('🖼️ Groups metadata:', mediaManagerState.groupsMetadata);
        } else {
            throw new Error(data.message || 'Failed to load groups list');
        }
    } catch (error) {
        console.warn('🖼️ API server not available, using sample data:', error.message);

        // Use sample data as fallback
        mediaManagerState.availableGroups = ['control/pdf_viewer', 'blog/articles', 'projects/gallery'];
        mediaManagerState.groupsMetadata = {
            'control/pdf_viewer': { displayName: 'Control → PDF Viewer', fileCount: 1 },
            'blog/articles': { displayName: 'Blog → Articles', fileCount: 0 },
            'projects/gallery': { displayName: 'Projects → Gallery', fileCount: 0 }
        };

        // Pre-load sample data for the PDF viewer group
        mediaManagerState.groupedFiles['control/pdf_viewer'] = {
            path: 'control/pdf_viewer',
            displayName: 'Control → PDF Viewer',
            files: [{
                name: 'sample.pdf',
                path: 'assets/files/control/sample.pdf',
                size: 85432,
                type: 'application/pdf',
                lastModified: Date.now() - 86400000, // 1 day ago
                webPath: './assets/files/control/sample.pdf'
            }]
        };
        mediaManagerState.loadedGroups.add('control/pdf_viewer');

        console.log('🖼️ Using sample data - Available groups:', mediaManagerState.availableGroups);
    }
}

async function loadGroupData(groupKey) {
    if (mediaManagerState.loadedGroups.has(groupKey)) {
        console.log(`🖼️ Group ${groupKey} already loaded`);
        return;
    }

    console.log(`🖼️ Loading group data for: ${groupKey}`);

    try {
        const authState = getGlobalAuthState();
        const headers = {
            'Content-Type': 'application/json'
        };

        if (authState.token) {
            headers['Authorization'] = `Bearer ${authState.token}`;
        }

        const apiPort = '8000';
        const apiUrl = `${window.location.protocol}//${window.location.hostname}:${apiPort}/api.php?endpoint=media_manager&action=list&group=${encodeURIComponent(groupKey)}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            // Store group data
            mediaManagerState.groupedFiles[groupKey] = {
                path: groupKey,
                displayName: getGroupDisplayName(groupKey),
                files: data.files || []
            };

            // Mark group as loaded
            mediaManagerState.loadedGroups.add(groupKey);

            console.log(`🖼️ Loaded ${data.files.length} files for group: ${groupKey}`);
        } else {
            throw new Error(data.message || `Failed to load group: ${groupKey}`);
        }

    } catch (error) {
        console.warn(`🖼️ API not available for group ${groupKey}, using sample data:`, error.message);

        // Use sample data as fallback
        let sampleFiles = [];

        if (groupKey === 'control/pdf_viewer') {
            sampleFiles = [{
                name: 'sample.pdf',
                filename: 'sample.pdf',
                path: 'assets/files/control/sample.pdf',
                size: 85432,
                type: 'application/pdf',
                modified: Math.floor((Date.now() - 86400000) / 1000), // 1 day ago in seconds
                webPath: './assets/files/control/sample.pdf'
            }];
        }
        // Other groups get empty arrays for now

        // Store group data
        mediaManagerState.groupedFiles[groupKey] = {
            path: groupKey,
            displayName: getGroupDisplayName(groupKey),
            files: sampleFiles
        };

        // Mark group as loaded
        mediaManagerState.loadedGroups.add(groupKey);

        console.log(`🖼️ Using sample data for group ${groupKey}: ${sampleFiles.length} files`);
    }
}

async function switchToGroup(groupKey) {
    if (mediaManagerState.selectedGroup === groupKey) {
        return; // Already on this group
    }

    try {
        mediaManagerState.isGroupLoading = true;
        mediaManagerState.selectedGroup = groupKey;

        // Show loading animation for the grid
        showGroupLoadingAnimation();
        updateStatus(`Loading ${getGroupDisplayName(groupKey)}...`, 'loading');

        // Load group data if not already loaded
        if (!mediaManagerState.loadedGroups.has(groupKey)) {
            await loadGroupData(groupKey);
        }

        // Set loading to false BEFORE applying filters so renderMediaGrid works
        mediaManagerState.isGroupLoading = false;

        // Apply filters and render
        applyFilters();

        updateStatus(`Loaded ${getGroupDisplayName(groupKey)}`, 'success');
        console.log(`🖼️ Switched to group: ${groupKey}`);

    } catch (error) {
        console.error(`🖼️ Error switching to group ${groupKey}:`, error);
        updateStatus(`Error loading group: ${error.message}`, 'error');
        mediaManagerState.isGroupLoading = false;
    }
}

function getGroupDisplayName(groupKey) {
    // Format group display name from page/component path
    const pathParts = groupKey.split('/');
    if (pathParts.length === 2) {
        const [page, component] = pathParts;
        return `${formatPageName(page)} → ${formatComponentName(component)}`;
    }

    return groupKey; // Fallback
}

function formatPageName(page) {
    const pageNames = {
        'profile': 'Profile',
        'projects': 'Projects',
        'blog': 'Blog',
        'general': 'General'
    };

    return pageNames[page] || page.charAt(0).toUpperCase() + page.slice(1).replace(/_/g, ' ');
}

function formatComponentName(component) {
    const componentNames = {
        'hero': 'Hero Section',
        'skills': 'Skills',
        'experience': 'Experience',
        'summary': 'Summary',
        'certification': 'Certifications',
        'projects_list': 'Project List',
        'blog_list': 'Blog List',
        'article': 'Article'
    };

    return componentNames[component] || component.charAt(0).toUpperCase() + component.slice(1).replace(/_/g, ' ');
}

function showMainLoadingAnimation() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="media-loading-main">
            <div class="loading-spinner"></div>
            <h3>Loading Media Groups...</h3>
            <p>Discovering your media organization</p>
        </div>
    `;
}

function hideMainLoadingAnimation() {
    // The grid will be replaced with actual content when applyFilters() is called
}

function showGroupLoadingAnimation() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    const groupName = getGroupDisplayName(mediaManagerState.selectedGroup);

    grid.innerHTML = `
        <div class="media-loading-group">
            <div class="loading-spinner small"></div>
            <h4>Loading ${groupName}...</h4>
            <p>Fetching media files...</p>
        </div>
    `;
}

function hideGroupLoadingAnimation() {
    // The grid will be replaced with actual content when renderMediaGrid() is called
}

function formatDynamicGroupName(folderName) {
    // Simply capitalize the folder name nicely
    return folderName.charAt(0).toUpperCase() + folderName.slice(1).replace(/_/g, ' ');
}

function formatNestedFolderName(folderPath) {
    // Format nested folder paths nicely
    return folderPath.map(folder =>
        folder.charAt(0).toUpperCase() + folder.slice(1).replace(/_/g, ' ')
    ).join(' → ');
}

function formatGroupDisplayName(page, component) {
    // This function is no longer needed, but keeping for backward compatibility
    // Use the dynamic display name instead
    return formatDynamicGroupName(page);
}

function renderMediaGrid() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    // Don't render if we're loading
    if (mediaManagerState.isLoading || mediaManagerState.isGroupLoading) {
        return;
    }

    // Get files for the selected group only
    const selectedGroupFiles = getSelectedGroupFiles();

    // Update the main header with current group info
    updateMainHeaderGroupInfo();

    if (selectedGroupFiles.length === 0) {
        const groupName = mediaManagerState.selectedGroup ?
            getGroupDisplayName(mediaManagerState.selectedGroup) : 'No Group';

        grid.innerHTML = `
            <div class="media-empty-state">
                <ion-icon name="images-outline"></ion-icon>
                <h4>No media files found in ${groupName}</h4>
                <p>Upload some media files to this group or select a different group</p>
            </div>
        `;
        return;
    }

    const isListView = mediaManagerState.viewMode === 'list';
    grid.className = `control-media-manager-grid ${isListView ? 'list-view' : ''}`;

    // Show only the images directly - no group header
    let gridHTML = '';

    // Add files directly
    selectedGroupFiles.forEach((file, index) => {
        gridHTML += createMediaItemHTML(file, index);
    });

    grid.innerHTML = gridHTML;

    // Add click event listeners to media items
    grid.querySelectorAll('.media-item').forEach((item) => {
        const index = parseInt(item.dataset.globalIndex);
        item.addEventListener('click', () => selectMediaItem(index));
    });

    // Update header again after rendering to ensure it shows current state
    setTimeout(() => updateMainHeaderGroupInfo(), 10);
}

function updateMainHeaderGroupInfo(retryCount = 0) {
    console.log(`🖼️ updateMainHeaderGroupInfo called (attempt ${retryCount + 1})`);

    const groupNameElement = document.getElementById('currentGroupName');
    const groupCountElement = document.getElementById('currentGroupCount');

    if (!groupNameElement || !groupCountElement) {
        if (retryCount < 3) { // Only retry 3 times
            console.log(`🖼️ Header elements not found - retrying (attempt ${retryCount + 1}/3)`);
            setTimeout(() => {
                updateMainHeaderGroupInfo(retryCount + 1);
            }, 100);
        } else {
            console.log('🖼️ Header elements not found after 3 retries - giving up');
        }
        return;
    }

    console.log('🖼️ Current selected group:', mediaManagerState.selectedGroup);

    if (mediaManagerState.selectedGroup) {
        const displayName = getGroupDisplayName(mediaManagerState.selectedGroup);
        const selectedGroupFiles = getSelectedGroupFiles();
        const fileCount = selectedGroupFiles.length;

        console.log(`🖼️ Setting header to: ${displayName} (${fileCount} files)`);

        groupNameElement.textContent = `${displayName} (${fileCount} files)`;
        groupCountElement.textContent = ''; // Clear the separate count element

        console.log(`🖼️ Header updated successfully: ${displayName} (${fileCount} files)`);
    } else {
        console.log('🖼️ No group selected, setting default text');
        groupNameElement.textContent = 'No group selected';
        groupCountElement.textContent = '';
        console.log('🖼️ Header set to default');
    }
}

function renderGroupNavigation() {
    // Remove group navigation display - lazy loading happens in background only
    return '';
}

function getSelectedGroupFiles() {
    if (!mediaManagerState.selectedGroup || !mediaManagerState.groupedFiles[mediaManagerState.selectedGroup]) {
        return [];
    }

    let groupFiles = [...mediaManagerState.groupedFiles[mediaManagerState.selectedGroup].files];

    // Apply type filter
    if (mediaManagerState.typeFilter !== 'all') {
        groupFiles = groupFiles.filter(file => file.type === mediaManagerState.typeFilter);
    }

    // Apply search filter
    if (mediaManagerState.searchTerm) {
        groupFiles = groupFiles.filter(file =>
            file.filename.toLowerCase().includes(mediaManagerState.searchTerm) ||
            file.path.toLowerCase().includes(mediaManagerState.searchTerm)
        );
    }

    // Apply sorting
    groupFiles.sort((a, b) => {
        switch (mediaManagerState.sortFilter) {
            case 'name':
                return a.filename.localeCompare(b.filename);
            case 'date':
                return b.modified - a.modified;
            case 'size':
                return b.size - a.size;
            case 'type':
                return a.type.localeCompare(b.type);
            default:
                return 0;
        }
    });

    return groupFiles;
}

function selectMediaItem(index) {
    // Remove previous selection
    document.querySelectorAll('.media-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Add selection to clicked item
    const mediaItems = document.querySelectorAll('.media-item');
    const targetItem = Array.from(mediaItems).find(item =>
        parseInt(item.dataset.globalIndex) === index
    );

    if (targetItem) {
        targetItem.classList.add('selected');
        const selectedGroupFiles = getSelectedGroupFiles();
        mediaManagerState.selectedFile = selectedGroupFiles[index];

        // Open modal instead of side panel
        openMediaDetailsModal(mediaManagerState.selectedFile);
    }
}

function openMediaDetailsModal(file) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('mediaDetailsModal');
    if (!modal) {
        createMediaDetailsModal();
        modal = document.getElementById('mediaDetailsModal');
    }

    // Populate modal content
    populateMediaDetailsModal(file);

    // Show modal
    modal.classList.add('active');

    // Update hash for navigation consistency
    const currentHash = window.location.hash.split('?')[0];
    const modalParams = encodeURIComponent(JSON.stringify([{
        "media-details": {
            "file": file.filename,
            "path": file.path
        }
    }]));
    window.location.hash = `${currentHash}/media-details?${modalParams}`;
}

function createMediaDetailsModal() {
    const modalHTML = `
        <div id="mediaDetailsModal" class="media-details-modal">
            <div class="media-details-modal-backdrop" onclick="closeMediaDetailsModal()"></div>
            <div class="media-details-modal-content">
                <div class="media-details-preview">
                    <div id="mediaDetailsPreview"></div>
                </div>
                <div class="media-details-info">
                    <div class="media-details-header">
                        <h2 id="mediaDetailsTitle" class="media-details-title"></h2>
                        <button onclick="closeMediaDetailsModal()" class="close-details-btn">
                            <ion-icon name="close-outline"></ion-icon>
                        </button>
                    </div>
                    <ul class="media-details-list">
                        <li class="media-details-item">
                            <span class="media-details-label">File Type</span>
                            <span id="mediaDetailsType" class="media-details-value"></span>
                        </li>
                        <li class="media-details-item">
                            <span class="media-details-label">File Size</span>
                            <span id="mediaDetailsSize" class="media-details-value"></span>
                        </li>
                        <li class="media-details-item">
                            <span class="media-details-label">Dimensions</span>
                            <span id="mediaDetailsDimensions" class="media-details-value"></span>
                        </li>
                        <li class="media-details-item">
                            <span class="media-details-label">Path</span>
                            <span id="mediaDetailsPath" class="media-details-value"></span>
                        </li>
                        <li class="media-details-item">
                            <span class="media-details-label">Modified</span>
                            <span id="mediaDetailsModified" class="media-details-value"></span>
                        </li>
                        <li class="media-details-item">
                            <span class="media-details-label">Filename</span>
                            <span id="mediaDetailsFilename" class="media-details-value editable-filename" contenteditable="false"></span>
                        </li>
                    </ul>
                    <div class="media-details-actions">
                        <button onclick="toggleFilenameEdit()" class="media-action-btn primary" id="editFilenameBtn">
                            <ion-icon name="create-outline"></ion-icon>
                            Edit Name
                        </button>
                        <button onclick="downloadMedia()" class="media-action-btn">
                            <ion-icon name="download-outline"></ion-icon>
                            Download
                        </button>
                        <button onclick="deleteMedia()" class="media-action-btn danger">
                            <ion-icon name="trash-outline"></ion-icon>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function populateMediaDetailsModal(file) {
    const fileUrl = getMediaFileUrl(file.path);

    // Update preview
    const preview = document.getElementById('mediaDetailsPreview');
    if (file.type === 'image') {
        preview.innerHTML = `<img src="${fileUrl}" alt="${file.filename}">`;
    } else if (file.type === 'video') {
        preview.innerHTML = `<video src="${fileUrl}" controls></video>`;
    } else {
        preview.innerHTML = `<ion-icon name="document-outline"></ion-icon>`;
    }

    // Update file details
    document.getElementById('mediaDetailsTitle').textContent = file.filename;
    document.getElementById('mediaDetailsType').textContent = file.type.charAt(0).toUpperCase() + file.type.slice(1);
    document.getElementById('mediaDetailsSize').textContent = formatFileSize(file.size);
    document.getElementById('mediaDetailsPath').textContent = file.path;
    document.getElementById('mediaDetailsModified').textContent = new Date(file.modified * 1000).toLocaleString();
    document.getElementById('mediaDetailsFilename').textContent = file.filename;

    // Get dimensions for images
    if (file.type === 'image') {
        const img = new Image();
        img.onload = function() {
            document.getElementById('mediaDetailsDimensions').textContent = `${this.width} × ${this.height}`;
        };
        img.onerror = function() {
            document.getElementById('mediaDetailsDimensions').textContent = 'Unable to load';
        };
        img.src = fileUrl;
    } else {
        document.getElementById('mediaDetailsDimensions').textContent = '-';
    }
}

function closeMediaDetailsModal() {
    const modal = document.getElementById('mediaDetailsModal');
    if (modal) {
        modal.classList.remove('active');
    }

    // Remove selection
    document.querySelectorAll('.media-item').forEach(item => {
        item.classList.remove('selected');
    });

    mediaManagerState.selectedFile = null;

    // Update hash to remove modal
    const currentHash = window.location.hash.split('/media-details')[0];
    window.location.hash = currentHash || '#media-manager';
}

function toggleFilenameEdit() {
    const filenameSpan = document.getElementById('mediaDetailsFilename');
    const editBtn = document.getElementById('editFilenameBtn');

    if (!mediaManagerState.selectedFile) return;

    if (mediaManagerState.isEditing) {
        // Save changes
        const newFilename = filenameSpan.textContent.trim();
        if (newFilename && newFilename !== mediaManagerState.selectedFile.filename) {
            renameMedia(newFilename);
        }
        filenameSpan.contentEditable = false;
        filenameSpan.classList.remove('editing');
        editBtn.innerHTML = '<ion-icon name="create-outline"></ion-icon>Edit Name';
        mediaManagerState.isEditing = false;
    } else {
        // Start editing
        filenameSpan.contentEditable = true;
        filenameSpan.classList.add('editing');
        filenameSpan.focus();
        editBtn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon>Save';
        mediaManagerState.isEditing = true;

        // Select text
        const range = document.createRange();
        range.selectNodeContents(filenameSpan);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function setViewMode(mode) {
    mediaManagerState.viewMode = mode;

    // Update modal buttons if modal is open
    const modalGridBtn = document.getElementById('modalGridViewBtn');
    const modalListBtn = document.getElementById('modalListViewBtn');

    if (modalGridBtn && modalListBtn) {
        modalGridBtn.classList.remove('active');
        modalListBtn.classList.remove('active');

        if (mode === 'grid') {
            modalGridBtn.classList.add('active');
        } else {
            modalListBtn.classList.add('active');
        }
    }

    // Re-render grid
    renderMediaGrid();
}

function filterMedia() {
    const searchInput = document.getElementById('mediaSearch');
    mediaManagerState.searchTerm = searchInput.value.toLowerCase();
    applyFilters();
}

function applyFilters() {
    // Update the filtered files to be the current group's files
    mediaManagerState.filteredFiles = getSelectedGroupFiles();

    // Re-render grid
    renderMediaGrid();
}

function refreshMediaFiles() {
    loadMediaFiles();
}

// Upload Modal Functions
function openUploadModal() {
    // Create modal if it doesn't exist, or ensure it's in document.body
    let modal = document.getElementById('uploadModal');
    if (!modal || modal.parentNode !== document.body) {
        if (modal) {
            modal.remove(); // Remove existing modal
        }
        createUploadModal(); // Create new modal in document.body
        modal = document.getElementById('uploadModal');
    }

    if (modal) {
        modal.classList.add('active');
    }
}

function createUploadModal() {
    const modalHTML = `
        <div id="uploadModal" class="upload-modal">
            <div class="upload-modal-backdrop"></div>
            <div class="upload-modal-content">
                <div class="upload-modal-header">
                    <h3 class="upload-modal-title">
                        <ion-icon name="cloud-upload-outline"></ion-icon>
                        Upload Media Files
                    </h3>
                    <button id="closeUploadModal" class="upload-close-btn">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>
                <div class="upload-modal-body">
                    <div class="upload-drop-zone" onclick="document.getElementById('fileInput').click()">
                        <ion-icon name="cloud-upload-outline"></ion-icon>
                        <h4>Drop files here or click to browse</h4>
                        <p>Supported formats: JPG, PNG, GIF, WebP, SVG, MP4, WebM, MOV, AVI</p>
                    </div>
                    <input type="file" id="fileInput" multiple accept="image/*,video/*" style="display: none;">
                    <div id="uploadProgress" style="display: none; margin-top: 20px;">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="progress-text">Uploading...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    bindUploadModalEvents();
}

function bindUploadModalEvents() {
    // Close button
    const closeBtn = document.getElementById('closeUploadModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeUploadModal);
    }

    // Backdrop click
    const backdrop = document.querySelector('#uploadModal .upload-modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', closeUploadModal);
    }

    // File input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
        });
    }
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function handleFileUpload(files) {
    if (files.length === 0) return;

    const progressContainer = document.getElementById('uploadProgress');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');

    progressContainer.style.display = 'block';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
            progressText.textContent = `Uploading ${file.name}... (${i + 1}/${files.length})`;
            progressFill.style.width = `${((i + 1) / files.length) * 100}%`;

            await uploadSingleFile(file);

        } catch (error) {
            console.error('Upload error:', error);
            updateStatus(`Upload failed: ${error.message}`, 'error');
        }
    }

    progressText.textContent = 'Upload complete!';

    setTimeout(() => {
        closeUploadModal();
        refreshMediaFiles();
    }, 1000);
}

async function uploadSingleFile(file) {
    const authState = getGlobalAuthState();
    if (!authState.isAuthenticated) {
        throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Determine upload path based on current selected group's folder structure
    let uploadPage = 'general'; // Default fallback
    let uploadComponent = 'uploads'; // Default component

    if (mediaManagerState.selectedGroup && mediaManagerState.selectedGroup !== 'root') {
        const pathParts = mediaManagerState.selectedGroup.split('/');

        // Use the actual folder structure for upload
        uploadPage = pathParts[0]; // First level folder (e.g., 'general', 'profile', 'blog')

        if (pathParts.length > 1) {
            uploadComponent = pathParts[1]; // Second level folder (e.g., 'hero', 'skills', 'blog_list')
        } else {
            uploadComponent = 'general'; // If only one level, use 'general' as component
        }
    }

    formData.append('page', uploadPage);
    formData.append('component', uploadComponent);

    console.log(`🖼️ Uploading to: ${uploadPage}/${uploadComponent}`);

    const headers = {};
    if (authState.token) {
        headers['Authorization'] = `Bearer ${authState.token}`;
    }

    const apiPort = '8000';
    const response = await fetch(`${window.location.protocol}//${window.location.hostname}:${apiPort}/api.php?endpoint=media_manager&action=upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Upload failed');
    }

    return data;
}

// Media Actions Functions
async function renameMedia(newFilename) {
    if (!mediaManagerState.selectedFile) return;

    try {
        updateStatus('Renaming file...', 'loading');

        const authState = getGlobalAuthState();
        if (!authState.isAuthenticated) {
            updateStatus('Authentication required', 'error');
            return;
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        if (authState.token) {
            headers['Authorization'] = `Bearer ${authState.token}`;
        }

        const apiPort = '8000';
        const response = await fetch(`${window.location.protocol}//${window.location.hostname}:${apiPort}/api.php?endpoint=media_manager&action=rename`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                oldPath: mediaManagerState.selectedFile.path,
                newFilename: newFilename
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            updateStatus('File renamed successfully', 'success');
            refreshMediaFiles();
        } else {
            throw new Error(data.message || 'Rename failed');
        }

    } catch (error) {
        console.error('Error renaming file:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

async function deleteMedia() {
    if (!mediaManagerState.selectedFile) return;

    if (!confirm(`Are you sure you want to delete "${mediaManagerState.selectedFile.filename}"? This action cannot be undone.`)) {
        return;
    }

    try {
        updateStatus('Deleting file...', 'loading');

        const authState = getGlobalAuthState();
        if (!authState.isAuthenticated) {
            updateStatus('Authentication required', 'error');
            return;
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        if (authState.token) {
            headers['Authorization'] = `Bearer ${authState.token}`;
        }

        const apiPort = '8000';
        const response = await fetch(`${window.location.protocol}//${window.location.hostname}:${apiPort}/api.php?endpoint=media_manager&action=delete`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                path: mediaManagerState.selectedFile.path
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            updateStatus('File deleted successfully', 'success');
            refreshMediaFiles();
        } else {
            throw new Error(data.message || 'Delete failed');
        }

    } catch (error) {
        console.error('Error deleting file:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}