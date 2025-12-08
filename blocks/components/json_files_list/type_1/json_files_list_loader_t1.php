<?php

class JsonFilesListLoaderT1 {
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        $template = file_get_contents(__DIR__ . '/json_files_list_structure_t1.html');
        
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        // Inject ID and navigation config
        $html = str_replace(
            '<div class="json-files-list-component" data-nav-handler="handleJsonFilesListNavigation">',
            '<div class="json-files-list-component" 
                 id="' . htmlspecialchars($id) . '" 
                 data-nav-handler="handleJsonFilesListNavigation"
                 data-nav-config="' . $navConfigJson . '">',
            $template
        );
        
        // Handle loading modes
        if ($loadingMode === 'shell') {
            return $this->generateShell($id, $navConfig, $componentMetadata, $html);
        }
        
        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata, $html) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace(
            '<div class="json-files-list-component" 
                 id="' . htmlspecialchars($id) . '" 
                 data-nav-handler="handleJsonFilesListNavigation"
                 data-nav-config="' . $navConfigJson . '">',
            '<div class="json-files-list-component" 
                 id="' . htmlspecialchars($id) . '" 
                 data-nav-handler="handleJsonFilesListNavigation"
                 data-nav-config="' . $navConfigJson . '"
                 data-dynamic="true"
                 data-load-state="not-loaded"
                 data-init-hook="initializeJsonFilesList"
                 data-component-metadata="' . $metadataJson . '">',
            $html
        );
        
        return $html;
    }
    
    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [
            'defaultState' => 'visible',
            'allowedStates' => ['visible', 'hidden'],
            'protected' => false
        ];
        return array_merge($defaultConfig, $navigationConfig);
    }
}

?>
