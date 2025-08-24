<?php
/**
 * Content Management API Endpoint
 * Handles CRUD operations for content files
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

// Get the request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$page = $_GET['page'] ?? '';
$component = $_GET['component'] ?? '';
$file = $_GET['file'] ?? '';

try {
    switch ($method) {
        case 'GET':
            handleGetRequest($action, $page, $component, $file);
            break;
        case 'POST':
            handlePostRequest($action, $page, $component);
            break;
        case 'PUT':
            handlePutRequest($action, $page, $component, $file);
            break;
        case 'DELETE':
            handleDeleteRequest($action, $page, $component, $file);
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

/**
 * Handle GET requests - Read content
 */
function handleGetRequest($action, $page, $component, $file) {
    switch ($action) {
        case 'list':
            listContent($page, $component);
            break;
        case 'read':
            readContent($page, $component, $file);
            break;
        case 'structure':
            getContentStructure();
            break;
        case 'dashboard':
            getDashboardStructure();
            break;
        default:
            throw new Exception('Invalid action for GET request', 400);
    }
}

/**
 * Handle POST requests - Create content
 */
function handlePostRequest($action, $page, $component) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'create':
            createContent($page, $component, $input);
            break;
        default:
            throw new Exception('Invalid action for POST request', 400);
    }
}

/**
 * Handle PUT requests - Update content
 */
function handlePutRequest($action, $page, $component, $file) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'update':
            updateContent($page, $component, $file, $input);
            break;
        default:
            throw new Exception('Invalid action for PUT request', 400);
    }
}

/**
 * Handle DELETE requests - Delete content
 */
function handleDeleteRequest($action, $page, $component, $file) {
    switch ($action) {
        case 'delete':
            deleteContent($page, $component, $file);
            break;
        default:
            throw new Exception('Invalid action for DELETE request', 400);
    }
}

/**
 * List all content files in a directory
 */
function listContent($page, $component) {
    $basePath = __DIR__ . '/../contents';
    
    if ($page && $component) {
        $path = "$basePath/$page/$component";
    } elseif ($page) {
        $path = "$basePath/$page";
    } else {
        $path = $basePath;
    }
    
    if (!is_dir($path)) {
        throw new Exception('Directory not found', 404);
    }
    
    $files = [];
    $items = scandir($path);
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $itemPath = "$path/$item";
        $isDir = is_dir($itemPath);
        
        $files[] = [
            'name' => $item,
            'type' => $isDir ? 'directory' : 'file',
            'path' => str_replace(__DIR__ . '/../contents/', '', $itemPath),
            'size' => $isDir ? null : filesize($itemPath),
            'modified' => filemtime($itemPath)
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $files
    ]);
}

/**
 * Read a specific content file
 */
function readContent($page, $component, $file) {
    if (!$page || !$component || !$file) {
        throw new Exception('Page, component, and file parameters are required', 400);
    }
    
    $filePath = __DIR__ . "/../contents/$page/$component/$file";
    
    if (!file_exists($filePath)) {
        throw new Exception('File not found', 404);
    }
    
    $content = file_get_contents($filePath);
    $isJson = pathinfo($filePath, PATHINFO_EXTENSION) === 'json';
    
    echo json_encode([
        'success' => true,
        'data' => [
            'content' => $isJson ? json_decode($content) : $content,
            'raw' => $content,
            'path' => "$page/$component/$file",
            'type' => $isJson ? 'json' : 'text'
        ]
    ]);
}

/**
 * Get the overall content structure
 */
function getContentStructure() {
    $basePath = __DIR__ . '/../contents';
    $structure = [];
    
    if (!is_dir($basePath)) {
        echo json_encode(['success' => true, 'data' => []]);
        return;
    }
    
    $pages = scandir($basePath);
    
    foreach ($pages as $page) {
        if ($page === '.' || $page === '..') continue;
        
        $pagePath = "$basePath/$page";
        if (!is_dir($pagePath)) continue;
        
        $structure[$page] = [];
        $components = scandir($pagePath);
        
        foreach ($components as $component) {
            if ($component === '.' || $component === '..') continue;
            
            $componentPath = "$pagePath/$component";
            if (!is_dir($componentPath)) continue;
            
            $structure[$page][$component] = [];
            $files = scandir($componentPath);
            
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                if (is_file("$componentPath/$file")) {
                    $structure[$page][$component][] = $file;
                }
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $structure
    ]);
}

/**
 * Create new content file
 */
function createContent($page, $component, $data) {
    if (!$page || !$component || !isset($data['filename']) || !isset($data['content'])) {
        throw new Exception('Page, component, filename, and content are required', 400);
    }
    
    $dirPath = __DIR__ . "/../contents/$page/$component";
    $filePath = "$dirPath/{$data['filename']}";
    
    // Create directory if it doesn't exist
    if (!is_dir($dirPath)) {
        mkdir($dirPath, 0755, true);
    }
    
    // Check if file already exists
    if (file_exists($filePath)) {
        throw new Exception('File already exists', 409);
    }
    
    // Write content
    $content = is_array($data['content']) ? json_encode($data['content'], JSON_PRETTY_PRINT) : $data['content'];
    
    if (file_put_contents($filePath, $content) === false) {
        throw new Exception('Failed to create file', 500);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'File created successfully',
        'path' => "$page/$component/{$data['filename']}"
    ]);
}

/**
 * Update existing content file
 */
function updateContent($page, $component, $file, $data) {
    if (!$page || !$component || !$file || !isset($data['content'])) {
        throw new Exception('Page, component, file, and content are required', 400);
    }
    
    $filePath = __DIR__ . "/../contents/$page/$component/$file";
    
    if (!file_exists($filePath)) {
        throw new Exception('File not found', 404);
    }
    
    // Create backup
    $backupPath = $filePath . '.backup.' . time();
    copy($filePath, $backupPath);
    
    // Update content
    $content = is_array($data['content']) ? json_encode($data['content'], JSON_PRETTY_PRINT) : $data['content'];
    
    if (file_put_contents($filePath, $content) === false) {
        throw new Exception('Failed to update file', 500);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'File updated successfully',
        'backup' => basename($backupPath)
    ]);
}

/**
 * Delete content file
 */
function deleteContent($page, $component, $file) {
    if (!$page || !$component || !$file) {
        throw new Exception('Page, component, and file parameters are required', 400);
    }
    
    $filePath = __DIR__ . "/../contents/$page/$component/$file";
    
    if (!file_exists($filePath)) {
        throw new Exception('File not found', 404);
    }
    
    // Create backup before deletion
    $backupPath = __DIR__ . "/../contents/.deleted/" . time() . "_{$page}_{$component}_{$file}";
    $backupDir = dirname($backupPath);
    
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    copy($filePath, $backupPath);
    
    if (!unlink($filePath)) {
        throw new Exception('Failed to delete file', 500);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'File deleted successfully',
        'backup' => basename($backupPath)
    ]);
}

/**
 * Get structure with metadata for dashboard interface
 */
function getDashboardStructure() {
    $basePath = __DIR__ . '/../contents';
    
    // Component metadata mapping
    $componentMetadata = [
        'header' => [
            'type' => 'Header Component',
            'icon' => 'list-outline',
            'description' => 'Site navigation and branding'
        ],
        'hero' => [
            'type' => 'Hero Section',
            'icon' => 'star-outline',
            'description' => 'Main banner with introduction'
        ],
        'summary' => [
            'type' => 'Summary Section',
            'icon' => 'document-text-outline',
            'description' => 'Professional summary and overview'
        ],
        'experience' => [
            'type' => 'Experience Timeline',
            'icon' => 'briefcase-outline',
            'description' => 'Work experience and career history'
        ],
        'education' => [
            'type' => 'Education Section',
            'icon' => 'school-outline',
            'description' => 'Educational background and qualifications'
        ],
        'certifications' => [
            'type' => 'Certifications',
            'icon' => 'medal-outline',
            'description' => 'Professional certifications and achievements'
        ],
        'skills' => [
            'type' => 'Skills Grid',
            'icon' => 'code-outline',
            'description' => 'Technical and professional skills'
        ],
        'testimonials' => [
            'type' => 'Testimonials',
            'icon' => 'chatbubbles-outline',
            'description' => 'Client testimonials and recommendations'
        ],
        'projects_list' => [
            'type' => 'Projects List',
            'icon' => 'grid-outline',
            'description' => 'Portfolio projects showcase'
        ],
        'blog_list' => [
            'type' => 'Articles List',
            'icon' => 'list-outline',
            'description' => 'Blog articles and content'
        ]
    ];

    // Page metadata mapping
    $pageMetadata = [
        'profile' => [
            'title' => 'Profile Page Management',
            'description' => 'Manage personal profile and professional information',
            'icon' => 'person-outline'
        ],
        'projects' => [
            'title' => 'Projects Page Management',
            'description' => 'Manage portfolio projects and showcases',
            'icon' => 'folder-outline'
        ],
        'blog' => [
            'title' => 'Blog Page Management',
            'description' => 'Manage blog articles and content',
            'icon' => 'newspaper-outline'
        ]
    ];

    $structure = [];
    
    if (!is_dir($basePath)) {
        echo json_encode(['success' => true, 'data' => []]);
        return;
    }
    
    $pages = scandir($basePath);
    
    foreach ($pages as $page) {
        if ($page === '.' || $page === '..') continue;
        
        $pagePath = "$basePath/$page";
        if (!is_dir($pagePath)) continue;
        
        // Get page metadata
        $pageData = $pageMetadata[$page] ?? [
            'title' => ucfirst($page) . ' Page Management',
            'description' => "Manage $page page components and content",
            'icon' => 'document-outline'
        ];
        
        $structure[$page] = [
            'title' => $pageData['title'],
            'description' => $pageData['description'],
            'icon' => $pageData['icon'],
            'components' => []
        ];
        
        $components = scandir($pagePath);
        
        foreach ($components as $component) {
            if ($component === '.' || $component === '..') continue;
            
            $componentPath = "$pagePath/$component";
            if (!is_dir($componentPath)) continue;
            
            // Get component metadata
            $componentData = $componentMetadata[$component] ?? [
                'type' => ucfirst(str_replace('_', ' ', $component)) . ' Component',
                'icon' => 'cube-outline',
                'description' => 'Custom component'
            ];
            
            $files = [];
            $componentFiles = scandir($componentPath);
            
            foreach ($componentFiles as $file) {
                if ($file === '.' || $file === '..') continue;
                if (is_file("$componentPath/$file")) {
                    $files[] = [
                        'name' => $file,
                        'size' => filesize("$componentPath/$file"),
                        'modified' => filemtime("$componentPath/$file"),
                        'extension' => pathinfo($file, PATHINFO_EXTENSION)
                    ];
                }
            }
            
            $structure[$page]['components'][] = [
                'name' => $component,
                'type' => $componentData['type'],
                'icon' => $componentData['icon'],
                'description' => $componentData['description'],
                'files' => $files
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $structure
    ]);
}
?> 