<?php

class WorkflowLoaderT1 {
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
        $template = file_get_contents(__DIR__ . '/workflow_structure_t1.html');
        $html = $this->fillTemplate($template, $data);

        // Inject ID and nav config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        $html = preg_replace(
            '/<section\\s+class=\\"workflow\\"\\s+data-nav-handler=\\"handleWorkflowNavigation\\"\\s*>/i',
            '<section class="workflow ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleWorkflowNavigation" data-nav-config="' . $navConfigJson . '">',
            $html,
            1
        );

        // Add JavaScript data injection
        $workflowData = $this->prepareWorkflowDataForJS($data['scenarios'] ?? []);
        $scenarioMeta = $this->prepareScenarioMetaForJS($data['scenarios'] ?? []);
        $jsDataScript = '<script>
        document.addEventListener("DOMContentLoaded", function() {
            console.log("Workflow PHP: Attempting to set workflow data");
            window.workflowScenarioMeta = ' . json_encode($scenarioMeta) . ';
            if (window.workflowBehavior) {
                console.log("Workflow PHP: Setting workflow data from PHP");
                window.workflowBehavior.setWorkflowData(' . json_encode($workflowData) . ');
            } else {
                console.log("Workflow PHP: Behavior not ready, waiting...");
                setTimeout(function() {
                    if (window.workflowBehavior) {
                        console.log("Workflow PHP: Setting workflow data from PHP (delayed)");
                        window.workflowBehavior.setWorkflowData(' . json_encode($workflowData) . ');
                    }
                }, 500);
            }
        });
        </script>';
        
        $html .= $jsDataScript;

        return $html;
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
