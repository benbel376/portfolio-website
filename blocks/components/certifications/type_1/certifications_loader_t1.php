<?php

class CertificationsLoaderT1 {
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
        // Load certifications data
        $certificationsData = $this->loadCertificationsData();
        
        // Load HTML template
        $template = file_get_contents(__DIR__ . '/certifications_structure_t1.html');
        
        // Inject ID and navigation config
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace('<div class="certifications-component">',
            '<div class="certifications-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCertificationsNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . '>',
            $template);
        
        // Inject JavaScript data
        $html .= $this->injectDataScript($certificationsData);
        
        return $html;
    }
    
    private function generateShell($id, $navConfig, $componentMetadata) {
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        $protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
        
        $template = file_get_contents(__DIR__ . '/certifications_structure_t1.html');
        
        $html = str_replace('<div class="certifications-component">',
            '<div class="certifications-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleCertificationsNavigation" data-nav-config="' . $navConfigJson . '"' . $styleAttr . $protectedAttr . ' data-metadata="' . $metadataJson . '">',
            $template);
        
        return $html;
    }
    
    private function generateContent($data) {
        // For content-only mode, just return the grid structure
        return '<div class="certifications__grid" id="certifications-grid"></div><div class="certifications__empty" id="certifications-empty" style="display: none;"><ion-icon name="ribbon-outline" aria-hidden="true"></ion-icon><p>No certifications available to display.</p></div>';
    }
    
    /**
     * Load certifications data from various sources
     */
    private function loadCertificationsData() {
        // Try to get data from profile configuration
        global $profileData;
        
        if (isset($profileData['certifications']) && is_array($profileData['certifications'])) {
            return $profileData['certifications'];
        }
        
        // Create default certifications data based on available images
        $certificationsData = [
            [
                'name' => 'AWS Cloud Practitioner',
                'issuer' => 'Amazon Web Services',
                'image' => 'assets/media/ml_mlops_profile/education_page_media/certification/profile_certification_aws_practitioner.png',
                'description' => 'Foundational understanding of AWS Cloud concepts, services, security, architecture, pricing, and support. Demonstrates ability to define what the AWS Cloud is and the basic global infrastructure.',
                'link' => 'https://aws.amazon.com/certification/certified-cloud-practitioner/'
            ],
            [
                'name' => 'AWS Solutions Architect Associate',
                'issuer' => 'Amazon Web Services',
                'image' => 'assets/media/ml_mlops_profile/education_page_media/certification/profile_certification_aws_solutions_architect.png',
                'description' => 'Demonstrates ability to design distributed systems on AWS. Validates technical expertise in designing and deploying scalable, highly available, and fault-tolerant systems on AWS.',
                'link' => 'https://aws.amazon.com/certification/certified-solutions-architect-associate/'
            ],
            [
                'name' => 'Microsoft Azure Fundamentals',
                'issuer' => 'Microsoft',
                'image' => 'assets/media/ml_mlops_profile/education_page_media/certification/profile_certification_azure_fundamentals.png',
                'description' => 'Foundational knowledge of cloud services and how those services are provided with Microsoft Azure. Covers cloud concepts, Azure services, security, privacy, compliance, and trust.',
                'link' => 'https://docs.microsoft.com/en-us/learn/certifications/azure-fundamentals/'
            ],
            [
                'name' => 'Google Data Analytics Certificate',
                'issuer' => 'Google',
                'image' => 'assets/media/ml_mlops_profile/education_page_media/certification/profile_certification_google_data_analytics.png',
                'description' => 'Comprehensive program covering data analysis fundamentals, including data cleaning, analysis, and visualization using tools like R, SQL, Tableau, and spreadsheets.',
                'link' => 'https://www.coursera.org/professional-certificates/google-data-analytics'
            ],
            [
                'name' => 'Fortinet Network Security Expert',
                'issuer' => 'Fortinet',
                'image' => 'assets/media/ml_mlops_profile/education_page_media/certification/profile_certification_fortinet_intro.png',
                'description' => 'Introduction to network security concepts and Fortinet security solutions. Covers fundamental security concepts, threat landscape, and basic security technologies.',
                'link' => 'https://www.fortinet.com/training/cybersecurity-professionals'
            ],
            [
                'name' => 'ISC2 Security Fundamentals',
                'issuer' => 'ISC2',
                'image' => 'assets/media/ml_mlops_profile/education_page_media/certification/profile_certification_isc2.png',
                'description' => 'Foundation-level cybersecurity knowledge covering security principles, business continuity, access controls, network security, and security assessment and testing.',
                'link' => 'https://www.isc2.org/Certifications'
            ]
        ];
        
        return $certificationsData;
    }
    
    /**
     * Inject certifications data into JavaScript
     */
    private function injectDataScript($certificationsData) {
        $script = '<script>';
        $script .= 'console.log("Certifications PHP: Attempting to set certifications data");';
        
        // Check if behavior is ready
        $script .= 'if (typeof setCertificationsData === "function") {';
        $script .= '    console.log("Certifications PHP: Setting data immediately");';
        $script .= '    setCertificationsData(' . json_encode($certificationsData) . ');';
        $script .= '} else {';
        $script .= '    console.log("Certifications PHP: Behavior not ready, waiting...");';
        $script .= '    setTimeout(function() {';
        $script .= '        console.log("Certifications PHP: Setting certifications data from PHP (delayed)");';
        $script .= '        if (typeof setCertificationsData === "function") {';
        $script .= '            setCertificationsData(' . json_encode($certificationsData) . ');';
        $script .= '        } else {';
        $script .= '            console.error("Certifications PHP: setCertificationsData function not found after delay");';
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
