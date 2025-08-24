<?php

class PortfolioBuilder {
    
    private $basePath;
    private $definitionsPath;
    private $blocksPath;
    private $parameters;
    private $currentPageDefinition;
    
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
        
        // Extract site configuration - handle both old string format and new object format
        if (is_string($profileConfig['site'])) {
            // Legacy format: site is just a string
            $siteName = $profileConfig['site'];
            $siteConfig = $this->loadJson($this->definitionsPath . '/sites/' . $siteName);
        } else {
            // New format: site is an object with embedded configuration
            $siteConfig = $profileConfig['site'];
            $siteName = $siteConfig['site']; // Extract the actual site specification
        }
        
        $pages = $profileConfig['pages'];
        
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
            // Track current page definition for dynamic loading metadata
            $this->currentPageDefinition = $pageFile;
            
            $pageConfig = $this->loadJson($this->definitionsPath . '/pages/' . $pageFile);
            $pageHtml = $this->buildPageFromObjects($pageConfig['objects']);
            $allPageContent .= $pageHtml . "\n";
        }
        
        // Reset current page definition
        $this->currentPageDefinition = null;
        
        return $allPageContent;
    }
    
    private function buildPageFromObjects($objects) {
        // Check if this is a flat structure (has parent relationships) or nested structure
        $hasParentRelationships = false;
        foreach ($objects as $object) {
            if (isset($object['parent'])) {
                $hasParentRelationships = true;
                break;
            }
        }
        
        if ($hasParentRelationships) {
            // Handle flat structure with parent relationships
            return $this->buildFromFlatStructure($objects);
        } else {
            // Handle nested structure
            return $this->buildFromNestedStructure($objects);
        }
    }
    
    private function buildFromFlatStructure($objects) {
        // Step 1: Build dependency tree from flat structure
        $tree = $this->buildHierarchyTree($objects);
        
        // Step 2: Build HTML starting from root objects (parent = null)
        $pageHtml = '';
        foreach ($tree['root'] as $rootObject) {
            $pageHtml .= $this->buildObjectHtml($rootObject, $tree);
        }
        
        return $pageHtml;
    }
    
    private function buildFromNestedStructure($objects) {
        // Build HTML from nested object structure
        $pageHtml = '';
        foreach ($objects as $object) {
            $pageHtml .= $this->buildObjectHtml($object);
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
    
    private function buildObjectHtml($object, $tree = null) {
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
        // Resolve component data strictly from variant-based data map
        if (!isset($object['variant'])) {
            throw new Exception("Missing 'variant' for component: $id");
        }
        if (!isset($object['data']) || !is_array($object['data'])) {
            throw new Exception("Missing or invalid 'data' map for component: $id");
        }
        $variantKey = $object['variant'];
        if (!isset($object['data'][$variantKey]) || !is_array($object['data'][$variantKey])) {
            throw new Exception("Variant '$variantKey' not found in data for component: $id");
        }
        $data = $object['data'][$variantKey];
        $navigationConfig = $object['navigation'] ?? [];
        $isProtected = isset($navigationConfig['protected']) ? (bool)$navigationConfig['protected'] : false;
        $isDynamic = $object['dynamic'] ?? false;
        // Enforce: protected elements must be dynamic (shell + API-gated content)
        if ($isProtected) {
            $isDynamic = true;
        }
        
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

        // Determine loading behavior from dynamic only
        $loadingMode = $isDynamic ? 'shell' : 'full';

        // Prepare component metadata including component data for loader usage
        $componentMetadata = [
            'componentSpec' => $componentSpec,
            'componentId' => $id,
            'componentData' => $data,
            'pageDefinition' => $this->currentPageDefinition ?? null,
            'buildTime' => time()
        ];

        // Check if loader supports dynamic loading
        $reflection = new ReflectionMethod($loader, 'load');
        $paramCount = $reflection->getNumberOfParameters();

        if ($paramCount >= 5) {
            return $loader->load($id, $title, $navigationConfig, $loadingMode, $componentMetadata);
        } elseif ($paramCount >= 3) {
            if ($loadingMode !== 'full') {
                throw new Exception("Component loader does not support dynamic loading: $loaderClass");
            }
            return $loader->load($id, $title, $navigationConfig);
        } else {
            if ($loadingMode !== 'full') {
                throw new Exception("Legacy component loader does not support dynamic loading: $loaderClass");
            }
            return $loader->load($id, $title);
        }
    }
    
    private function loadContainer($object, $tree = null) {
        $containerSpec = $object['component']; // e.g., "vertical/type_1" - containers also use 'component' key
        $id = $object['id'];
        $data = $object['data'] ?? [];
        $navigationConfig = $object['navigation'] ?? [];
        
        // Parse container specification to get container name and version
        $parts = explode('/', $containerSpec);
        $containerType = $parts[0]; // e.g., "vertical"
        $version = $parts[1] ?? 'type_1'; // e.g., "type_1"
        
        // Get children for this container - handle both flat and nested structures
        $childrenHtml = [];
        
        if ($tree !== null) {
            // Flat structure: get children from tree
            $children = $tree['children'][$id] ?? [];
            foreach ($children as $child) {
                $childrenHtml[] = $this->buildObjectHtml($child, $tree);
            }
        } else {
            // Nested structure: get children from nested objects
            $children = $object['objects'] ?? [];
            foreach ($children as $child) {
                $childrenHtml[] = $this->buildObjectHtml($child);
            }
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
        $siteSpec = $siteConfig['site'] ?? $siteConfig['type']; // e.g., "top_bar/type_2"
        
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
        $navigationTabs = $siteConfig['navigationTabs'] ?? $siteConfig['navigation']['tabs'] ?? [];
        $defaultNavigation = $siteConfig['defaultNavigation'] ?? $siteConfig['navigation']['defaultNavigation'] ?? null;
        $title = $siteConfig['title'] ?? $siteConfig['branding']['title'] ?? 'Portfolio';
        
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
