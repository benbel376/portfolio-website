<?php

/**
 * Competencies Component Loader
 * 
 * Data Structure:
 * {
 *   "categories": [
 *     {
 *       "title": "Category Name",
 *       "skills": [
 *         {
 *           "title": "Skill Name",
 *           "description": "Skill description",
 *           "icon": "icon-name",
 *           "type": "ml"
 *         }
 *       ]
 *     }
 *   ],
 *   "slideshow": [
 *     {
 *       "title": "Slide Title",
 *       "description": "Slide description",
 *       "src": "path/to/image.jpg",
 *       "type": "image"
 *     }
 *   ]
 * }
 * 
 * Supported States: visible, hidden
 * Dynamic Loading: Supported
 * Protected Content: Supported
 */
class CompetenciesLoaderT1 {
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
            error_log("CompetenciesLoaderT1 error: " . $e->getMessage());
            return $this->generateErrorPlaceholder();
        }
    }

    private function generateFullComponent($id, $navConfig, $data) {
        $template = file_get_contents(__DIR__ . '/competencies_structure_t1.html');
        
        if ($template === false) {
            throw new Exception('Failed to load competencies structure template');
        }
        
        $html = $this->fillTemplate($template, $data);

        // Inject ID and nav config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        $html = preg_replace(
            '/<section\\s+class=\\"competencies\\"\\s+data-nav-handler=\\"handleCompetenciesNavigation\\"\\s*>/i',
            '<section class="competencies ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCompetenciesNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
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
        $template = file_get_contents(__DIR__ . '/competencies_structure_t1.html');
        
        if ($template === false) {
            throw new Exception('Failed to load competencies structure template');
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
            '/<section\\s+class=\\"competencies\\"\\s+data-nav-handler=\\"handleCompetenciesNavigation\\"\\s*>/i',
            '<section class="competencies ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCompetenciesNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . ' data-dynamic="true" data-load-state="not-loaded" data-init-hook="initializeCompetencies" data-component-metadata="' . $metadataJson . '"' . $protectedAttr . '>',
            $template,
            1
        );
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, return minimal structure
        return '<div class="competencies__skills-list" id="skills-list"></div><div class="competencies__pagination" id="pagination-dots"></div>';
    }
    
    /**
     * Inject competencies data into JavaScript
     */
    private function injectDataScript($data) {
        $skillsData = $this->prepareSkillsDataForJS($data['categories'] ?? []);
        $slideshowData = $this->prepareSlideshowDataForJS($data['slideshow'] ?? []);
        
        $script = '<script>';
        $script .= 'if (typeof window.setCompetenciesData === "function") {';
        $script .= '    window.setCompetenciesData(' . json_encode($skillsData) . ', ' . json_encode($slideshowData) . ');';
        $script .= '} else {';
        $script .= '    setTimeout(function() {';
        $script .= '        if (typeof window.setCompetenciesData === "function") {';
        $script .= '            window.setCompetenciesData(' . json_encode($skillsData) . ', ' . json_encode($slideshowData) . ');';
        $script .= '        }';
        $script .= '    }, 100);';
        $script .= '}';
        $script .= '</script>';
        
        return $script;
    }
    
    private function generateErrorPlaceholder() {
        return '<section class="competencies competencies--error"><div class="competencies__empty"><ion-icon name="alert-circle-outline"></ion-icon><p>Unable to load competencies</p></div></section>';
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