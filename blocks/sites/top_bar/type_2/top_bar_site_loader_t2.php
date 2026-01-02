<?php

class TopBarSiteLoader {
    
    public function load($navigationTabs, $title, $pageContent, $defaultNavigation = null, $backgrounds = null, $theme = null) {
        // DEBUG: Log what we received
        error_log("SITE LOADER DEBUG: backgrounds = " . json_encode($backgrounds));
        error_log("SITE LOADER DEBUG: theme = " . json_encode($theme));
        
        // Load the HTML structure template
        $htmlTemplate = file_get_contents(__DIR__ . '/top_bar_site_structure_t2.html');
        
        // Initialize HTML with template content
        $html = $htmlTemplate;
        
        // Replace title placeholder
        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $html);
        
        // Generate navigation tabs with hash-based navigation
        $navigationHtml = $this->generateNavigationTabs($navigationTabs);
        $html = str_replace('<!-- NAVIGATION_TABS_PLACEHOLDER -->', $navigationHtml, $html);
        
        // Add default navigation configuration as data attribute
        if ($defaultNavigation) {
            $defaultNavJson = htmlspecialchars(json_encode($defaultNavigation), ENT_QUOTES, 'UTF-8');
            $html = str_replace('<div class="site-container">', '<div class="site-container" data-default-navigation="' . $defaultNavJson . '">', $html);
        }
        
        // Inject background CSS variables from JSON config (in head)
        $backgroundStyles = $this->generateBackgroundStyles($backgrounds);
        $html = str_replace('<!-- BACKGROUND_STYLES_PLACEHOLDER -->', $backgroundStyles, $html);
        
        // Inject actual background div for proper full-page coverage
        $backgroundDiv = $this->generateBackgroundDiv($backgrounds);
        
        // Inject background divs INSIDE the site container, right after the opening tag
        $siteContainerPos = strpos($html, '<div class="site-container"');
        if ($siteContainerPos !== false) {
            $closingTagPos = strpos($html, '>', $siteContainerPos);
            if ($closingTagPos !== false) {
                $html = substr_replace($html, '>' . $backgroundDiv, $closingTagPos, 1);
            }
        }
        
        // Inject theme CSS variables from JSON config (at end of body to override @import CSS)
        $themeStyles = $this->generateThemeStyles($theme);
        $html = str_replace('<!-- THEME_OVERRIDE_PLACEHOLDER -->', $themeStyles, $html);
        
        // Replace page content placeholder
        $html = str_replace('<!-- PAGE_CONTENT_PLACEHOLDER -->', $pageContent, $html);
        
        return $html;
    }
    
    private function generateBackgroundDiv($backgrounds) {
        // Default backgrounds (fallbacks) - used when JSON doesn't specify
        $defaults = [
            'light' => [
                'body' => 'definitions/media/backgrounds/general_background_light_v1.png',
                'container' => 'definitions/media/backgrounds/general_background_bubbles_v1.avif'
            ],
            'dark' => [
                'body' => 'definitions/media/backgrounds/general_background_dark_v1.png',
                'container' => 'definitions/media/backgrounds/general_background_bubbles_dark_v1.jpg'
            ]
        ];
        
        // Merge with provided backgrounds
        $lightContainer = $backgrounds['light']['container'] ?? $defaults['light']['container'];
        $darkContainer = $backgrounds['dark']['container'] ?? $defaults['dark']['container'];
        
        // Generate background div that covers the entire scrollable content
        // Use CSS variables for theme-aware backgrounds
        $backgroundDiv = '<div class="site-background-layer" style="';
        $backgroundDiv .= 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: -999; pointer-events: none;';
        $backgroundDiv .= 'background-image: var(--site-container-bg-image, url(' . htmlspecialchars($lightContainer) . '));';
        $backgroundDiv .= 'background-size: cover; background-position: center; background-repeat: no-repeat;';
        $backgroundDiv .= 'opacity: 0.8; min-height: 100%; width: 100%; border-radius: 22px;';
        $backgroundDiv .= '"></div>';
        
        // Add JavaScript for height adjustment only (theme switching now handled by CSS)
        $backgroundDiv .= '<script>';
        $backgroundDiv .= 'function updateTopBarBackgrounds() {';
        $backgroundDiv .= '  const siteContainer = document.querySelector(".site-container");';
        $backgroundDiv .= '  const backgroundLayer = document.querySelector(".site-background-layer");';
        $backgroundDiv .= '  ';
        $backgroundDiv .= '  if (backgroundLayer && siteContainer) {';
        $backgroundDiv .= '    // Update height to cover all content';
        $backgroundDiv .= '    const contentHeight = Math.max(siteContainer.scrollHeight, window.innerHeight);';
        $backgroundDiv .= '    backgroundLayer.style.height = contentHeight + "px";';
        $backgroundDiv .= '    ';
        $backgroundDiv .= '    // Ensure site container background color matches theme';
        $backgroundDiv .= '    siteContainer.style.backgroundColor = "var(--bg)";';
        $backgroundDiv .= '  }';
        $backgroundDiv .= '}';
        $backgroundDiv .= '';
        $backgroundDiv .= '// Initial setup';
        $backgroundDiv .= 'document.addEventListener("DOMContentLoaded", function() {';
        $backgroundDiv .= '  setTimeout(updateTopBarBackgrounds, 100);';
        $backgroundDiv .= '});';
        $backgroundDiv .= '';
        $backgroundDiv .= '// Handle resize and load events';
        $backgroundDiv .= 'window.addEventListener("resize", updateTopBarBackgrounds);';
        $backgroundDiv .= 'window.addEventListener("load", updateTopBarBackgrounds);';
        $backgroundDiv .= '</script>';
        
        return $backgroundDiv;
    }
    
    private function generateBackgroundStyles($backgrounds) {
        // Default backgrounds (fallbacks) - used when JSON doesn't specify
        $defaults = [
            'light' => [
                'body' => 'definitions/media/backgrounds/general_background_light_v1.png',
                'container' => 'definitions/media/backgrounds/general_background_bubbles_v1.avif'
            ],
            'dark' => [
                'body' => 'definitions/media/backgrounds/general_background_dark_v1.png',
                'container' => 'definitions/media/backgrounds/general_background_bubbles_dark_v1.jpg'
            ]
        ];
        
        // Merge with provided backgrounds
        $lightBody = $backgrounds['light']['body'] ?? $defaults['light']['body'];
        $lightContainer = $backgrounds['light']['container'] ?? $defaults['light']['container'];
        $darkBody = $backgrounds['dark']['body'] ?? $defaults['dark']['body'];
        $darkContainer = $backgrounds['dark']['container'] ?? $defaults['dark']['container'];
        
        // Generate inline style tag with CSS variables
        // These variable names match what the CSS expects
        // Use absolute path from web root for reliability
        $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        
        $style = '<style id="site-background-variables">';
        $style .= ':root {';
        $style .= '--site-bg-light: url("' . $basePath . '/' . htmlspecialchars($lightContainer) . '");';
        $style .= '--body-bg-light: url("' . $basePath . '/' . htmlspecialchars($lightBody) . '");';
        $style .= '--site-bg-dark: url("' . $basePath . '/' . htmlspecialchars($darkContainer) . '");';
        $style .= '--body-bg-dark: url("' . $basePath . '/' . htmlspecialchars($darkBody) . '");';
        $style .= '--site-container-bg-image: var(--site-bg-light);';
        $style .= '--body-bg-image: var(--body-bg-light);';
        $style .= '}';
        $style .= '.theme-dark {';
        $style .= '--site-container-bg-image: var(--site-bg-dark);';
        $style .= '--body-bg-image: var(--body-bg-dark);';
        $style .= '}';
        $style .= '</style>';
        
        return $style;
    }
    
    private function generateThemeStyles($theme) {
        if (empty($theme)) {
            return '';
        }
        
        $style = '<style id="site-theme-variables">';
        
        // Light theme variables (in :root)
        $style .= ':root {';
        $style .= $this->generateThemeVariables($theme['light'] ?? [], 'light');
        $style .= $this->generateSharedVariables($theme['shared'] ?? []);
        $style .= '}';
        
        // Dark theme variables (in .theme-dark)
        $style .= '.theme-dark {';
        $style .= $this->generateThemeVariables($theme['dark'] ?? [], 'dark');
        $style .= '}';
        
        $style .= '</style>';
        
        return $style;
    }
    
    private function generateThemeVariables($themeConfig, $mode) {
        $css = '';
        
        // Colors
        if (!empty($themeConfig['colors'])) {
            foreach ($themeConfig['colors'] as $name => $value) {
                $css .= '--' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        // Fonts
        if (!empty($themeConfig['fonts'])) {
            foreach ($themeConfig['fonts'] as $name => $value) {
                $css .= '--font-' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        // Custom variables (extensible - any variable can be added here)
        if (!empty($themeConfig['custom'])) {
            foreach ($themeConfig['custom'] as $name => $value) {
                $css .= '--' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        return $css;
    }
    
    private function generateSharedVariables($sharedConfig) {
        $css = '';
        
        // Spacing
        if (!empty($sharedConfig['spacing'])) {
            foreach ($sharedConfig['spacing'] as $name => $value) {
                $css .= '--spacing-' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        // Border radius
        if (!empty($sharedConfig['radius'])) {
            foreach ($sharedConfig['radius'] as $name => $value) {
                $css .= '--radius-' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        // Text sizes
        if (!empty($sharedConfig['text-size'])) {
            foreach ($sharedConfig['text-size'] as $name => $value) {
                $css .= '--text-' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        // Custom shared variables (extensible)
        if (!empty($sharedConfig['custom'])) {
            foreach ($sharedConfig['custom'] as $name => $value) {
                $css .= '--' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        return $css;
    }
    
    private function generateNavigationTabs($navigationTabs) {
        $tabsHtml = '';
        
        foreach ($navigationTabs as $tab) {
            $label = htmlspecialchars($tab['label']);
            $targetId = htmlspecialchars($tab['target']);
            $state = htmlspecialchars($tab['state'] ?? 'visible');
            $tabId = htmlspecialchars($tab['tabId'] ?? $targetId);
            $isProtected = !empty($tab['protected']);
            
            // Generate minimal hash URL - only include state if NOT the default (visible)
            // Format: #elementId (default state) or #elementId/customState (non-default)
            $hashUrl = "#{$targetId}";
            if ($state !== 'visible') {
                $hashUrl .= "/{$state}";
            }
            
            // Add children to hash URL if specified (only if non-default state)
            if (!empty($tab['children']) && is_array($tab['children'])) {
                foreach ($tab['children'] as $child) {
                    $childTarget = htmlspecialchars($child['target']);
                    $childState = htmlspecialchars($child['state'] ?? 'visible');
                    // Only add child to URL if it has a non-default state
                    if ($childState !== 'visible') {
                        $hashUrl .= "|{$childTarget}/{$childState}";
                    }
                }
            }
            
            $tabsHtml .= '<li>';
            $tabsHtml .= '<a href="' . $hashUrl . '" class="nav-link" data-target="' . $targetId . '" data-state="' . $state . '" data-tab-id="' . $tabId . '"' . ($isProtected ? ' data-protected="true"' : '') . '>';
            $tabsHtml .= $label;
            $tabsHtml .= '</a>';
            $tabsHtml .= '</li>' . "\n";
        }
        
        return $tabsHtml;
    }
}

?> 