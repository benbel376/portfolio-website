<?php
// Main entry point for the portfolio website
// This file reads the entry configuration and loads the specified profile
// Supports both URL routing (/profile_name) and query parameters (?profile=profile_name)

require_once 'builders/builder_t1.php';

/**
 * Assemble dictionary from profile, site, and page definitions
 * Applies security-first rule: protected = dynamic
 */
function assembleDictionary($profileName, $profileKey, $debugMode = false) {
    if ($debugMode) {
        error_log("INDEX DEBUG: Starting dictionary assembly for profile '$profileKey'");
    }
    
    // Step 1: Load profile configuration
    $profilePath = 'definitions/profiles/' . $profileName;
    $profileConfig = loadJsonFile($profilePath, $debugMode);
    
    // Step 2: Load site configuration
    $siteName = $profileConfig['site'];
    $sitePath = 'definitions/sites/' . $siteName;
    $siteConfig = loadJsonFile($sitePath, $debugMode);
    
    // Step 3: Load and flatten all page objects
    $allObjects = [];
    $pages = $profileConfig['pages'];
    
    if ($debugMode) {
        error_log("INDEX DEBUG: Processing " . count($pages) . " pages");
    }
    
    foreach ($pages as $pageFile) {
        if ($debugMode) {
            error_log("INDEX DEBUG: Loading page: $pageFile");
        }
        
        $pagePath = 'definitions/pages/' . $pageFile;
        $pageConfig = loadJsonFile($pagePath, $debugMode);
        $pageObjects = $pageConfig['objects'] ?? [];
        
        // Add page definition metadata to each object
        foreach ($pageObjects as &$object) {
            $object['_pageSource'] = $pageFile;
        }
        
        // Flatten objects (handles both nested and flat structures)
        $flattenedObjects = flattenObjects($pageObjects, $pageFile, $debugMode);
        $allObjects = array_merge($allObjects, $flattenedObjects);
        
        if ($debugMode) {
            error_log("INDEX DEBUG: Page $pageFile contributed " . count($flattenedObjects) . " objects");
        }
    }
    
    // Step 4: Apply security enforcement (CRITICAL: protected = dynamic)
    $allObjects = enforceSecurityRules($allObjects, $debugMode);
    
    // Step 5: Assemble final dictionary
    $dictionary = [
        'site' => $siteConfig,
        'objects' => $allObjects,
        'pageDefinition' => 'assembled_from_' . $profileKey . '_profile'
    ];
    
    if ($debugMode) {
        error_log("INDEX DEBUG: Dictionary assembly complete");
        error_log("INDEX DEBUG: Final object count: " . count($allObjects));
    }
    
    return $dictionary;
}

/**
 * Load and parse JSON file with error handling
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
        error_log("INDEX DEBUG: Loaded JSON file: $filepath");
    }
    
    return $json;
}

/**
 * Extract top-level objects only (preserve nested structure)
 * Prevents duplication: containers handle their own children
 * Propagates _pageSource to nested objects
 */
function flattenObjects($objects, $pageFile, $debugMode = false) {
    $flattened = [];
    
    foreach ($objects as $object) {
        // Ensure _pageSource is set for this object
        if (!isset($object['_pageSource'])) {
            $object['_pageSource'] = $pageFile;
        }
        
        // Recursively propagate _pageSource to nested objects
        if (isset($object['objects']) && is_array($object['objects'])) {
            foreach ($object['objects'] as &$nestedObject) {
                propagatePageSource($nestedObject, $pageFile);
            }
        }
        
        // Add only the top-level object
        // Containers will handle their nested children internally
        $flattened[] = $object;
        
        // DO NOT flatten nested objects - this was causing duplicates!
        // The builder's nested structure logic will handle children properly
    }
    
    if ($debugMode) {
        error_log("INDEX DEBUG: Extracted " . count($flattened) . " top-level objects from $pageFile");
    }
    
    return $flattened;
}

/**
 * Recursively propagate _pageSource to nested objects
 */
function propagatePageSource(&$object, $pageFile) {
    if (!isset($object['_pageSource'])) {
        $object['_pageSource'] = $pageFile;
    }
    
    if (isset($object['objects']) && is_array($object['objects'])) {
        foreach ($object['objects'] as &$nestedObject) {
            propagatePageSource($nestedObject, $pageFile);
        }
    }
}

/**
 * Enforce security-first rules on objects
 * CRITICAL: Any protected object must be dynamic (shells on initial load)
 */
function enforceSecurityRules($objects, $debugMode = false) {
    $modifiedCount = 0;
    
    foreach ($objects as &$object) {
        $isProtected = false;
        
        // Check protection in navigation config
        if (isset($object['navigation']['protected'])) {
            $isProtected = (bool)$object['navigation']['protected'];
        }
        
        // Also check direct protected flag (backup)
        if (isset($object['protected'])) {
            $isProtected = $isProtected || (bool)$object['protected'];
        }
        
        // SECURITY RULE: Protected content must be dynamic
        if ($isProtected) {
            $wasDynamic = $object['dynamic'] ?? false;
            $object['dynamic'] = true;
            
            if ($debugMode && !$wasDynamic) {
                $objectId = $object['id'] ?? 'no-id';
                error_log("INDEX DEBUG: SECURITY ENFORCEMENT - Object '$objectId' is protected, forcing dynamic=true");
                $modifiedCount++;
            }
        }
    }
    
    if ($debugMode && $modifiedCount > 0) {
        error_log("INDEX DEBUG: Security enforcement applied to $modifiedCount objects");
    }
    
    return $objects;
}

try {
    // Read entry configuration to get available profiles
    $entryPath = 'definitions/entry.json';
    
    if (!file_exists($entryPath)) {
        throw new Exception("Entry configuration not found: $entryPath");
    }
    
    $entryContent = file_get_contents($entryPath);
    $entryConfig = json_decode($entryContent, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON in entry configuration");
    }
    
    // Determine profile from multiple sources (URL path or query parameter)
    $profileKey = '';
    $profileName = '';
    
    // Method 1: Check query parameter (works everywhere)
    if (isset($_GET['profile']) && !empty($_GET['profile'])) {
        $requestedProfile = $_GET['profile'];
        if (isset($entryConfig['profiles'][$requestedProfile])) {
            $profileKey = $requestedProfile;
            $profileConfig = $entryConfig['profiles'][$requestedProfile];
            // Handle both old string format and new object format
            $profileName = is_string($profileConfig) ? $profileConfig : $profileConfig['profile'];
        }
    }
    
    // Method 2: Check URL path (works with URL rewriting)
    if (empty($profileName)) {
        $requestUri = $_SERVER['REQUEST_URI'];
        $scriptName = $_SERVER['SCRIPT_NAME'];
        
        // Get the path relative to the script directory
        $basePath = dirname($scriptName);
        $path = parse_url($requestUri, PHP_URL_PATH);
        
        // Remove the base path to get just the profile path
        if ($basePath !== '/' && strpos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath));
        }
        
        // Remove leading slash and any trailing slashes
        $path = trim($path, '/');
        
        // Remove index.php if it's in the path
        if (strpos($path, 'index.php') === 0) {
            $path = trim(substr($path, 9), '/');
        }
        
        if (!empty($path)) {
            // Check if the path matches any defined profile
            $pathSegments = explode('/', $path);
            $requestedProfile = $pathSegments[0];
            
            if (isset($entryConfig['profiles'][$requestedProfile])) {
                $profileKey = $requestedProfile;
                $profileConfig = $entryConfig['profiles'][$requestedProfile];
                // Handle both old string format and new object format
                $profileName = is_string($profileConfig) ? $profileConfig : $profileConfig['profile'];
            }
        }
    }
    
    // Fallback to default profile
    if (empty($profileName)) {
        $defaultProfileKey = $entryConfig['default_profile'];
        if (isset($entryConfig['profiles'][$defaultProfileKey])) {
            $profileKey = $defaultProfileKey;
            $profileConfig = $entryConfig['profiles'][$defaultProfileKey];
            $profileName = is_string($profileConfig) ? $profileConfig : $profileConfig['profile'];
        } else {
            throw new Exception("Default profile '$defaultProfileKey' not found in profiles configuration");
        }
    }
    
    // Validate that the profile file exists
    $profilePath = 'definitions/profiles/' . $profileName;
    if (!file_exists($profilePath)) {
        throw new Exception("Profile file not found: $profilePath");
    }
    
    // Get builder configuration from profile
    if (!isset($profileConfig['builder'])) {
        throw new Exception("Builder not specified for profile '$profileKey'");
    }
    $builderFile = $profileConfig['builder'];
    
    // Validate builder file exists
    $builderPath = 'builders/' . $builderFile;
    if (!file_exists($builderPath)) {
        throw new Exception("Builder file not found: $builderPath");
    }
    
    // Include the specified builder file (if different from default)
    if ($builderFile !== 'builder_t1.php') {
        require_once $builderPath;
    }
    
    // Enable debug mode for development (could be set from profile config in future)
    $debugMode = false;
    
    // Create builder with debug mode
    $builder = new PortfolioBuilder('.', $debugMode);
    
    // Assemble dictionary from profile, site, and page definitions
    $dictionary = assembleDictionary($profileName, $profileKey, $debugMode);
    
    if ($debugMode) {
        error_log("INDEX DEBUG: Dictionary assembled for profile '$profileKey'");
        error_log("INDEX DEBUG: Dictionary has " . count($dictionary['objects']) . " total objects");
        error_log("INDEX DEBUG: Has site config: " . (isset($dictionary['site']) ? 'yes' : 'no'));
    }
    
    echo $builder->build($dictionary);
    
} catch (Exception $e) {
    // Error handling with user-friendly message and available profiles
    http_response_code(500);
    
    // Get available profiles for the error page
    $availableProfiles = '';
    if (isset($entryConfig['profiles'])) {
        foreach ($entryConfig['profiles'] as $key => $config) {
            $profileFile = is_string($config) ? $config : $config['profile'];
            $builderFile = is_array($config) && isset($config['builder']) ? $config['builder'] : 'not specified';
            $availableProfiles .= "<li><a href='?profile=$key'>$key</a> (Profile: $profileFile, Builder: $builderFile)</li>";
        }
    }
    
    echo "<!DOCTYPE html>
<html>
<head>
    <title>Portfolio - Error</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 5px; }
        .help { background: #d1ecf1; color: #0c5460; padding: 15px; margin-top: 20px; border-radius: 5px; }
        .help ul { margin: 10px 0; }
        .help a { color: #0c5460; text-decoration: underline; }
    </style>
</head>
<body>
    <div class='error'>
        <h2>Portfolio Loading Error</h2>
        <p>" . htmlspecialchars($e->getMessage()) . "</p>
    </div>
    
    <div class='help'>
        <h3>Available Profiles:</h3>
        <ul>
            $availableProfiles
        </ul>
        <p><strong>Usage Examples:</strong></p>
        <ul>
            <li>Default: <a href='index.php'>index.php</a></li>
            <li>Query Parameter: <a href='?profile=ml_mlops'>?profile=ml_mlops</a></li>
        </ul>
    </div>
</body>
</html>";
}

?>
