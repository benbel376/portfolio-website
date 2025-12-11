<?php
/**
 * Feature List Component Loader
 */

class FeatureListLoaderT1 {
    
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
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
    }

    private function processNavigationConfig($navigationConfig) {
        return [
            'defaultState' => $navigationConfig['defaultState'] ?? 'visible',
            'allowedStates' => $navigationConfig['allowedStates'] ?? ['visible', 'hidden', 'scrollTo']
        ];
    }

    private function generateShell($id, $navConfig, $componentMetadata) {
        $template = file_get_contents(__DIR__ . '/feature_list_structure_t1.html');
        
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        
        $template = str_replace(
            '<section class="feature-list-component"',
            '<section class="feature-list-component" id="' . htmlspecialchars($id, ENT_QUOTES, 'UTF-8') . '" 
                 data-nav-config=\'' . $navConfigJson . '\'
                 data-dynamic="true"
                 data-load-state="not-loaded"
                 data-init-hook="initializeFeatureList"
                 data-component-metadata=\'' . $metadataJson . '\'',
            $template
        );
        
        return $template;
    }

    private function generateContent($data) {
        return $this->injectDataScript('', $data);
    }

    private function generateFullComponent($id, $navConfig, $data) {
        $template = file_get_contents(__DIR__ . '/feature_list_structure_t1.html');
        
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = str_replace(
            '<section class="feature-list-component"',
            '<section class="feature-list-component" id="' . htmlspecialchars($id, ENT_QUOTES, 'UTF-8') . '" 
                 data-nav-config=\'' . $navConfigJson . '\'',
            $template
        );
        
        // Inject data script before closing section
        $dataScript = $this->injectDataScript($id, $data);
        $lastPos = strrpos($template, '</section>');
        $template = substr_replace($template, $dataScript . '</section>', $lastPos, 10);
        
        return $template;
    }

    private function injectDataScript($id, $data) {
        $jsonData = json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
        
        $script = '<script>';
        $script .= '(function() {';
        $script .= 'var data = ' . $jsonData . ';';
        $script .= 'if (typeof window.setFeatureListData === "function") {';
        $script .= '    window.setFeatureListData("' . htmlspecialchars($id, ENT_QUOTES, 'UTF-8') . '", data);';
        $script .= '} else {';
        $script .= '    setTimeout(function() {';
        $script .= '        if (typeof window.setFeatureListData === "function") {';
        $script .= '            window.setFeatureListData("' . htmlspecialchars($id, ENT_QUOTES, 'UTF-8') . '", data);';
        $script .= '        }';
        $script .= '    }, 100);';
        $script .= '}';
        $script .= '})();';
        $script .= '</script>';
        
        return $script;
    }
}
