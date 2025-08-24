<?php

class ToolsLoaderT1 {
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $data = $componentMetadata['componentData'] ?? [];

        switch ($loadingMode) {
            case 'full':
            default:
                return $this->generateFullComponent($id, $navConfig, $data);
        }
    }

    private function generateFullComponent($id, $navConfig, $data) {
        $template = file_get_contents(__DIR__ . '/tools_structure_t1.html');
        $html = $this->fillTemplate($template, $data);

        // Inject ID and nav config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        $html = preg_replace(
            '/<section\\s+class=\\"tools\\"\\s+data-nav-handler=\\"handleToolsNavigation\\"\\s*>/i',
            '<section class="tools ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleToolsNavigation" data-nav-config="' . $navConfigJson . '">',
            $html,
            1
        );

        // Add JavaScript data injection
        $toolsData = $this->prepareToolsDataForJS($data['categories'] ?? []);
        $jsDataScript = '<script>
        document.addEventListener("DOMContentLoaded", function() {
            console.log("Tools PHP: Attempting to set tools data");
            if (window.toolsBehavior) {
                console.log("Tools PHP: Setting tools data from PHP");
                window.toolsBehavior.setToolsData(' . json_encode($toolsData) . ');
            } else {
                console.log("Tools PHP: Behavior not ready, waiting...");
                setTimeout(function() {
                    if (window.toolsBehavior) {
                        console.log("Tools PHP: Setting tools data from PHP (delayed)");
                        window.toolsBehavior.setToolsData(' . json_encode($toolsData) . ');
                    }
                }, 500);
            }
        });
        </script>';
        
        $html .= $jsDataScript;

        return $html;
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
