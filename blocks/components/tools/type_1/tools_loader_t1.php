<?php

/**
 * Tools Component Loader
 * 
 * Data Structure:
 * {
 *   "title": "Toolkits",
 *   "categories": [
 *     {
 *       "title": "Category Name",
 *       "tools": [
 *         {
 *           "name": "Tool Name",
 *           "description": "Tool description",
 *           "icon": "icon-name",
 *           "category": "general",
 *           "projects": ["project1", "project2"]
 *         }
 *       ]
 *     }
 *   ]
 * }
 * 
 * Supported States: visible, hidden
 * Dynamic Loading: Supported
 * Protected Content: Supported
 */
class ToolsLoaderT1 {
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
            error_log("ToolsLoaderT1 error: " . $e->getMessage());
            return $this->generateErrorPlaceholder();
        }
    }

    private function generateFullComponent($id, $navConfig, $data) {
        $template = file_get_contents(__DIR__ . '/tools_structure_t1.html');
        
        if ($template === false) {
            throw new Exception('Failed to load tools structure template');
        }
        
        $html = $this->fillTemplate($template, $data);

        // Inject ID and nav config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        $html = preg_replace(
            '/<section\\s+class=\\"tools-component\\"\\s+data-nav-handler=\\"handleToolsNavigation\\"\\s*>/i',
            '<section class="tools-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleToolsNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $html,
            1
        );

        // Inject data script INSIDE container
        $dataScript = $this->injectDataScript($data);
        $lastSectionPos = strrpos($html, '</section>');
        if ($lastSectionPos !== false) {
            $html = substr_replace($html, $dataScript . '</section>', $lastSectionPos, 10);
        }

        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $template = file_get_contents(__DIR__ . '/tools_structure_t1.html');
        
        if ($template === false) {
            throw new Exception('Failed to load tools structure template');
        }
        
        // Prepare metadata and config
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        
        // Inject shell attributes
        $html = preg_replace(
            '/<section\\s+class=\\"tools-component\\"\\s+data-nav-handler=\\"handleToolsNavigation\\"\\s*>/i',
            '<section class="tools-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleToolsNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . ' data-dynamic="true" data-load-state="not-loaded" data-init-hook="initializeTools" data-component-metadata="' . $metadataJson . '"' . $protectedAttr . '>',
            $template,
            1
        );
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, return minimal structure
        return '<div class="tools__grid" id="tools-grid"></div><div class="tools__pagination" id="tools-pagination-dots"></div>';
    }
    
    /**
     * Inject tools data into JavaScript
     */
    private function injectDataScript($data) {
        $toolsData = $this->prepareToolsDataForJS($data['categories'] ?? []);
        
        $script = '<script>';
        $script .= 'if (typeof window.setToolsData === "function") {';
        $script .= '    window.setToolsData(' . json_encode($toolsData) . ');';
        $script .= '} else {';
        $script .= '    setTimeout(function() {';
        $script .= '        if (typeof window.setToolsData === "function") {';
        $script .= '            window.setToolsData(' . json_encode($toolsData) . ');';
        $script .= '        }';
        $script .= '    }, 100);';
        $script .= '}';
        $script .= '</script>';
        
        return $script;
    }
    
    private function generateErrorPlaceholder() {
        return '<section class="tools-component tools-component--error"><div class="tools__empty"><ion-icon name="alert-circle-outline"></ion-icon><p>Unable to load tools</p></div></section>';
    }

    private function fillTemplate($template, $data) {
        $title = $data['title'] ?? 'Toolkits';
        $categories = $data['categories'] ?? [];

        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $template);
        $html = str_replace('<!-- DROPDOWN_OPTIONS_PLACEHOLDER -->', $this->renderDropdownOptions($categories), $html);
        $html = str_replace('<!-- TOOLS_GRID_PLACEHOLDER -->', '', $html); // Will be filled by JS
        $html = str_replace('<!-- PAGINATION_DOTS_PLACEHOLDER -->', '', $html); // Will be filled by JS

        return $html;
    }

    private function renderDropdownOptions($categories) {
        if (!is_array($categories) || empty($categories)) return '';

        $output = '<option value="all" selected>All Tools</option>';
        foreach ($categories as $index => $category) {
            $title = htmlspecialchars($category['title'] ?? '');
            $key = 'category_' . $index;
            $output .= '<option value="' . $key . '">' . $title . '</option>';
        }
        return $output;
    }

    private function prepareToolsDataForJS($categories) {
        $toolsData = [];
        $allTools = [];
        
        foreach ($categories as $index => $category) {
            $key = 'category_' . $index;
            $tools = [];
            
            if (isset($category['tools']) && is_array($category['tools'])) {
                foreach ($category['tools'] as $tool) {
                    $toolData = [
                        'name' => $tool['name'] ?? '',
                        'description' => $tool['description'] ?? '',
                        'icon' => $tool['icon'] ?? 'code-outline',
                        'category' => $tool['category'] ?? 'general',
                        'projects' => $tool['projects'] ?? []
                    ];
                    $tools[] = $toolData;
                    $allTools[] = $toolData; // Add to all tools collection
                }
            }
            
            $toolsData[$key] = $tools;
        }
        
        // Add "all" category with all tools
        $toolsData['all'] = $allTools;
        
        return $toolsData;
    }

    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = ['defaultState' => 'visible', 'allowedStates' => ['visible', 'hidden']];
        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) $config['defaultState'] = 'visible';
        return $config;
    }
}

?>
