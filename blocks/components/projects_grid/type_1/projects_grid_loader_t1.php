<?php

class ProjectsGridLoaderT1 {
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
        // Load projects data
        $projectsData = $this->loadProjectsData();
        
        // Load HTML template
        $template = file_get_contents(__DIR__ . '/projects_grid_structure_t1.html');
        
        // Inject ID and navigation config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace('<div class="projects-grid-component">',
            '<div class="projects-grid-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleProjectsGridNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $template);
        
        // Inject JavaScript data
        $html .= $this->injectDataScript($projectsData);
        
        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = file_get_contents(__DIR__ . '/projects_grid_structure_t1.html');
        
        $html = str_replace('<div class="projects-grid-component">',
            '<div class="projects-grid-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleProjectsGridNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . $protectedAttr . ' data-metadata="' . $metadataJson . '">',
            $template);
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, just return the grid structure
        return '<div class="projects-grid__grid" id="projects-grid"></div><div class="projects-grid__empty" id="projects-empty" style="display: none;"><ion-icon name="folder-open-outline" aria-hidden="true"></ion-icon><h3>No projects found</h3><p>Try adjusting your search or filter criteria.</p></div>';
    }
    
    /**
     * Load projects data from various sources
     */
    private function loadProjectsData() {
        // Try to get data from profile configuration
        global $profileData;
        
        if (isset($profileData['projects']) && is_array($profileData['projects'])) {
            return $profileData['projects'];
        }
        
        // Create default projects data
        $projectsData = [
            [
                'name' => 'AI-Powered Customer Analytics Platform',
                'description' => 'A comprehensive machine learning platform that analyzes customer behavior patterns and provides actionable insights for business growth.',
                'category' => 'machine-learning',
                'date' => '2023-11-15'
            ],
            [
                'name' => 'E-Commerce Mobile Application',
                'description' => 'Full-featured mobile e-commerce application with user authentication, product catalog, shopping cart, and payment integration.',
                'category' => 'mobile-development',
                'date' => '2023-09-22'
            ],
            [
                'name' => 'Real-Time Chat Application',
                'description' => 'Scalable real-time messaging application supporting group chats, file sharing, and emoji reactions with end-to-end encryption.',
                'category' => 'web-development',
                'date' => '2023-08-10'
            ],
            [
                'name' => 'Blockchain Voting System',
                'description' => 'Secure and transparent voting system built on blockchain technology ensuring vote integrity and immutability.',
                'category' => 'blockchain',
                'date' => '2023-07-05'
            ],
            [
                'name' => 'IoT Smart Home Dashboard',
                'description' => 'Comprehensive IoT dashboard for smart home management with lighting, temperature, and security system controls.',
                'category' => 'iot',
                'date' => '2023-06-18'
            ],
            [
                'name' => 'Machine Learning Stock Predictor',
                'description' => 'Advanced stock price prediction system using LSTM neural networks with 85% accuracy rate for trading signals.',
                'category' => 'machine-learning',
                'date' => '2023-05-12'
            ],
            [
                'name' => 'Cloud Infrastructure Automation',
                'description' => 'DevOps automation suite for cloud infrastructure management with CI/CD pipelines and auto-scaling capabilities.',
                'category' => 'devops',
                'date' => '2023-04-08'
            ],
            [
                'name' => 'Augmented Reality Shopping App',
                'description' => 'AR-powered shopping experience allowing customers to visualize products in their space before purchase.',
                'category' => 'mobile-development',
                'date' => '2023-03-25'
            ],
            [
                'name' => 'Microservices API Gateway',
                'description' => 'High-performance API gateway for microservices architecture handling 10k+ requests per second with load balancing.',
                'category' => 'backend-development',
                'date' => '2023-02-14'
            ],
            [
                'name' => 'Data Visualization Dashboard',
                'description' => 'Interactive business intelligence dashboard with real-time data visualization and automated report generation.',
                'category' => 'data-science',
                'date' => '2023-01-30'
            ],
            [
                'name' => 'Cybersecurity Threat Detection',
                'description' => 'AI-powered cybersecurity system for threat detection and response using machine learning to identify anomalies.',
                'category' => 'cybersecurity',
                'date' => '2022-12-20'
            ],
            [
                'name' => 'Progressive Web Application',
                'description' => 'High-performance PWA with offline capabilities, push notifications, and native app-like experience.',
                'category' => 'web-development',
                'date' => '2022-11-15'
            ]
        ];
        
        return $projectsData;
    }
    
    /**
     * Inject projects data into JavaScript
     */
    private function injectDataScript($projectsData) {
        $script = '<script>';
        $script .= 'console.log("Projects Grid PHP: Attempting to set projects data");';
        
        // Check if behavior is ready
        $script .= 'if (typeof setProjectsData === "function") {';
        $script .= '    console.log("Projects Grid PHP: Setting data immediately");';
        $script .= '    setProjectsData(' . json_encode($projectsData) . ');';
        $script .= '} else {';
        $script .= '    console.log("Projects Grid PHP: Behavior not ready, waiting...");';
        $script .= '    setTimeout(function() {';
        $script .= '        console.log("Projects Grid PHP: Setting projects data from PHP (delayed)");';
        $script .= '        if (typeof setProjectsData === "function") {';
        $script .= '            setProjectsData(' . json_encode($projectsData) . ');';
        $script .= '        } else {';
        $script .= '            console.error("Projects Grid PHP: setProjectsData function not found after delay");';
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
