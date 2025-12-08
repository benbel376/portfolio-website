<?php
/**
 * Definition Management Endpoint
 * Handles CRUD operations for JSON definition files
 */

header('Content-Type: application/json');

// Get action from query string
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            // List all JSON definition files
            $files = listDefinitionFiles();
            echo json_encode([
                'success' => true,
                'files' => $files,
                'timestamp' => time()
            ]);
            break;
            
        case 'read':
            // Read specific file
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            $path = $data['path'] ?? '';
            
            if (empty($path)) {
                throw new Exception('File path is required');
            }
            
            $content = readDefinitionFile($path);
            echo json_encode([
                'success' => true,
                'content' => $content,
                'path' => $path,
                'timestamp' => time()
            ]);
            break;
            
        case 'create':
            // Create new file
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            
            $path = $data['path'] ?? '';
            $content = $data['content'] ?? '';
            
            if (empty($path) || empty($content)) {
                throw new Exception('Path and content are required');
            }
            
            createDefinitionFile($path, $content);
            echo json_encode([
                'success' => true,
                'message' => 'File created successfully',
                'path' => $path,
                'timestamp' => time()
            ]);
            break;
            
        case 'update':
            // Update existing file
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            
            $path = $data['path'] ?? '';
            $content = $data['content'] ?? '';
            
            if (empty($path) || empty($content)) {
                throw new Exception('Path and content are required');
            }
            
            updateDefinitionFile($path, $content);
            echo json_encode([
                'success' => true,
                'message' => 'File updated successfully',
                'path' => $path,
                'timestamp' => time()
            ]);
            break;
            
        case 'delete':
            // Delete file
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            
            $path = $data['path'] ?? '';
            
            if (empty($path)) {
                throw new Exception('File path is required');
            }
            
            deleteDefinitionFile($path);
            echo json_encode([
                'success' => true,
                'message' => 'File deleted successfully',
                'path' => $path,
                'timestamp' => time()
            ]);
            break;
            
        case 'validate':
            // Validate JSON content
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
                'available_actions' => ['list', 'read', 'create', 'update', 'delete', 'validate']
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

/**
 * List all JSON definition files
 */
function listDefinitionFiles() {
    $basePath = __DIR__ . '/../definitions';
    $files = [];
    
    // Scan pages
    $pagesPath = $basePath . '/pages';
    if (is_dir($pagesPath)) {
        $pageFiles = glob($pagesPath . '/*.json');
        foreach ($pageFiles as $file) {
            $files[] = [
                'name' => basename($file),
                'path' => 'definitions/pages/' . basename($file),
                'type' => 'pages',
                'lastModified' => filemtime($file)
            ];
        }
    }
    
    // Scan profiles
    $profilesPath = $basePath . '/profiles';
    if (is_dir($profilesPath)) {
        $profileFiles = glob($profilesPath . '/*.json');
        foreach ($profileFiles as $file) {
            $files[] = [
                'name' => basename($file),
                'path' => 'definitions/profiles/' . basename($file),
                'type' => 'profiles',
                'lastModified' => filemtime($file)
            ];
        }
    }
    
    // Scan sites
    $sitesPath = $basePath . '/sites';
    if (is_dir($sitesPath)) {
        $siteFiles = glob($sitesPath . '/*.json');
        foreach ($siteFiles as $file) {
            $files[] = [
                'name' => basename($file),
                'path' => 'definitions/sites/' . basename($file),
                'type' => 'sites',
                'lastModified' => filemtime($file)
            ];
        }
    }
    
    return $files;
}

/**
 * Read definition file
 */
function readDefinitionFile($path) {
    $fullPath = __DIR__ . '/../' . $path;
    
    if (!file_exists($fullPath)) {
        throw new Exception('File not found: ' . $path);
    }
    
    $content = file_get_contents($fullPath);
    
    // Validate JSON
    json_decode($content);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON in file: ' . json_last_error_msg());
    }
    
    return $content;
}

/**
 * Create definition file
 */
function createDefinitionFile($path, $content) {
    $fullPath = __DIR__ . '/../' . $path;
    
    // Validate path
    if (!preg_match('#^definitions/(pages|profiles|sites)/[a-zA-Z0-9_\-]+\.json$#', $path)) {
        throw new Exception('Invalid file path');
    }
    
    // Check if file already exists
    if (file_exists($fullPath)) {
        throw new Exception('File already exists');
    }
    
    // Validate JSON
    $validation = validateJSON($content);
    if (!$validation['valid']) {
        throw new Exception('Invalid JSON: ' . implode(', ', $validation['errors']));
    }
    
    // Create file
    if (file_put_contents($fullPath, $content) === false) {
        throw new Exception('Failed to create file');
    }
}

/**
 * Update definition file
 */
function updateDefinitionFile($path, $content) {
    $fullPath = __DIR__ . '/../' . $path;
    
    // Validate path
    if (!preg_match('#^definitions/(pages|profiles|sites)/[a-zA-Z0-9_\-]+\.json$#', $path)) {
        throw new Exception('Invalid file path');
    }
    
    // Check if file exists
    if (!file_exists($fullPath)) {
        throw new Exception('File not found');
    }
    
    // Validate JSON
    $validation = validateJSON($content);
    if (!$validation['valid']) {
        throw new Exception('Invalid JSON: ' . implode(', ', $validation['errors']));
    }
    
    // Update file
    if (file_put_contents($fullPath, $content) === false) {
        throw new Exception('Failed to update file');
    }
}

/**
 * Delete definition file
 */
function deleteDefinitionFile($path) {
    $fullPath = __DIR__ . '/../' . $path;
    
    // Validate path
    if (!preg_match('#^definitions/(pages|profiles|sites)/[a-zA-Z0-9_\-]+\.json$#', $path)) {
        throw new Exception('Invalid file path');
    }
    
    // Check if file exists
    if (!file_exists($fullPath)) {
        throw new Exception('File not found');
    }
    
    // Delete file
    if (!unlink($fullPath)) {
        throw new Exception('Failed to delete file');
    }
}

/**
 * Validate JSON content
 */
function validateJSON($content) {
    $errors = [];
    
    // Try to decode
    json_decode($content);
    $jsonError = json_last_error();
    
    if ($jsonError !== JSON_ERROR_NONE) {
        $errors[] = json_last_error_msg();
        return ['valid' => false, 'errors' => $errors];
    }
    
    return ['valid' => true, 'errors' => []];
}

?>
