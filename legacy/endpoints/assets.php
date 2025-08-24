<?php
/**
 * Assets Management API Endpoint
 * Handles management of CSS, JS, and other asset files
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$type = $_GET['type'] ?? ''; // css, js, images, files
$file = $_GET['file'] ?? '';
$page = $_GET['page'] ?? '';
$component = $_GET['component'] ?? '';

try {
    switch ($method) {
        case 'GET':
            handleGetRequest($action, $type, $file, $page, $component);
            break;
        case 'POST':
            handlePostRequest($action, $type, $page, $component);
            break;
        case 'PUT':
            handlePutRequest($action, $type, $file, $page, $component);
            break;
        case 'DELETE':
            handleDeleteRequest($action, $type, $file, $page, $component);
            break;
        default:
            throw new Exception('Method not allowed', 405);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function handleGetRequest($action, $type, $file, $page, $component) {
    switch ($action) {
        case 'list':
            listAssets($type);
            break;
        case 'read':
            readAsset($type, $file);
            break;
        case 'structure':
            getAssetsStructure();
            break;
        default:
            throw new Exception('Invalid action for GET request', 400);
    }
}

function handlePostRequest($action, $type, $page, $component) {
    switch ($action) {
        case 'upload':
            uploadAsset($type, $page, $component);
            break;
        case 'create':
            createAsset($type);
            break;
        default:
            throw new Exception('Invalid action for POST request', 400);
    }
}

function handlePutRequest($action, $type, $file, $page, $component) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'update':
            updateAsset($type, $file, $input);
            break;
        case 'rename':
            renameAsset($type, $file, $input, $page, $component);
            break;
        default:
            throw new Exception('Invalid action for PUT request', 400);
    }
}

function handleDeleteRequest($action, $type, $file, $page, $component) {
    switch ($action) {
        case 'delete':
            deleteAsset($type, $file, $page, $component);
            break;
        default:
            throw new Exception('Invalid action for DELETE request', 400);
    }
}

function listAssets($type) {
    $validTypes = ['css', 'js', 'images', 'files'];
    
    if ($type && !in_array($type, $validTypes)) {
        throw new Exception('Invalid asset type', 400);
    }
    
    $basePath = __DIR__ . '/../assets';
    $result = [];
    
    if ($type) {
        $result[$type] = scanAssetDirectory("$basePath/$type");
    } else {
        foreach ($validTypes as $assetType) {
            $typePath = "$basePath/$assetType";
            if (is_dir($typePath)) {
                $result[$assetType] = scanAssetDirectory($typePath);
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $result
    ]);
}

function scanAssetDirectory($path, $relativePath = '') {
    $items = [];
    
    if (!is_dir($path)) {
        return $items;
    }
    
    $files = scandir($path);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $filePath = "$path/$file";
        $relativeFilePath = $relativePath ? "$relativePath/$file" : $file;
        
        if (is_dir($filePath)) {
            $items[] = [
                'name' => $file,
                'type' => 'directory',
                'path' => $relativeFilePath,
                'children' => scanAssetDirectory($filePath, $relativeFilePath)
            ];
        } else {
            $items[] = [
                'name' => $file,
                'type' => 'file',
                'path' => $relativeFilePath,
                'size' => filesize($filePath),
                'modified' => filemtime($filePath),
                'extension' => pathinfo($file, PATHINFO_EXTENSION)
            ];
        }
    }
    
    return $items;
}

function readAsset($type, $file) {
    if (!$type || !$file) {
        throw new Exception('Type and file parameters are required', 400);
    }
    
    $filePath = __DIR__ . "/../assets/$type/$file";
    
    if (!file_exists($filePath)) {
        throw new Exception('File not found', 404);
    }
    
    $content = file_get_contents($filePath);
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'content' => $content,
            'path' => "$type/$file",
            'type' => $extension,
            'size' => filesize($filePath),
            'modified' => filemtime($filePath)
        ]
    ]);
}

function getAssetsStructure() {
    $basePath = __DIR__ . '/../assets';
    $structure = [];
    
    $types = ['css', 'js', 'images', 'files'];
    
    foreach ($types as $type) {
        $typePath = "$basePath/$type";
        if (is_dir($typePath)) {
            $structure[$type] = scanAssetDirectory($typePath);
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $structure
    ]);
}

function uploadAsset($type, $page = '', $component = '') {
    if (!isset($_FILES['file'])) {
        throw new Exception('No file uploaded', 400);
    }
    
    $file = $_FILES['file'];
    
    // Log incoming request
    error_log("Upload request: type=$type, page=$page, component=$component, file={$file['name']}");
    
    // Build target directory based on page/component structure
    $targetDir = __DIR__ . "/../assets/$type";
    
    if ($page && $component) {
        $targetDir .= "/$page/$component";
    } elseif ($page) {
        $targetDir .= "/$page";
    }
    
    error_log("Target directory: $targetDir");
    
    // Create directory if it doesn't exist
    if (!is_dir($targetDir)) {
        error_log("Creating directory: $targetDir");
        if (!mkdir($targetDir, 0755, true)) {
            throw new Exception('Failed to create target directory', 500);
        }
    }
    
    // Check if directory is writable
    if (!is_writable($targetDir)) {
        throw new Exception('Target directory is not writable', 500);
    }
    
    $targetFile = "$targetDir/" . basename($file['name']);
    error_log("Target file: $targetFile");
    
    if (file_exists($targetFile)) {
        throw new Exception('File already exists', 409);
    }
    
    // Validate file type for images
    if ($type === 'images') {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('Invalid image type. Allowed: JPG, PNG, GIF, WebP, SVG', 400);
        }
        
        // Check file size (max 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            throw new Exception('File too large. Maximum size: 5MB', 400);
        }
    }
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
        ];
        
        $errorMsg = $errorMessages[$file['error']] ?? 'Unknown upload error';
        throw new Exception($errorMsg, 400);
    }
    
    if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
        error_log("Failed to move uploaded file from {$file['tmp_name']} to $targetFile");
        throw new Exception('Failed to upload file', 500);
    }
    
    error_log("File uploaded successfully: $targetFile");
    
    $relativePath = $type;
    if ($page && $component) {
        $relativePath .= "/$page/$component";
    } elseif ($page) {
        $relativePath .= "/$page";
    }
    $relativePath .= "/" . basename($file['name']);
    
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'path' => $relativePath,
        'filename' => basename($file['name']),
        'size' => $file['size'],
        'directory_created' => !file_exists($targetDir)
    ]);
}

function createAsset($type) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['filename']) || !isset($input['content'])) {
        throw new Exception('Filename and content are required', 400);
    }
    
    $targetDir = __DIR__ . "/../assets/$type";
    $targetFile = "$targetDir/{$input['filename']}";
    
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }
    
    if (file_exists($targetFile)) {
        throw new Exception('File already exists', 409);
    }
    
    if (file_put_contents($targetFile, $input['content']) === false) {
        throw new Exception('Failed to create file', 500);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'File created successfully',
        'path' => "$type/{$input['filename']}"
    ]);
}

function updateAsset($type, $file, $data) {
    if (!isset($data['content'])) {
        throw new Exception('Content is required', 400);
    }
    
    $filePath = __DIR__ . "/../assets/$type/$file";
    
    if (!file_exists($filePath)) {
        throw new Exception('File not found', 404);
    }
    
    // Create backup
    $backupPath = $filePath . '.backup.' . time();
    copy($filePath, $backupPath);
    
    if (file_put_contents($filePath, $data['content']) === false) {
        throw new Exception('Failed to update file', 500);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'File updated successfully',
        'backup' => basename($backupPath)
    ]);
}

function renameAsset($type, $oldFile, $data, $page = '', $component = '') {
    if (!isset($data['newFilename'])) {
        throw new Exception('New filename is required', 400);
    }
    
    // URL decode the filename in case it contains special characters
    $oldFile = urldecode($oldFile);
    $newFilename = $data['newFilename'];
    
    error_log("Rename request: type=$type, page=$page, component=$component, oldFile=$oldFile, newFilename=$newFilename");
    
    // Build file path based on page/component structure
    $basePath = __DIR__ . "/../assets/$type";
    
    if ($page && $component) {
        $filePath = "$basePath/$page/$component";
    } elseif ($page) {
        $filePath = "$basePath/$page";
    } else {
        $filePath = $basePath;
    }
    
    $oldFilePath = "$filePath/$oldFile";
    $newFilePath = "$filePath/$newFilename";
    
    error_log("Rename paths: oldFilePath=$oldFilePath, newFilePath=$newFilePath");
    
    if (!file_exists($oldFilePath)) {
        throw new Exception('File not found', 404);
    }
    
    if (file_exists($newFilePath)) {
        throw new Exception('File with new name already exists', 409);
    }
    
    // Validate file extension for images
    if ($type === 'images') {
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        $newExtension = strtolower(pathinfo($newFilename, PATHINFO_EXTENSION));
        if (!in_array($newExtension, $allowedExtensions)) {
            throw new Exception('Invalid file extension for image', 400);
        }
    }
    
    if (!rename($oldFilePath, $newFilePath)) {
        throw new Exception('Failed to rename file', 500);
    }
    
    error_log("File renamed successfully: $oldFilePath -> $newFilePath");
    
    echo json_encode([
        'success' => true,
        'message' => 'File renamed successfully',
        'oldFilename' => $oldFile,
        'newFilename' => $newFilename
    ]);
}

function deleteAsset($type, $file, $page = '', $component = '') {
    if (!$type || !$file) {
        throw new Exception('Type and file parameters are required', 400);
    }
    
    // URL decode the filename in case it contains special characters
    $file = urldecode($file);
    
    error_log("Delete request: type=$type, page=$page, component=$component, file=$file");
    
    // Build file path based on page/component structure
    $basePath = __DIR__ . "/../assets/$type";
    
    if ($page && $component) {
        $filePath = "$basePath/$page/$component/$file";
    } elseif ($page) {
        $filePath = "$basePath/$page/$file";
    } else {
        $filePath = "$basePath/$file";
    }
    
    error_log("Delete file path: $filePath");
    
    if (!file_exists($filePath)) {
        throw new Exception('File not found', 404);
    }
    
    // Create backup
    $backupDir = __DIR__ . "/../assets/.deleted";
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    $timestamp = time();
    $backupName = "{$timestamp}_{$type}";
    if ($page) $backupName .= "_{$page}";
    if ($component) $backupName .= "_{$component}";
    $backupName .= "_{$file}";
    
    $backupPath = "$backupDir/$backupName";
    copy($filePath, $backupPath);
    
    if (!unlink($filePath)) {
        throw new Exception('Failed to delete file', 500);
    }
    
    error_log("File deleted successfully: $filePath (backed up to $backupPath)");
    
    echo json_encode([
        'success' => true,
        'message' => 'File deleted successfully',
        'filename' => $file,
        'backup' => basename($backupPath)
    ]);
}
?> 