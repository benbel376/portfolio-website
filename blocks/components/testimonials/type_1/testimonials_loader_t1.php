<?php

class TestimonialsLoader {
    
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        // Debug logging
        error_log("Testimonials PHP: Attempting to load testimonials component with ID: $id");
        
        // Get testimonials data from component metadata
        $testimonialsData = isset($componentMetadata['componentData']) ? $componentMetadata['componentData'] : [];
        
        error_log("Testimonials PHP: Data count: " . count($testimonialsData));
        
        // Load the HTML structure
        $htmlPath = __DIR__ . '/testimonials_structure_t1.html';
        $html = file_get_contents($htmlPath);
        
        if ($html === false) {
            return '<div class="error">Failed to load testimonials component structure</div>';
        }
        
        // Process navigation config
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        // Add ID and navigation config to the component
        $html = preg_replace(
            '/<div\\s+class="testimonials-component"\\s+data-nav-handler="handleTestimonialsNavigation"\\s*>/i',
            '<div class="testimonials-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleTestimonialsNavigation" data-nav-config="' . $navConfigJson . '">',
            $html,
            1
        );
        
        // Inject testimonials data into JavaScript
        $testimonialsJson = json_encode($testimonialsData, JSON_HEX_APOS | JSON_HEX_QUOT);
        
        $dataScript = "
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Testimonials PHP: Attempting to set testimonials data');
            const testimonialsData = {$testimonialsJson};
            
            // Set data immediately if behavior is ready
            if (window.setTestimonialsData) {
                console.log('Testimonials PHP: Setting data immediately');
                window.setTestimonialsData(testimonialsData);
            } else {
                console.log('Testimonials PHP: Behavior not ready, waiting...');
                // Store data for when behavior loads
                window.testimonialsData = testimonialsData;
                
                // Try again after a short delay
                setTimeout(function() {
                    if (window.setTestimonialsData) {
                        console.log('Testimonials PHP: Setting testimonials data from PHP (delayed)');
                        window.setTestimonialsData(testimonialsData);
                    }
                }, 100);
            }
        });
        </script>";
        
        return $html . $dataScript;
    }
    
    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [ 'defaultState' => 'visible', 'allowedStates' => ['visible','hidden','scrollTo'] ];
        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) $config['defaultState'] = 'visible';
        return $config;
    }
}

?>
