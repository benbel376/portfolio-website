<?php
/**
 * Media Manager API Endpoint
 * Handles media file operations with lazy loading support
 */

// Enable CORS for cross-origin requests
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000',
    'http://127.0.0.1'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:8000");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Authentication check
session_start();
$authenticated = false;

// Check JWT token first
$authHeader = getallheaders()['Authorization'] ?? '';
if (strpos($authHeader, 'Bearer ') === 0) {
    $token = substr($authHeader, 7);
    if (validateJWTToken($token)) {
        $authenticated = true;
    }
} elseif (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
    // Fallback to session authentication
    $authenticated = true;
}

if (!$authenticated) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

// Get the action
$action = $_GET['action'] ?? '';
$endpoint = $_GET['endpoint'] ?? '';

if ($endpoint !== 'media_manager') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid endpoint']);
    exit;
}

// Handle different actions
switch ($action) {
    case 'list_groups':
        handleListGroups();
        break;
    case 'list':
        $group = $_GET['group'] ?? null;
        if ($group) {
            handleListGroupFiles($group);
        } else {
            handleListAllFiles(); // Fallback for compatibility
        }
        break;
    case 'upload':
        handleUpload();
        break;
    case 'delete':
        handleDelete();
        break;
    case 'rename':
        handleRename();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function handleListGroups() {
    $mediaDir = __DIR__ . '/../assets/images';
    $groups = scanForGroupsWithMetadata($mediaDir);
    
    echo json_encode([
        'success' => true,
        'groups' => array_keys($groups), // Just the group keys for compatibility
        'groupsMetadata' => $groups, // Full metadata for each group
        'total_groups' => count($groups)
    ]);
}

function handleListGroupFiles($groupKey) {
    $mediaDir = __DIR__ . '/../assets/images';
    $files = scanGroupFiles($mediaDir, $groupKey);
    
    echo json_encode([
        'success' => true,
        'group' => $groupKey,
        'files' => $files,
        'count' => count($files)
    ]);
}

function handleListAllFiles() {
    // Legacy function for backwards compatibility
    $mediaDir = __DIR__ . '/../assets/images';
    $allFiles = scanMediaFiles($mediaDir);
    
    echo json_encode([
        'success' => true,
        'files' => $allFiles,
        'count' => count($allFiles)
    ]);
}

function scanForGroupsWithMetadata($directory, $basePath = '') {
    $groups = [];
    $supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov', 'avi'];
    
    if (!is_dir($directory)) {
        return $groups;
    }
    
    try {
        // Scan for page directories first
        $pageItems = scandir($directory);
        
        foreach ($pageItems as $pageItem) {
            if ($pageItem === '.' || $pageItem === '..') {
                continue;
            }
            
            $pagePath = $directory . DIRECTORY_SEPARATOR . $pageItem;
            
            if (is_dir($pagePath)) {
                // This is a page directory, now scan for component directories
                $componentItems = scandir($pagePath);
                
                foreach ($componentItems as $componentItem) {
                    if ($componentItem === '.' || $componentItem === '..') {
                        continue;
                    }
                    
                    $componentPath = $pagePath . DIRECTORY_SEPARATOR . $componentItem;
                    
                    if (is_dir($componentPath)) {
                        // Scan this component directory and collect metadata
                        $metadata = scanGroupMetadata($componentPath, $pageItem, $componentItem);
                        
                        if ($metadata['fileCount'] > 0) {
                            $groupKey = $pageItem . '/' . $componentItem;
                            $groups[$groupKey] = $metadata;
                        }
                    }
                }
            }
        }
    } catch (Exception $e) {
        error_log("Error scanning for groups in $directory: " . $e->getMessage());
    }
    
    // Sort groups naturally by page then component
    uksort($groups, function($a, $b) {
        $partsA = explode('/', $a);
        $partsB = explode('/', $b);
        
        // Compare page first
        $pageCompare = strcmp($partsA[0], $partsB[0]);
        if ($pageCompare !== 0) {
            return $pageCompare;
        }
        
        // If same page, compare component
        return strcmp($partsA[1], $partsB[1]);
    });
    
    return $groups;
}

function scanGroupMetadata($componentPath, $page, $component) {
    $supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov', 'avi'];
    
    $metadata = [
        'page' => $page,
        'component' => $component,
        'path' => $page . '/' . $component,
        'fileCount' => 0,
        'imageCount' => 0,
        'videoCount' => 0,
        'totalSize' => 0,
        'lastModified' => 0,
        'fileTypes' => []
    ];
    
    try {
        if (is_dir($componentPath)) {
            $files = scandir($componentPath);
            
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') {
                    continue;
                }
                
                $filePath = $componentPath . DIRECTORY_SEPARATOR . $file;
                
                if (!is_dir($filePath)) {
                    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    
                    if (in_array($extension, $supportedExtensions)) {
                        $metadata['fileCount']++;
                        
                        // Count by type
                        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])) {
                            $metadata['imageCount']++;
                        } elseif (in_array($extension, ['mp4', 'webm', 'mov', 'avi'])) {
                            $metadata['videoCount']++;
                        }
                        
                        // Track file types
                        if (!in_array($extension, $metadata['fileTypes'])) {
                            $metadata['fileTypes'][] = $extension;
                        }
                        
                        // Get file size and modification time
                        $fileSize = filesize($filePath);
                        $fileModified = filemtime($filePath);
                        
                        $metadata['totalSize'] += $fileSize;
                        $metadata['lastModified'] = max($metadata['lastModified'], $fileModified);
                    }
                }
            }
        }
    } catch (Exception $e) {
        error_log("Error scanning metadata for $componentPath: " . $e->getMessage());
    }
    
    return $metadata;
}

function scanGroupFiles($directory, $groupKey, $basePath = '') {
    $mediaFiles = [];
    $supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov', 'avi'];
    
    if (!is_dir($directory)) {
        return $mediaFiles;
    }
    
    try {
        // Split group key into page/component
        $pathParts = explode('/', $groupKey);
        if (count($pathParts) !== 2) {
            return $mediaFiles; // Invalid group key
        }
        
        $page = $pathParts[0];
        $component = $pathParts[1];
        
        // Scan specific page/component directory
        $groupPath = $directory . DIRECTORY_SEPARATOR . $page . DIRECTORY_SEPARATOR . $component;
        
        if (is_dir($groupPath)) {
            $items = scandir($groupPath);
            foreach ($items as $item) {
                if ($item === '.' || $item === '..') {
                    continue;
                }
                
                $fullPath = $groupPath . DIRECTORY_SEPARATOR . $item;
                $relativePath = $groupKey . '/' . $item;
                
                if (!is_dir($fullPath)) {
                    $extension = strtolower(pathinfo($item, PATHINFO_EXTENSION));
                    if (in_array($extension, $supportedExtensions)) {
                        $mediaFiles[] = createFileInfo($relativePath, $fullPath, $item, $page, $component);
                    }
                }
            }
        }
        
        // Sort files by name
        usort($mediaFiles, function($a, $b) {
            return strcmp($a['filename'], $b['filename']);
        });
        
    } catch (Exception $e) {
        error_log("Error scanning group files for $groupKey: " . $e->getMessage());
    }
    
    return $mediaFiles;
}

function createFileInfo($relativePath, $fullPath, $filename, $page = null, $component = null) {
    // Extract page and component info from path if not provided
    if ($page === null || $component === null) {
        $pathParts = explode('/', $relativePath);
        $page = $pathParts[0] ?? 'unknown';
        $component = $pathParts[1] ?? 'unknown';
    }
    
    // Determine media type
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    $videoExtensions = ['mp4', 'webm', 'mov', 'avi'];
    
    $type = 'unknown';
    if (in_array($extension, $imageExtensions)) {
        $type = 'image';
    } elseif (in_array($extension, $videoExtensions)) {
        $type = 'video';
    }
    
    return [
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

// Legacy function for backwards compatibility
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
                    $mediaFiles[] = createFileInfo($relativePath, $fullPath, $item);
                }
            }
        }
    } catch (Exception $e) {
        error_log("Media scan error in $directory: " . $e->getMessage());
    }
    
    return $mediaFiles;
}

function handleUpload() {
    // Handle file upload logic here
    echo json_encode(['success' => false, 'message' => 'Upload not implemented yet']);
}

function handleDelete() {
    // Handle file deletion logic here
    echo json_encode(['success' => false, 'message' => 'Delete not implemented yet']);
}

function handleRename() {
    // Handle file rename logic here
    echo json_encode(['success' => false, 'message' => 'Rename not implemented yet']);
}

function validateJWTToken($token) {
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
?> 