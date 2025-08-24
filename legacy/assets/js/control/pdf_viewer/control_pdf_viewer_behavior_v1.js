/**
 * PDF Viewer Component Behavior v1
 * Extracts data from DOM and implements native-style PDF viewing functionality
 * Following clean separation of concerns - no reliance on global variables
 */

class PDFViewerManager {
    constructor() {
        this.componentElement = document.querySelector('.control-pdf-viewer-section');

        if (!this.componentElement) {
            console.warn('PDF Viewer component not found');
            return;
        }

        // Initialize component state
        this.pdfData = [];
        this.currentPdf = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.zoomLevel = 1.0;
        this.viewMode = 'native';
        this.isFullscreen = false;
        this.pdfDoc = null;
        this.renderTask = null;

        // PDF.js setup
        this.initializePDFJS();

        // Extract data from DOM
        this.extractDataFromDOM();

        // Initialize component
        this.init();
    }

    async initializePDFJS() {
        // Load PDF.js if not already loaded
        if (typeof pdfjsLib === 'undefined') {
            try {
                // Load PDF.js from CDN
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

                // Set PDF.js worker
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                console.log('PDF.js loaded successfully');
            } catch (error) {
                console.error('Failed to load PDF.js:', error);
                this.showError('PDF viewer library failed to load.');
                return;
            }
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    extractDataFromDOM() {
        // ✅ CORRECT: Extract data from DOM structure
        const pdfItems = this.componentElement.querySelectorAll('.pdf-item');
        this.pdfData = [];

        pdfItems.forEach((item, index) => {
            const pdf = {
                id: item.dataset.pdfId,
                title: item.dataset.pdfTitle,
                category: item.dataset.pdfCategory,
                path: item.dataset.pdfPath,
                pages: parseInt(item.dataset.pdfPages) || 1,
                size: item.dataset.pdfSize,
                date: item.dataset.pdfDate,
                author: item.dataset.pdfAuthor,
                description: item.dataset.pdfDescription,
                thumbnail: item.dataset.pdfThumbnail,
                originalIndex: index,
                element: item
            };
            this.pdfData.push(pdf);
        });

        // Extract configuration from container
        const canvasContainer = this.componentElement.querySelector('.pdf-canvas-container');
        if (canvasContainer) {
            this.viewerConfig = {
                zoomEnabled: canvasContainer.dataset.zoomEnabled === 'true',
                fullscreenEnabled: canvasContainer.dataset.fullscreenEnabled === 'true',
                nativeStyling: canvasContainer.dataset.nativeStyling === 'true',
                defaultPdf: canvasContainer.dataset.defaultPdf
            };
        }

        // Extract categories for filtering
        this.extractCategoriesFromData();

        console.log('PDF Viewer data extracted:', {
            pdfs: this.pdfData.length,
            config: this.viewerConfig
        });
    }

    extractCategoriesFromData() {
        const categories = new Set();
        this.pdfData.forEach(pdf => {
            if (pdf.category) {
                categories.add(pdf.category);
            }
        });
        this.categories = Array.from(categories).sort();
    }

    init() {
        this.bindEvents();
        this.loadDefaultPdf();
        this.updateDisplay();
    }

    bindEvents() {
        // PDF item selection
        this.componentElement.addEventListener('click', (e) => {
            const pdfItem = e.target.closest('.pdf-item');
            if (pdfItem) {
                const pdfId = pdfItem.dataset.pdfId;
                this.selectPdf(pdfId);
            }
        });

        // Toolbar actions
        this.bindToolbarEvents();

        // Upload functionality
        this.bindUploadEvents();

        // Search and filter
        this.bindSearchAndFilterEvents();

        // Keyboard shortcuts
        this.bindKeyboardEvents();

        // Window resize
        window.addEventListener('resize', () => {
            if (this.pdfDoc && this.currentPage) {
                this.renderPage(this.currentPage);
            }
        });
    }

    bindToolbarEvents() {
        const toolbar = this.componentElement.querySelector('.pdf-viewer-toolbar');
        if (!toolbar) return;

        // Page navigation
        const prevBtn = toolbar.querySelector('#prevPageBtn');
        const nextBtn = toolbar.querySelector('#nextPageBtn');
        const pageInput = toolbar.querySelector('#currentPageInput');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());
        if (pageInput) {
            pageInput.addEventListener('change', (e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= this.totalPages) {
                    this.goToPage(page);
                }
            });
        }

        // Zoom controls
        const zoomInBtn = toolbar.querySelector('#zoomInBtn');
        const zoomOutBtn = toolbar.querySelector('#zoomOutBtn');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());

        // View mode
        const viewModeSelect = toolbar.querySelector('#viewModeSelect');
        if (viewModeSelect) {
            viewModeSelect.addEventListener('change', (e) => {
                this.setViewMode(e.target.value);
            });
        }

        // Fullscreen
        const fullscreenBtn = toolbar.querySelector('#fullscreenBtn');
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    bindUploadEvents() {
        const uploadBtn = this.componentElement.querySelector('#uploadPdfBtn');
        const fileInput = document.querySelector('#pdfFileInput');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    bindSearchAndFilterEvents() {
        const searchInput = this.componentElement.querySelector('#pdfSearchInput');
        const categoryFilter = this.componentElement.querySelector('#categoryFilter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterPdfs(e.target.value, categoryFilter ?.value || '');
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterPdfs(searchInput ?.value || '', e.target.value);
            });
        }
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.componentElement.closest('.collapsible-section__content[hidden]')) {
                switch (e.key) {
                    case 'ArrowLeft':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.previousPage();
                        }
                        break;
                    case 'ArrowRight':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.nextPage();
                        }
                        break;
                    case 'F11':
                        e.preventDefault();
                        this.toggleFullscreen();
                        break;
                    case 'Escape':
                        if (this.isFullscreen) {
                            e.preventDefault();
                            this.toggleFullscreen();
                        }
                        break;
                    case '+':
                    case '=':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.zoomIn();
                        }
                        break;
                    case '-':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.zoomOut();
                        }
                        break;
                }
            }
        });
    }

    async loadDefaultPdf() {
        if (this.pdfData.length > 0) {
            // Load first PDF or default PDF from config
            const defaultPdfId = this.viewerConfig ?.defaultPdf;
            const defaultPdf = defaultPdfId ?
                this.pdfData.find(pdf => pdf.id === defaultPdfId) :
                this.pdfData[0];

            if (defaultPdf) {
                await this.selectPdf(defaultPdf.id);
            }
        }
    }

    async selectPdf(pdfId) {
        const pdf = this.pdfData.find(p => p.id === pdfId);
        if (!pdf) {
            console.error('PDF not found:', pdfId);
            return;
        }

        // Update active state in DOM
        this.pdfData.forEach(p => p.element.classList.remove('active'));
        pdf.element.classList.add('active');

        // Update current PDF
        this.currentPdf = pdf;
        this.currentPage = 1;

        // Update UI
        this.updateCurrentPdfTitle(pdf.title);
        this.showLoading();

        try {
            // Load PDF document
            await this.loadPdfDocument(pdf.path);
            this.hideLoading();

            // Render first page
            await this.renderPage(1);

            console.log('PDF loaded successfully:', pdf.title);
        } catch (error) {
            console.error('Failed to load PDF:', error);
            this.showError(`Failed to load "${pdf.title}". Please try another file.`);
        }
    }

    async loadPdfDocument(pdfPath) {
        try {
            // Cancel any ongoing render task
            if (this.renderTask) {
                this.renderTask.cancel();
            }

            // Load PDF document
            const loadingTask = pdfjsLib.getDocument(pdfPath);
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;

            // Update page controls
            this.updatePageControls();

        } catch (error) {
            throw new Error(`PDF loading failed: ${error.message}`);
        }
    }

    async renderPage(pageNumber) {
        if (!this.pdfDoc || pageNumber < 1 || pageNumber > this.totalPages) {
            return;
        }

        try {
            // Cancel previous render task
            if (this.renderTask) {
                this.renderTask.cancel();
            }

            const page = await this.pdfDoc.getPage(pageNumber);
            const canvas = this.componentElement.querySelector('#pdfCanvas');
            const context = canvas.getContext('2d');

            // Calculate viewport with zoom
            const viewport = page.getViewport({ scale: this.zoomLevel });

            // Apply native styling adjustments
            if (this.viewerConfig ?.nativeStyling) {
                // Enhance for native article appearance
                const scale = this.calculateNativeScale(viewport);
                const nativeViewport = page.getViewport({ scale: scale * this.zoomLevel });
                canvas.height = nativeViewport.height;
                canvas.width = nativeViewport.width;

                // Render with enhanced settings for article-like appearance
                const renderContext = {
                    canvasContext: context,
                    viewport: nativeViewport,
                    // Enhance text rendering
                    textLayerMode: 2,
                    // Improve image quality
                    enableWebGL: true
                };

                this.renderTask = page.render(renderContext);
            } else {
                // Standard PDF rendering
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                this.renderTask = page.render(renderContext);
            }

            await this.renderTask.promise;

            // Update current page
            this.currentPage = pageNumber;
            this.updatePageControls();

            // Show canvas
            canvas.hidden = false;

            console.log(`Page ${pageNumber} rendered successfully`);

        } catch (error) {
            if (error.name !== 'RenderingCancelledException') {
                console.error('Page rendering failed:', error);
                this.showError('Failed to render PDF page.');
            }
        }
    }

    calculateNativeScale(viewport) {
        // Calculate optimal scale for native article appearance
        const canvas = this.componentElement.querySelector('#pdfCanvas');
        const container = this.componentElement.querySelector('.pdf-canvas-container');

        if (!container) return 1.5; // Default enhanced scale

        const containerWidth = container.clientWidth - 80; // Account for padding
        const maxWidth = Math.min(containerWidth, 800); // Max article width

        const scale = maxWidth / viewport.width;
        return Math.max(scale, 1.2); // Minimum scale for readability
    }

    updateCurrentPdfTitle(title) {
        const titleElement = this.componentElement.querySelector('#currentPdfTitle');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    updatePageControls() {
        const pageInput = this.componentElement.querySelector('#currentPageInput');
        const totalPagesSpan = this.componentElement.querySelector('#totalPages');
        const prevBtn = this.componentElement.querySelector('#prevPageBtn');
        const nextBtn = this.componentElement.querySelector('#nextPageBtn');

        if (pageInput) {
            pageInput.value = this.currentPage;
            pageInput.max = this.totalPages;
        }

        if (totalPagesSpan) {
            totalPagesSpan.textContent = `of ${this.totalPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
        }
    }

    async previousPage() {
        if (this.currentPage > 1) {
            await this.renderPage(this.currentPage - 1);
        }
    }

    async nextPage() {
        if (this.currentPage < this.totalPages) {
            await this.renderPage(this.currentPage + 1);
        }
    }

    async goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            await this.renderPage(pageNumber);
        }
    }

    zoomIn() {
        if (this.viewerConfig ?.zoomEnabled) {
            this.zoomLevel = Math.min(this.zoomLevel * 1.25, 3.0);
            this.updateZoomDisplay();
            if (this.pdfDoc && this.currentPage) {
                this.renderPage(this.currentPage);
            }
        }
    }

    zoomOut() {
        if (this.viewerConfig ?.zoomEnabled) {
            this.zoomLevel = Math.max(this.zoomLevel / 1.25, 0.5);
            this.updateZoomDisplay();
            if (this.pdfDoc && this.currentPage) {
                this.renderPage(this.currentPage);
            }
        }
    }

    updateZoomDisplay() {
        const zoomLevelSpan = this.componentElement.querySelector('#zoomLevel');
        if (zoomLevelSpan) {
            zoomLevelSpan.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }

    setViewMode(mode) {
        this.viewMode = mode;
        const container = this.componentElement.querySelector('.pdf-canvas-container');

        if (container) {
            // Remove existing view mode classes
            container.removeAttribute('data-view-mode');

            // Set new view mode
            if (mode !== 'native') {
                container.setAttribute('data-view-mode', mode);
            }
        }

        // Re-render current page with new view mode
        if (this.pdfDoc && this.currentPage) {
            this.renderPage(this.currentPage);
        }
    }

    toggleFullscreen() {
        if (!this.viewerConfig ?.fullscreenEnabled) return;

        const section = this.componentElement;

        if (!this.isFullscreen) {
            // Enter fullscreen
            section.classList.add('pdf-viewer-fullscreen');
            this.isFullscreen = true;

            // Update fullscreen button icon
            const fullscreenBtn = section.querySelector('#fullscreenBtn ion-icon');
            if (fullscreenBtn) {
                fullscreenBtn.setAttribute('name', 'contract-outline');
            }
        } else {
            // Exit fullscreen
            section.classList.remove('pdf-viewer-fullscreen');
            this.isFullscreen = false;

            // Update fullscreen button icon
            const fullscreenBtn = section.querySelector('#fullscreenBtn ion-icon');
            if (fullscreenBtn) {
                fullscreenBtn.setAttribute('name', 'expand-outline');
            }
        }

        // Re-render to adjust to new container size
        setTimeout(() => {
            if (this.pdfDoc && this.currentPage) {
                this.renderPage(this.currentPage);
            }
        }, 100);
    }

    filterPdfs(searchTerm, category) {
        const normalizedSearch = searchTerm.toLowerCase().trim();

        this.pdfData.forEach(pdf => {
            let visible = true;

            // Search filter
            if (normalizedSearch) {
                const searchableText = [
                    pdf.title,
                    pdf.description,
                    pdf.author,
                    pdf.category
                ].join(' ').toLowerCase();

                visible = visible && searchableText.includes(normalizedSearch);
            }

            // Category filter
            if (category) {
                visible = visible && pdf.category === category;
            }

            // Update DOM visibility
            pdf.element.style.display = visible ? 'flex' : 'none';
        });

        // Update PDF count
        const visibleCount = this.pdfData.filter(pdf =>
            pdf.element.style.display !== 'none'
        ).length;

        this.updatePdfCount(visibleCount);
    }

    updatePdfCount(count) {
        const countElement = this.componentElement.querySelector('.pdf-count');
        if (countElement) {
            countElement.textContent = `${count} article${count !== 1 ? 's' : ''}`;
            countElement.dataset.pdfCount = count;
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }

        try {
            // Create object URL for the uploaded file
            const fileUrl = URL.createObjectURL(file);

            // Create temporary PDF data object
            const uploadedPdf = {
                id: `uploaded_${Date.now()}`,
                title: file.name.replace('.pdf', ''),
                category: 'Uploaded',
                path: fileUrl,
                pages: '?', // Will be determined after loading
                size: this.formatFileSize(file.size),
                date: new Date().toISOString().split('T')[0],
                author: 'User Upload',
                description: 'Uploaded PDF file',
                thumbnail: null
            };

            // Load and display the uploaded PDF
            await this.loadUploadedPdf(uploadedPdf);

        } catch (error) {
            console.error('File upload failed:', error);
            alert('Failed to load uploaded PDF file.');
        }
    }

    async loadUploadedPdf(pdfData) {
        this.currentPdf = pdfData;
        this.currentPage = 1;

        this.updateCurrentPdfTitle(pdfData.title);
        this.showLoading();

        try {
            await this.loadPdfDocument(pdfData.path);
            this.hideLoading();
            await this.renderPage(1);

            console.log('Uploaded PDF loaded successfully:', pdfData.title);
        } catch (error) {
            console.error('Failed to load uploaded PDF:', error);
            this.showError('Failed to load uploaded PDF file.');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showLoading() {
        const loadingState = this.componentElement.querySelector('#pdfLoadingState');
        const canvas = this.componentElement.querySelector('#pdfCanvas');
        const errorState = this.componentElement.querySelector('#pdfErrorState');

        if (loadingState) loadingState.hidden = false;
        if (canvas) canvas.hidden = true;
        if (errorState) errorState.hidden = true;
    }

    hideLoading() {
        const loadingState = this.componentElement.querySelector('#pdfLoadingState');
        if (loadingState) loadingState.hidden = true;
    }

    showError(message) {
        const loadingState = this.componentElement.querySelector('#pdfLoadingState');
        const canvas = this.componentElement.querySelector('#pdfCanvas');
        const errorState = this.componentElement.querySelector('#pdfErrorState');

        if (loadingState) loadingState.hidden = true;
        if (canvas) canvas.hidden = true;
        if (errorState) {
            errorState.hidden = false;
            const errorMessage = errorState.querySelector('p');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
    }

    updateDisplay() {
        this.updateZoomDisplay();
        this.updatePdfCount(this.pdfData.length);
    }

    cleanup() {
        // Cancel any ongoing render tasks
        if (this.renderTask) {
            this.renderTask.cancel();
        }

        // Close PDF document
        if (this.pdfDoc) {
            this.pdfDoc.destroy();
        }

        // Remove event listeners
        // (Event listeners are automatically removed when component is destroyed)

        console.log('PDF Viewer cleaned up');
    }
}

// ✅ CORRECT: Initialize based on component presence
function initializePDFViewerComponent() {
    const pdfViewerComponent = document.querySelector('.control-pdf-viewer-section');

    if (pdfViewerComponent) {
        // Check if component has content (PDF items)
        const pdfItems = pdfViewerComponent.querySelectorAll('.pdf-item');

        if (pdfItems.length > 0) {
            window.pdfViewerManager = new PDFViewerManager();
            console.log('PDF Viewer component initialized');
        } else {
            console.log('PDF Viewer component found but no PDF items available');
        }
    }
}

// ✅ CORRECT: Handle both static and dynamic loading
document.addEventListener('DOMContentLoaded', initializePDFViewerComponent);
document.addEventListener('componentLoaded', initializePDFViewerComponent);

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFViewerManager;
}
