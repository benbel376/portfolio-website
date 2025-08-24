<?php
/**
 * Media Manager Component Loader v1
 * Manages media files (images/videos) in page-component folders
 * SECURED COMPONENT: Requires authentication token
 */

// Check if this is a secured component request
if (isset($AUTH_TOKEN) && !empty($AUTH_TOKEN)) {
    // Validate the JWT token for secured access
    if (!validateComponentAuthToken($AUTH_TOKEN)) {
        // Return authentication required message
        echo '<div class="secured-component-auth-required">
                <div class="auth-required-message">
                    <ion-icon name="lock-closed-outline"></ion-icon>
                    <h3>Authentication Required</h3>
                    <p>Please login to access the Media Manager.</p>
                </div>
              </div>';
        return;
    }
} else {
    // No token provided, check if user is authenticated via session
    session_start();
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        // Return authentication required message
        echo '<div class="secured-component-auth-required">
                <div class="auth-required-message">
                    <ion-icon name="lock-closed-outline"></ion-icon>
                    <h3>Authentication Required</h3>
                    <p>Please login to access the Media Manager.</p>
                </div>
              </div>';
        return;
    }
}

// Token validation function
function validateComponentAuthToken($token) {
    $secret = 'portfolio_jwt_secret_2024';
    
    // Split the token
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    $header = $parts[0];
    $payload = $parts[1];
    $signature = $parts[2];
    
    // Verify signature
    $expectedSignature = hash_hmac('sha256', $header . "." . $payload, $secret, true);
    $expectedBase64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));
    
    if ($signature !== $expectedBase64Signature) {
        return false;
    }
    
    // Decode payload
    $decodedPayload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    
    // Check expiration
    if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
        return false;
    }
    
    return true;
}

// Function to recursively scan for media files
function scanMediaFiles($directory, $basePath = '') {
    $mediaFiles = [];
    $supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov', 'avi'];
    
    if (!is_dir($directory)) {
        return $mediaFiles;
    }
    
    try {
        $items = scandir($directory);
        
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            
            $fullPath = $directory . DIRECTORY_SEPARATOR . $item;
            $relativePath = $basePath ? $basePath . '/' . $item : $item;
            
            if (is_dir($fullPath)) {
                // Recursively scan subdirectories
                $subFiles = scanMediaFiles($fullPath, $relativePath);
                $mediaFiles = array_merge($mediaFiles, $subFiles);
            } else {
                $extension = strtolower(pathinfo($item, PATHINFO_EXTENSION));
                if (in_array($extension, $supportedExtensions)) {
                    // Extract page and component info from path
                    $pathParts = explode('/', $relativePath);
                    $page = $pathParts[0] ?? 'root';
                    $component = $pathParts[1] ?? 'general';
                    
                    // Use the actual filename, not from path parts
                    $filename = $item;
                    
                    // Determine media type
                    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
                    $videoExtensions = ['mp4', 'webm', 'mov', 'avi'];
                    
                    $type = 'unknown';
                    if (in_array($extension, $imageExtensions)) {
                        $type = 'image';
                    } elseif (in_array($extension, $videoExtensions)) {
                        $type = 'video';
                    }
                    
                    $mediaFiles[] = [
                        'path' => $relativePath,
                        'fullPath' => $fullPath,
                        'page' => $page,
                        'component' => $component,
                        'filename' => $filename,
                        'extension' => $extension,
                        'type' => $type,
                        'size' => filesize($fullPath),
                        'modified' => filemtime($fullPath),
                        'readable' => is_readable($fullPath),
                        'writable' => is_writable($fullPath)
                    ];
                }
            }
        }
    } catch (Exception $e) {
        // Silent fail - directory might not be accessible
        error_log("Media scan error in $directory: " . $e->getMessage());
    }
    
    return $mediaFiles;
}

// Scan the assets/images directory for media files
$mediaDir = __DIR__ . '/../../../assets/images';
$mediaFiles = scanMediaFiles($mediaDir);

// Sort files by page, then component, then filename
usort($mediaFiles, function($a, $b) {
    if ($a['page'] !== $b['page']) {
        return strcmp($a['page'], $b['page']);
    }
    if ($a['component'] !== $b['component']) {
        return strcmp($a['component'], $b['component']);
    }
    return strcmp($a['filename'], $b['filename']);
});

// Group files by page and type
$filesByPage = [];
$totalImages = 0;
$totalVideos = 0;
$totalSize = 0;

foreach ($mediaFiles as $file) {
    $filesByPage[$file['page']][] = $file;
    if ($file['type'] === 'image') $totalImages++;
    if ($file['type'] === 'video') $totalVideos++;
    $totalSize += $file['size'];
}
?>

<section id="media-manager-component" class="control-media-manager-section">
    <div class="control-media-manager-container">
        
        <!-- Clean Header with Just Title and Controls -->
        <div class="control-media-manager-header">
            <div class="control-media-manager-title-area">
                <h3 class="control-media-manager-title">
                    <ion-icon name="images-outline"></ion-icon>
                    Media Manager
                </h3>
                <div class="current-group-info">
                    <span id="currentGroupName">No group selected</span>
                    <span id="currentGroupCount" class="group-file-count">0 files</span>
                </div>
            </div>
            <div class="control-media-manager-actions">
                <button id="openFiltersBtn" class="control-media-manager-filters-btn">
                    <ion-icon name="options-outline"></ion-icon>
                    Filters & Settings
                </button>
                <button id="uploadMediaBtn" class="control-media-manager-upload-btn">
                    <ion-icon name="cloud-upload-outline"></ion-icon>
                    Upload
                </button>
            </div>
        </div>

        <!-- Clean Media Grid - No Controls Visible -->
        <div class="control-media-manager-main">
            <div class="control-media-manager-content">
                <div id="mediaGrid" class="control-media-manager-grid">
                    <!-- Media items will be loaded here dynamically -->
                </div>
            </div>

            <!-- Media Info Panel -->
            <div id="mediaInfoPanel" class="control-media-manager-info-panel" style="display: none;">
                <div class="info-panel-header">
                    <h4>Media Information</h4>
                    <button id="closeInfoPanel" onclick="closeInfoPanel()">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>
                <div class="info-panel-content">
                    <div id="mediaPreview" class="media-preview">
                        <!-- Preview will be inserted here -->
                    </div>
                    <div class="media-details">
                        <div class="detail-group">
                            <label>Filename:</label>
                            <span id="mediaFilename" class="editable-filename" contenteditable="false">-</span>
                            <button id="editFilenameBtn" onclick="toggleFilenameEdit()">
                                <ion-icon name="create-outline"></ion-icon>
                            </button>
                        </div>
                        <div class="detail-group">
                            <label>Type:</label>
                            <span id="mediaType">-</span>
                        </div>
                        <div class="detail-group">
                            <label>Size:</label>
                            <span id="mediaSize">-</span>
                        </div>
                        <div class="detail-group">
                            <label>Dimensions:</label>
                            <span id="mediaDimensions">-</span>
                        </div>
                        <div class="detail-group">
                            <label>Modified:</label>
                            <span id="mediaModified">-</span>
                        </div>
                        <div class="detail-group">
                            <label>Path:</label>
                            <span id="mediaPath">-</span>
                        </div>
                    </div>
                    <div class="media-actions">
                        <button id="downloadMediaBtn" onclick="downloadMedia()">
                            <ion-icon name="download-outline"></ion-icon>
                            Download
                        </button>
                        <button id="deleteMediaBtn" onclick="deleteMedia()" class="danger">
                            <ion-icon name="trash-outline"></ion-icon>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section> 