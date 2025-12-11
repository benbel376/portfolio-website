<?php
error_log("Project Details PHP: Loader file loaded");
class ProjectDetailsLoader {
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        error_log("Project Details PHP: Attempting to load project details component with ID: $id, Mode: $loadingMode");
        
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
            '/<section\\s+class="project-details-component"\\s+data-nav-handler="handleProjectDetailsNavigation"\\s*>/i',
            '<section class="project-details-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleProjectDetailsNavigation" data-nav-config="' . $navConfigJson . '">',
            $html,
            1
        );

        // Handle different loading modes
        if ($loadingMode === 'shell') {
            return $this->generateShell($html, $id, $componentMetadata);
        } elseif ($loadingMode === 'content') {
            return $this->generateContent($html, $projectData, $id);
        }

        // Default: return full HTML for backwards compatibility (populate data directly)
        if (!empty($componentMetadata['componentData'])) {
            error_log("Project Details PHP: Using component data for full load");
            return $this->generateContent($html, $componentMetadata['componentData'], $id);
        }
        
        error_log("Project Details PHP: Returning empty HTML shell");
        return $html;
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

    /**
     * Generate shell for dynamic loading
     */
    private function generateShell($html, $id, $componentMetadata) {
        // Add dynamic content container wrapper around everything after the banner
        $html = str_replace(
            '  <!-- Main Content Container -->',
            '  <div class="dynamic-content-container"><!-- Main Content Container -->',
            $html
        );
        
        // Close the dynamic content container before the script tag
        $html = str_replace(
            '<script src="blocks/components/project_details/type_1/project_details_behavior_t1.js" type="module"></script>',
            '</div><script src="blocks/components/project_details/type_1/project_details_behavior_t1.js"></script>',
            $html
        );

        // Add component metadata and dynamic marker for dynamic loading
        $metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
        
        $html = str_replace(
            'data-nav-handler="handleProjectDetailsNavigation"',
            'data-nav-handler="handleProjectDetailsNavigation" data-dynamic="true" data-init-hook="initializeProjectDetailsComponent" data-component-metadata="' . $metadataJson . '"',
            $html
        );

        return $html;
    }

    /**
     * Generate content for dynamic loading
     */
    private function generateContent($html, $projectData, $id) {
        error_log("Project Details PHP: Generating content with data keys: " . implode(', ', array_keys($projectData)));
        
        // Handle multiple projects data structure
        if (isset($projectData['projects']) && isset($projectData['defaultProject'])) {
            // Check for URL parameter to determine which project to show
            $selectedProject = $projectData['defaultProject']; // Default fallback
            
            // Check if there's a project parameter in the URL
            if (isset($_GET['project'])) {
                $requestedProject = urldecode($_GET['project']);
                error_log("Project Details PHP: Requested project from URL: " . $requestedProject);
                if (isset($projectData['projects'][$requestedProject])) {
                    $selectedProject = $requestedProject;
                }
            }
            
            $projectsData = $projectData['projects'];
            
            if (isset($projectsData[$selectedProject])) {
                $projectData = $projectsData[$selectedProject];
                error_log("Project Details PHP: Using project data for: " . $selectedProject);
            } else {
                error_log("Project Details PHP: Selected project not found, using first available project");
                $projectData = reset($projectsData);
            }
        }
        
        // Populate data into HTML
        if (!empty($projectData)) {
            // Update banner image
            if (isset($projectData['bannerImage'])) {
                $html = str_replace('src=""', 'src="' . htmlspecialchars($projectData['bannerImage']) . '"', $html);
                $html = str_replace('alt=""', 'alt="' . htmlspecialchars($projectData['title'] ?? 'Project Banner') . '"', $html);
            }

            // Update title
            if (isset($projectData['title'])) {
                $html = str_replace('<h1 class="project-details__title" id="project-title"></h1>', 
                    '<h1 class="project-details__title" id="project-title">' . htmlspecialchars($projectData['title']) . '</h1>', $html);
            }

            // Update meta information
            if (isset($projectData['category'])) {
                $html = str_replace('<span class="project-details__category" id="project-category"></span>',
                    '<span class="project-details__category" id="project-category">' . htmlspecialchars($projectData['category']) . '</span>', $html);
            }

            if (isset($projectData['status'])) {
                $html = str_replace('<span class="project-details__status" id="project-status"></span>',
                    '<span class="project-details__status" id="project-status">' . htmlspecialchars($projectData['status']) . '</span>', $html);
            }

            if (isset($projectData['year'])) {
                $html = str_replace('<span class="project-details__year" id="project-year"></span>',
                    '<span class="project-details__year" id="project-year">' . htmlspecialchars($projectData['year']) . '</span>', $html);
            }

            // Update description
            if (isset($projectData['description'])) {
                $html = str_replace('<div class="project-details__description" id="project-description"></div>',
                    '<div class="project-details__description" id="project-description"><p>' . nl2br(htmlspecialchars($projectData['description'])) . '</p></div>', $html);
            }

            // Update technologies
            if (isset($projectData['technologies']) && is_array($projectData['technologies'])) {
                $techHtml = '';
                foreach ($projectData['technologies'] as $tech) {
                    $techHtml .= '<span class="project-details__tech-tag">' . htmlspecialchars($tech) . '</span>';
                }
                $html = str_replace('<div class="project-details__technologies" id="project-technologies"></div>',
                    '<div class="project-details__technologies" id="project-technologies">' . $techHtml . '</div>', $html);
            }

            // Update Features section
            if (isset($projectData['features']) && is_array($projectData['features'])) {
                $featuresHtml = '<ul class="project-details__feature-list">';
                foreach ($projectData['features'] as $feature) {
                    $featuresHtml .= '<li class="project-details__feature-item">' . htmlspecialchars($feature) . '</li>';
                }
                $featuresHtml .= '</ul>';
                $html = str_replace('<div class="project-details__features" id="project-features">',
                    '<div class="project-details__features" id="project-features">' . $featuresHtml, $html);
                $html = str_replace('<!-- Features will be loaded here -->', '', $html);
            }



            // Update project links
            if (isset($projectData['demoLink'])) {
                $html = str_replace('<a href="#" class="project-details__link" id="project-demo-link">',
                    '<a href="' . htmlspecialchars($projectData['demoLink']) . '" class="project-details__link" id="project-demo-link" target="_blank">', $html);
            }

            if (isset($projectData['repoLink'])) {
                $html = str_replace('<a href="#" class="project-details__link" id="project-repo-link">',
                    '<a href="' . htmlspecialchars($projectData['repoLink']) . '" class="project-details__link" id="project-repo-link" target="_blank">', $html);
            }
        }

        // Check if component is secured (from navigation config or component metadata)
        $isSecured = false; // For now, project details are not secured

        // Wrap content with security metadata wrapper
        $wrappedContent = '<div data-component-wrapper="true" data-secured="' . ($isSecured ? 'true' : 'false') . '" data-component-id="' . htmlspecialchars($id) . '">' . $html . '</div>';

        return $wrappedContent;
    }


}
?>
