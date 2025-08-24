<?php
// Control PDF Viewer Component Loader v1
// Generates clean HTML with data attributes for JavaScript behavior extraction

// ✅ FLEXIBLE CONTENT LOADING: Support multiple specification methods
$contentFile = '';

// Method 1: API call parameter (client-side dynamic)
if (isset($_GET['content'])) {
    $contentFile = $_GET['content'];
}
// Method 2: Include parameter (server-side rendered)  
elseif (isset($CONTENT_FILE)) {
    $contentFile = $CONTENT_FILE;
}
// Method 3: Fallback to default
else {
    $contentFile = 'control_pdf_viewer_default_v1';
}

// Ensure .json extension and build secure path
$contentFile = preg_replace('/\.json$/', '', $contentFile) . '.json';
$dataFile = __DIR__ . '/../../../contents/control/pdf_viewer/' . $contentFile;

// Load and validate JSON data
if (!file_exists($dataFile)) {
    echo '<div class="pdf-viewer-error">PDF viewer data file not found.</div>';
    return;
}

$data = json_decode(file_get_contents($dataFile), true);
if (!$data) {
    echo '<div class="pdf-viewer-error">Invalid PDF viewer data format.</div>';
    return;
}

$viewerConfig = $data['viewer_config'] ?? [];
$availablePdfs = $data['available_pdfs'] ?? [];
$categories = $data['categories'] ?? [];
$viewModes = $data['view_modes'] ?? [];
?>

<!-- PDF Viewer Component - Modern Design -->
<div class="control-pdf-viewer-section">
    <div class="control-pdf-viewer-container">
        
        <!-- PDF Viewer Header -->
        <header class="control-pdf-viewer-header">
            <div class="pdf-viewer-title-area">
                <h3 class="control-pdf-viewer-title">
                    <ion-icon name="document-text-outline"></ion-icon>
                    <?= htmlspecialchars($viewerConfig['title'] ?? 'PDF Viewer') ?>
                </h3>
                <p class="pdf-viewer-description">
                    <?= htmlspecialchars($viewerConfig['description'] ?? '') ?>
                </p>
            </div>
            
            <div class="pdf-viewer-actions">
                <button class="pdf-viewer-upload-btn" id="uploadPdfBtn" type="button">
                    <ion-icon name="cloud-upload-outline"></ion-icon>
                    Upload PDF
                </button>
                <button class="pdf-viewer-settings-btn" id="viewerSettingsBtn" type="button">
                    <ion-icon name="settings-outline"></ion-icon>
                </button>
            </div>
        </header>

        <!-- PDF Viewer Main Content -->
        <div class="control-pdf-viewer-main">
            
            <!-- PDF Library Sidebar -->
            <aside class="pdf-library-sidebar">
                <div class="library-header">
                    <h4>Article Library</h4>
                    <div class="library-stats">
                        <span class="pdf-count" data-pdf-count="<?= count($availablePdfs) ?>">
                            <?= count($availablePdfs) ?> articles
                        </span>
                    </div>
                </div>

                <!-- Search and Filters -->
                <div class="library-controls">
                    <div class="pdf-search">
                        <input type="text" 
                               id="pdfSearchInput" 
                               placeholder="Search articles..."
                               data-search-enabled="<?= $viewerConfig['enable_search'] ? 'true' : 'false' ?>">
                        <ion-icon name="search-outline"></ion-icon>
                    </div>
                    
                    <div class="category-filter">
                        <select id="categoryFilter" data-filter-type="category">
                            <option value="">All Categories</option>
                            <?php foreach ($categories as $category): ?>
                                <option value="<?= htmlspecialchars($category) ?>">
                                    <?= htmlspecialchars($category) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <!-- PDF List -->
                <div class="pdf-list">
                    <?php foreach ($availablePdfs as $index => $pdf): ?>
                        <div class="pdf-item <?= $index === 0 ? 'active' : '' ?>" 
                             data-pdf-id="<?= htmlspecialchars($pdf['id']) ?>"
                             data-pdf-title="<?= htmlspecialchars($pdf['title']) ?>"
                             data-pdf-category="<?= htmlspecialchars($pdf['category']) ?>"
                             data-pdf-path="<?= htmlspecialchars($pdf['file_path']) ?>"
                             data-pdf-pages="<?= htmlspecialchars($pdf['pages']) ?>"
                             data-pdf-size="<?= htmlspecialchars($pdf['file_size']) ?>"
                             data-pdf-date="<?= htmlspecialchars($pdf['date_created']) ?>"
                             data-pdf-author="<?= htmlspecialchars($pdf['author']) ?>"
                             data-pdf-description="<?= htmlspecialchars($pdf['description']) ?>"
                             data-pdf-thumbnail="<?= htmlspecialchars($pdf['thumbnail'] ?? '') ?>">
                            
                            <div class="pdf-item-thumbnail">
                                <?php if (!empty($pdf['thumbnail'])): ?>
                                    <img src="<?= htmlspecialchars($pdf['thumbnail']) ?>" 
                                         alt="<?= htmlspecialchars($pdf['title']) ?> thumbnail"
                                         loading="lazy">
                                <?php else: ?>
                                    <div class="pdf-item-placeholder">
                                        <ion-icon name="document-text-outline"></ion-icon>
                                    </div>
                                <?php endif; ?>
                                
                                <div class="pdf-item-overlay">
                                    <ion-icon name="eye-outline"></ion-icon>
                                </div>
                            </div>
                            
                            <div class="pdf-item-info">
                                <h5 class="pdf-item-title"><?= htmlspecialchars($pdf['title']) ?></h5>
                                <p class="pdf-item-meta">
                                    <span class="pdf-category"><?= htmlspecialchars($pdf['category']) ?></span>
                                    <span class="pdf-pages"><?= htmlspecialchars($pdf['pages']) ?> pages</span>
                                    <span class="pdf-size"><?= htmlspecialchars($pdf['file_size']) ?></span>
                                </p>
                                <p class="pdf-item-description">
                                    <?= htmlspecialchars($pdf['description']) ?>
                                </p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </aside>

            <!-- PDF Viewer Area -->
            <main class="pdf-viewer-content">
                <div class="pdf-viewer-toolbar">
                    <div class="toolbar-left">
                        <span class="current-pdf-title" id="currentPdfTitle">
                            <?= !empty($availablePdfs) ? htmlspecialchars($availablePdfs[0]['title']) : 'No PDF Selected' ?>
                        </span>
                    </div>
                    
                    <div class="toolbar-center">
                        <button class="toolbar-btn" id="prevPageBtn" data-action="prev-page">
                            <ion-icon name="chevron-back-outline"></ion-icon>
                        </button>
                        <span class="page-info">
                            <input type="number" id="currentPageInput" value="1" min="1" max="1" class="page-number-input">
                            <span id="totalPages">of 1</span>
                        </span>
                        <button class="toolbar-btn" id="nextPageBtn" data-action="next-page">
                            <ion-icon name="chevron-forward-outline"></ion-icon>
                        </button>
                    </div>
                    
                    <div class="toolbar-right">
                        <div class="view-mode-selector">
                            <select id="viewModeSelect" data-current-mode="native">
                                <?php foreach ($viewModes as $mode): ?>
                                    <option value="<?= htmlspecialchars($mode['id']) ?>" 
                                            title="<?= htmlspecialchars($mode['description']) ?>">
                                        <?= htmlspecialchars($mode['name']) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="zoom-controls">
                            <button class="toolbar-btn" id="zoomOutBtn" data-action="zoom-out">
                                <ion-icon name="remove-outline"></ion-icon>
                            </button>
                            <span class="zoom-level" id="zoomLevel">100%</span>
                            <button class="toolbar-btn" id="zoomInBtn" data-action="zoom-in">
                                <ion-icon name="add-outline"></ion-icon>
                            </button>
                        </div>
                        
                        <button class="toolbar-btn" id="fullscreenBtn" data-action="fullscreen">
                            <ion-icon name="expand-outline"></ion-icon>
                        </button>
                    </div>
                </div>

                <!-- PDF Canvas Container -->
                <div class="pdf-canvas-container" 
                     data-zoom-enabled="<?= $viewerConfig['enable_zoom'] ? 'true' : 'false' ?>"
                     data-fullscreen-enabled="<?= $viewerConfig['enable_fullscreen'] ? 'true' : 'false' ?>"
                     data-native-styling="<?= $viewerConfig['native_styling'] ? 'true' : 'false' ?>"
                     data-default-pdf="<?= htmlspecialchars($viewerConfig['default_pdf'] ?? '') ?>">
                    
                    <div class="pdf-loading-state" id="pdfLoadingState">
                        <div class="loading-spinner"></div>
                        <p>Loading PDF...</p>
                    </div>
                    
                    <canvas id="pdfCanvas" class="pdf-canvas" hidden></canvas>
                    
                    <div class="pdf-error-state" id="pdfErrorState" hidden>
                        <ion-icon name="alert-circle-outline"></ion-icon>
                        <h4>Unable to load PDF</h4>
                        <p>The selected PDF file could not be loaded. Please try another file.</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
</div>

<!-- Hidden file input for PDF upload -->
<input type="file" id="pdfFileInput" accept=".pdf" hidden> 