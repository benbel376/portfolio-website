<?php
/**
 * JSON Editor API Endpoint
 * Handles loading and saving JSON files for the editor
 * Supports both JWT token and session-based authentication
 */

session_start();

// Function to validate JWT token
function validateJwtToken($token) {
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

// Check authentication - either JWT token or session
$isAuthenticated = false;

// First, check for JWT token in Authorization header
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if ($authHeader && strpos($authHeader, 'Bearer ') === 0) {
    $token = substr($authHeader, 7); // Remove "Bearer " prefix
    if (validateJwtToken($token)) {
        $isAuthenticated = true;
    }
}

// Fallback to session-based authentication
if (!$isAuthenticated) {
    if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
        $isAuthenticated = true;
    }
}

// If neither authentication method works, deny access
if (!$isAuthenticated) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required. Please provide a valid JWT token or login session.'
    ]);
    exit();
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'load':
            loadJsonFile();
            break;
        case 'save':
            saveJsonFile();
            break;
        case 'list':
            listJsonFiles();
            break;
        case 'browse':
            browseJsonFiles();
            break;
        default:
            throw new Exception('Invalid action. Available actions: load, save, list, browse', 400);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function loadJsonFile() {
    $file = $_GET['file'] ?? '';
    
    if (empty($file)) {
        throw new Exception('File parameter is required', 400);
    }
    
    // Security: Prevent directory traversal
    if (strpos($file, '..') !== false || strpos($file, '/') === 0) {
        throw new Exception('Invalid file path', 403);
    }
    
    $filePath = __DIR__ . '/../contents/' . $file;
    
    // Check if file exists
    if (!file_exists($filePath)) {
        throw new Exception('File not found', 404);
    }
    
    // Check if file is readable
    if (!is_readable($filePath)) {
        throw new Exception('File is not readable', 403);
    }
    
    // Check if it's actually a JSON file
    if (pathinfo($filePath, PATHINFO_EXTENSION) !== 'json') {
        throw new Exception('File is not a JSON file', 400);
    }
    
    $content = file_get_contents($filePath);
    
    if ($content === false) {
        throw new Exception('Failed to read file', 500);
    }
    
    // Validate JSON
    json_decode($content);
    if (json_last_error() !== JSON_ERROR_NONE) {
        // If it's not valid JSON, still return it but with a warning
        echo json_encode([
            'success' => true,
            'content' => $content,
            'warning' => 'File contains invalid JSON: ' . json_last_error_msg(),
            'file' => $file,
            'size' => strlen($content),
            'modified' => filemtime($filePath)
        ]);
        return;
    }
    
    echo json_encode([
        'success' => true,
        'content' => $content,
        'file' => $file,
        'size' => strlen($content),
        'modified' => filemtime($filePath)
    ]);
}

function saveJsonFile() {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }
    
    $file = $input['file'] ?? '';
    $content = $input['content'] ?? '';
    
    if (empty($file)) {
        throw new Exception('File parameter is required', 400);
    }
    
    if (empty($content)) {
        throw new Exception('Content parameter is required', 400);
    }
    
    // Security: Prevent directory traversal
    if (strpos($file, '..') !== false || strpos($file, '/') === 0) {
        throw new Exception('Invalid file path', 403);
    }
    
    // Validate JSON content before saving
    json_decode($content);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON content: ' . json_last_error_msg(), 400);
    }
    
    $filePath = __DIR__ . '/../contents/' . $file;
    
    // Check if file exists
    if (!file_exists($filePath)) {
        throw new Exception('File not found', 404);
    }
    
    // Check if file is writable
    if (!is_writable($filePath)) {
        throw new Exception('File is not writable', 403);
    }
    
    // Check if it's actually a JSON file
    if (pathinfo($filePath, PATHINFO_EXTENSION) !== 'json') {
        throw new Exception('File is not a JSON file', 400);
    }
    
    // Create backup before saving
    $backupPath = $filePath . '.backup.' . time();
    if (!copy($filePath, $backupPath)) {
        // If backup fails, warn but continue
        error_log("Failed to create backup for $filePath");
    }
    
    // Save the file
    $result = file_put_contents($filePath, $content);
    
    if ($result === false) {
        throw new Exception('Failed to save file', 500);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'File saved successfully',
        'file' => $file,
        'size' => strlen($content),
        'backup' => basename($backupPath)
    ]);
}

function listJsonFiles() {
    $contentsDir = __DIR__ . '/../contents';
    
    if (!is_dir($contentsDir)) {
        throw new Exception('Contents directory not found', 404);
    }
    
    $files = scanJsonFilesRecursive($contentsDir);
    
    echo json_encode([
        'success' => true,
        'files' => $files,
        'count' => count($files)
    ]);
}

function browseJsonFiles() {
    $contentsDir = __DIR__ . '/../contents';
    
    if (!is_dir($contentsDir)) {
        throw new Exception('Contents directory not found', 404);
    }
    
    $files = scanJsonFilesRecursive($contentsDir);
    
    // Group files by page and component for better organization
    $grouped = [];
    foreach ($files as $file) {
        $page = $file['page'];
        $component = $file['component'];
        
        if (!isset($grouped[$page])) {
            $grouped[$page] = [];
        }
        
        if (!isset($grouped[$page][$component])) {
            $grouped[$page][$component] = [];
        }
        
        $grouped[$page][$component][] = $file;
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'files' => $files,
            'grouped' => $grouped,
            'pages' => array_keys($grouped),
            'total_files' => count($files),
            'total_pages' => count($grouped)
        ]
    ]);
}

function scanJsonFilesRecursive($directory, $basePath = '') {
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
            $subFiles = scanJsonFilesRecursive($fullPath, $relativePath);
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
?> 