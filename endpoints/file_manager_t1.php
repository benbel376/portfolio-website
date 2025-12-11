<?php
/**
 * File Manager Endpoint
 * Unified file operations for the definitions folder
 * Handles: JSON files, images, videos, PDFs, folders
 * Actions: tree, list, read, create, update, delete, rename, duplicate, upload, validate
 */

header('Content-Type: application/json');

// Start session for authentication
session_start();

// Check authentication for all operations
$isAuthenticated = !empty($_SESSION['auth']) && $_SESSION['auth'] === true;

if (!$isAuthenticated) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required',
        'timestamp' => time()
    ]);
    exit();
}

// Get action from query string
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'tree':
            $tree = getFolderTree();
            echo json_encode([
                'success' => true,
                'tree' => $tree,
                'timestamp' => time()
            ]);
            break;
            
        case 'list':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            $path = $data['path'] ?? 'definitions';
            
            $files = listFiles($path);
            echo json_encode([
                'success' => true,
                'files' => $files,
                'path' => $path,
                'timestamp' => time()
            ]);
            break;
            
        case 'read':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            $path = $data['path'] ?? '';
            
            if (empty($path)) {
                throw new Exception('File path is required');
            }
            
            $content = readFileContent($path);
            echo json_encode([
                'success' => true,
                'content' => $content,
                'path' => $path,
                'timestamp' => time()
            ]);
            break;
            
        case 'create':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            
            $path = $data['path'] ?? '';
            $type = $data['type'] ?? 'file';
            $template = $data['template'] ?? 'empty';
            $content = $data['content'] ?? null;
            
            if (empty($path)) {
                throw new Exception('Path is required');
            }
            
            createItem($path, $type, $template, $content);
            echo json_encode([
                'success' => true,
                'message' => ucfirst($type) . ' created successfully',
                'path' => $path,
                'timestamp' => time()
            ]);
            break;
            
        case 'update':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            
            $path = $data['path'] ?? '';
            $content = $data['content'] ?? '';
            
            if (empty($path) || $content === '') {
                throw new Exception('Path and content are required');
            }
            
            updateFile($path, $content);
            echo json_encode([
                'success' => true,
                'message' => 'File updated successfully',
                'path' => $path,
                'timestamp' => time()
            ]);
            break;
            
        case 'delete':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            $path = $data['path'] ?? '';
            
            if (empty($path)) {
                throw new Exception('Path is required');
            }
            
            deleteItem($path);
            echo json_encode([
                'success' => true,
                'message' => 'Deleted successfully',
                'path' => $path,
                'timestamp' => time()
            ]);
            break;
            
        case 'rename':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            
            $path = $data['path'] ?? '';
            $newName = $data['newName'] ?? '';
            
            if (empty($path) || empty($newName)) {
                throw new Exception('Path and new name are required');
            }
            
            $newPath = renameItem($path, $newName);
            echo json_encode([
                'success' => true,
                'message' => 'Renamed successfully',
                'oldPath' => $path,
                'newPath' => $newPath,
                'timestamp' => time()
            ]);
            break;
            
        case 'duplicate':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            $path = $data['path'] ?? '';
            
            if (empty($path)) {
                throw new Exception('Path is required');
            }
            
            $newPath = duplicateItem($path);
            echo json_encode([
                'success' => true,
                'message' => 'Duplicated successfully',
                'originalPath' => $path,
                'newPath' => $newPath,
                'timestamp' => time()
            ]);
            break;
            
        case 'upload':
            handleUpload();
            break;
            
        case 'validate':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            $content = $data['content'] ?? '';
            
            $validation = validateJSON($content);
            echo json_encode([
                'success' => true,
                'valid' => $validation['valid'],
                'errors' => $validation['errors'],
                'timestamp' => time()
            ]);
            break;
            
        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid action',
                'available_actions' => ['tree', 'list', 'read', 'create', 'update', 'delete', 'rename', 'duplicate', 'upload', 'validate']
            ]);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => time()
    ]);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate path is within definitions folder
 */
function validatePath($path) {
    if (strpos($path, 'definitions') !== 0) {
        return false;
    }
    if (strpos($path, '..') !== false) {
        return false;
    }
    if (!preg_match('#^[a-zA-Z0-9_\-/\.]+$#', $path)) {
        return false;
    }
    return true;
}

/**
 * Get folder tree structure
 */
function getFolderTree() {
    $basePath = __DIR__ . '/../definitions';
    return buildTreeNode($basePath, 'definitions');
}

/**
 * Build tree node recursively
 */
function buildTreeNode($fullPath, $relativePath) {
    $node = [
        'name' => basename($fullPath),
        'path' => $relativePath,
        'type' => 'folder',
        'children' => []
    ];
    
    if (!is_dir($fullPath)) {
        return null;
    }
    
    $items = scandir($fullPath);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $itemFullPath = $fullPath . '/' . $item;
        $itemRelativePath = $relativePath . '/' . $item;
        
        if (is_dir($itemFullPath)) {
            $childNode = buildTreeNode($itemFullPath, $itemRelativePath);
            if ($childNode) {
                $node['children'][] = $childNode;
            }
        }
    }
    
    usort($node['children'], function($a, $b) {
        return strcasecmp($a['name'], $b['name']);
    });
    
    return $node;
}

/**
 * List files in a directory
 */
function listFiles($path) {
    if (!validatePath($path)) {
        throw new Exception('Invalid path');
    }
    
    $fullPath = __DIR__ . '/../' . $path;
    
    if (!is_dir($fullPath)) {
        throw new Exception('Directory not found');
    }
    
    $files = [];
    $items = scandir($fullPath);
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $itemFullPath = $fullPath . '/' . $item;
        $itemRelativePath = $path . '/' . $item;
        
        $isDir = is_dir($itemFullPath);
        $extension = $isDir ? null : strtolower(pathinfo($item, PATHINFO_EXTENSION));
        
        $files[] = [
            'name' => $item,
            'path' => $itemRelativePath,
            'type' => $isDir ? 'folder' : 'file',
            'extension' => $extension,
            'size' => $isDir ? null : filesize($itemFullPath),
            'modified' => filemtime($itemFullPath)
        ];
    }
    
    return $files;
}

/**
 * Read file content
 */
function readFileContent($path) {
    if (!validatePath($path)) {
        throw new Exception('Invalid file path');
    }
    
    $fullPath = __DIR__ . '/../' . $path;
    
    if (!file_exists($fullPath)) {
        throw new Exception('File not found');
    }
    
    if (is_dir($fullPath)) {
        throw new Exception('Cannot read directory');
    }
    
    $content = file_get_contents($fullPath);
    
    // Validate JSON for .json files
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext === 'json') {
        json_decode($content);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON in file: ' . json_last_error_msg());
        }
    }
    
    return $content;
}

/**
 * Create new file or folder
 */
function createItem($path, $type, $template, $content = null) {
    if (!validatePath($path)) {
        throw new Exception('Invalid path');
    }
    
    $fullPath = __DIR__ . '/../' . $path;
    
    if (file_exists($fullPath)) {
        throw new Exception('Item already exists');
    }
    
    if ($type === 'folder') {
        if (!mkdir($fullPath, 0755, true)) {
            throw new Exception('Failed to create folder');
        }
    } else {
        // Use provided content or template
        $fileContent = $content !== null ? $content : getTemplateContent($template);
        
        // Ensure parent directory exists
        $parentDir = dirname($fullPath);
        if (!is_dir($parentDir)) {
            mkdir($parentDir, 0755, true);
        }
        
        if (file_put_contents($fullPath, $fileContent) === false) {
            throw new Exception('Failed to create file');
        }
    }
}

/**
 * Get template content for new files
 */
function getTemplateContent($template) {
    switch ($template) {
        case 'page':
            return json_encode([
                'objects' => [
                    [
                        'type' => 'container',
                        'component' => 'vertical/type_1',
                        'id' => 'main-container',
                        'parentTab' => 'about',
                        'navigation' => [
                            'defaultState' => 'hidden',
                            'allowedStates' => ['visible', 'hidden']
                        ],
                        'objects' => []
                    ]
                ]
            ], JSON_PRETTY_PRINT);
            
        case 'profile':
            return json_encode([
                'site' => 'top_bar_site_t2.json',
                'pages' => []
            ], JSON_PRETTY_PRINT);
            
        case 'site':
            return json_encode([
                'type' => 'top_bar/type_2',
                'branding' => [
                    'title' => 'New Site'
                ],
                'navigation' => [
                    'defaultNavigation' => [
                        'hash' => 'main-container/visible'
                    ],
                    'tabs' => []
                ]
            ], JSON_PRETTY_PRINT);
            
        default:
            return '{}';
    }
}

/**
 * Update file content
 */
function updateFile($path, $content) {
    if (!validatePath($path)) {
        throw new Exception('Invalid file path');
    }
    
    $fullPath = __DIR__ . '/../' . $path;
    
    if (!file_exists($fullPath)) {
        throw new Exception('File not found');
    }
    
    if (is_dir($fullPath)) {
        throw new Exception('Cannot update directory');
    }
    
    // Validate JSON for .json files
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext === 'json') {
        $validation = validateJSON($content);
        if (!$validation['valid']) {
            throw new Exception('Invalid JSON: ' . implode(', ', $validation['errors']));
        }
    }
    
    if (file_put_contents($fullPath, $content) === false) {
        throw new Exception('Failed to update file');
    }
}

/**
 * Delete file or folder
 */
function deleteItem($path) {
    if (!validatePath($path)) {
        throw new Exception('Invalid path');
    }
    
    // Prevent deleting root definitions folder
    if ($path === 'definitions') {
        throw new Exception('Cannot delete root definitions folder');
    }
    
    $fullPath = __DIR__ . '/../' . $path;
    
    if (!file_exists($fullPath)) {
        throw new Exception('Item not found');
    }
    
    if (is_dir($fullPath)) {
        // Delete directory recursively
        if (!deleteDirectory($fullPath)) {
            throw new Exception('Failed to delete folder');
        }
    } else {
        if (!unlink($fullPath)) {
            throw new Exception('Failed to delete file');
        }
    }
}

/**
 * Delete directory recursively
 */
function deleteDirectory($dir) {
    if (!is_dir($dir)) {
        return false;
    }
    
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $path = $dir . '/' . $item;
        if (is_dir($path)) {
            deleteDirectory($path);
        } else {
            unlink($path);
        }
    }
    
    return rmdir($dir);
}

/**
 * Rename file or folder
 */
function renameItem($path, $newName) {
    if (!validatePath($path)) {
        throw new Exception('Invalid path');
    }
    
    $fullPath = __DIR__ . '/../' . $path;
    
    if (!file_exists($fullPath)) {
        throw new Exception('Item not found');
    }
    
    // Validate new name
    if (!preg_match('/^[a-zA-Z0-9_\-\.]+$/', $newName)) {
        throw new Exception('Invalid name. Use only letters, numbers, underscores, hyphens, and dots.');
    }
    
    $parentDir = dirname($fullPath);
    $newFullPath = $parentDir . '/' . $newName;
    $newRelativePath = dirname($path) . '/' . $newName;
    
    if (file_exists($newFullPath)) {
        throw new Exception('An item with that name already exists');
    }
    
    if (!rename($fullPath, $newFullPath)) {
        throw new Exception('Failed to rename');
    }
    
    return $newRelativePath;
}

/**
 * Duplicate file
 */
function duplicateItem($path) {
    if (!validatePath($path)) {
        throw new Exception('Invalid path');
    }
    
    $fullPath = __DIR__ . '/../' . $path;
    
    if (!file_exists($fullPath)) {
        throw new Exception('Item not found');
    }
    
    if (is_dir($fullPath)) {
        throw new Exception('Cannot duplicate folders');
    }
    
    $pathInfo = pathinfo($fullPath);
    $baseName = $pathInfo['filename'];
    $extension = isset($pathInfo['extension']) ? '.' . $pathInfo['extension'] : '';
    $parentDir = $pathInfo['dirname'];
    
    $counter = 1;
    do {
        $newName = $baseName . '_copy' . ($counter > 1 ? $counter : '') . $extension;
        $newFullPath = $parentDir . '/' . $newName;
        $counter++;
    } while (file_exists($newFullPath) && $counter < 100);
    
    if (!copy($fullPath, $newFullPath)) {
        throw new Exception('Failed to duplicate');
    }
    
    return dirname($path) . '/' . $newName;
}

/**
 * Handle file upload
 */
function handleUpload() {
    if (!isset($_FILES['file'])) {
        throw new Exception('No file uploaded');
    }
    
    $file = $_FILES['file'];
    $targetPath = $_POST['path'] ?? 'definitions/media';
    
    if (!validatePath($targetPath)) {
        throw new Exception('Invalid upload path');
    }
    
    // Validate file
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Upload error: ' . $file['error']);
    }
    
    // Check file size (max 10MB)
    $maxSize = 10 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        throw new Exception('File too large. Maximum size is 10MB.');
    }
    
    // Validate file type
    $allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf',
        'application/json'
    ];
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('File type not allowed: ' . $mimeType);
    }
    
    // Sanitize filename
    $fileName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $file['name']);
    
    // Ensure target directory exists
    $targetDir = __DIR__ . '/../' . $targetPath;
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }
    
    // Handle duplicate names
    $targetFile = $targetDir . '/' . $fileName;
    if (file_exists($targetFile)) {
        $pathInfo = pathinfo($fileName);
        $baseName = $pathInfo['filename'];
        $extension = isset($pathInfo['extension']) ? '.' . $pathInfo['extension'] : '';
        
        $counter = 1;
        do {
            $fileName = $baseName . '_' . $counter . $extension;
            $targetFile = $targetDir . '/' . $fileName;
            $counter++;
        } while (file_exists($targetFile) && $counter < 100);
    }
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
        throw new Exception('Failed to save uploaded file');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'path' => $targetPath . '/' . $fileName,
        'fileName' => $fileName,
        'timestamp' => time()
    ]);
}

/**
 * Validate JSON content
 */
function validateJSON($content) {
    $errors = [];
    
    json_decode($content);
    $jsonError = json_last_error();
    
    if ($jsonError !== JSON_ERROR_NONE) {
        $errors[] = json_last_error_msg();
        return ['valid' => false, 'errors' => $errors];
    }
    
    return ['valid' => true, 'errors' => []];
}

?>
