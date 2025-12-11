<?php

/**
 * Coding Stats Component Loader - Type 1
 */

class CodingStatsLoaderT1 {
    
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
        $template = file_get_contents(__DIR__ . '/coding_stats_structure_t1.html');
        
        // Replace title
        $title = $data['title'] ?? 'Coding Practice';
        $template = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $template);
        
        // Inject ID and nav config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = str_replace(
            '<section class="coding-stats-component" data-nav-handler="handleCodingStatsNavigation">',
            '<section class="coding-stats-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCodingStatsNavigation" data-nav-config="' . $navConfigJson . '" data-init-hook="initializeCodingStats"' . $styleAttr . '>',
            $template
        );
        
        // Inject data script
        $dataScript = $this->injectDataScript($data);
        $lastPos = strrpos($template, '</section>');
        if ($lastPos !== false) {
            $template = substr_replace($template, $dataScript . '</section>', $lastPos, 10);
        }
        
        return $template;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $template = file_get_contents(__DIR__ . '/coding_stats_structure_t1.html');
        
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = str_replace(
            '<section class="coding-stats-component" data-nav-handler="handleCodingStatsNavigation">',
            '<section class="coding-stats-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCodingStatsNavigation" data-nav-config="' . $navConfigJson . '" data-init-hook="initializeCodingStats"' . $styleAttr . $protectedAttr . ' data-dynamic="true" data-load-state="not-loaded" data-component-metadata="' . $metadataJson . '">',
            $template
        );
        
        return $template;
    }
    
    private function generateContent($data) {
        return $this->injectDataScript($data);
    }
    
    private function injectDataScript($data) {
        $jsonData = json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP);
        
        $script = '<script>';
        $script .= 'window.codingStatsData = ' . $jsonData . ';';
        $script .= 'if (typeof window.setCodingStatsData === "function") {';
        $script .= '    window.setCodingStatsData(' . $jsonData . ');';
        $script .= '}';
        $script .= '</script>';
        
        return $script;
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
