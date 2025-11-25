/**
 * Cache Manager for Dynamic Content
 * Handles cache clearing, hard resets, and cache management
 */
class CacheManager {
    constructor() {
        this.cachePrefix = 'dynamic_content_';
        this.versionKey = 'cache_version';
        this.currentVersion = '1.0.0';
        
        this.init();
    }
    
    /**
     * Initialize cache manager
     */
    init() {
        // Check for hard reset parameter in URL
        this.checkForHardReset();
        
        // Check cache version compatibility
        this.checkCacheVersion();
        
        // Add keyboard shortcut for cache clearing (Ctrl+Shift+R)
        this.setupKeyboardShortcuts();
        
        console.log('Cache Manager initialized');
    }
    
    /**
     * Check for hard reset parameter in URL
     */
    checkForHardReset() {
        const urlParams = new URLSearchParams(window.location.search);
        const hardReset = urlParams.get('hard_reset');
        const clearCache = urlParams.get('clear_cache');
        
        if (hardReset === 'true' || clearCache === 'true') {
            console.log('Hard reset detected, clearing all caches...');
            this.clearAllCaches();
            
            // Remove the parameter from URL to prevent repeated clearing
            this.removeResetParameterFromUrl();
        }
    }
    
    /**
     * Check cache version compatibility
     */
    checkCacheVersion() {
        try {
            const storedVersion = localStorage.getItem(this.versionKey);
            
            if (!storedVersion || storedVersion !== this.currentVersion) {
                console.log(`Cache version mismatch (stored: ${storedVersion}, current: ${this.currentVersion}). Clearing cache...`);
                this.clearDynamicContentCache();
                localStorage.setItem(this.versionKey, this.currentVersion);
            }
        } catch (error) {
            console.warn('Error checking cache version:', error);
        }
    }
    
    /**
     * Setup keyboard shortcuts for cache management
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+R: Clear cache and reload
            if (event.ctrlKey && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                this.hardReset();
            }
            
            // Ctrl+Shift+C: Clear cache only
            if (event.ctrlKey && event.shiftKey && event.key === 'C') {
                event.preventDefault();
                this.clearDynamicContentCache();
                this.showCacheMessage('Dynamic content cache cleared');
            }
        });
    }
    
    /**
     * Perform hard reset (clear all caches and reload)
     */
    hardReset() {
        console.log('Performing hard reset...');
        this.clearAllCaches();
        
        // Add hard reset parameter to URL and reload
        const url = new URL(window.location);
        url.searchParams.set('hard_reset', 'true');
        window.location.href = url.toString();
    }
    
    /**
     * Clear all caches (localStorage, sessionStorage, etc.)
     */
    clearAllCaches() {
        try {
            // Clear dynamic content cache
            this.clearDynamicContentCache();
            
            // Clear other application caches
            this.clearApplicationCache();
            
            // Clear browser caches if possible
            this.clearBrowserCache();
            
            console.log('All caches cleared');
        } catch (error) {
            console.error('Error clearing caches:', error);
        }
    }
    
    /**
     * Clear dynamic content cache specifically
     */
    clearDynamicContentCache() {
        try {
            const keys = Object.keys(localStorage);
            let clearedCount = 0;
            
            keys.forEach(key => {
                if (key.startsWith(this.cachePrefix)) {
                    localStorage.removeItem(key);
                    clearedCount++;
                }
            });
            
            console.log(`Cleared ${clearedCount} dynamic content cache entries`);
            
            // Notify dynamic content loader if available
            if (window.dynamicContentLoader && typeof window.dynamicContentLoader.clearCache === 'function') {
                window.dynamicContentLoader.clearCache();
            }
            
        } catch (error) {
            console.warn('Error clearing dynamic content cache:', error);
        }
    }
    
    /**
     * Clear application-specific caches
     */
    clearApplicationCache() {
        try {
            // Clear navigation state cache
            const navKeys = Object.keys(localStorage).filter(key => 
                key.startsWith('nav_') || 
                key.startsWith('navigation_') ||
                key.startsWith('state_')
            );
            
            navKeys.forEach(key => localStorage.removeItem(key));
            
            // Clear session storage
            sessionStorage.clear();
            
            console.log('Application cache cleared');
        } catch (error) {
            console.warn('Error clearing application cache:', error);
        }
    }
    
    /**
     * Clear browser caches (limited by browser security)
     */
    clearBrowserCache() {
        try {
            // Clear service worker cache if available
            if ('serviceWorker' in navigator && 'caches' in window) {
                caches.keys().then(cacheNames => {
                    return Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                }).then(() => {
                    console.log('Service worker caches cleared');
                }).catch(error => {
                    console.warn('Error clearing service worker caches:', error);
                });
            }
        } catch (error) {
            console.warn('Error clearing browser cache:', error);
        }
    }
    
    /**
     * Remove reset parameter from URL
     */
    removeResetParameterFromUrl() {
        try {
            const url = new URL(window.location);
            url.searchParams.delete('hard_reset');
            url.searchParams.delete('clear_cache');
            
            // Update URL without reloading
            window.history.replaceState({}, document.title, url.toString());
        } catch (error) {
            console.warn('Error removing reset parameter from URL:', error);
        }
    }
    
    /**
     * Show cache management message to user
     */
    showCacheMessage(message, type = 'info') {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `cache-notification cache-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        try {
            const stats = {
                dynamicContentEntries: 0,
                totalSize: 0,
                oldestEntry: null,
                newestEntry: null
            };
            
            const keys = Object.keys(localStorage);
            let oldestTime = Date.now();
            let newestTime = 0;
            
            keys.forEach(key => {
                if (key.startsWith(this.cachePrefix)) {
                    stats.dynamicContentEntries++;
                    
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        const size = new Blob([localStorage.getItem(key)]).size;
                        stats.totalSize += size;
                        
                        if (data.timestamp) {
                            if (data.timestamp < oldestTime) {
                                oldestTime = data.timestamp;
                                stats.oldestEntry = key;
                            }
                            if (data.timestamp > newestTime) {
                                newestTime = data.timestamp;
                                stats.newestEntry = key;
                            }
                        }
                    } catch (error) {
                        // Skip invalid entries
                    }
                }
            });
            
            return stats;
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return null;
        }
    }
    
    /**
     * Clean up old cache entries
     */
    cleanupOldEntries(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
        try {
            const keys = Object.keys(localStorage);
            const now = Date.now();
            let cleanedCount = 0;
            
            keys.forEach(key => {
                if (key.startsWith(this.cachePrefix)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data.timestamp && (now - data.timestamp) > maxAge) {
                            localStorage.removeItem(key);
                            cleanedCount++;
                        }
                    } catch (error) {
                        // Remove invalid entries
                        localStorage.removeItem(key);
                        cleanedCount++;
                    }
                }
            });
            
            if (cleanedCount > 0) {
                console.log(`Cleaned up ${cleanedCount} old cache entries`);
            }
            
            return cleanedCount;
        } catch (error) {
            console.error('Error cleaning up old entries:', error);
            return 0;
        }
    }
}

// Create global instance
window.cacheManager = new CacheManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheManager;
} 