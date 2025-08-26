<?php

class EducationHistoryLoaderT1 {
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $componentData = $componentMetadata['componentData'] ?? [];
        
        switch ($loadingMode) {
            case 'shell':
                return $this->generateShell($id, $navConfig, $componentMetadata);
            case 'content':
                return $this->generateContent($componentData);
            case 'full':
            default:
                return $this->generateFullComponent($id, $componentData, $navConfig);
        }
    }
    
    private function generateFullComponent($id, $data, $navConfig) {
        // Load education history data
        $educationHistoryData = $this->loadEducationHistoryData();
        
        // Load HTML template
        $template = file_get_contents(__DIR__ . '/education_history_structure_t1.html');
        
        // Inject ID and navigation config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace('<div class="education-history-component">',
            '<div class="education-history-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleEducationHistoryNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $template);
        
        // Inject JavaScript data
        $html .= $this->injectDataScript($educationHistoryData);
        
        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = file_get_contents(__DIR__ . '/education_history_structure_t1.html');
        
        $html = str_replace('<div class="education-history-component">',
            '<div class="education-history-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleEducationHistoryNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . $protectedAttr . ' data-metadata="' . $metadataJson . '">',
            $template);
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, just return the timeline structure
        return '<div class="education-history__timeline" id="education-history-timeline"></div><div class="education-history__empty" id="education-history-empty" style="display: none;"><ion-icon name="school-outline" aria-hidden="true"></ion-icon><p>No education history available to display.</p></div>';
    }
    
    /**
     * Load education history data from various sources
     */
    private function loadEducationHistoryData() {
        // Try to get data from profile configuration
        global $profileData;
        
        if (isset($profileData['education']) && is_array($profileData['education'])) {
            return $profileData['education'];
        }
        
        // Create default education history data
        $educationHistoryData = [
            [
                'institution' => 'University of Technology',
                'degree' => 'Master of Science in Computer Science',
                'field' => 'Machine Learning & Data Science',
                'startDate' => '2020-09-01',
                'endDate' => '2022-06-30',
                'description' => 'Specialized in machine learning algorithms, data mining, and artificial intelligence. Completed thesis on deep learning applications in natural language processing.',
                'highlights' => [
                    'Graduated Magna Cum Laude with GPA 3.8/4.0',
                    'Published research paper on neural network optimization',
                    'Teaching Assistant for Data Structures and Algorithms',
                    'President of Computer Science Graduate Association'
                ]
            ],
            [
                'institution' => 'State University',
                'degree' => 'Bachelor of Science in Computer Engineering',
                'field' => 'Software Engineering',
                'startDate' => '2016-09-01',
                'endDate' => '2020-05-15',
                'description' => 'Comprehensive program covering software development, computer systems, and engineering principles. Strong foundation in mathematics, programming, and system design.',
                'highlights' => [
                    'Graduated Summa Cum Laude with GPA 3.9/4.0',
                    'Dean\'s List for 6 consecutive semesters',
                    'Lead developer for senior capstone project',
                    'Member of IEEE Computer Society'
                ]
            ],
            [
                'institution' => 'Community College of Technology',
                'degree' => 'Associate of Science in Computer Information Systems',
                'field' => 'Information Technology',
                'startDate' => '2014-09-01',
                'endDate' => '2016-05-20',
                'description' => 'Foundation coursework in computer systems, programming fundamentals, and information technology. Prepared for transfer to four-year university program.',
                'highlights' => [
                    'Graduated with High Honors, GPA 3.95/4.0',
                    'Phi Theta Kappa Honor Society member',
                    'Student tutor for programming courses',
                    'Outstanding Student in Computer Science Award'
                ]
            ]
        ];
        
        return $educationHistoryData;
    }
    
    /**
     * Inject education history data into JavaScript
     */
    private function injectDataScript($educationHistoryData) {
        $script = '<script>';
        $script .= 'console.log("Education History PHP: Attempting to set education data");';
        
        // Check if behavior is ready
        $script .= 'if (typeof setEducationHistoryData === "function") {';
        $script .= '    console.log("Education History PHP: Setting data immediately");';
        $script .= '    setEducationHistoryData(' . json_encode($educationHistoryData) . ');';
        $script .= '} else {';
        $script .= '    console.log("Education History PHP: Behavior not ready, waiting...");';
        $script .= '    setTimeout(function() {';
        $script .= '        console.log("Education History PHP: Setting education data from PHP (delayed)");';
        $script .= '        if (typeof setEducationHistoryData === "function") {';
        $script .= '            setEducationHistoryData(' . json_encode($educationHistoryData) . ');';
        $script .= '        } else {';
        $script .= '            console.error("Education History PHP: setEducationHistoryData function not found after delay");';
        $script .= '        }';
        $script .= '    }, 100);';
        $script .= '}';
        $script .= '</script>';
        
        return $script;
    }
    
    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [
            'defaultState' => 'visible',
            'allowedStates' => ['visible', 'hidden']
        ];
        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) {
            $config['defaultState'] = 'visible';
        }
        return $config;
    }
}

?>
