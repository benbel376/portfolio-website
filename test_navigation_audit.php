<?php
/**
 * Navigation System Backend Audit Script
 * Validates page definitions, site configuration, and builder logic
 * Run from command line: php test_navigation_audit.php
 */

class NavigationBackendAudit {
    private $issues = [];
    private $warnings = [];
    private $passed = [];
    private $basePath;
    
    public function __construct($basePath = '.') {
        $this->basePath = $basePath;
    }
    
    // Test 1: Verify all page definitions have proper structure
    public function testPageDefinitions() {
        echo "\n=== Test 1: Page Definitions Structure ===\n";
        
        $pagesPath = $this->basePath . '/definitions/pages';
        if (!is_dir($pagesPath)) {
            $this->issues[] = "Pages directory not found: $pagesPath";
            return false;
        }
        
        $pageFiles = glob($pagesPath . '/*.json');
        echo "Found " . count($pageFiles) . " page definition files\n";
        
        foreach ($pageFiles as $pageFile) {
            $filename = basename($pageFile);
            $content = file_get_contents($pageFile);
            $data = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->issues[] = "Invalid JSON in $filename: " . json_last_error_msg();
                continue;
            }
            
            // Check for objects array
            if (!isset($data['objects']) || !is_array($data['objects'])) {
                $this->issues[] = "$filename: Missing or invalid 'objects' array";
                continue;
            }
            
            // Check each object
            foreach ($data['objects'] as $index => $object) {
                $this->validateObject($object, $filename, $index);
            }
        }
        
        $this->passed[] = "Page definitions structure validated";
        return true;
    }
    
    private function validateObject($object, $filename, $index) {
        $objectId = $object['id'] ?? "object-$index";
        
        // Required fields
        if (!isset($object['type'])) {
            $this->issues[] = "$filename: Object $objectId missing 'type' field";
        }
        
        if (!isset($object['component'])) {
            $this->issues[] = "$filename: Object $objectId missing 'component' field";
        }
        
        if (!isset($object['id'])) {
            $this->issues[] = "$filename: Object $objectId missing 'id' field";
        }
        
        // Check navigation config
        if (isset($object['navigation'])) {
            $nav = $object['navigation'];
            
            if (!isset($nav['defaultState'])) {
                $this->warnings[] = "$filename: Object $objectId missing 'defaultState' in navigation";
            }
            
            if (!isset($nav['allowedStates'])) {
                $this->warnings[] = "$filename: Object $objectId missing 'allowedStates' in navigation";
            }
        }
        
        // Check for components with variant-based data
        if ($object['type'] === 'component') {
            if (!isset($object['variant'])) {
                $this->warnings[] = "$filename: Component $objectId missing 'variant' field";
            }
            
            if (!isset($object['data']) || !is_array($object['data'])) {
                $this->warnings[] = "$filename: Component $objectId missing or invalid 'data' map";
            } else {
                $variant = $object['variant'] ?? null;
                if ($variant && !isset($object['data'][$variant])) {
                    $this->issues[] = "$filename: Component $objectId variant '$variant' not found in data map";
                }
            }
        }
        
        // Check containers have parentTab
        if ($object['type'] === 'container') {
            $isMainContainer = strpos($objectId, '-main-container') !== false;
            
            if ($isMainContainer && !isset($object['parentTab'])) {
                $this->warnings[] = "$filename: Main container $objectId missing 'parentTab' field";
            }
        }
        
        // Validate nested objects if present
        if (isset($object['objects']) && is_array($object['objects'])) {
            foreach ($object['objects'] as $childIndex => $childObject) {
                $this->validateObject($childObject, $filename, "$index.$childIndex");
            }
        }
    }
    
    // Test 2: Verify site configuration matches page parentTab values
    public function testSiteConfiguration() {
        echo "\n=== Test 2: Site Configuration ===\n";
        
        $sitePath = $this->basePath . '/definitions/sites/top_bar_site_t2.json';
        if (!file_exists($sitePath)) {
            $this->issues[] = "Site configuration not found: $sitePath";
            return false;
        }
        
        $content = file_get_contents($sitePath);
        $siteConfig = json_decode($content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->issues[] = "Invalid JSON in site configuration: " . json_last_error_msg();
            return false;
        }
        
        // Extract tab IDs
        $tabs = $siteConfig['navigation']['tabs'] ?? [];
        $tabIds = [];
        
        foreach ($tabs as $tab) {
            if (isset($tab['tabId'])) {
                $tabIds[] = $tab['tabId'];
            }
        }
        
        echo "Found " . count($tabIds) . " navigation tabs: " . implode(', ', $tabIds) . "\n";
        
        // Check default navigation
        if (!isset($siteConfig['navigation']['defaultNavigation'])) {
            $this->warnings[] = "Site configuration missing defaultNavigation";
        } else {
            $defaultHash = $siteConfig['navigation']['defaultNavigation']['hash'] ?? null;
            if (!$defaultHash) {
                $this->warnings[] = "Default navigation missing hash";
            } else {
                echo "Default navigation: $defaultHash\n";
            }
        }
        
        // Collect all parentTab values from pages
        $parentTabs = $this->collectParentTabs();
        
        // Check alignment
        foreach ($parentTabs as $parentTab) {
            if (!in_array($parentTab, $tabIds)) {
                $this->warnings[] = "Page has parentTab='$parentTab' but no matching navigation tab";
            }
        }
        
        foreach ($tabIds as $tabId) {
            if (!in_array($tabId, $parentTabs)) {
                $this->warnings[] = "Navigation tab '$tabId' has no matching page with parentTab";
            }
        }
        
        $this->passed[] = "Site configuration validated";
        return true;
    }
    
    private function collectParentTabs() {
        $parentTabs = [];
        $pagesPath = $this->basePath . '/definitions/pages';
        $pageFiles = glob($pagesPath . '/*.json');
        
        foreach ($pageFiles as $pageFile) {
            $content = file_get_contents($pageFile);
            $data = json_decode($content, true);
            
            if (json_last_error() === JSON_ERROR_NONE && isset($data['objects'])) {
                foreach ($data['objects'] as $object) {
                    if (isset($object['parentTab'])) {
                        $parentTabs[] = $object['parentTab'];
                    }
                }
            }
        }
        
        return array_unique($parentTabs);
    }
    
    // Test 3: Verify protected content is automatically marked as dynamic
    public function testProtectedContentLogic() {
        echo "\n=== Test 3: Protected Content Logic ===\n";
        
        $pagesPath = $this->basePath . '/definitions/pages';
        $pageFiles = glob($pagesPath . '/*.json');
        
        $protectedComponents = [];
        
        foreach ($pageFiles as $pageFile) {
            $filename = basename($pageFile);
            $content = file_get_contents($pageFile);
            $data = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                continue;
            }
            
            foreach ($data['objects'] as $object) {
                $isProtected = isset($object['navigation']['protected']) && $object['navigation']['protected'] === true;
                $isDynamic = isset($object['dynamic']) && $object['dynamic'] === true;
                
                if ($isProtected) {
                    $protectedComponents[] = [
                        'file' => $filename,
                        'id' => $object['id'],
                        'dynamic' => $isDynamic
                    ];
                    
                    // Note: The enforcement happens in index.php, not in the JSON
                    // So we just document what we find
                    if (!$isDynamic) {
                        $this->warnings[] = "$filename: Protected component '{$object['id']}' not marked as dynamic (will be enforced by index.php)";
                    }
                }
            }
        }
        
        echo "Found " . count($protectedComponents) . " protected components\n";
        $this->passed[] = "Protected content logic checked";
        return true;
    }
    
    // Test 4: Verify builder exists and has correct methods
    public function testBuilderStructure() {
        echo "\n=== Test 4: Builder Structure ===\n";
        
        $builderPath = $this->basePath . '/builders/builder_t1.php';
        if (!file_exists($builderPath)) {
            $this->issues[] = "Builder not found: $builderPath";
            return false;
        }
        
        require_once $builderPath;
        
        if (!class_exists('PortfolioBuilder')) {
            $this->issues[] = "PortfolioBuilder class not found";
            return false;
        }
        
        $reflection = new ReflectionClass('PortfolioBuilder');
        
        // Check for required methods
        $requiredMethods = ['build', 'buildObjects'];
        foreach ($requiredMethods as $method) {
            if (!$reflection->hasMethod($method)) {
                $this->issues[] = "PortfolioBuilder missing method: $method";
            }
        }
        
        $this->passed[] = "Builder structure validated";
        return true;
    }
    
    // Test 5: Verify all component loaders exist
    public function testComponentLoaders() {
        echo "\n=== Test 5: Component Loaders ===\n";
        
        $componentsPath = $this->basePath . '/blocks/components';
        if (!is_dir($componentsPath)) {
            $this->issues[] = "Components directory not found: $componentsPath";
            return false;
        }
        
        $componentDirs = glob($componentsPath . '/*', GLOB_ONLYDIR);
        $missingLoaders = [];
        
        foreach ($componentDirs as $componentDir) {
            $componentName = basename($componentDir);
            $versions = glob($componentDir . '/type_*', GLOB_ONLYDIR);
            
            foreach ($versions as $versionDir) {
                $loaderFiles = glob($versionDir . '/*loader*.php');
                
                if (empty($loaderFiles)) {
                    $missingLoaders[] = $versionDir;
                    $this->warnings[] = "No loader found in: $versionDir";
                }
            }
        }
        
        if (empty($missingLoaders)) {
            $this->passed[] = "All components have loaders";
        }
        
        return true;
    }
    
    // Test 6: Verify container loaders exist
    public function testContainerLoaders() {
        echo "\n=== Test 6: Container Loaders ===\n";
        
        $containersPath = $this->basePath . '/blocks/containers';
        if (!is_dir($containersPath)) {
            $this->issues[] = "Containers directory not found: $containersPath";
            return false;
        }
        
        $containerDirs = glob($containersPath . '/*', GLOB_ONLYDIR);
        $missingLoaders = [];
        
        foreach ($containerDirs as $containerDir) {
            $containerName = basename($containerDir);
            $versions = glob($containerDir . '/type_*', GLOB_ONLYDIR);
            
            foreach ($versions as $versionDir) {
                $loaderFiles = glob($versionDir . '/*loader*.php');
                
                if (empty($loaderFiles)) {
                    $missingLoaders[] = $versionDir;
                    $this->warnings[] = "No loader found in: $versionDir";
                }
            }
        }
        
        if (empty($missingLoaders)) {
            $this->passed[] = "All containers have loaders";
        }
        
        return true;
    }
    
    // Test 7: Verify default states consistency
    public function testDefaultStatesConsistency() {
        echo "\n=== Test 7: Default States Consistency ===\n";
        
        $pagesPath = $this->basePath . '/definitions/pages';
        $pageFiles = glob($pagesPath . '/*.json');
        
        $mainContainers = [];
        
        foreach ($pageFiles as $pageFile) {
            $filename = basename($pageFile);
            $content = file_get_contents($pageFile);
            $data = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                continue;
            }
            
            foreach ($data['objects'] as $object) {
                if ($object['type'] === 'container' && strpos($object['id'], '-main-container') !== false) {
                    $defaultState = $object['navigation']['defaultState'] ?? 'not-set';
                    $mainContainers[] = [
                        'file' => $filename,
                        'id' => $object['id'],
                        'defaultState' => $defaultState
                    ];
                    
                    // Main containers should typically be hidden by default
                    if ($defaultState !== 'hidden') {
                        $this->warnings[] = "$filename: Main container '{$object['id']}' has defaultState='$defaultState' (expected 'hidden')";
                    }
                }
            }
        }
        
        echo "Found " . count($mainContainers) . " main containers\n";
        $this->passed[] = "Default states consistency checked";
        return true;
    }
    
    // Run all tests
    public function runAll() {
        echo "\n╔════════════════════════════════════════════════════════╗\n";
        echo "║     NAVIGATION BACKEND COMPREHENSIVE AUDIT            ║\n";
        echo "╚════════════════════════════════════════════════════════╝\n";
        
        $this->testPageDefinitions();
        $this->testSiteConfiguration();
        $this->testProtectedContentLogic();
        $this->testBuilderStructure();
        $this->testComponentLoaders();
        $this->testContainerLoaders();
        $this->testDefaultStatesConsistency();
        
        $this->printReport();
    }
    
    // Print comprehensive report
    public function printReport() {
        echo "\n╔════════════════════════════════════════════════════════╗\n";
        echo "║                    AUDIT REPORT                        ║\n";
        echo "╚════════════════════════════════════════════════════════╝\n";
        
        echo "\n✅ PASSED: " . count($this->passed) . " checks\n";
        foreach ($this->passed as $msg) {
            echo "   ✓ $msg\n";
        }
        
        if (count($this->warnings) > 0) {
            echo "\n⚠️  WARNINGS: " . count($this->warnings) . " issues\n";
            foreach ($this->warnings as $msg) {
                echo "   ⚠ $msg\n";
            }
        }
        
        if (count($this->issues) > 0) {
            echo "\n❌ CRITICAL ISSUES: " . count($this->issues) . " problems\n";
            foreach ($this->issues as $msg) {
                echo "   ✗ $msg\n";
            }
        }
        
        echo "\n" . str_repeat('═', 60) . "\n";
        
        if (count($this->issues) === 0) {
            echo "🎉 NAVIGATION BACKEND: FULLY COMPLIANT\n";
        } else {
            echo "⚠️  NAVIGATION BACKEND: ISSUES DETECTED\n";
        }
        
        echo str_repeat('═', 60) . "\n\n";
        
        return [
            'passed' => count($this->passed),
            'warnings' => count($this->warnings),
            'issues' => count($this->issues)
        ];
    }
}

// Run the audit
$audit = new NavigationBackendAudit(__DIR__);
$audit->runAll();
