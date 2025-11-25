<?php

class CertificationsLoaderT1 {
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
        // Get certifications data from the component data (not external file)
        $certificationsData = $data['certifications'] ?? [];
        
        // Debug logging
        error_log("Certifications Loader DEBUG: Full data structure: " . print_r($data, true));
        error_log("Certifications Loader DEBUG: Certifications data: " . print_r($certificationsData, true));
        
        // Load HTML template
        $template = file_get_contents(__DIR__ . '/certifications_structure_t1.html');
        
        // Replace placeholders with data
        $html = $this->replacePlaceholders($template, $data);
        
        // Inject ID and navigation config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace('<div class="certifications-component">',
            '<div class="certifications-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCertificationsNavigation" data-nav-config="' . $navConfigJson . '" data-init-hook="initializeCertifications"' . $styleAttr . '>',
            $html);
        
        // Inject JavaScript data INSIDE the component container, before the last closing tag
        $dataScript = $this->injectDataScript($certificationsData);
        $lastDivPos = strrpos($html, '</div>');
        if ($lastDivPos !== false) {
            $html = substr_replace($html, $dataScript . '</div>', $lastDivPos, 6);
        }
        
        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = file_get_contents(__DIR__ . '/certifications_structure_t1.html');
        
        $html = str_replace('<div class="certifications-component">',
            '<div class="certifications-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCertificationsNavigation" data-nav-config="' . $navConfigJson . '" data-init-hook="initializeCertifications"' . $styleAttr . $protectedAttr . ' data-dynamic="true" data-load-state="not-loaded" data-component-metadata="' . $metadataJson . '">',
            $template);
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, this method is not used in the new architecture
        // The builder will call generateFullComponent with dynamic=false for content mode
        return '';
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
     * Inject certifications data into JavaScript
     */
    private function injectDataScript($certificationsData) {
        // Debug logging
        error_log("Certifications Loader DEBUG: Injecting data script with " . count($certificationsData) . " certifications");
        
        $script = '<script>';
        $script .= 'console.log("Certifications PHP: Attempting to set certifications data", ' . json_encode($certificationsData) . ');';
        $script .= 'console.log("Certifications PHP: window.setCertificationsData function exists?", typeof window.setCertificationsData);';
        
        // The behavior script should already be loaded globally, so just call the function
        $script .= 'if (typeof window.setCertificationsData === "function") {';
        $script .= '    window.setCertificationsData(' . json_encode($certificationsData) . ');';
        $script .= '} else {';
        $script .= '    console.error("Certifications PHP: window.setCertificationsData function not found - behavior script not loaded");';
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