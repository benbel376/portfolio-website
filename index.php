<?php
// Main entry point for the portfolio website
// This file reads the entry configuration and loads the specified profile
// Supports both URL routing (/profile_name) and query parameters (?profile=profile_name)

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
    
    // Get builder configuration and parameters
    $builderFile = $entryConfig['default_builder']; // Default builder
    $builderParameters = [];
    
    // Override with profile-specific builder and parameters if available
    if (isset($profileConfig) && is_array($profileConfig)) {
        if (isset($profileConfig['builder'])) {
            $builderFile = $profileConfig['builder'];
        }
        if (isset($profileConfig['parameters'])) {
            $builderParameters = $profileConfig['parameters'];
        }
    }
    
    // Validate builder file exists
    $builderPath = 'builders/' . $builderFile;
    if (!file_exists($builderPath)) {
        throw new Exception("Builder file not found: $builderPath");
    }
    
    // Include the specified builder file (if different from default)
    if ($builderFile !== 'builder_t1.php') {
        require_once $builderPath;
    }
    
    // Create builder and build the site with the determined profile and parameters
    $builder = new PortfolioBuilder();
    
    // Pass builder parameters if available
    if (!empty($builderParameters)) {
        $builder->setParameters($builderParameters);
    }
    
    echo $builder->build($profileName);
    
} catch (Exception $e) {
    // Error handling with user-friendly message and available profiles
    http_response_code(500);
    
    // Get available profiles for the error page
    $availableProfiles = '';
    if (isset($entryConfig['profiles'])) {
        foreach ($entryConfig['profiles'] as $key => $config) {
            $profileFile = is_string($config) ? $config : $config['profile'];
            $builderFile = is_array($config) && isset($config['builder']) ? $config['builder'] : $entryConfig['default_builder'];
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
