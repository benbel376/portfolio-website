<?php

class PlaceholderLoader {
    public function load($id, $title = 'Content coming soon', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        $navConfig = $this->processNavigationConfig($navigationConfig);

        switch ($loadingMode) {
            case 'shell':
                return $this->generateShell($id, $navConfig, $componentMetadata);
            case 'content':
                return $this->generateContent($title);
            case 'full':
            default:
                return $this->generateFullComponent($id, $title, $navConfig);
        }
    }

    private function generateFullComponent($id, $title, $navConfig) {
        $template = file_get_contents(__DIR__ . '/placeholder_structure_t1.html');

        // Inject title
        $html = str_replace('<!-- TEXT_PLACEHOLDER -->', htmlspecialchars($title), $template);

        // Inject ID and nav config/handler
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        $html = str_replace('<div class="placeholder-component">',
            '<div class="placeholder-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handlePlaceholderNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $html);

        return $html;
    }

    private function generateShell($id, $navConfig, $componentMetadata) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';

        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        $shell = '<link rel="stylesheet" href="blocks/components/placeholders/type_1/placeholder_style_t1.css">'
            . '<div class="placeholder-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '"'
            . $protectedAttr
            . ' data-nav-handler="handlePlaceholderNavigation" data-nav-config="' . $navConfigJson . '"'
            . ' data-dynamic="true" data-load-state="not-loaded" data-component-metadata="' . $metadataJson . '"' . $styleAttr . '>'
            . '  <div class="dynamic-content-placeholder">'
            . '    <div class="loading-indicator" style="display:none;"><div class="loading-spinner"></div><span>Loading...</span></div>'
            . '    <div class="error-placeholder" style="display:none;"><span>Content unavailable</span></div>'
            . '    <div class="dynamic-content-container"></div>'
            . '  </div>'
            . '</div>';

        return $shell;
    }

    private function generateContent($title) {
        // Only inner box; shell provides container and styles
        return '<div class="placeholder-box"><div class="placeholder-text">' . htmlspecialchars($title) . '</div></div>';
    }

    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [
            'defaultState' => 'visible',
            'allowedStates' => ['visible', 'hidden', 'toggle'],
            'transitions' => false,
            'initialParameters' => []
        ];

        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) {
            $config['defaultState'] = 'visible';
        }
        return $config;
    }
}

?>


