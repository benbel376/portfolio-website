/**
 * Navigation System Audit Script
 * Comprehensive validation of navigation architecture
 * Run in browser console after page load
 */

class NavigationAudit {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.passed = [];
    }

    // Test 1: Verify GlobalNavigator is initialized
    testGlobalNavigatorInitialization() {
        console.log('\n=== Test 1: GlobalNavigator Initialization ===');
        
        if (!window.globalNavigator) {
            this.issues.push('GlobalNavigator not found on window object');
            return false;
        }
        
        if (!window.globalNavigator.isInitialized) {
            this.issues.push('GlobalNavigator exists but not initialized');
            return false;
        }
        
        this.passed.push('GlobalNavigator properly initialized');
        return true;
    }

    // Test 2: Verify all elements with data-nav-handler have handlers registered
    testHandlerRegistration() {
        console.log('\n=== Test 2: Handler Registration ===');
        
        const navigableElements = document.querySelectorAll('[data-nav-handler]');
        console.log(`Found ${navigableElements.length} navigable elements`);
        
        let missingHandlers = [];
        let registeredCount = 0;
        
        navigableElements.forEach(element => {
            const handlerName = element.getAttribute('data-nav-handler');
            const elementId = element.id;
            
            if (!elementId) {
                this.issues.push(`Element with handler "${handlerName}" has no ID`);
                return;
            }
            
            // Check if handler function exists
            if (typeof window[handlerName] !== 'function') {
                missingHandlers.push({ elementId, handlerName });
                this.issues.push(`Handler function "${handlerName}" not found for element "${elementId}"`);
            } else {
                registeredCount++;
            }
            
            // Check if registered in GlobalNavigator
            if (window.globalNavigator && !window.globalNavigator.registeredHandlers.has(elementId)) {
                this.warnings.push(`Element "${elementId}" has handler but not registered in GlobalNavigator`);
            }
        });
        
        if (missingHandlers.length === 0) {
            this.passed.push(`All ${registeredCount} navigation handlers properly registered`);
            return true;
        }
        
        return false;
    }

    // Test 3: Verify all containers have data-parent-tab
    testParentTabConfiguration() {
        console.log('\n=== Test 3: Parent Tab Configuration ===');
        
        const containers = document.querySelectorAll('[data-nav-handler="handleVerticalContainerNavigation"], [data-nav-handler="handleHorizontalContainerNavigation"]');
        console.log(`Found ${containers.length} containers`);
        
        let missingParentTab = [];
        
        containers.forEach(container => {
            const parentTab = container.getAttribute('data-parent-tab');
            const containerId = container.id;
            
            if (!parentTab) {
                missingParentTab.push(containerId);
                this.warnings.push(`Container "${containerId}" missing data-parent-tab attribute`);
            }
        });
        
        if (missingParentTab.length === 0) {
            this.passed.push('All containers have parentTab configuration');
            return true;
        }
        
        return false;
    }

    // Test 4: Verify navigation tabs match container parentTab values
    testTabContainerAlignment() {
        console.log('\n=== Test 4: Tab-Container Alignment ===');
        
        const navLinks = document.querySelectorAll('.nav-link');
        const containers = document.querySelectorAll('[data-parent-tab]');
        
        const tabIds = new Set();
        navLinks.forEach(link => {
            const tabId = link.getAttribute('data-tab-id') || link.getAttribute('data-target');
            if (tabId) tabIds.add(tabId);
        });
        
        const parentTabs = new Set();
        containers.forEach(container => {
            const parentTab = container.getAttribute('data-parent-tab');
            if (parentTab) parentTabs.add(parentTab);
        });
        
        console.log('Tab IDs:', Array.from(tabIds));
        console.log('Parent Tabs:', Array.from(parentTabs));
        
        // Check for orphaned parentTabs (no matching tab)
        parentTabs.forEach(parentTab => {
            if (!tabIds.has(parentTab)) {
                this.warnings.push(`Container has parentTab="${parentTab}" but no matching navigation tab`);
            }
        });
        
        // Check for tabs with no containers
        tabIds.forEach(tabId => {
            if (!parentTabs.has(tabId)) {
                this.warnings.push(`Navigation tab "${tabId}" has no matching container with parentTab`);
            }
        });
        
        this.passed.push('Tab-Container alignment checked');
        return true;
    }

    // Test 5: Verify default states are properly configured
    testDefaultStates() {
        console.log('\n=== Test 5: Default States Configuration ===');
        
        const navigableElements = document.querySelectorAll('[data-nav-handler]');
        let missingConfig = [];
        
        navigableElements.forEach(element => {
            const navConfig = element.getAttribute('data-nav-config');
            const elementId = element.id;
            
            if (!navConfig) {
                missingConfig.push(elementId);
                this.warnings.push(`Element "${elementId}" missing data-nav-config`);
                return;
            }
            
            try {
                const config = JSON.parse(navConfig);
                if (!config.defaultState) {
                    this.warnings.push(`Element "${elementId}" has no defaultState in config`);
                }
                if (!config.allowedStates || !Array.isArray(config.allowedStates)) {
                    this.warnings.push(`Element "${elementId}" has no allowedStates in config`);
                }
            } catch (e) {
                this.issues.push(`Element "${elementId}" has invalid JSON in data-nav-config`);
            }
        });
        
        if (missingConfig.length === 0) {
            this.passed.push('All elements have navigation configuration');
            return true;
        }
        
        return false;
    }

    // Test 6: Verify dynamic components have proper metadata
    testDynamicComponents() {
        console.log('\n=== Test 6: Dynamic Components Configuration ===');
        
        const dynamicComponents = document.querySelectorAll('[data-dynamic="true"]');
        console.log(`Found ${dynamicComponents.length} dynamic components`);
        
        dynamicComponents.forEach(component => {
            const componentId = component.id;
            const metadata = component.getAttribute('data-component-metadata');
            const initHook = component.getAttribute('data-init-hook');
            const loadState = component.getAttribute('data-load-state');
            
            if (!metadata) {
                this.warnings.push(`Dynamic component "${componentId}" missing data-component-metadata`);
            }
            
            if (!initHook) {
                this.warnings.push(`Dynamic component "${componentId}" missing data-init-hook`);
            }
            
            if (!loadState) {
                this.warnings.push(`Dynamic component "${componentId}" missing data-load-state`);
            }
            
            // Verify init hook function exists
            if (initHook && typeof window[initHook] !== 'function') {
                this.issues.push(`Init hook "${initHook}" not found for component "${componentId}"`);
            }
        });
        
        this.passed.push(`Dynamic components checked (${dynamicComponents.length} found)`);
        return true;
    }

    // Test 7: Test navigation state tracking
    testStateTracking() {
        console.log('\n=== Test 7: State Tracking ===');
        
        if (!window.globalNavigator) {
            this.issues.push('Cannot test state tracking - GlobalNavigator not found');
            return false;
        }
        
        const currentState = window.globalNavigator.getCurrentState();
        const previousState = window.globalNavigator.previousState;
        
        console.log('Current State:', currentState);
        console.log('Previous State:', previousState);
        
        if (!(currentState instanceof Map)) {
            this.issues.push('currentState is not a Map');
            return false;
        }
        
        if (!(previousState instanceof Map)) {
            this.issues.push('previousState is not a Map');
            return false;
        }
        
        this.passed.push('State tracking structures are valid');
        return true;
    }

    // Test 8: Verify container behavior handlers
    testContainerHandlers() {
        console.log('\n=== Test 8: Container Handler Functions ===');
        
        const requiredHandlers = [
            'handleVerticalContainerNavigation',
            'handleHorizontalContainerNavigation'
        ];
        
        requiredHandlers.forEach(handlerName => {
            if (typeof window[handlerName] !== 'function') {
                this.issues.push(`Required handler "${handlerName}" not found`);
            } else {
                this.passed.push(`Handler "${handlerName}" exists`);
            }
        });
        
        return true;
    }

    // Test 9: Verify hash parsing
    testHashParsing() {
        console.log('\n=== Test 9: Hash Parsing ===');
        
        if (!window.globalNavigator) {
            this.issues.push('Cannot test hash parsing - GlobalNavigator not found');
            return false;
        }
        
        // Test various hash formats
        const testCases = [
            { hash: 'summary-main-container/visible', expected: 1 },
            { hash: 'summary-main-container/visible|skills-main-container/hidden', expected: 2 },
            { hash: 'projects-main-container/visible?category=ml', expected: 1 }
        ];
        
        testCases.forEach(testCase => {
            try {
                const parsed = window.globalNavigator.parseHash(testCase.hash);
                if (parsed.size === testCase.expected) {
                    this.passed.push(`Hash parsing correct for: ${testCase.hash}`);
                } else {
                    this.issues.push(`Hash parsing failed for: ${testCase.hash} (expected ${testCase.expected}, got ${parsed.size})`);
                }
            } catch (e) {
                this.issues.push(`Hash parsing threw error for: ${testCase.hash} - ${e.message}`);
            }
        });
        
        return true;
    }

    // Test 10: Verify restorePreviousElementsToDefaults logic
    testRestoreLogic() {
        console.log('\n=== Test 10: Restore Previous Elements Logic ===');
        
        if (!window.globalNavigator) {
            this.issues.push('Cannot test restore logic - GlobalNavigator not found');
            return false;
        }
        
        // Check if method exists
        if (typeof window.globalNavigator.restorePreviousElementsToDefaults !== 'function') {
            this.issues.push('restorePreviousElementsToDefaults method not found');
            return false;
        }
        
        // Check if defaultStates Map is populated
        if (!window.globalNavigator.defaultStates || window.globalNavigator.defaultStates.size === 0) {
            this.warnings.push('defaultStates Map is empty - may not have discovered elements yet');
        } else {
            console.log(`Default states registered for ${window.globalNavigator.defaultStates.size} elements`);
            this.passed.push(`Default states tracked for ${window.globalNavigator.defaultStates.size} elements`);
        }
        
        return true;
    }

    // Run all tests
    runAll() {
        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║     NAVIGATION SYSTEM COMPREHENSIVE AUDIT             ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        
        this.testGlobalNavigatorInitialization();
        this.testHandlerRegistration();
        this.testParentTabConfiguration();
        this.testTabContainerAlignment();
        this.testDefaultStates();
        this.testDynamicComponents();
        this.testStateTracking();
        this.testContainerHandlers();
        this.testHashParsing();
        this.testRestoreLogic();
        
        this.printReport();
    }

    // Print comprehensive report
    printReport() {
        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║                    AUDIT REPORT                        ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        
        console.log(`\n✅ PASSED: ${this.passed.length} checks`);
        this.passed.forEach(msg => console.log(`   ✓ ${msg}`));
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS: ${this.warnings.length} issues`);
            this.warnings.forEach(msg => console.warn(`   ⚠ ${msg}`));
        }
        
        if (this.issues.length > 0) {
            console.log(`\n❌ CRITICAL ISSUES: ${this.issues.length} problems`);
            this.issues.forEach(msg => console.error(`   ✗ ${msg}`));
        }
        
        console.log('\n' + '═'.repeat(60));
        
        if (this.issues.length === 0) {
            console.log('🎉 NAVIGATION SYSTEM: FULLY COMPLIANT');
        } else {
            console.log('⚠️  NAVIGATION SYSTEM: ISSUES DETECTED');
        }
        
        console.log('═'.repeat(60) + '\n');
        
        return {
            passed: this.passed.length,
            warnings: this.warnings.length,
            issues: this.issues.length,
            details: {
                passed: this.passed,
                warnings: this.warnings,
                issues: this.issues
            }
        };
    }
}

// Auto-run on load
console.log('Navigation Audit Script Loaded');
console.log('Run: new NavigationAudit().runAll()');

// Export for manual use
window.NavigationAudit = NavigationAudit;
