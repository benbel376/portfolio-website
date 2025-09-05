<?php
/**
 * Dynamic Content Loading Endpoint
 * Handles requests for dynamic component content loading
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Only allow POST requests for content loading
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST requests are allowed');
    }
    
    // Get request data
    $input = file_get_contents('php://input');
    $requestData = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON in request body');
    }
    
    // Validate required parameters
    $requiredParams = ['componentId', 'pageDefinition'];
    foreach ($requiredParams as $param) {
        if (!isset($requestData[$param])) {
            throw new Exception("Missing required parameter: $param");
        }
    }
    
    $componentId = $requestData['componentId'];
    $pageDefinition = $requestData['pageDefinition'];
    $isSecuredHint = $requestData['isSecured'] ?? false; // Client hint, not trusted
    $urlParams = $requestData['urlParams'] ?? []; // URL parameters from client
    
    // Security: Validate page definition file name
    if (!preg_match('/^[a-zA-Z0-9_\-]+\.json$/', $pageDefinition)) {
        throw new Exception('Invalid page definition format');
    }
    
    // Component spec will be extracted from the page definition
    
    // Load the page definition to verify the component exists
    $pageDefinitionPath = '../definitions/pages/' . $pageDefinition;
    if (!file_exists($pageDefinitionPath)) {
        throw new Exception('Page definition not found');
    }
    
    $pageConfig = json_decode(file_get_contents($pageDefinitionPath), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON in page definition');
    }
    
    // Find the specific component in the page definition (support flat and nested)
    $componentFound = false;
    $componentObject = null;

    $searchFunc = function($objects) use (&$searchFunc, $componentId, &$componentFound, &$componentObject) {
        if (!is_array($objects)) return;
        foreach ($objects as $obj) {
            if (($obj['id'] ?? null) === $componentId) {
                $componentFound = true;
                $componentObject = $obj;
                return;
            }
            if (!empty($obj['objects'])) {
                $searchFunc($obj['objects']);
                if ($componentFound) return;
            }
        }
    };

    $searchFunc($pageConfig['objects'] ?? []);
    
    if (!$componentFound) {
        throw new Exception('Component not found in page definition');
    }
    
    // Extract component specification from the found component
    $componentSpec = $componentObject['component'] ?? null;
    if (!$componentSpec) {
        throw new Exception('Component specification not found');
    }
    
    // Security: Validate component spec format
    if (!preg_match('/^[a-zA-Z0-9_\-]+\/[a-zA-Z0-9_\-]+$/', $componentSpec)) {
        throw new Exception('Invalid component specification format');
    }
    
    // Verify the component is marked as dynamic
    if (!isset($componentObject['dynamic']) || !$componentObject['dynamic']) {
        throw new Exception('Component is not configured for dynamic loading');
    }

    // Enforce protection: require authenticated session for protected components
    $isProtected = !empty($componentObject['protected']) || (!empty($componentObject['navigation']['protected']));
    if ($isProtected) {
        session_start();
        $authed = !empty($_SESSION['auth']) && $_SESSION['auth'] === true;
        if (!$authed) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Unauthorized',
                'timestamp' => time()
            ]);
            exit();
        }
    }
    
    // Include the builder to access component loading functionality
    require_once '../builders/builder_t1.php';
    
    // Parse component specification
    $parts = explode('/', $componentSpec);
    $componentType = $parts[0];
    $version = $parts[1] ?? 'type_1';
    
    // Determine component path
    $componentPath = '../blocks/components/' . $componentType . '/' . $version;
    
    // Find and include the loader
    $loaderFiles = glob($componentPath . '/*loader*.php');
    if (empty($loaderFiles)) {
        throw new Exception('Component loader not found');
    }
    
    $loaderFile = $loaderFiles[0];
    require_once $loaderFile;
    
    // Find the loader class
    $loaderClasses = get_declared_classes();
    $loaderClass = null;
    
    foreach ($loaderClasses as $class) {
        if (stripos($class, 'loader') !== false) {
            $loaderClass = $class;
            break;
        }
    }
    
    if (!$loaderClass || !class_exists($loaderClass)) {
        throw new Exception('Loader class not found');
    }
    
    // Create loader instance
    $loader = new $loaderClass();
    
    // Check if loader supports content mode
    $reflection = new ReflectionMethod($loader, 'load');
    $paramCount = $reflection->getNumberOfParameters();
    
    if ($paramCount < 5) {
        throw new Exception('Component loader does not support dynamic content loading');
    }
    
    // Set URL parameters for the PHP loader
    if (!empty($urlParams)) {
        foreach ($urlParams as $key => $value) {
            $_GET[$key] = $value;
        }
    }

    // Extract navigation config first
    $navigationConfig = $componentObject['navigation'] ?? [];
    
    // Support variant-based data map: data[variant]
    if (!isset($componentObject['variant'])) {
        throw new Exception("Missing 'variant' for component: $componentId");
    }
    if (!isset($componentObject['data']) || !is_array($componentObject['data'])) {
        throw new Exception("Missing or invalid 'data' map for component: $componentId");
    }
    $variantKey = $componentObject['variant'];
    if (!isset($componentObject['data'][$variantKey]) || !is_array($componentObject['data'][$variantKey])) {
        throw new Exception("Variant '$variantKey' not found in data for component: $componentId");
    }
    $componentData = $componentObject['data'][$variantKey];
    $title = $componentData['title'] ?? 'Default Title';

    // Generate content using the loader, passing component data via metadata for rich components
    $content = $loader->load($componentId, $title, $navigationConfig, 'content', [
        'componentSpec' => $componentSpec,
        'componentId' => $componentId,
        'componentData' => $componentData,
        'pageDefinition' => $pageDefinition,
        'buildTime' => time()
    ]);
    
    // Parse wrapper to check security status
    $finalContent = $content;
    if (preg_match('/<div\s+data-component-wrapper="true"\s+data-secured="([^"]+)"\s+data-component-id="[^"]*"[^>]*>(.*?)<\/div>/s', $content, $matches)) {
        $actualSecurityStatus = $matches[1] === 'true';
        $wrappedContent = $matches[2];
        
        // Final security check - validate against actual component security
        if ($actualSecurityStatus) {
            // This is a secured component, check authentication
            session_start();
            $authed = !empty($_SESSION['auth']) && $_SESSION['auth'] === true;
            if (!$authed) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Unauthorized access to secured component',
                    'timestamp' => time()
                ]);
                exit();
            }
        }
        
        // Strip wrapper for client injection
        $finalContent = $wrappedContent;
    }
    
    // Return successful response
    echo json_encode([
        'success' => true,
        'content' => $finalContent,
        'componentId' => $componentId,
        'timestamp' => time(),
        'cacheKey' => md5($componentSpec . $componentId . serialize($componentData))
    ]);
    
} catch (Exception $e) {
    // Return error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => time()
    ]);
}

?> 
