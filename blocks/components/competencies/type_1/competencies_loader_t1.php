<?php

class CompetenciesLoaderT1 {
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
        $template = file_get_contents(__DIR__ . '/competencies_structure_t1.html');
        $html = $this->fillTemplate($template, $data);

        // Inject ID and nav config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        $html = preg_replace(
            '/<section\\s+class=\\"competencies\\"\\s+data-nav-handler=\\"handleCompetenciesNavigation\\"\\s*>/i',
            '<section class="competencies ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCompetenciesNavigation" data-nav-config="' . $navConfigJson . '">',
            $html,
            1
        );

        // Add JavaScript data injection
        $skillsData = $this->prepareSkillsDataForJS($data['categories'] ?? []);
        $slideshowData = $this->prepareSlideshowDataForJS($data['slideshow'] ?? []);
        $jsDataScript = '<script>
        document.addEventListener("DOMContentLoaded", function() {
            console.log("Competencies PHP: Attempting to set skills data");
            if (window.competenciesBehavior) {
                console.log("Competencies PHP: Setting skills data from PHP");
                window.competenciesBehavior.setSkillsData(' . json_encode($skillsData) . ');
                window.competenciesBehavior.setSlideshowData(' . json_encode($slideshowData) . ');
            } else {
                console.log("Competencies PHP: Behavior not ready, waiting...");
                setTimeout(function() {
                    if (window.competenciesBehavior) {
                        console.log("Competencies PHP: Setting skills data from PHP (delayed)");
                        window.competenciesBehavior.setSkillsData(' . json_encode($skillsData) . ');
                        window.competenciesBehavior.setSlideshowData(' . json_encode($slideshowData) . ');
                    }
                }, 500);
            }
        });
        </script>';
        
        $html .= $jsDataScript;

        return $html;
    }

    private function fillTemplate($template, $data) {
        $categories = $data['categories'] ?? [];

        $html = str_replace('<!-- DROPDOWN_OPTIONS_PLACEHOLDER -->', $this->renderDropdownOptions($categories), $template);
        $html = str_replace('<!-- SKILLS_LIST_PLACEHOLDER -->', '', $html); // Will be filled by JS
        $html = str_replace('<!-- PAGINATION_DOTS_PLACEHOLDER -->', '', $html); // Will be filled by JS

        return $html;
    }

    private function renderDropdownOptions($categories) {
        if (!is_array($categories) || empty($categories)) return '';

        $output = '<option value="all" selected>All Competencies</option>';
        foreach ($categories as $index => $category) {
            $title = htmlspecialchars($category['title'] ?? '');
            $key = 'category_' . $index;
            $output .= '<option value="' . $key . '">' . $title . '</option>';
        }
        return $output;
    }

    private function prepareSkillsDataForJS($categories) {
        $skillsData = [];
        $allSkills = [];
        
        foreach ($categories as $index => $category) {
            $key = 'category_' . $index;
            $skills = [];
            
            if (isset($category['skills']) && is_array($category['skills'])) {
                foreach ($category['skills'] as $skill) {
                    $skillData = [
                        'title' => $skill['title'] ?? '',
                        'description' => $skill['description'] ?? '',
                        'icon' => $skill['icon'] ?? 'checkmark-circle-outline',
                        'type' => $skill['type'] ?? 'ml'
                    ];
                    $skills[] = $skillData;
                    $allSkills[] = $skillData; // Add to all skills collection
                }
            }
            
            $skillsData[$key] = $skills;
        }
        
        // Add "all" category with all skills
        $skillsData['all'] = $allSkills;
        
        return $skillsData;
    }

    private function prepareSlideshowDataForJS($slideshowData) {
        if (!is_array($slideshowData)) return [];
        
        $slides = [];
        foreach ($slideshowData as $slide) {
            $slides[] = [
                'title' => $slide['title'] ?? 'Pipeline Visualization',
                'description' => $slide['description'] ?? 'Advanced data pipeline architecture',
                'src' => $slide['src'] ?? '',
                'type' => $slide['type'] ?? 'image' // 'image', 'gif', 'video'
            ];
        }
        
        return $slides;
    }

    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = ['defaultState' => 'visible', 'allowedStates' => ['visible', 'hidden']];
        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) $config['defaultState'] = 'visible';
        return $config;
    }
}

?>