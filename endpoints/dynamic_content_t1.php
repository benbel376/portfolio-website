<?php
/**
 * Dynamic Content Loading Endpoint
 * Dictionary-driven approach: Extract object → Create mini-dictionary → Pass to builder
 * Validates authentication BEFORE builder call for protected content
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

// Include builder and helper functions
require_once __DIR__ . '/../builders/builder_t1.php';

/**
 * Load and parse JSON file with error handling (shared with index.php)
 */
function loadJsonFile($filepath, $debugMode = false) {
    if (!file_exists($filepath)) {
        throw new Exception("Configuration file not found: $filepath");
    }
    
    $content = file_get_contents($filepath);
    $json = json_decode($content, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON in file: $filepath");
    }
    
    if ($debugMode) {
        error_log("DYNAMIC API DEBUG: Loaded JSON file: $filepath");
    }
    
    return $json;
}

/**
 * Extract single object and its dependencies from page definition
 * Returns flattened array of objects needed for the requested component/container
 */
function extractObjectAndDependencies($pageObjects, $targetId, $debugMode = false) {
    $found = [];
    
    $searchFunc = function($objects, $depth = 0) use (&$searchFunc, $targetId, &$found, $debugMode) {
        if (!is_array($objects)) return false;
        
        foreach ($objects as $obj) {
            if (($obj['id'] ?? null) === $targetId) {
                // Found target - include it and all its nested objects
                $found[] = $obj;
                
                if (isset($obj['objects']) && is_array($obj['objects'])) {
                    // Recursively add all nested objects
                    $nestedObjects = flattenObjects($obj['objects'], $debugMode);
                    $found = array_merge($found, $nestedObjects);
                }
                
                if ($debugMode) {
                    error_log("DYNAMIC API DEBUG: Found target object '$targetId' with " . count($found) . " total objects");
                }
                return true;
            }
            
            // Search in nested objects
            if (isset($obj['objects']) && is_array($obj['objects'])) {
                if ($searchFunc($obj['objects'], $depth + 1)) {
                    return true;
                }
            }
        }
        return false;
    };
    
    $searchFunc($pageObjects);
    return $found;
}

/**
 * Flatten object hierarchy into single array (shared with index.php)
 */
function flattenObjects($objects, $debugMode = false) {
    $flattened = [];
    
    foreach ($objects as $object) {
        $flattened[] = $object;
        
        if (isset($object['objects']) && is_array($object['objects'])) {
            $nestedFlattened = flattenObjects($object['objects'], $debugMode);
            $flattened = array_merge($flattened, $nestedFlattened);
        }
    }
    
    return $flattened;
}

try {
    // Enable debug mode for development
    $debugMode = false;
    
    // Only allow POST requests for content loading
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST requests are allowed');
    }
    
    // Get request data
    $input = file_get_contents('php://input');
    
    // For testing: allow fallback to global test input
    if (empty($input) && isset($GLOBALS['_test_input'])) {
        $input = $GLOBALS['_test_input'];
        if ($debugMode) {
            error_log("DYNAMIC API DEBUG: Using test input data");
        }
    }
    
    $requestData = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON in request body');
    }
    
    // Validate required parameters
    if (!isset($requestData['pageDefinition'])) {
        throw new Exception("Missing required parameter: pageDefinition");
    }
    
    $pageDefinition = $requestData['pageDefinition'];
    $componentId = $requestData['componentId'] ?? null; // Optional - for component-specific loading
    $containerId = $requestData['containerId'] ?? null; // Optional - for page-level loading
    $urlParams = $requestData['urlParams'] ?? []; // URL parameters from client
    
    // Determine request type
    $requestType = 'unknown';
    if ($componentId) {
        $requestType = 'component';
    } elseif ($containerId) {
        $requestType = 'page-container';
    } else {
        $requestType = 'full-page';
    }
    
    // Security: Validate page definition file name
    if (!preg_match('/^[a-zA-Z0-9_\-]+\.json$/', $pageDefinition)) {
        throw new Exception('Invalid page definition format');
    }
    
    if ($debugMode) {
        error_log("DYNAMIC API DEBUG: $requestType request - componentId='$componentId', containerId='$containerId', page='$pageDefinition'");
    }
    
    // Set URL parameters for loaders that need them
    if (!empty($urlParams)) {
        foreach ($urlParams as $key => $value) {
            $_GET[$key] = $value;
        }
        if ($debugMode) {
            error_log("DYNAMIC API DEBUG: Set URL params: " . json_encode($urlParams));
        }
    }
    
    // STEP 1: Load page definition
    $pageDefinitionPath = __DIR__ . '/../definitions/pages/' . $pageDefinition;
    $pageConfig = loadJsonFile($pageDefinitionPath, $debugMode);
    
    // STEP 2: Extract objects based on request type
    $targetObject = null;
    
    if ($requestType === 'component') {
        // Component-specific request: extract single component and dependencies
        if ($debugMode) {
            error_log("DYNAMIC API DEBUG: Component-specific request for '$componentId'");
        }
        
        $objects = extractObjectAndDependencies($pageConfig['objects'] ?? [], $componentId, $debugMode);
        
        if (empty($objects)) {
            throw new Exception("Component '$componentId' not found in page definition");
        }
        
        // Get the main target object (first one is always the target)
        $targetObject = $objects[0];
        
        // Verify component is configured for dynamic loading
        if (!isset($targetObject['dynamic']) || !$targetObject['dynamic']) {
            throw new Exception("Component '$componentId' is not configured for dynamic loading");
        }
        
    } elseif ($requestType === 'page-container') {
        // Page-level request for specific container: load entire page but focus on container
        if ($debugMode) {
            error_log("DYNAMIC API DEBUG: Page-level request for container '$containerId' from page '$pageDefinition'");
        }
        
        $objects = flattenObjects($pageConfig['objects'] ?? [], $debugMode);
        
        // Find the target container in the objects
        foreach ($objects as $object) {
            if ($object['id'] === $containerId) {
                $targetObject = $object;
                break;
            }
        }
        
        if (!$targetObject) {
            throw new Exception("Container '$containerId' not found in page definition");
        }
        
    } else {
        // Full page request: load entire page
        if ($debugMode) {
            error_log("DYNAMIC API DEBUG: Full page request for '$pageDefinition'");
        }
        
        $objects = flattenObjects($pageConfig['objects'] ?? [], $debugMode);
        // No specific target for full page requests
    }
    
    // STEP 3: Security validation BEFORE builder call
    session_start();
    $authed = !empty($_SESSION['auth']) && $_SESSION['auth'] === true;
    
    // Security validation for specific targets (component or container)
    if ($targetObject) {
        $isProtected = false;
        
        // Check protection in navigation config
        if (isset($targetObject['navigation']['protected'])) {
            $isProtected = (bool)$targetObject['navigation']['protected'];
        }
        
        // Also check direct protected flag (backup)
        if (isset($targetObject['protected'])) {
            $isProtected = $isProtected || (bool)$targetObject['protected'];
        }
        
        // CRITICAL: Enforce authentication for protected content
        if ($isProtected && !$authed) {
            $targetId = $componentId ?? $containerId ?? 'unknown';
            if ($debugMode) {
                error_log("DYNAMIC API DEBUG: Authentication failed for protected $requestType '$targetId'");
            }
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Unauthorized access to protected content',
                'timestamp' => time()
            ]);
            exit();
        }
        
        if ($debugMode && $isProtected) {
            $targetId = $componentId ?? $containerId ?? 'unknown';
            error_log("DYNAMIC API DEBUG: Authentication successful for protected $requestType '$targetId'");
        }
    }
    
    // For full page requests, check if any objects are protected
    if ($requestType === 'full-page') {
        foreach ($objects as $object) {
            $isObjectProtected = false;
            
            if (isset($object['navigation']['protected'])) {
                $isObjectProtected = (bool)$object['navigation']['protected'];
            }
            if (isset($object['protected'])) {
                $isObjectProtected = $isObjectProtected || (bool)$object['protected'];
            }
            
            if ($isObjectProtected && !$authed) {
                if ($debugMode) {
                    $objId = $object['id'] ?? 'no-id';
                    error_log("DYNAMIC API DEBUG: Authentication failed for protected object '$objId' in full page request");
                }
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Unauthorized access to protected content',
                    'timestamp' => time()
                ]);
                exit();
            }
        }
    }
    
    // STEP 4: Apply dynamic flag management according to request type and authentication
    foreach ($objects as &$object) {
        $isObjectProtected = false;
        
        // Check if object is protected
        if (isset($object['navigation']['protected'])) {
            $isObjectProtected = (bool)$object['navigation']['protected'];
        }
        if (isset($object['protected'])) {
            $isObjectProtected = $isObjectProtected || (bool)$object['protected'];
        }
        
        if ($isObjectProtected) {
            // Protected object: dynamic = false only if authenticated, otherwise keep as dynamic
            $object['dynamic'] = $authed ? false : true;
            if ($debugMode) {
                $objId = $object['id'] ?? 'no-id';
                $dynamicState = $authed ? 'false (authenticated)' : 'true (not authenticated)';
                error_log("DYNAMIC API DEBUG: Protected object '$objId' dynamic=$dynamicState");
            }
        } else {
            // Non-protected object: always set dynamic = false (content mode)
            $object['dynamic'] = false;
            if ($debugMode) {
                $objId = $object['id'] ?? 'no-id';
                error_log("DYNAMIC API DEBUG: Non-protected object '$objId' dynamic=false");
            }
        }
    }
    
    // STEP 5: Create mini-dictionary for builder
    $targetIdentifier = $componentId ?? $containerId ?? 'all';
    $dictionary = [
        'site' => null, // No site wrapper for dynamic content
        'objects' => $objects,
        'pageDefinition' => 'dynamic_' . $pageDefinition . '_' . $requestType . '_' . $targetIdentifier
    ];
    
    if ($debugMode) {
        error_log("DYNAMIC API DEBUG: Created dictionary with " . count($objects) . " objects");
    }
    
    // STEP 6: Use builder to generate content
    $builder = new PortfolioBuilder(__DIR__ . '/..', $debugMode);
    $content = $builder->build($dictionary);
    
    if ($debugMode) {
        error_log("DYNAMIC API DEBUG: Builder returned content length: " . strlen($content));
    }
    
    // STEP 7: Return successful response
    $responseData = [
        'success' => true,
        'content' => $content,
        'requestType' => $requestType,
        'objectCount' => count($objects),
        'timestamp' => time()
    ];
    
    // Add type-specific response data
    if ($componentId) {
        $responseData['componentId'] = $componentId;
    }
    if ($containerId) {
        $responseData['containerId'] = $containerId;
    }
    $responseData['pageDefinition'] = $pageDefinition;
    $responseData['cacheKey'] = md5($targetIdentifier . $pageDefinition . serialize($objects));
    
    echo json_encode($responseData);
    
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
