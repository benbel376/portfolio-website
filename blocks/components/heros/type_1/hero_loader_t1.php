<?php

class HeroLoader {
    
    public function load($id, $title = 'Default Title', $navigationConfig = []) {
        // Load the HTML structure template
        $htmlTemplate = file_get_contents(__DIR__ . '/hero_structure_t1.html');
        
        // Handle navigation configuration first
        $navConfig = $this->processNavigationConfig($navigationConfig);
        
        // Apply default state styling based on config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        if ($defaultState === 'hidden') {
            $htmlTemplate = str_replace('class="header-component"', 'class="header-component nav-hidden" style="display: none;"', $htmlTemplate);
        } else {
            $htmlTemplate = str_replace('class="header-component"', 'class="header-component nav-visible"', $htmlTemplate);
        }
        
        // Replace placeholders with actual data
        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $htmlTemplate);
        
        // Add the unique ID to the component while preserving existing attributes
        if ($defaultState === 'hidden') {
            $html = str_replace('<header class="header-component nav-hidden" data-nav-handler="handleHeroNavigation">', '<header class="header-component nav-hidden" id="' . htmlspecialchars($id) . '" data-nav-handler="handleHeroNavigation">', $html);
        } else {
            $html = str_replace('<header class="header-component nav-visible" data-nav-handler="handleHeroNavigation">', '<header class="header-component nav-visible" id="' . htmlspecialchars($id) . '" data-nav-handler="handleHeroNavigation">', $html);
        }
        
        // Add navigation configuration as data attribute
        if (!empty($navConfig)) {
            $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
            $html = str_replace('data-nav-handler="handleHeroNavigation"', 
                              'data-nav-handler="handleHeroNavigation" data-nav-config="' . $navConfigJson . '"', 
                              $html);
        }
        
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
}

?> 