<?php

/**
 * Workflow Component Loader
 * 
 * Data Structure:
 * {
 *   "title": "How I Work",
 *   "scenarios": [
 *     {
 *       "title": "Scenario Name",
 *       "description": "Scenario description",
 *       "steps": [
 *         {
 *           "title": "Step Title",
 *           "description": "Step description",
 *           "icon": "icon-name",
 *           "tools": ["Tool1", "Tool2"]
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
class WorkflowLoaderT2 {
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
            error_log("WorkflowLoaderT2 error: " . $e->getMessage());
            return $this->generateErrorPlaceholder();
        }
    }

    private function generateFullComponent($id, $navConfig, $data) {
        $template = file_get_contents(__DIR__ . '/workflow_structure_t2.html');
        
        if ($template === false) {
            throw new Exception('Failed to load workflow structure template');
        }
        
        $html = $this->fillTemplate($template, $data);

        // Inject ID and nav config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        $html = preg_replace(
            '/<section\\s+class=\\"workflow-component\\"\\s+data-nav-handler=\\"handleWorkflowNavigation\\"\\s*>/i',
            '<section class="workflow-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleWorkflowNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $html,
            1
        );

        // Inject JavaScript data
        $html .= $this->injectDataScript($data);

        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $template = file_get_contents(__DIR__ . '/workflow_structure_t2.html');
        
        if ($template === false) {
            throw new Exception('Failed to load workflow structure template');
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
            '/<section\\s+class=\\"workflow-component\\"\\s+data-nav-handler=\\"handleWorkflowNavigation\\"\\s*>/i',
            '<section class="workflow-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleWorkflowNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . ' data-dynamic="true" data-load-state="not-loaded" data-init-hook="initializeWorkflow" data-component-metadata="' . $metadataJson . '"' . $protectedAttr . '>',
            $template,
            1
        );
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, return minimal structure
        return '<div class="workflow__steps" id="workflow-steps"></div>';
    }
    
    /**
     * Inject workflow data into JavaScript
     */
    private function injectDataScript($data) {
        $workflowData = $this->prepareWorkflowDataForJS($data['scenarios'] ?? []);
        $scenarioMeta = $this->prepareScenarioMetaForJS($data['scenarios'] ?? []);
        
        $script = '<script>';
        $script .= 'console.log("Workflow PHP: Attempting to set workflow data");';
        $script .= 'window.workflowScenarioMeta = ' . json_encode($scenarioMeta) . ';';
        $script .= 'if (typeof window.setWorkflowData === "function") {';
        $script .= '    console.log("Workflow PHP: Setting data immediately");';
        $script .= '    window.setWorkflowData(' . json_encode($workflowData) . ');';
        $script .= '} else {';
        $script .= '    console.log("Workflow PHP: Behavior not ready, waiting...");';
        $script .= '    setTimeout(function() {';
        $script .= '        console.log("Workflow PHP: Setting workflow data from PHP (delayed)");';
        $script .= '        if (typeof window.setWorkflowData === "function") {';
        $script .= '            window.setWorkflowData(' . json_encode($workflowData) . ');';
        $script .= '        } else {';
        $script .= '            console.error("Workflow PHP: setWorkflowData function not found after delay");';
        $script .= '        }';
        $script .= '    }, 100);';
        $script .= '}';
        $script .= '</script>';
        
        return $script;
    }
    
    private function generateErrorPlaceholder() {
        return '<section class="workflow-component workflow-component--error"><div class="workflow__empty"><ion-icon name="alert-circle-outline"></ion-icon><p>Unable to load workflow</p></div></section>';
    }

    private function fillTemplate($template, $data) {
        $title = $data['title'] ?? 'How I Work';
        $scenarios = $data['scenarios'] ?? [];

        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $template);
        $html = str_replace('<!-- DROPDOWN_OPTIONS_PLACEHOLDER -->', $this->renderDropdownOptions($scenarios), $html);
        $html = str_replace('<!-- WORKFLOW_STEPS_PLACEHOLDER -->', '', $html); // Will be filled by JS

        return $html;
    }

    private function renderDropdownOptions($scenarios) {
        if (!is_array($scenarios) || empty($scenarios)) return '';

        $output = '';
        $first = true;
        foreach ($scenarios as $index => $scenario) {
            $title = htmlspecialchars($scenario['title'] ?? '');
            $key = 'scenario_' . $index;
            $selected = $first ? ' selected' : '';
            $output .= '<option value="' . $key . '"' . $selected . '>' . $title . '</option>';
            $first = false;
        }
        return $output;
    }

    private function prepareWorkflowDataForJS($scenarios) {
        if (!is_array($scenarios)) return [];
        
        $workflowData = [];
        foreach ($scenarios as $index => $scenario) {
            $key = 'scenario_' . $index;
            $steps = [];
            
            if (isset($scenario['steps']) && is_array($scenario['steps'])) {
                foreach ($scenario['steps'] as $step) {
                    $stepData = [
                        'title' => $step['title'] ?? 'Process Step',
                        'description' => $step['description'] ?? 'Step description',
                        'icon' => $step['icon'] ?? 'checkmark-circle-outline',
                        'tools' => $step['tools'] ?? []
                    ];
                    $steps[] = $stepData;
                }
            }
            
            $workflowData[$key] = $steps;
        }
        
        return $workflowData;
    }

    private function prepareScenarioMetaForJS($scenarios) {
        if (!is_array($scenarios)) return [];
        
        $scenarioMeta = [];
        foreach ($scenarios as $index => $scenario) {
            $key = 'scenario_' . $index;
            $scenarioMeta[$key] = [
                'title' => $scenario['title'] ?? 'Workflow Scenario',
                'description' => $scenario['description'] ?? 'Workflow scenario description.'
            ];
        }
        
        return $scenarioMeta;
    }

    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = ['defaultState' => 'visible', 'allowedStates' => ['visible', 'hidden']];
        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) $config['defaultState'] = 'visible';
        return $config;
    }
}

?>
