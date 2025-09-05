<?php

class ProjectsGridLoaderT1 {
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $componentData = $componentMetadata['componentData'] ?? [];
        
        switch ($loadingMode) {
            case 'shell':
                return $this->generateShell($id, $navConfig, $componentMetadata);
            case 'content':
                return $this->generateContent($componentData);
            case 'full':
            default:
                return $this->generateFullComponent($id, $componentData, $navConfig, $componentMetadata);
        }
    }
    
    private function generateFullComponent($id, $data, $navConfig, $componentMetadata) {
        // Load data from JSON file if dataSource is specified
        $projectsData = $this->loadDataFromSource($componentMetadata);
        
        // Load HTML template
        $template = file_get_contents(__DIR__ . '/projects_grid_structure_t1.html');
        
        // Replace placeholders with data
        $html = $this->replacePlaceholders($template, $data);
        
        // Inject ID and navigation config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace('<div class="projects-grid-component">',
            '<div class="projects-grid-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleProjectsGridNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $html);
        
        // Inject JavaScript data
        $html .= $this->injectDataScript($projectsData);
        
        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = file_get_contents(__DIR__ . '/projects_grid_structure_t1.html');
        
        $html = str_replace('<div class="projects-grid-component">',
            '<div class="projects-grid-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleProjectsGridNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . $protectedAttr . ' data-metadata="' . $metadataJson . '">',
            $template);
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, just return the grid structure
        return '<div class="projects-grid__grid" id="projects-grid"></div><div class="projects-grid__empty" id="projects-empty" style="display: none;"><ion-icon name="folder-open-outline" aria-hidden="true"></ion-icon><h3>No projects found</h3><p>Try adjusting your search or filter criteria.</p></div>';
    }
    
    /**
     * Load data from JSON file specified in dataSource
     */
    private function loadDataFromSource($componentMetadata) {
        $dataSource = $componentMetadata['dataSource'] ?? null;
        
        if ($dataSource && file_exists($dataSource)) {
            $jsonContent = file_get_contents($dataSource);
            $data = json_decode($jsonContent, true);
            
            if (json_last_error() === JSON_ERROR_NONE && isset($data['projects'])) {
                return $data['projects'];
            }
        }
        
        // Return empty array if no data source or invalid data
        return [];
    }
    
    /**
     * Replace placeholders in HTML template with data
     */
    private function replacePlaceholders($template, $data) {
        // Replace simple placeholders
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $template = str_replace('{{' . $key . '}}', htmlspecialchars($value), $template);
            }
        }
        
        return $template;
    }
    
    /**
     * Inject projects data into JavaScript
     */
    private function injectDataScript($projectsData) {
        $script = '<script>';
        $script .= 'console.log("Projects Grid PHP: Attempting to set projects data");';
        
        // Check if behavior is ready
        $script .= 'if (typeof setProjectsData === "function") {';
        $script .= '    console.log("Projects Grid PHP: Setting data immediately");';
        $script .= '    setProjectsData(' . json_encode($projectsData) . ');';
        $script .= '} else {';
        $script .= '    console.log("Projects Grid PHP: Behavior not ready, waiting...");';
        $script .= '    setTimeout(function() {';
        $script .= '        console.log("Projects Grid PHP: Setting projects data from PHP (delayed)");';
        $script .= '        if (typeof setProjectsData === "function") {';
        $script .= '            setProjectsData(' . json_encode($projectsData) . ');';
        $script .= '        } else {';
        $script .= '            console.error("Projects Grid PHP: setProjectsData function not found after delay");';
        $script .= '        }';
        $script .= '    }, 100);';
        $script .= '}';
        $script .= '</script>';
        
        return $script;
    }
    
    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [
            'defaultState' => 'visible',
            'allowedStates' => ['visible', 'hidden']
        ];
        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) {
            $config['defaultState'] = 'visible';
        }
        return $config;
    }
}

?>