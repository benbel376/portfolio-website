<?php
/**
 * Portfolio API Router
 * Routes requests to appropriate endpoint handlers
 */

// Handle CORS properly for credentialed requests
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost',
    'http://localhost:80',
    'http://localhost:8000',
    'http://127.0.0.1',
    'http://127.0.0.1:80',
    'http://127.0.0.1:8000'
];

header('Content-Type: application/json');

// Set CORS headers based on origin
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$endpoint = $_GET['endpoint'] ?? '';

try {
    switch ($endpoint) {
        case 'content':
            include __DIR__ . '/endpoints/content.php';
            break;
        case 'assets':
            include __DIR__ . '/endpoints/assets.php';
            break;
        case 'loaders':
            include __DIR__ . '/endpoints/loaders.php';
            break;
        case 'auth':
            include __DIR__ . '/endpoints/auth.php';
            break;
        case 'json_editor':
            include __DIR__ . '/endpoints/json_editor.php';
            break;
        case 'media_manager':
            include __DIR__ . '/endpoints/media_manager.php';
            break;
        case 'info':
            showApiInfo();
            break;
        default:
            throw new Exception('Invalid endpoint. Available endpoints: content, assets, loaders, auth, json_editor, media_manager, info', 400);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function showApiInfo() {
    echo json_encode([
        'success' => true,
        'data' => [
            'name' => 'Portfolio API',
            'version' => '1.0.0',
            'description' => 'API for managing portfolio content and assets',
            'endpoints' => [
                'content' => [
                    'description' => 'Manage content files (JSON data)',
                    'methods' => ['GET', 'POST', 'PUT', 'DELETE'],
                    'actions' => ['list', 'read', 'create', 'update', 'delete', 'structure'],
                    'examples' => [
                        'GET /api.php?endpoint=content&action=structure',
                        'GET /api.php?endpoint=content&action=list&page=profile&component=hero',
                        'GET /api.php?endpoint=content&action=read&page=profile&component=hero&file=data.json',
                        'POST /api.php?endpoint=content&action=create&page=profile&component=hero',
                        'PUT /api.php?endpoint=content&action=update&page=profile&component=hero&file=data.json',
                        'DELETE /api.php?endpoint=content&action=delete&page=profile&component=hero&file=data.json'
                    ]
                ],
                'assets' => [
                    'description' => 'Manage asset files (CSS, JS, images, files)',
                    'methods' => ['GET', 'POST', 'PUT', 'DELETE'],
                    'actions' => ['list', 'read', 'create', 'update', 'delete', 'upload', 'structure'],
                    'examples' => [
                        'GET /api.php?endpoint=assets&action=structure',
                        'GET /api.php?endpoint=assets&action=list&type=css',
                        'GET /api.php?endpoint=assets&action=read&type=css&file=server.css',
                        'POST /api.php?endpoint=assets&action=create&type=css',
                        'POST /api.php?endpoint=assets&action=upload&type=images',
                        'PUT /api.php?endpoint=assets&action=update&type=css&file=server.css',
                        'DELETE /api.php?endpoint=assets&action=delete&type=css&file=old-styles.css'
                    ]
                ],
                'loaders' => [
                    'description' => 'Execute loader scripts for dynamic content',
                    'methods' => ['GET', 'POST'],
                    'actions' => ['component', 'content', 'list'],
                    'examples' => [
                        'GET /api.php?endpoint=loaders&loader=list',
                        'GET /api.php?endpoint=loaders&loader=component&page=projects&component=projects_list',
                        'GET /api.php?endpoint=loaders&loader=content&page=projects&component=projects_list',
                        'POST /api.php?endpoint=loaders&loader=component (with JSON body)'
                    ]
                ],
                'auth' => [
                    'description' => 'Handle authentication and session management',
                    'methods' => ['GET', 'POST'],
                    'actions' => ['check_auth', 'login', 'logout'],
                    'examples' => [
                        'GET /api.php?endpoint=auth&action=check_auth',
                        'POST /api.php?endpoint=auth&action=login',
                        'POST /api.php?endpoint=auth&action=logout'
                    ]
                ]
            ],
            'usage' => [
                'All endpoints return JSON responses',
                'Success responses include "success": true',
                'Error responses include "success": false and "message"',
                'POST/PUT requests should include Content-Type: application/json',
                'File uploads use multipart/form-data'
            ]
        ]
    ]);
}
?> 