<?php
/**
 * API Router
 * Central entry point for all API requests
 * Routes requests to appropriate endpoint handlers
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors in API responses

// Set JSON response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Send JSON error response
 */
function sendError($message, $code = 400, $details = null) {
    http_response_code($code);
    $response = [
        'success' => false,
        'error' => $message,
        'timestamp' => time()
    ];
    if ($details !== null) {
        $response['details'] = $details;
    }
    echo json_encode($response);
    exit();
}

/**
 * Send JSON success response
 */
function sendSuccess($data) {
    http_response_code(200);
    echo json_encode(array_merge(['success' => true], $data));
    exit();
}

/**
 * Get request method
 */
function getRequestMethod() {
    return $_SERVER['REQUEST_METHOD'] ?? 'GET';
}

/**
 * Get endpoint from URL
 * Supports: api.php?endpoint=name or api.php/name
 */
function getEndpoint() {
    // Check query parameter first
    if (isset($_GET['endpoint'])) {
        return $_GET['endpoint'];
    }
    
    // Check path info
    if (isset($_SERVER['PATH_INFO'])) {
        return trim($_SERVER['PATH_INFO'], '/');
    }
    
    // Check request URI
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (preg_match('#/api\.php/([^?]+)#', $uri, $matches)) {
        return $matches[1];
    }
    
    return null;
}

/**
 * Get request body as JSON
 */
function getRequestBody() {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        return [];
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON in request body', 400, json_last_error_msg());
    }
    
    return $data;
}

// ============================================================================
// MAIN ROUTING LOGIC
// ============================================================================

try {
    // Get the requested endpoint
    $endpoint = getEndpoint();
    
    if (!$endpoint) {
        sendError('No endpoint specified. Use: api.php?endpoint=name or api.php/name', 400);
    }
    
    // Validate endpoint name (security: prevent path traversal)
    if (!preg_match('/^[a-zA-Z0-9_\-]+$/', $endpoint)) {
        sendError('Invalid endpoint name', 400);
    }
    
    // Map endpoint names to handler files
    $endpointMap = [
        'dynamic_content' => 'endpoints/dynamic_content_t1.php',
        'security' => 'endpoints/security_t1.php',
        'file_manager' => 'endpoints/file_manager_t1.php',
        'ai_assistant' => 'endpoints/ai_assistant_t1.php',
        // Legacy aliases for backward compatibility
        'definition_management' => 'endpoints/file_manager_t1.php',
        'media_management' => 'endpoints/file_manager_t1.php',
    ];
    
    // Check if endpoint exists
    if (!isset($endpointMap[$endpoint])) {
        sendError("Unknown endpoint: $endpoint", 404, [
            'available_endpoints' => array_keys($endpointMap)
        ]);
    }
    
    $handlerFile = __DIR__ . '/' . $endpointMap[$endpoint];
    
    // Check if handler file exists
    if (!file_exists($handlerFile)) {
        sendError("Endpoint handler not found: $endpoint", 500);
    }
    
    // Log request for debugging (optional)
    $logEnabled = false; // Set to true for debugging
    if ($logEnabled) {
        error_log("API Request: $endpoint [" . getRequestMethod() . "]");
    }
    
    // Include and execute the endpoint handler
    // The handler is responsible for sending its own response
    require $handlerFile;
    
} catch (Exception $e) {
    // Catch any uncaught exceptions
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error', 500, $e->getMessage());
}
