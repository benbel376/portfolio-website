<?php
/**
 * File Manager Component Loader
 * Handles loading modes: full, shell, content
 */

class FileManagerLoaderT1 {
    
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        $template = file_get_contents(__DIR__ . '/file_manager_structure_t1.html');
        
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        // Inject ID and navigation config
        $html = str_replace(
            '<div class="file-manager-component" data-nav-handler="handleFileManagerNavigation">',
            '<div class="file-manager-component" 
                 id="' . htmlspecialchars($id) . '" 
                 data-nav-handler="handleFileManagerNavigation"
                 data-nav-config="' . $navConfigJson . '">',
            $template
        );
        
        // Handle loading modes
        switch ($loadingMode) {
            case 'shell':
                return $this->generateShell($id, $navConfig, $componentMetadata, $html);
            case 'content':
                return $this->generateContent($componentMetadata);
            case 'full':
            default:
                return $html;
        }
    }
    
    /**
     * Generate shell for dynamic loading
     */
    private function generateShell($id, $navConfig, $componentMetadata, $html) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        // Add dynamic loading attributes
        $html = str_replace(
            'id="' . htmlspecialchars($id) . '"',
            'id="' . htmlspecialchars($id) . '"
                 data-dynamic="true"
                 data-load-state="not-loaded"
                 data-init-hook="initializeFileManager"
                 data-component-metadata="' . $metadataJson . '"',
            $html
        );
        
        return $html;
    }
    
    /**
     * Generate content only (for API responses)
     */
    private function generateContent($componentMetadata) {
        // For file manager, content is loaded via JS
        // This returns the full component as it's interactive
        $template = file_get_contents(__DIR__ . '/file_manager_structure_t1.html');
        return $template;
    }
    
    /**
     * Process navigation configuration
     */
    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [
            'defaultState' => 'hidden',
            'allowedStates' => ['visible', 'hidden'],
            'protected' => true  // File manager is always protected
        ];
        return array_merge($defaultConfig, $navigationConfig);
    }
}
