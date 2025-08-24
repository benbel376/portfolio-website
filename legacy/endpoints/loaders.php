<?php
/**
 * Loaders API Endpoint
 * Communicates with the existing loader system for dynamic content loading
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$loader = $_GET['loader'] ?? '';
$page = $_GET['page'] ?? '';
$component = $_GET['component'] ?? '';
$content = $_GET['content'] ?? '';
$token = $_GET['token'] ?? null;

try {
    switch ($method) {
        case 'GET':
            handleGetRequest($loader, $page, $component, $content, $token);
            break;
        case 'POST':
            handlePostRequest($loader, $token);
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

function handleGetRequest($loader, $page, $component, $content, $token) {
    switch ($loader) {
        case 'component':
            loadComponent($page, $component, $content, $token);
            break;
        case 'content':
            loadContent($page, $component, $content, $token);
            break;
        case 'list':
            listLoaders();
            break;
        default:
            throw new Exception('Invalid loader specified', 400);
    }
}

function handlePostRequest($loader, $token) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($loader) {
        case 'component':
            loadComponentWithData($input, $token);
            break;
        default:
            throw new Exception('Invalid loader for POST request', 400);
    }
}

function loadComponent($page, $component, $content, $token) {
    if (!$page || !$component) {
        throw new Exception('Page and component parameters are required', 400);
    }
    
    // Try three-tier structure first: loaders/page/component/component_loader_v1.php
    $loaderPath = __DIR__ . "/../loaders/{$page}/{$component}/{$component}_loader_v1.php";
    
    // Fallback to flat structure: loaders/{page}_{component}_loader_v1.php
    if (!file_exists($loaderPath)) {
        $loaderPath = __DIR__ . "/../loaders/{$page}_{$component}_loader_v1.php";
    }
    
    if (!file_exists($loaderPath)) {
        throw new Exception('Loader not found', 404);
    }
    
    try {
        // Set variables that the loader might use
        if ($content) {
            $CONTENT_FILE = $content;
        }
        
        // Make authentication token available to loaders
        if ($token) {
            $AUTH_TOKEN = $token;
        }
        
        // Start output buffering to capture the loader output
        ob_start();
        include $loaderPath;
        $html = ob_get_clean();
        
        // Return in the format the frontend component loader expects
        echo json_encode([
            'success' => true,
            'html' => $html,  // Frontend expects jsonResponse.html
            'meta' => [
                'page' => $page,
                'component' => $component,
                'content_file' => $content,
                'loader' => basename($loaderPath)
            ]
        ]);
        
    } catch (Exception $e) {
        ob_end_clean(); // Clean up output buffer
        throw new Exception('Loader execution failed: ' . $e->getMessage(), 500);
    }
}

function loadContent($page, $component, $content, $token) {
    if (!$page || !$component) {
        throw new Exception('Page and component parameters are required', 400);
    }
    
    $contentPath = __DIR__ . "/../contents/$page/$component";
    
    if (!is_dir($contentPath)) {
        throw new Exception('Content directory not found', 404);
    }
    
    // If specific content file is requested
    if ($content) {
        $filePath = "$contentPath/$content";
        
        if (!file_exists($filePath)) {
            throw new Exception('Content file not found', 404);
        }
        
        $fileContent = file_get_contents($filePath);
        $isJson = pathinfo($filePath, PATHINFO_EXTENSION) === 'json';
        
        echo json_encode([
            'success' => true,
            'data' => [
                'content' => $isJson ? json_decode($fileContent) : $fileContent,
                'raw' => $fileContent,
                'file' => $content,
                'type' => $isJson ? 'json' : 'text'
            ]
        ]);
        
    } else {
        // List all content files in the component directory
        $files = [];
        $items = scandir($contentPath);
        
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            
            if (is_file("$contentPath/$item")) {
                $files[] = [
                    'name' => $item,
                    'size' => filesize("$contentPath/$item"),
                    'modified' => filemtime("$contentPath/$item"),
                    'extension' => pathinfo($item, PATHINFO_EXTENSION)
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'files' => $files,
                'page' => $page,
                'component' => $component,
                'path' => "$page/$component"
            ]
        ]);
    }
}

function loadComponentWithData($input, $token) {
    if (!isset($input['page']) || !isset($input['component'])) {
        throw new Exception('Page and component are required', 400);
    }
    
    $page = $input['page'];
    $component = $input['component'];
    $content = $input['content'] ?? null;
    $data = $input['data'] ?? [];
    
    // Try three-tier structure first: loaders/page/component/component_loader_v1.php
    $loaderPath = __DIR__ . "/../loaders/{$page}/{$component}/{$component}_loader_v1.php";
    
    // Fallback to flat structure: loaders/{page}_{component}_loader_v1.php
    if (!file_exists($loaderPath)) {
        $loaderPath = __DIR__ . "/../loaders/{$page}_{$component}_loader_v1.php";
    }
    
    if (!file_exists($loaderPath)) {
        throw new Exception('Loader not found', 404);
    }
    
    try {
        // Set variables that the loader might use
        if ($content) {
            $CONTENT_FILE = $content;
        }
        
        // Make authentication token available to loaders
        if ($token) {
            $AUTH_TOKEN = $token;
        }
        
        // Set any additional data as variables
        foreach ($data as $key => $value) {
            $$key = $value;
        }
        
        // Start output buffering to capture the loader output
        ob_start();
        include $loaderPath;
        $html = ob_get_clean();
        
        echo json_encode([
            'success' => true,
            'data' => [
                'html' => $html,
                'page' => $page,
                'component' => $component,
                'content_file' => $content,
                'data' => $data,
                'loader' => basename($loaderPath)
            ]
        ]);
        
    } catch (Exception $e) {
        ob_end_clean(); // Clean up output buffer
        throw new Exception('Loader execution failed: ' . $e->getMessage(), 500);
    }
}

function listLoaders() {
    $loadersPath = __DIR__ . '/../loaders';
    
    if (!is_dir($loadersPath)) {
        echo json_encode([
            'success' => true,
            'data' => []
        ]);
        return;
    }
    
    $loaders = [];
    $files = scandir($loadersPath);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..' || !is_file("$loadersPath/$file")) {
            continue;
        }
        
        // Parse loader filename to extract page and component
        if (preg_match('/^(.+)_(.+)_loader_v1\.php$/', $file, $matches)) {
            $page = $matches[1];
            $component = $matches[2];
            
            $loaders[] = [
                'file' => $file,
                'page' => $page,
                'component' => $component,
                'path' => "$page/$component",
                'size' => filesize("$loadersPath/$file"),
                'modified' => filemtime("$loadersPath/$file")
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $loaders
    ]);
}
?> 