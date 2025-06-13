<?php
// Main entry point for the portfolio website
// This file reads the entry configuration and loads the specified profile
// Supports URL routing: /profile_name or default profile

require_once 'builders/builder_t1.php';

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
    
    // Parse URL to determine which profile to load
    $requestUri = $_SERVER['REQUEST_URI'];
    $path = parse_url($requestUri, PHP_URL_PATH);
    
    // Remove leading slash and any trailing slashes
    $path = trim($path, '/');
    
    // Determine profile name from URL
    $profileKey = '';
    $profileName = '';
    
    if (empty($path) || $path === 'index.php') {
        // Default profile when no path specified
        $profileName = $entryConfig['default_profile'];
        $profileKey = 'default';
    } else {
        // Check if the path matches any defined profile
        $pathSegments = explode('/', $path);
        $requestedProfile = $pathSegments[0];
        
        if (isset($entryConfig['profiles'][$requestedProfile])) {
            $profileKey = $requestedProfile;
            $profileName = $entryConfig['profiles'][$requestedProfile];
        } else {
            // Profile not found, use default
            $profileName = $entryConfig['default_profile'];
            $profileKey = 'default';
            
            // Log the attempt for debugging
            error_log("Profile '$requestedProfile' not found, using default profile");
        }
    }
    
    // Validate that the profile file exists
    $profilePath = 'definitions/profiles/' . $profileName;
    if (!file_exists($profilePath)) {
        throw new Exception("Profile file not found: $profilePath");
    }
    
    // Create builder and build the site with the determined profile
    $builder = new PortfolioBuilder();
    echo $builder->build($profileName);
    
} catch (Exception $e) {
    // Error handling with user-friendly message
    http_response_code(500);
    echo "<!DOCTYPE html>
<html>
<head>
    <title>Portfolio - Error</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class='error'>
        <h2>Portfolio Loading Error</h2>
        <p>" . htmlspecialchars($e->getMessage()) . "</p>
    </div>
</body>
</html>";
}

?>
