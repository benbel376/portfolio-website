<?php
class ProjectDetailsLoader {
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        error_log("Project Details PHP: Attempting to load project details component with ID: $id");
        
        $projectData = isset($componentMetadata['componentData']) ? $componentMetadata['componentData'] : [];
        error_log("Project Details PHP: Data available: " . json_encode($projectData));

        $htmlPath = __DIR__ . '/project_details_structure_t1.html';
        $html = file_get_contents($htmlPath);

        // Process navigation config
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        // Inject component ID and navigation configuration
        $html = preg_replace(
            '/<section\\s+class="project-details"\\s+data-nav-handler="handleProjectDetailsNavigation"\\s*>/i',
            '<section class="project-details ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleProjectDetailsNavigation" data-nav-config="' . $navConfigJson . '">',
            $html,
            1
        );

        // Create data injection script
        $projectDataJson = json_encode($projectData, JSON_HEX_APOS | JSON_HEX_QUOT);
        $dataScript = "
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Project Details PHP: Attempting to set project data');
            const projectData = {$projectDataJson};
            if (window.setProjectDetailsData) {
                console.log('Project Details PHP: Setting data immediately');
                window.setProjectDetailsData(projectData);
            } else {
                console.log('Project Details PHP: Behavior not ready, waiting...');
                window.projectDetailsData = projectData;
                setTimeout(function() {
                    if (window.setProjectDetailsData) {
                        console.log('Project Details PHP: Setting project data from PHP (delayed)');
                        window.setProjectDetailsData(projectData);
                    }
                }, 100);
            }
        });
        </script>";

        return $html . $dataScript;
    }

    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [
            'defaultState' => 'visible',
            'allowedStates' => ['visible', 'hidden', 'scrollTo']
        ];
        
        $config = array_merge($defaultConfig, $navigationConfig);
        
        // Validate defaultState
        if (!in_array($config['defaultState'], $config['allowedStates'])) {
            $config['defaultState'] = 'visible';
        }
        
        return $config;
    }
}
?>
