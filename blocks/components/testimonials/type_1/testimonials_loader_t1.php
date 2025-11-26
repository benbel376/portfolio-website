<?php

/**
 * Testimonials Component Loader
 * 
 * Data Structure:
 * [
 *   {
 *     "name": "John Doe",
 *     "role": "CEO, Company Name",
 *     "text": "Testimonial text here...",
 *     "image": "path/to/image.jpg",
 *     "rating": 5
 *   }
 * ]
 * 
 * Supported States: visible, hidden, scrollTo
 * Dynamic Loading: Supported
 * Protected Content: Supported
 */
class TestimonialsLoaderT1 {
    
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        try {
            $navConfig = $this->processNavigationConfig($navigationConfig);
            $data = $componentMetadata['componentData'] ?? [];
            
            switch ($loadingMode) {
                case 'shell':
                    return $this->generateShell($id, $navConfig, $componentMetadata);
                case 'content':
                    return $this->generateContent($data);
                case 'full':
                default:
                    return $this->generateFullComponent($id, $navConfig, $data);
            }
        } catch (Exception $e) {
            error_log("TestimonialsLoaderT1 error: " . $e->getMessage());
            return $this->generateErrorPlaceholder();
        }
    }
    
    private function generateFullComponent($id, $navConfig, $data) {
        // Load HTML template
        $template = file_get_contents(__DIR__ . '/testimonials_structure_t1.html');
        
        if ($template === false) {
            throw new Exception('Failed to load testimonials structure template');
        }
        
        // Inject ID and navigation config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace('<div class="testimonials-component" data-nav-handler="handleTestimonialsNavigation">',
            '<div class="testimonials-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleTestimonialsNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $template);
        
        // Inject data script INSIDE container
        $dataScript = $this->injectDataScript($data);
        $lastDivPos = strrpos($html, '</div>');
        if ($lastDivPos !== false) {
            $html = substr_replace($html, $dataScript . '</div>', $lastDivPos, 6);
        }
        
        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        // Load HTML template
        $template = file_get_contents(__DIR__ . '/testimonials_structure_t1.html');
        
        if ($template === false) {
            throw new Exception('Failed to load testimonials structure template');
        }
        
        // Prepare metadata and config
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        
        // Inject shell attributes
        $html = str_replace('<div class="testimonials-component" data-nav-handler="handleTestimonialsNavigation">',
            '<div class="testimonials-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleTestimonialsNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . ' data-dynamic="true" data-load-state="not-loaded" data-init-hook="initializeTestimonials" data-component-metadata="' . $metadataJson . '"' . $protectedAttr . '>',
            $template);
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, return minimal structure that will be populated by JavaScript
        return '<div class="testimonials__slides-container" id="testimonials-slides"></div><div class="testimonials__controls"><div class="testimonials__indicators" id="testimonials-indicators"></div></div><div class="testimonials__empty" id="testimonials-empty" style="display: none;"><ion-icon name="chatbubbles-outline"></ion-icon><p>No testimonials available</p></div>';
    }
    
    /**
     * Inject testimonials data into JavaScript
     */
    private function injectDataScript($data) {
        $script = '<script>';
        $script .= 'if (typeof window.setTestimonialsData === "function") {';
        $script .= '    window.setTestimonialsData(' . json_encode($data) . ');';
        $script .= '} else {';
        $script .= '    setTimeout(function() {';
        $script .= '        if (typeof window.setTestimonialsData === "function") {';
        $script .= '            window.setTestimonialsData(' . json_encode($data) . ');';
        $script .= '        }';
        $script .= '    }, 100);';
        $script .= '}';
        $script .= '</script>';
        
        return $script;
    }
    
    private function generateErrorPlaceholder() {
        return '<div class="testimonials-component testimonials-component--error"><div class="testimonials__empty"><ion-icon name="alert-circle-outline"></ion-icon><p>Unable to load testimonials</p></div></div>';
    }
    
    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [
            'defaultState' => 'visible',
            'allowedStates' => ['visible', 'hidden', 'scrollTo']
        ];
        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) {
            $config['defaultState'] = 'visible';
        }
        return $config;
    }
}

?>
