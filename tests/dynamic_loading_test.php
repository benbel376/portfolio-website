<?php
/**
 * COMPREHENSIVE DYNAMIC LOADING BACKEND TEST SUITE
 * Tests API endpoint, builder integration, and all scenarios
 * Run from command line: C:\xampp\php\php.exe tests/dynamic_loading_test.php
 */

class DynamicLoadingBackendTest {
    private $results = [
        'passed' => [],
        'failed' => [],
        'warnings' => [],
        'skipped' => []
    ];
    private $testCount = 0;
    private $basePath;
    
    public function __construct($basePath = '.') {
        $this->basePath = $basePath;
    }
    
    // ============================================================================
    // TEST UTILITIES
    // ============================================================================
    
    private function runTest($name, $testFn) {
        $this->testCount++;
        echo "\n🧪 Test {$this->testCount}: $name\n";
        
        try {
            $result = $testFn();
            if ($result === 'skip') {
                $this->results['skipped'][] = $name;
                echo "⏭️  SKIPPED: $name\n";
            } elseif ($result) {
                $this->results['passed'][] = $name;
                echo "✅ PASSED: $name\n";
            } else {
                $this->results['failed'][] = $name;
                echo "❌ FAILED: $name\n";
            }
        } catch (Exception $e) {
            $this->results['failed'][] = $name;
            echo "❌ FAILED: $name - " . $e->getMessage() . "\n";
        }
    }
    
    private function assert($condition, $message) {
        if (!$condition) {
            throw new Exception("Assertion failed: $message");
        }
    }
    
    private function mockApiRequest($payload) {
        // Mock API request by setting global test input
        $GLOBALS['_test_input'] = json_encode($payload);
        
        // Capture output
        ob_start();
        include $this->basePath . '/endpoints/dynamic_content_t1.php';
        $output = ob_get_clean();
        
        // Clean up
        unset($GLOBALS['_test_input']);
        
        return json_decode($output, true);
    }
    
    // ============================================================================
    // SCENARIO 1: PROTECTED CONTENT
    // ============================================================================
    
    private function testProtectedContentWithoutAuth() {
        $this->runTest('Scenario 1.1: Protected content blocked without auth', function() {
            // Start session without auth
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['auth'] = false;
            
            $payload = [
                'componentId' => 'admin-main-container',
                'pageDefinition' => 'control_page_t1.json',
                'isSecured' => true
            ];
            
            $response = $this->mockApiRequest($payload);
            
            echo "Response: " . json_encode($response) . "\n";
            
            // Should return error
            $this->assert($response['success'] === false, 'Should fail without auth');
            $this->assert(isset($response['error']), 'Should have error message');
            
            return true;
        });
    }
    
    private function testProtectedContentWithAuth() {
        $this->runTest('Scenario 1.2: Protected content loads with auth', function() {
            // Start session with auth
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['auth'] = true;
            
            $payload = [
                'componentId' => 'admin-main-container',
                'pageDefinition' => 'control_page_t1.json',
                'isSecured' => true
            ];
            
            $response = $this->mockApiRequest($payload);
            
            echo "Response success: " . ($response['success'] ? 'true' : 'false') . "\n";
            
            // Should succeed
            $this->assert($response['success'] === true, 'Should succeed with auth');
            $this->assert(isset($response['content']), 'Should have content');
            
            return true;
        });
    }
    
    // ============================================================================
    // SCENARIO 2: EXPLICIT DYNAMIC COMPONENTS
    // ============================================================================
    
    private function testExplicitDynamicComponent() {
        $this->runTest('Scenario 2: Explicit dynamic component loads', function() {
            $payload = [
                'componentId' => 'projects-grid',
                'pageDefinition' => 'projects_page_t1.json'
            ];
            
            $response = $this->mockApiRequest($payload);
            
            echo "Response success: " . ($response['success'] ? 'true' : 'false') . "\n";
            echo "Content length: " . (isset($response['content']) ? strlen($response['content']) : 0) . "\n";
            
            $this->assert($response['success'] === true, 'Should load successfully');
            $this->assert(isset($response['content']), 'Should have content');
            $this->assert(strlen($response['content']) > 0, 'Content should not be empty');
            
            return true;
        });
    }
    
    // ============================================================================
    // SCENARIO 3: URL PARAMETERS
    // ============================================================================
    
    private function testURLParameters() {
        $this->runTest('Scenario 3: URL parameters passed to loaders', function() {
            $payload = [
                'componentId' => 'project-details-main',
                'pageDefinition' => 'project_details_page_t1.json',
                'urlParams' => [
                    'project' => 'AI-Platform',
                    'category' => 'ml'
                ]
            ];
            
            $response = $this->mockApiRequest($payload);
            
            echo "Response success: " . ($response['success'] ? 'true' : 'false') . "\n";
            
            $this->assert($response['success'] === true, 'Should load with parameters');
            $this->assert(isset($response['content']), 'Should have content');
            
            // Verify $_GET was set (would be used by loaders)
            // Note: This is set in the API endpoint
            
            return true;
        });
    }
    
    // ============================================================================
    // SCENARIO 4: PAGE DEFINITION VALIDATION
    // ============================================================================
    
    private function testPageDefinitionValidation() {
        $this->runTest('Scenario 4.1: Invalid page definition rejected', function() {
            $payload = [
                'componentId' => 'test-component',
                'pageDefinition' => '../../../etc/passwd' // Path traversal attempt
            ];
            
            $response = $this->mockApiRequest($payload);
            
            echo "Response: " . json_encode($response) . "\n";
            
            $this->assert($response['success'] === false, 'Should reject invalid page definition');
            
            return true;
        });
    }
    
    private function testMissingPageDefinition() {
        $this->runTest('Scenario 4.2: Missing page definition handled', function() {
            $payload = [
                'componentId' => 'test-component',
                'pageDefinition' => 'nonexistent_page.json'
            ];
            
            $response = $this->mockApiRequest($payload);
            
            echo "Response: " . json_encode($response) . "\n";
            
            $this->assert($response['success'] === false, 'Should fail for missing page');
            
            return true;
        });
    }
    
    // ============================================================================
    // SCENARIO 5: COMPONENT EXTRACTION
    // ============================================================================
    
    private function testComponentExtraction() {
        $this->runTest('Scenario 5: Component extraction from page definition', function() {
            $payload = [
                'componentId' => 'profile-hero',
                'pageDefinition' => 'summary_page_t1.json'
            ];
            
            $response = $this->mockApiRequest($payload);
            
            echo "Response success: " . ($response['success'] ? 'true' : 'false') . "\n";
            echo "Object count: " . ($response['objectCount'] ?? 0) . "\n";
            
            $this->assert($response['success'] === true, 'Should extract component');
            $this->assert(isset($response['objectCount']), 'Should report object count');
            
            return true;
        });
    }
    
    // ============================================================================
    // SCENARIO 6: BUILDER INTEGRATION
    // ============================================================================
    
    private function testBuilderIntegration() {
        $this->runTest('Scenario 6: Builder generates content correctly', function() {
            $payload = [
                'componentId' => 'profile-hero',
                'pageDefinition' => 'summary_page_t1.json'
            ];
            
            $response = $this->mockApiRequest($payload);
            
            $this->assert($response['success'] === true, 'Should succeed');
            $this->assert(isset($response['content']), 'Should have content');
            
            $content = $response['content'];
            
            // Verify content structure
            $this->assert(strpos($content, '<') !== false, 'Content should be HTML');
            $this->assert(strpos($content, 'id="profile-hero"') !== false, 'Should have component ID');
            
            echo "Content preview: " . substr($content, 0, 200) . "...\n";
            
            return true;
        });
    }
    
    // ============================================================================
    // SCENARIO 7: DYNAMIC FLAG MANAGEMENT
    // ============================================================================
    
    private function testDynamicFlagManagement() {
        $this->runTest('Scenario 7: Dynamic flag set to false for content mode', function() {
            // This is tested indirectly - the API should set dynamic=false
            // so the builder generates full content, not shells
            
            $payload = [
                'componentId' => 'profile-hero',
                'pageDefinition' => 'summary_page_t1.json'
            ];
            
            $response = $this->mockApiRequest($payload);
            
            $this->assert($response['success'] === true, 'Should succeed');
            
            $content = $response['content'];
            
            // Full content should have actual data, not just shell
            // Check for data-load-state="not-loaded" which indicates shell
            $isShell = strpos($content, 'data-load-state="not-loaded"') !== false;
            
            $this->assert(!$isShell, 'Should generate full content, not shell');
            
            return true;
        });
    }
    
    // ============================================================================
    // SCENARIO 8: REQUEST TYPE DETECTION
    // ============================================================================
    
    private function testRequestTypeDetection() {
        $this->runTest('Scenario 8.1: Component request type', function() {
            $payload = [
                'componentId' => 'profile-hero',
                'pageDefinition' => 'summary_page_t1.json'
            ];
            
            $response = $this->mockApiRequest($payload);
            
            $this->assert($response['success'] === true, 'Should succeed');
            $this->assert($response['requestType'] === 'component', 'Should detect component request');
            
            return true;
        });
    }
    
    private function testPageContainerRequestType() {
        $this->runTest('Scenario 8.2: Page container request type', function() {
            $payload = [
                'containerId' => 'summary-main-container',
                'pageDefinition' => 'summary_page_t1.json'
            ];
            
            $response = $this->mockApiRequest($payload);
            
            $this->assert($response['success'] === true, 'Should succeed');
            $this->assert($response['requestType'] === 'page-container', 'Should detect page-container request');
            
            return true;
        });
    }
    
    // ============================================================================
    // SCENARIO 9: ERROR HANDLING
    // ============================================================================
    
    private function testMissingComponentId() {
        $this->runTest('Scenario 9.1: Missing component ID handled', function() {
            $payload = [
                'componentId' => 'nonexistent-component',
                'pageDefinition' => 'summary_page_t1.json'
            ];
            
            $response = $this->mockApiRequest($payload);
            
            echo "Response: " . json_encode($response) . "\n";
            
            $this->assert($response['success'] === false, 'Should fail for missing component');
            
            return true;
        });
    }
    
    private function testInvalidJSON() {
        $this->runTest('Scenario 9.2: Invalid JSON request handled', function() {
            $GLOBALS['_test_input'] = 'invalid json {{{';
            
            ob_start();
            include $this->basePath . '/endpoints/dynamic_content_t1.php';
            $output = ob_get_clean();
            
            unset($GLOBALS['_test_input']);
            
            $response = json_decode($output, true);
            
            echo "Response: " . json_encode($response) . "\n";
            
            $this->assert($response['success'] === false, 'Should fail for invalid JSON');
            
            return true;
        });
    }
    
    // ============================================================================
    // SCENARIO 10: CACHE KEY GENERATION
    // ============================================================================
    
    private function testCacheKeyGeneration() {
        $this->runTest('Scenario 10: Cache key generation', function() {
            $payload = [
                'componentId' => 'profile-hero',
                'pageDefinition' => 'summary_page_t1.json'
            ];
            
            $response = $this->mockApiRequest($payload);
            
            $this->assert($response['success'] === true, 'Should succeed');
            $this->assert(isset($response['cacheKey']), 'Should have cache key');
            $this->assert(!empty($response['cacheKey']), 'Cache key should not be empty');
            
            echo "Cache key: " . $response['cacheKey'] . "\n";
            
            return true;
        });
    }
    
    // ============================================================================
    // RUN ALL TESTS
    // ============================================================================
    
    public function runAll() {
        echo "\n╔════════════════════════════════════════════════════════╗\n";
        echo "║   DYNAMIC LOADING BACKEND TEST SUITE                  ║\n";
        echo "╚════════════════════════════════════════════════════════╝\n";
        
        // Run all tests
        $this->testProtectedContentWithoutAuth();
        $this->testProtectedContentWithAuth();
        $this->testExplicitDynamicComponent();
        $this->testURLParameters();
        $this->testPageDefinitionValidation();
        $this->testMissingPageDefinition();
        $this->testComponentExtraction();
        $this->testBuilderIntegration();
        $this->testDynamicFlagManagement();
        $this->testRequestTypeDetection();
        $this->testPageContainerRequestType();
        $this->testMissingComponentId();
        $this->testInvalidJSON();
        $this->testCacheKeyGeneration();
        
        // Print report
        $this->printReport();
    }
    
    private function printReport() {
        echo "\n╔════════════════════════════════════════════════════════╗\n";
        echo "║                    TEST REPORT                         ║\n";
        echo "╚════════════════════════════════════════════════════════╝\n\n";
        
        echo "Total Tests: {$this->testCount}\n";
        echo "✅ Passed: " . count($this->results['passed']) . "\n";
        echo "❌ Failed: " . count($this->results['failed']) . "\n";
        echo "⏭️  Skipped: " . count($this->results['skipped']) . "\n";
        echo "⚠️  Warnings: " . count($this->results['warnings']) . "\n\n";
        
        if (count($this->results['passed']) > 0) {
            echo "✅ PASSED TESTS:\n";
            foreach ($this->results['passed'] as $test) {
                echo "   ✓ $test\n";
            }
            echo "\n";
        }
        
        if (count($this->results['failed']) > 0) {
            echo "❌ FAILED TESTS:\n";
            foreach ($this->results['failed'] as $test) {
                echo "   ✗ $test\n";
            }
            echo "\n";
        }
        
        if (count($this->results['skipped']) > 0) {
            echo "⏭️  SKIPPED TESTS:\n";
            foreach ($this->results['skipped'] as $test) {
                echo "   - $test\n";
            }
            echo "\n";
        }
        
        echo str_repeat('═', 60) . "\n";
        
        if (count($this->results['failed']) === 0) {
            echo "🎉 ALL TESTS PASSED!\n";
        } else {
            echo "⚠️  SOME TESTS FAILED\n";
        }
        
        echo str_repeat('═', 60) . "\n\n";
    }
}

// Run the tests
$test = new DynamicLoadingBackendTest(__DIR__ . '/..');
$test->runAll();
