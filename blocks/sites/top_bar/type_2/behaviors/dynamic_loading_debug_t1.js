/**
 * Dynamic Loading Debug Utility
 * Provides debugging tools and console commands for dynamic content loading
 */
class DynamicLoadingDebug {
    constructor() {
        this.isEnabled = false;
        this.logHistory = [];
        this.maxLogHistory = 100;
        
        // Enable debug mode if URL parameter is present
        this.checkDebugMode();
        
        if (this.isEnabled) {
            this.init();
        }
    }
    
    /**
     * Check if debug mode should be enabled
     */
    checkDebugMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.isEnabled = urlParams.get('debug_dynamic') === 'true' || 
                        urlParams.get('debug') === 'true' ||
                        localStorage.getItem('dynamic_debug_enabled') === 'true';
    }
    
    /**
     * Initialize debug utilities
     */
    init() {
        console.log('🔧 Dynamic Loading Debug Mode Enabled');
        
        // Add debug commands to window
        this.addDebugCommands();
        
        // Setup debug UI
        this.setupDebugUI();
        
        // Monitor dynamic loading events
        this.setupEventMonitoring();
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    /**
     * Add debug commands to window object
     */
    addDebugCommands() {
        window.dynamicDebug = {
            // Show system status
            status: () => this.showSystemStatus(),
            
            // Show cache statistics
            cache: () => this.showCacheStats(),
            
            // Clear all caches
            clearCache: () => this.clearAllCaches(),
            
            // Force reload container
            reload: (containerId) => this.forceReloadContainer(containerId),
            
            // Show loading history
            history: () => this.showLoadingHistory(),
            
            // Test dynamic loading
            test: (containerId) => this.testDynamicLoading(containerId),
            
            // Show help
            help: () => this.showHelp(),
            
            // Toggle debug mode
            toggle: () => this.toggleDebugMode()
        };
        
        console.log('🔧 Debug commands available: window.dynamicDebug');
        console.log('🔧 Type dynamicDebug.help() for available commands');
    }
    
    /**
     * Setup debug UI overlay
     */
    setupDebugUI() {
        const debugPanel = document.createElement('div');
        debugPanel.id = 'dynamic-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10001;
            max-width: 300px;
            display: none;
        `;
        
        debugPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🔧 Dynamic Loading Debug</div>
            <div id="debug-status">Initializing...</div>
            <div style="margin-top: 10px;">
                <button onclick="window.dynamicDebug.status()" style="margin: 2px; padding: 2px 5px; font-size: 10px;">Status</button>
                <button onclick="window.dynamicDebug.cache()" style="margin: 2px; padding: 2px 5px; font-size: 10px;">Cache</button>
                <button onclick="window.dynamicDebug.help()" style="margin: 2px; padding: 2px 5px; font-size: 10px;">Help</button>
            </div>
        `;
        
        document.body.appendChild(debugPanel);
        
        // Update status periodically
        setInterval(() => this.updateDebugPanel(), 2000);
    }
    
    /**
     * Setup event monitoring for dynamic loading
     */
    setupEventMonitoring() {
        // Monitor hash changes
        const originalHashChange = window.addEventListener;
        
        // Log navigation events
        this.log('Event monitoring started');
    }
    
    /**
     * Setup keyboard shortcuts for debug functions
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+D: Toggle debug panel
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                this.toggleDebugPanel();
            }
            
            // Ctrl+Shift+S: Show system status
            if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault();
                this.showSystemStatus();
            }
        });
    }
    
    /**
     * Show system status
     */
    showSystemStatus() {
        const status = {
            globalNavigator: !!window.globalNavigator,
            dynamicContentLoader: !!window.dynamicContentLoader,
            siteDynamicContent: !!window.topBarSiteDynamicContent,
            cacheManager: !!window.cacheManager
        };
        
        console.group('🔧 Dynamic Loading System Status');
        console.table(status);
        console.groupEnd();
        
        this.log('System status displayed');
        return status;
    }
    
    /**
     * Show cache statistics
     */
    showCacheStats() {
        if (!window.cacheManager) {
            console.warn('Cache manager not available');
            return;
        }
        
        const stats = window.cacheManager.getCacheStats();
        console.group('🔧 Cache Statistics');
        console.table(stats);
        console.groupEnd();
        
        this.log('Cache stats displayed');
        return stats;
    }
    
    /**
     * Clear all caches
     */
    clearAllCaches() {
        if (window.cacheManager) {
            window.cacheManager.clearAllCaches();
            console.log('🔧 All caches cleared');
            this.log('All caches cleared via debug command');
        } else {
            console.warn('Cache manager not available');
        }
    }
    
    /**
     * Force reload container
     */
    async forceReloadContainer(containerId) {
        if (!containerId) {
            console.error('Container ID required');
            return;
        }
        
        if (window.topBarSiteDynamicContent) {
            console.log(`🔧 Force reloading container: ${containerId}`);
            const result = await window.topBarSiteDynamicContent.forceReloadContainer(containerId);
            console.log(`🔧 Reload result: ${result}`);
            this.log(`Force reloaded container: ${containerId}, result: ${result}`);
            return result;
        } else {
            console.warn('Site dynamic content loader not available');
        }
    }
    
    /**
     * Show loading history
     */
    showLoadingHistory() {
        console.group('🔧 Dynamic Loading History');
        this.logHistory.forEach((entry, index) => {
            console.log(`${index + 1}. [${entry.timestamp}] ${entry.message}`);
        });
        console.groupEnd();
    }
    
    /**
     * Test dynamic loading for a container
     */
    async testDynamicLoading(containerId) {
        if (!containerId) {
            console.error('Container ID required for testing');
            return;
        }
        
        console.log(`🔧 Testing dynamic loading for container: ${containerId}`);
        
        // Check if container exists
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return;
        }
        
        // Check for dynamic components
        const dynamicComponents = container.querySelectorAll('[data-dynamic="true"]');
        console.log(`🔧 Found ${dynamicComponents.length} dynamic components`);
        
        // Test loading
        if (window.topBarSiteDynamicContent) {
            const result = await window.topBarSiteDynamicContent.loadContainerContentInternal(containerId);
            console.log(`🔧 Test loading result: ${result}`);
            this.log(`Test loading for ${containerId}: ${result}`);
        }
    }
    
    /**
     * Show help
     */
    showHelp() {
        console.group('🔧 Dynamic Loading Debug Commands');
        console.log('dynamicDebug.status() - Show system status');
        console.log('dynamicDebug.cache() - Show cache statistics');
        console.log('dynamicDebug.clearCache() - Clear all caches');
        console.log('dynamicDebug.reload(containerId) - Force reload container');
        console.log('dynamicDebug.history() - Show loading history');
        console.log('dynamicDebug.test(containerId) - Test dynamic loading');
        console.log('dynamicDebug.help() - Show this help');
        console.log('dynamicDebug.toggle() - Toggle debug mode');
        console.groupEnd();
    }
    
    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('dynamic_debug_enabled', this.isEnabled.toString());
        
        if (this.isEnabled) {
            console.log('🔧 Debug mode enabled');
            this.init();
        } else {
            console.log('🔧 Debug mode disabled');
            this.cleanup();
        }
    }
    
    /**
     * Toggle debug panel visibility
     */
    toggleDebugPanel() {
        const panel = document.getElementById('dynamic-debug-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Update debug panel content
     */
    updateDebugPanel() {
        const statusDiv = document.getElementById('debug-status');
        if (statusDiv) {
            const status = `
                Navigator: ${window.globalNavigator ? '✅' : '❌'}<br>
                Loader: ${window.dynamicContentLoader ? '✅' : '❌'}<br>
                Site: ${window.topBarSiteDynamicContent ? '✅' : '❌'}<br>
                Cache: ${window.cacheManager ? '✅' : '❌'}
            `;
            statusDiv.innerHTML = status;
        }
    }
    
    /**
     * Log debug message
     */
    log(message) {
        const entry = {
            timestamp: new Date().toLocaleTimeString(),
            message: message
        };
        
        this.logHistory.push(entry);
        
        // Keep history size manageable
        if (this.logHistory.length > this.maxLogHistory) {
            this.logHistory.shift();
        }
    }
    
    /**
     * Cleanup debug utilities
     */
    cleanup() {
        const panel = document.getElementById('dynamic-debug-panel');
        if (panel) {
            panel.remove();
        }
        
        delete window.dynamicDebug;
    }
}

// Initialize debug system
window.dynamicLoadingDebug = new DynamicLoadingDebug();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicLoadingDebug;
} 