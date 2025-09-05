<?php

class EducationHistoryLoaderT1 {
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
        $educationHistoryData = $this->loadDataFromSource($componentMetadata);
        
        // Load HTML template
        $template = file_get_contents(__DIR__ . '/education_history_structure_t1.html');
        
        // Replace placeholders with data
        $html = $this->replacePlaceholders($template, $data);
        
        // Inject ID and navigation config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace('<div class="education-history-component">',
            '<div class="education-history-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleEducationHistoryNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $html);
        
        // Inject JavaScript data
        $html .= $this->injectDataScript($educationHistoryData);
        
        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = file_get_contents(__DIR__ . '/education_history_structure_t1.html');
        
        $html = str_replace('<div class="education-history-component">',
            '<div class="education-history-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleEducationHistoryNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . $protectedAttr . ' data-metadata="' . $metadataJson . '">',
            $template);
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, just return the timeline structure
        return '<div class="education-history__timeline" id="education-history-timeline"></div><div class="education-history__empty" id="education-history-empty" style="display: none;"><ion-icon name="school-outline" aria-hidden="true"></ion-icon><p>No education history available to display.</p></div>';
    }
    
    /**
     * Load data from JSON file specified in dataSource
     */
    private function loadDataFromSource($componentMetadata) {
        $dataSource = $componentMetadata['dataSource'] ?? null;
        
        if ($dataSource && file_exists($dataSource)) {
            $jsonContent = file_get_contents($dataSource);
            $data = json_decode($jsonContent, true);
            
            if (json_last_error() === JSON_ERROR_NONE && isset($data['education'])) {
                return $data['education'];
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
     * Inject education history data into JavaScript
     */
    private function injectDataScript($educationHistoryData) {
        $script = '<script>';
        $script .= 'console.log("Education History PHP: Attempting to set education history data");';
        
        // Check if behavior is ready
        $script .= 'if (typeof setEducationHistoryData === "function") {';
        $script .= '    console.log("Education History PHP: Setting data immediately");';
        $script .= '    setEducationHistoryData(' . json_encode($educationHistoryData) . ');';
        $script .= '} else {';
        $script .= '    console.log("Education History PHP: Behavior not ready, waiting...");';
        $script .= '    setTimeout(function() {';
        $script .= '        console.log("Education History PHP: Setting education history data from PHP (delayed)");';
        $script .= '        if (typeof setEducationHistoryData === "function") {';
        $script .= '            setEducationHistoryData(' . json_encode($educationHistoryData) . ');';
        $script .= '        } else {';
        $script .= '            console.error("Education History PHP: setEducationHistoryData function not found after delay");';
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