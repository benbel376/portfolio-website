<?php

class PortfolioBuilder {
    
    private $basePath;
    private $definitionsPath;
    private $blocksPath;
    private $parameters;
    
    public function __construct($basePath = '.') {
        $this->basePath = $basePath;  
        $this->definitionsPath = $basePath . '/definitions';
        $this->blocksPath = $basePath . '/blocks';
        $this->parameters = [];
    }
    
    /**
     * Set builder parameters from entry configuration
     */
    public function setParameters($parameters) {
        $this->parameters = $parameters;
    }
    
    /**
     * Get a specific parameter value
     */
    public function getParameter($key, $default = null) {
        return $this->parameters[$key] ?? $default;
    }
    
    /**
     * Get all parameters
     */
    public function getParameters() {
        return $this->parameters;
    }
    
    public function build($profileName) {
        $debugMode = $this->getParameter('debug', false);
        
        if ($debugMode) {
            $debugInfo = "<!-- Builder Debug Info:\n";
            $debugInfo .= "Profile: $profileName\n";
            $debugInfo .= "Parameters: " . json_encode($this->parameters, JSON_PRETTY_PRINT) . "\n";
            $debugInfo .= "Build Time: " . date('Y-m-d H:i:s') . "\n";
            $debugInfo .= "-->\n";
        }
        
        // Step 1: Load profile configuration using the provided profile name
        $profileConfig = $this->loadJson($this->definitionsPath . '/profiles/' . $profileName);
        $siteName = $profileConfig['site'];
        $pages = $profileConfig['pages'];
        
        // Step 2: Load site configuration
        $siteConfig = $this->loadJson($this->definitionsPath . '/sites/' . $siteName);
        
        // Add builder parameters to site config for loaders to access
        $siteConfig['builderParameters'] = $this->parameters;
        
        // Step 3: Build page content by assembling components and containers
        $pageContent = $this->buildPages($pages);
        
        // Step 4: Load site block and insert page content
        $result = $this->loadSiteBlock($siteConfig, $pageContent);
        
        // Add debug info if enabled
        if ($debugMode) {
            $result = $debugInfo . $result;
        }
        
        return $result;
    }
    
    private function buildPages($pages) {
        $allPageContent = '';
        
        foreach ($pages as $pageFile) {
            $pageConfig = $this->loadJson($this->definitionsPath . '/pages/' . $pageFile);
            $pageHtml = $this->buildPageFromObjects($pageConfig['objects']);
            $allPageContent .= $pageHtml . "\n";
        }
        
        return $allPageContent;
    }
    
    private function buildPageFromObjects($objects) {
        // Step 1: Build dependency tree from flat structure
        $tree = $this->buildHierarchyTree($objects);
        
        // Step 2: Build HTML starting from root objects (parent = null)
        $pageHtml = '';
        foreach ($tree['root'] as $rootObject) {
            $pageHtml .= $this->buildObjectHtml($rootObject, $tree);
        }
        
        return $pageHtml;
    }
    
    private function buildHierarchyTree($objects) {
        $tree = ['root' => [], 'children' => []];
        
        // Organize objects by parent relationship
        foreach ($objects as $object) {
            if ($object['parent'] === null) {
                $tree['root'][] = $object;
            } else {
                if (!isset($tree['children'][$object['parent']])) {
                    $tree['children'][$object['parent']] = [];
                }
                $tree['children'][$object['parent']][] = $object;
            }
        }
        
        return $tree;
    }
    
    private function buildObjectHtml($object, $tree) {
        if ($object['type'] === 'component') {
            return $this->loadComponent($object);
        } elseif ($object['type'] === 'container') {
            return $this->loadContainer($object, $tree);
        }
        
        return '';
    }
    
    private function loadComponent($object) {
        $componentSpec = $object['component']; // e.g., "heros/type_1"
        $id = $object['id'];
        $data = $object['data'] ?? [];
        $navigationConfig = $object['navigation'] ?? [];
        
        // Parse component specification to get component name and version
        $parts = explode('/', $componentSpec);
        $componentType = $parts[0]; // e.g., "heros"
        $version = $parts[1] ?? 'type_1'; // e.g., "type_1"
        
        // Determine component path
        $componentPath = $this->blocksPath . '/components/' . $componentType . '/' . $version;
        
        // Find the loader file dynamically
        $loaderFile = $this->findLoaderFile($componentPath);
        
        if (!$loaderFile) {
            throw new Exception("Component loader not found in: $componentPath");
        }
        
        // Include the loader
        require_once $loaderFile;
        
        // Find the loader class dynamically
        $loaderClass = $this->findLoaderClass($loaderFile);
        
        if (!$loaderClass || !class_exists($loaderClass)) {
            throw new Exception("Loader class not found in: $loaderFile");
        }
        
        $loader = new $loaderClass();
        
        // Extract data for the loader (e.g., title for hero component)
        $title = $data['title'] ?? 'Default Title';
        
        // Check if loader supports navigation configuration
        $reflection = new ReflectionMethod($loader, 'load');
        $paramCount = $reflection->getNumberOfParameters();
        
        if ($paramCount >= 3) {
            // Loader supports navigation configuration
            return $loader->load($id, $title, $navigationConfig);
        } else {
            // Legacy loader, only pass basic parameters
            return $loader->load($id, $title);
        }
    }
    
    private function loadContainer($object, $tree) {
        $containerSpec = $object['component']; // e.g., "vertical/type_1"
        $id = $object['id'];
        $data = $object['data'] ?? [];
        $navigationConfig = $object['navigation'] ?? [];
        
        // Parse container specification to get container name and version
        $parts = explode('/', $containerSpec);
        $containerType = $parts[0]; // e.g., "vertical"
        $version = $parts[1] ?? 'type_1'; // e.g., "type_1"
        
        // Get children for this container
        $children = $tree['children'][$id] ?? [];
        $childrenHtml = [];
        
        // Build all children first
        foreach ($children as $child) {
            $childrenHtml[] = $this->buildObjectHtml($child, $tree);
        }
        
        // Determine container path
        $containerPath = $this->blocksPath . '/containers/' . $containerType . '/' . $version;
        
        // Find the loader file dynamically
        $loaderFile = $this->findLoaderFile($containerPath);
        
        if (!$loaderFile) {
            throw new Exception("Container loader not found in: $containerPath");
        }
        
        // Include the loader
        require_once $loaderFile;
        
        // Find the loader class dynamically
        $loaderClass = $this->findLoaderClass($loaderFile);
        
        if (!$loaderClass || !class_exists($loaderClass)) {
            throw new Exception("Loader class not found in: $loaderFile");
        }
        
        $loader = new $loaderClass();
        
        // Check if loader supports navigation configuration
        $reflection = new ReflectionMethod($loader, 'load');
        $paramCount = $reflection->getNumberOfParameters();
        
        if ($paramCount >= 3) {
            // Loader supports navigation configuration
            return $loader->load($id, $childrenHtml, $navigationConfig);
        } else {
            // Legacy loader, only pass basic parameters
            return $loader->load($id, $childrenHtml);
        }
    }
    
    private function loadSiteBlock($siteConfig, $pageContent) {
        $siteSpec = $siteConfig['type']; // e.g., "top_bar/type_2"
        
        // Parse site specification to get site name and version
        $parts = explode('/', $siteSpec);
        $siteType = $parts[0]; // e.g., "top_bar"
        $version = $parts[1] ?? 'type_1'; // e.g., "type_2"
        
        // Determine the site block path
        $siteBlockPath = $this->blocksPath . '/sites/' . $siteType . '/' . $version;
        
        // Find the loader file dynamically
        $loaderFile = $this->findLoaderFile($siteBlockPath);
        
        if (!$loaderFile) {
            throw new Exception("Site loader not found in: $siteBlockPath");
        }
        
        // Include the loader
        require_once $loaderFile;
        
        // Find the loader class dynamically
        $loaderClass = $this->findLoaderClass($loaderFile);
        
        if (!$loaderClass || !class_exists($loaderClass)) {
            throw new Exception("Loader class not found in: $loaderFile");
        }
        
        $loader = new $loaderClass();
        
        // Extract specific data for the loader
        $navigationTabs = $siteConfig['navigation']['tabs'];
        $defaultNavigation = $siteConfig['navigation']['defaultNavigation'] ?? null;
        $title = isset($siteConfig['branding']['title']) ? $siteConfig['branding']['title'] : 'Portfolio';
        
        // Load site with navigation and page content
        return $loader->load($navigationTabs, $title, $pageContent, $defaultNavigation);
    }
    
    private function findLoaderFile($directoryPath) {
        if (!is_dir($directoryPath)) {
            return false;
        }
        
        $files = scandir($directoryPath);
        
        foreach ($files as $file) {
            // Check if it's a PHP file and contains "loader" in the name
            if (pathinfo($file, PATHINFO_EXTENSION) === 'php' && strpos($file, 'loader') !== false) {
                return $directoryPath . '/' . $file;
            }
        }
        
        return false;
    }
    
    private function findLoaderClass($filePath) {
        $content = file_get_contents($filePath);
        
        // Use regex to find class definitions that contain "Loader"
        if (preg_match('/class\s+(\w*Loader\w*)/i', $content, $matches)) {
            return $matches[1];
        }
        
        return false;
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
