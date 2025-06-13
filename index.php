<?php
// Main entry point for the portfolio website
// This file reads the entry configuration and loads the specified profile

require_once 'builders/builder_v1.php';

try {
    // Read entry configuration to determine which profile to load
    $entryPath = 'definitions/entry.json';
    
    if (!file_exists($entryPath)) {
        throw new Exception("Entry configuration not found: $entryPath");
    }
    
    $entryContent = file_get_contents($entryPath);
    $entryConfig = json_decode($entryContent, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON in entry configuration");
    }
    
    // Get the profile name from entry configuration
    $profileName = $entryConfig['profile'];
    
    // Create builder and build the site with the specific profile
    $builder = new PortfolioBuilder();
    echo $builder->build($profileName);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

?>
