<?php

/**
 * Code Display Component Loader
 * Renders code snippets with syntax highlighting and copy functionality
 */
class CodeDisplayLoaderT1 {

    /**
     * Load the component
     */
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $data = $componentMetadata['componentData'] ?? [];

        switch ($loadingMode) {
            case 'shell':
                return $this->generateShell($id, $navConfig, $componentMetadata);
            case 'content':
                return $this->generateContent($id, $data);
            case 'full':
            default:
                return $this->generateFullComponent($id, $navConfig, $data);
        }
    }

    /**
     * Process navigation configuration
     */
    private function processNavigationConfig($navigationConfig) {
        return [
            'defaultState' => $navigationConfig['defaultState'] ?? 'visible',
            'allowedStates' => $navigationConfig['allowedStates'] ?? ['visible', 'hidden', 'scrollTo'],
            'protected' => $navigationConfig['protected'] ?? false
        ];
    }

    /**
     * Generate full component with data
     */
    private function generateFullComponent($id, $navConfig, $data) {
        $template = file_get_contents(__DIR__ . '/code_display_structure_t1.html');
        
        // Inject ID and nav config
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        $template = str_replace(
            '<section class="code-display-component" data-nav-handler="handleCodeDisplayNavigation">',
            '<section class="code-display-component" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCodeDisplayNavigation" data-nav-config="' . $navConfigJson . '">',
            $template
        );

        // Inject data script before closing section
        $dataScript = $this->generateDataScript($id, $data);
        $lastPos = strrpos($template, '</section>');
        $template = substr_replace($template, $dataScript . '</section>', $lastPos, 10);

        return $template;
    }

    /**
     * Generate shell for dynamic loading
     */
    private function generateShell($id, $navConfig, $componentMetadata) {
        $template = file_get_contents(__DIR__ . '/code_display_structure_t1.html');
        
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        
        $template = str_replace(
            '<section class="code-display-component" data-nav-handler="handleCodeDisplayNavigation">',
            '<section class="code-display-component" 
                 id="' . htmlspecialchars($id) . '" 
                 data-nav-handler="handleCodeDisplayNavigation"
                 data-nav-config="' . $navConfigJson . '"
                 data-dynamic="true"
                 data-load-state="not-loaded"
                 data-init-hook="initializeCodeDisplay"
                 data-component-metadata="' . $metadataJson . '">',
            $template
        );

        return $template;
    }

    /**
     * Generate content only (for API responses)
     */
    private function generateContent($id, $data) {
        $template = file_get_contents(__DIR__ . '/code_display_structure_t1.html');
        
        // Remove link and script tags for content-only mode
        $template = preg_replace('/<link[^>]*>/', '', $template);
        $template = preg_replace('/<script[^>]*>.*?<\/script>/s', '', $template);
        
        // Inject data script
        $dataScript = $this->generateDataScript($id, $data);
        $lastDivPos = strrpos($template, '</div>');
        $template = substr_replace($template, $dataScript . '</div>', $lastDivPos, 6);

        return $template;
    }

    /**
     * Generate data injection script
     */
    private function generateDataScript($id, $data) {
        if (empty($data)) {
            return '';
        }

        $jsonData = json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
        $safeId = json_encode($id);
        
        $script = '<script>';
        $script .= '(function() {';
        $script .= 'var id = ' . $safeId . ';';
        $script .= 'var data = ' . $jsonData . ';';
        $script .= 'if (typeof window.setCodeDisplayData === "function") {';
        $script .= '    window.setCodeDisplayData(id, data);';
        $script .= '} else {';
        $script .= '    window.codeDisplayData = window.codeDisplayData || {};';
        $script .= '    window.codeDisplayData[id] = data;';
        $script .= '    setTimeout(function() {';
        $script .= '        if (typeof window.setCodeDisplayData === "function") {';
        $script .= '            window.setCodeDisplayData(id, data);';
        $script .= '        }';
        $script .= '    }, 100);';
        $script .= '}';
        $script .= '})();';
        $script .= '</script>';

        return $script;
    }
}
