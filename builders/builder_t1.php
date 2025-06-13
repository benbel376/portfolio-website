<?php

class PortfolioBuilder {
    
    private $basePath;
    private $definitionsPath;
    private $blocksPath;
    
    public function __construct($basePath = '.') {
        $this->basePath = $basePath;  
        $this->definitionsPath = $basePath . '/definitions';
        $this->blocksPath = $basePath . '/blocks';
    }
    
    public function build($profileName) {
        // Step 1: Load profile configuration using the provided profile name
        $profileConfig = $this->loadJson($this->definitionsPath . '/profiles/' . $profileName);
        $siteName = $profileConfig['site'];
        $pages = $profileConfig['pages'];
        
        // Step 2: Load site configuration
        $siteConfig = $this->loadJson($this->definitionsPath . '/sites/' . $siteName);
        
        // Step 3: Extract data for site loader and load the site block
        return $this->loadSiteBlock($siteConfig, $pages);
    }
    
    private function loadSiteBlock($siteConfig, $pages) {
        $siteType = $siteConfig['type']; // e.g., "top_bar"
        
        // Determine the site block path and loader
        $siteBlockPath = $this->blocksPath . '/sites/' . $siteType . '/type_1';
        $loaderFile = $siteBlockPath . '/' . $siteType . '_stie_loader_t1.php';
        
        if (!file_exists($loaderFile)) {
            throw new Exception("Site loader not found: $loaderFile");
        }
        
        // Include the loader
        require_once $loaderFile;
        
        // Create loader instance based on site type
        $loaderClass = $this->getLoaderClassName($siteType);
        
        if (!class_exists($loaderClass)) {
            throw new Exception("Loader class not found: $loaderClass");
        }
        
        $loader = new $loaderClass();
        
        // Extract specific data for the loader
        $navigationTabs = $siteConfig['navigation']['tabs'];
        $title = isset($siteConfig['branding']['title']) ? $siteConfig['branding']['title'] : 'Portfolio';
        
        // Use the loader to generate the site with extracted data
        return $loader->load($navigationTabs, $title);
    }
    
    private function getLoaderClassName($siteType) {
        // Convert site type to class name (e.g., "top_bar" -> "TopBarSiteLoader")
        $className = str_replace('_', '', ucwords($siteType, '_')) . 'SiteLoader';
        return $className;
    }
    
    private function loadJson($filepath) {
        if (!file_exists($filepath)) {
            throw new Exception("Configuration file not found: $filepath");
        }
        
        $content = file_get_contents($filepath);
        $json = json_decode($content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON in file: $filepath");
        }
        
        return $json;
    }
}

?>
