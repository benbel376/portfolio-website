<?php

class PortfolioBuilder {
    
    private $basePath;
    private $blocksPath;
    private $debugMode;
    
    public function __construct($basePath = '.', $debugMode = false) {
        $this->basePath = $basePath;  
        $this->blocksPath = $basePath . '/blocks';
        $this->debugMode = $debugMode;
    }
    
    
    /**
     * Build HTML from a dictionary structure
     * Dictionary format: {
     *   "site": { site_config } | null,
     *   "objects": [ array_of_objects ],
     *   "pageDefinition": "source_page.json"
     * }
     */
    public function build($dictionary) {
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Starting build with dictionary");
            error_log("BUILDER DEBUG: Dictionary keys: " . implode(', ', array_keys($dictionary)));
            error_log("BUILDER DEBUG: Objects count: " . count($dictionary['objects'] ?? []));
        }
        
        $siteConfig = $dictionary['site'] ?? null;
        $objects = $dictionary['objects'] ?? [];
        $pageDefinition = $dictionary['pageDefinition'] ?? 'unknown';
        
        // Build content from objects
        $content = $this->buildObjects($objects, $pageDefinition);
        
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Content built, length: " . strlen($content));
            error_log("BUILDER DEBUG: Has site config: " . ($siteConfig ? 'yes' : 'no'));
        }
        
        // If site config provided, wrap in site template
        if ($siteConfig) {
            $result = $this->loadSiteBlock($siteConfig, $content);
            if ($this->debugMode) {
                error_log("BUILDER DEBUG: Site template applied, final length: " . strlen($result));
            }
            return $result;
        }
        
        // Otherwise return content only (for dynamic loading)
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Returning content only (no site template)");
        }
        return $content;
    }
    
    /**
     * Build HTML content from array of objects
     */
    private function buildObjects($objects, $pageDefinition = 'unknown') {
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Building objects from page: $pageDefinition");
            error_log("BUILDER DEBUG: Processing " . count($objects) . " objects");
        }
        
        // Check if this is a flat structure (has parent relationships) or nested structure
        $hasParentRelationships = false;
        foreach ($objects as $object) {
            if (isset($object['parent'])) {
                $hasParentRelationships = true;
                break;
            }
        }
        
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Structure type: " . ($hasParentRelationships ? 'flat' : 'nested'));
        }
        
        if ($hasParentRelationships) {
            // Handle flat structure with parent relationships
            return $this->buildFromFlatStructure($objects, $pageDefinition);
        } else {
            // Handle nested structure
            return $this->buildFromNestedStructure($objects, $pageDefinition);
        }
    }
    
    
    private function buildFromFlatStructure($objects, $pageDefinition) {
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Building flat structure");
        }
        
        // Step 1: Build dependency tree from flat structure
        $tree = $this->buildHierarchyTree($objects);
        
        // Step 2: Build HTML starting from root objects (parent = null)
        $pageHtml = '';
        foreach ($tree['root'] as $rootObject) {
            $pageHtml .= $this->buildObjectHtml($rootObject, $tree, $pageDefinition);
        }
        
        return $pageHtml;
    }
    
    private function buildFromNestedStructure($objects, $pageDefinition) {
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Building nested structure");
        }
        
        // Build HTML from nested object structure
        $pageHtml = '';
        foreach ($objects as $object) {
            $pageHtml .= $this->buildObjectHtml($object, null, $pageDefinition);
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
    
    private function buildObjectHtml($object, $tree = null, $pageDefinition = 'unknown') {
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Building object: " . ($object['id'] ?? 'no-id') . " (type: " . ($object['type'] ?? 'unknown') . ")");
        }
        
        if ($object['type'] === 'component') {
            return $this->loadComponent($object, $pageDefinition);
        } elseif ($object['type'] === 'container') {
            return $this->loadContainer($object, $tree, $pageDefinition);
        }
        
        return '';
    }
    
    private function loadComponent($object, $pageDefinition = 'unknown') {
        $componentSpec = $object['component']; // e.g., "heros/type_1"
        $id = $object['id'];
        
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Loading component $id ($componentSpec)");
        }
        
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
        
        // IMPORTANT: Use dynamic flag as-is (should be enforced by index.php for protected content)
        $isDynamic = $object['dynamic'] ?? false;
        
        if ($this->debugMode) {
            $isProtected = isset($navigationConfig['protected']) ? (bool)$navigationConfig['protected'] : false;
            error_log("BUILDER DEBUG: Component $id - Dynamic: " . ($isDynamic ? 'yes' : 'no') . ", Protected: " . ($isProtected ? 'yes' : 'no'));
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
            'dataSource' => $object['dataSource'] ?? null,
            'pageDefinition' => $object['_pageSource'] ?? $pageDefinition,
            'buildTime' => time()
        ];
        
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Component $id metadata prepared");
        }

        // Find and instantiate the loader
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

        // Check if loader supports dynamic loading
        $reflection = new ReflectionMethod($loader, 'load');
        $paramCount = $reflection->getNumberOfParameters();

        if ($paramCount >= 5) {
            $result = $loader->load($id, $title, $navigationConfig, $loadingMode, $componentMetadata);
            if ($this->debugMode) {
                error_log("BUILDER DEBUG: Component $id loaded successfully, result length: " . strlen($result));
            }
            return $result;
        } elseif ($paramCount >= 3) {
            if ($loadingMode !== 'full') {
                throw new Exception("Component loader does not support dynamic loading: $loaderClass");
            }
            $result = $loader->load($id, $title, $navigationConfig);
            if ($this->debugMode) {
                error_log("BUILDER DEBUG: Component $id loaded (nav-aware), result length: " . strlen($result));
            }
            return $result;
        } else {
            if ($loadingMode !== 'full') {
                throw new Exception("Legacy component loader does not support dynamic loading: $loaderClass");
            }
            $result = $loader->load($id, $title);
            if ($this->debugMode) {
                error_log("BUILDER DEBUG: Component $id loaded (legacy), result length: " . strlen($result));
            }
            return $result;
        }
    }
    
    private function loadContainer($object, $tree = null, $pageDefinition = 'unknown') {
        $containerSpec = $object['component']; // e.g., "vertical/type_1" - containers also use 'component' key
        $id = $object['id'];
        $data = $object['data'] ?? [];
        $navigationConfig = $object['navigation'] ?? [];
        
        // Include parentTab if specified
        if (isset($object['parentTab'])) {
            $navigationConfig['parentTab'] = $object['parentTab'];
        }
        
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Loading container $id ($containerSpec)");
        }
        
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
                $childrenHtml[] = $this->buildObjectHtml($child, $tree, $pageDefinition);
            }
        } else {
            // Nested structure: get children from nested objects
            $children = $object['objects'] ?? [];
            foreach ($children as $child) {
                $childrenHtml[] = $this->buildObjectHtml($child, null, $pageDefinition);
            }
        }
        
        if ($this->debugMode) {
            error_log("BUILDER DEBUG: Container $id has " . count($childrenHtml) . " children");
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
            $result = $loader->load($id, $childrenHtml, $navigationConfig);
            if ($this->debugMode) {
                error_log("BUILDER DEBUG: Container $id loaded (nav-aware), result length: " . strlen($result));
            }
            return $result;
        } else {
            // Legacy loader, only pass basic parameters
            $result = $loader->load($id, $childrenHtml);
            if ($this->debugMode) {
                error_log("BUILDER DEBUG: Container $id loaded (legacy), result length: " . strlen($result));
            }
            return $result;
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
        $backgrounds = $siteConfig['backgrounds'] ?? null;
        $theme = $siteConfig['theme'] ?? null;
        $branding = $siteConfig['branding'] ?? null;
        
        // Check loader signature and call appropriately
        $reflection = new ReflectionMethod($loader, 'load');
        $paramCount = $reflection->getNumberOfParameters();
        
        if ($paramCount >= 7) {
            // New loader with branding support
            return $loader->load($navigationTabs, $title, $pageContent, $defaultNavigation, $backgrounds, $theme, $branding);
        } else {
            // Legacy loader
            return $loader->load($navigationTabs, $title, $pageContent, $defaultNavigation, $backgrounds, $theme);
        }
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
    
}

?>

