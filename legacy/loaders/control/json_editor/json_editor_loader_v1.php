<?php
/**
 * JSON Editor Component Loader v1
 * Scans all JSON files in the project structure and provides editing interface
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
                    <p>Please login to access the JSON Editor.</p>
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
                    <p>Please login to access the JSON Editor.</p>
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

// Function to recursively scan for JSON files
function scanJsonFiles($directory, $basePath = '') {
    $jsonFiles = [];
    
    if (!is_dir($directory)) {
        return $jsonFiles;
    }
    
    $items = scandir($directory);
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        
        $fullPath = $directory . DIRECTORY_SEPARATOR . $item;
        $relativePath = $basePath ? $basePath . '/' . $item : $item;
        
        if (is_dir($fullPath)) {
            // Recursively scan subdirectories
            $subFiles = scanJsonFiles($fullPath, $relativePath);
            $jsonFiles = array_merge($jsonFiles, $subFiles);
        } elseif (pathinfo($item, PATHINFO_EXTENSION) === 'json') {
            // Extract page and component info from path
            $pathParts = explode('/', $relativePath);
            $page = $pathParts[0] ?? 'unknown';
            $component = $pathParts[1] ?? 'unknown';
            $filename = $pathParts[2] ?? $item;
            
            $jsonFiles[] = [
                'path' => $relativePath,
                'fullPath' => $fullPath,
                'page' => $page,
                'component' => $component,
                'filename' => $filename,
                'size' => filesize($fullPath),
                'modified' => filemtime($fullPath),
                'readable' => is_readable($fullPath),
                'writable' => is_writable($fullPath)
            ];
        }
    }
    
    return $jsonFiles;
}

// Scan the contents directory for JSON files
$contentsDir = __DIR__ . '/../../../contents';
$jsonFiles = scanJsonFiles($contentsDir);

// Sort files by page, then component, then filename
usort($jsonFiles, function($a, $b) {
    if ($a['page'] !== $b['page']) {
        return strcmp($a['page'], $b['page']);
    }
    if ($a['component'] !== $b['component']) {
        return strcmp($a['component'], $b['component']);
    }
    return strcmp($a['filename'], $b['filename']);
});

// Group files by page for better organization
$filesByPage = [];
foreach ($jsonFiles as $file) {
    $filesByPage[$file['page']][] = $file;
}
?>

<section id="json-editor-component" class="control-json-editor-section">
    <div class="control-json-editor-container">
        
        <!-- JSON Editor Header -->
        <div class="control-json-editor-header">
            <div class="control-json-editor-title-area">
                <h3 class="control-json-editor-title">
                    <ion-icon name="code-outline"></ion-icon>
                    JSON Editor
                </h3>
            </div>
            <div class="control-json-editor-actions">
                <button id="openFileModal" class="control-json-editor-file-browser-btn">
                    Browse Files
                </button>
            </div>
        </div>

        <!-- Full Width Editor -->
        <div class="control-json-editor-main">
            
            <!-- Editor Header -->
            <div class="control-json-editor-editor-header">
                <div class="control-json-editor-current-file-info">
                    <span id="currentFileName" class="control-json-editor-current-file-name">No file selected</span>
                    <span id="currentFilePath" class="control-json-editor-current-file-path"></span>
                </div>
                
                <div class="control-json-editor-editor-actions">
                    <button id="formatJson" class="control-json-editor-editor-btn" title="Format JSON" disabled>
                        <ion-icon name="code-outline"></ion-icon>
                        Format
                    </button>
                    <button id="validateJson" class="control-json-editor-editor-btn" title="Validate JSON" disabled>
                        <ion-icon name="checkmark-circle-outline"></ion-icon>
                        Validate
                    </button>
                    <button id="saveJson" class="control-json-editor-editor-btn" title="Save changes" disabled>
                        <ion-icon name="save-outline"></ion-icon>
                        Save
                    </button>
                </div>
            </div>

            <!-- Editor Content Area -->
            <div class="control-json-editor-editor-content">
                <div id="jsonEditorEmpty" class="control-json-editor-editor-empty-state">
                    <h4>Select a JSON file</h4>
                </div>
                
                <div id="jsonEditorContainer" class="control-json-editor-editor-container" style="display: none;">
                    <textarea id="jsonTextarea" class="control-json-editor-json-textarea" placeholder="Loading..."></textarea>
                </div>
            </div>

            <!-- Editor Status Bar -->
            <div class="control-json-editor-status-bar">
                <div class="control-json-editor-status-left">
                    <span id="editorStatus" class="control-json-editor-status-text">Ready</span>
                    <span id="jsonValidation" class="control-json-editor-validation-status"></span>
                </div>
                <div class="control-json-editor-status-right">
                    <span id="cursorPosition" class="control-json-editor-cursor-info">Ln 1, Col 1</span>
                    <span id="documentStats" class="control-json-editor-document-stats"></span>
                </div>
            </div>
        </div>
    </div>
</section> 