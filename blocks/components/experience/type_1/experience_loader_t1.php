<?php

class ExperienceLoaderT1 {
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
                return $this->generateFullComponent($id, $componentData, $navConfig);
        }
    }
    
    private function generateFullComponent($id, $data, $navConfig) {
        // Use experience data from component configuration
        $experienceData = $data['experiences'] ?? [];
        
        // Load HTML template
        $template = file_get_contents(__DIR__ . '/experience_structure_t1.html');
        
        // Inject ID and navigation config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace('<div class="experience-component">',
            '<div class="experience-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleExperienceNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $template);
        
        // Inject JavaScript data
        $html .= $this->injectDataScript($experienceData);
        
        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = file_get_contents(__DIR__ . '/experience_structure_t1.html');
        
        $html = str_replace('<div class="experience-component">',
            '<div class="experience-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleExperienceNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . $protectedAttr . ' data-metadata="' . $metadataJson . '">',
            $template);
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, just return the timeline structure
        return '<div class="experience-timeline" id="experience-timeline"></div><div class="experience-empty" id="experience-empty" style="display: none;"><ion-icon name="briefcase-outline" aria-hidden="true"></ion-icon><p>No work experience information available.</p></div>';
    }
    
    /**
     * Load experience data from various sources
     */
    private function loadExperienceData() {
        // Try to get data from profile configuration
        global $profileData;
        
        if (isset($profileData['experience']) && is_array($profileData['experience'])) {
            return $profileData['experience'];
        }
        
        // Try to load from data file
        $dataFile = __DIR__ . '/../../../../definitions/data/experience_data_ml_mlops_t1.json';
        
        if (file_exists($dataFile)) {
            $json = file_get_contents($dataFile);
            $data = json_decode($json, true);
            
            if ($data && is_array($data)) {
                return $data;
            }
        }
        
        // Fallback: try to load from legacy data file
        $legacyDataFile = __DIR__ . '/../../../../legacy/contents/profile/experience/profile_experience_data_v1.json';
        
        if (file_exists($legacyDataFile)) {
            $json = file_get_contents($legacyDataFile);
            $legacyData = json_decode($json, true);
            
            if ($legacyData && is_array($legacyData)) {
                return $legacyData;
            }
        }
        
        return [];
    }
    
    /**
     * Inject experience data into JavaScript
     */
    private function injectDataScript($experienceData) {
        // Prepare experience data for JavaScript
        $jsData = [
            'experiences' => $experienceData
        ];
        
        $script = '<script>';
        $script .= 'console.log("Experience PHP: Attempting to set experience data");';
        
        // Check if behavior is ready
        $script .= 'if (typeof setExperienceData === "function") {';
        $script .= '    console.log("Experience PHP: Setting data immediately");';
        $script .= '    setExperienceData(' . json_encode($jsData) . ');';
        $script .= '} else {';
        $script .= '    console.log("Experience PHP: Behavior not ready, waiting...");';
        $script .= '    setTimeout(function() {';
        $script .= '        console.log("Experience PHP: Setting experience data from PHP (delayed)");';
        $script .= '        if (typeof setExperienceData === "function") {';
        $script .= '            setExperienceData(' . json_encode($jsData) . ');';
        $script .= '        } else {';
        $script .= '            console.error("Experience PHP: setExperienceData function not found after delay");';
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
