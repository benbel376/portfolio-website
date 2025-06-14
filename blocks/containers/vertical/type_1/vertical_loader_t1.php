<?php

class VerticalLoader {
    
    public function load($id, $childrenHtml = [], $navigationConfig = []) {
        // Load the HTML structure template
        $htmlTemplate = file_get_contents(__DIR__ . '/vertical_structure_t1.html');
        
        // Combine all children HTML
        $childrenContent = '';
        foreach ($childrenHtml as $childHtml) {
            $childrenContent .= $childHtml . "\n";
        }
        
        // Replace placeholder with children content
        $html = str_replace('<!-- CHILDREN_PLACEHOLDER -->', $childrenContent, $htmlTemplate);
        
        // Add the unique ID to the container while preserving existing attributes
        $html = str_replace('<div class="vertical-container" data-nav-handler="handleVerticalContainerNavigation">', 
                          '<div class="vertical-container" id="' . htmlspecialchars($id) . '" data-nav-handler="handleVerticalContainerNavigation">', 
                          $html);
        
        // Handle navigation configuration
        $navConfig = $this->processNavigationConfig($navigationConfig);
        
        // Add navigation configuration as data attribute
        if (!empty($navConfig)) {
            $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
            $html = str_replace('data-nav-handler="handleVerticalContainerNavigation"', 
                              'data-nav-handler="handleVerticalContainerNavigation" data-nav-config="' . $navConfigJson . '"', 
                              $html);
        }
        
        // Apply default state styling if specified
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        if ($defaultState === 'hidden') {
            $html = str_replace('class="vertical-container"', 'class="vertical-container nav-hidden" style="display: none;"', $html);
        } else {
            $html = str_replace('class="vertical-container"', 'class="vertical-container nav-visible"', $html);
        }
        
        // Add the container's own script import and initialization script
        $scriptImport = $this->generateScriptImport();
        $initScript = $this->generateInitializationScript($id, $navConfig);
        $html .= $scriptImport . $initScript;
        
        return $html;
    }
    
    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [
            'defaultState' => 'visible',
            'allowedStates' => ['visible', 'hidden', 'toggle'],
            'transitions' => false,
            'initialParameters' => []
        ];
        
        // Merge with provided config
        $config = array_merge($defaultConfig, $navigationConfig);
        
        // Validate allowed states
        if (!in_array($config['defaultState'], $config['allowedStates'])) {
            $config['defaultState'] = 'visible';
        }
        
        return $config;
    }
    
    private function generateInitializationScript($containerId, $navConfig) {
        $configJson = json_encode($navConfig);
        
        return "
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof initializeVerticalContainerNavigation === 'function') {
                initializeVerticalContainerNavigation('" . htmlspecialchars($containerId, ENT_QUOTES) . "', " . $configJson . ");
            } else {
                console.warn('Vertical container navigation function not loaded for: " . htmlspecialchars($containerId, ENT_QUOTES) . "');
            }
        });
        </script>";
    }
}

?> 