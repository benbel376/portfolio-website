<?php

class SideBarSiteLoader {
    
    public function load($navigationTabs, $title, $pageContent, $defaultNavigation = null, $backgrounds = null, $theme = null, $branding = null) {
        // Load the HTML structure template
        $htmlTemplate = file_get_contents(__DIR__ . '/side_bar_site_structure_t1.html');
        $html = $htmlTemplate;
        
        // Replace title placeholders
        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $html);
        $html = str_replace('<!-- SITE_TITLE_PLACEHOLDER -->', htmlspecialchars($branding['title'] ?? $title), $html);
        
        // Replace logo placeholder
        $logo = $branding['logo'] ?? 'definitions/media/profile/avatar.png';
        $html = str_replace('<!-- LOGO_PLACEHOLDER -->', htmlspecialchars($logo), $html);
        
        // Generate navigation tabs with icons for sidebar
        $navigationHtml = $this->generateNavigationTabs($navigationTabs);
        $html = str_replace('<!-- NAVIGATION_TABS_PLACEHOLDER -->', $navigationHtml, $html);
        
        // Add default navigation configuration as data attribute
        if ($defaultNavigation) {
            $defaultNavJson = htmlspecialchars(json_encode($defaultNavigation), ENT_QUOTES, 'UTF-8');
            $html = str_replace('<div class="site-container sidebar-layout">', '<div class="site-container sidebar-layout" data-default-navigation="' . $defaultNavJson . '">', $html);
        }
        
        // Inject background CSS variables from JSON config
        $backgroundStyles = $this->generateBackgroundStyles($backgrounds);
        $html = str_replace('<!-- BACKGROUND_STYLES_PLACEHOLDER -->', $backgroundStyles, $html);
        
        // Inject actual background div for proper full-page coverage
        $backgroundDiv = $this->generateBackgroundDiv($backgrounds);
        
        // Inject background divs INSIDE the site container, right after the opening tag
        $siteContainerPos = strpos($html, '<div class="site-container sidebar-layout"');
        if ($siteContainerPos !== false) {
            $closingTagPos = strpos($html, '>', $siteContainerPos);
            if ($closingTagPos !== false) {
                $html = substr_replace($html, '>' . $backgroundDiv, $closingTagPos, 1);
            }
        }
        
        // Inject theme CSS variables from JSON config
        $themeStyles = $this->generateThemeStyles($theme);
        $html = str_replace('<!-- THEME_OVERRIDE_PLACEHOLDER -->', $themeStyles, $html);
        
        // Replace page content placeholder
        $html = str_replace('<!-- PAGE_CONTENT_PLACEHOLDER -->', $pageContent, $html);
        
        return $html;
    }
    
    private function generateNavigationTabs($navigationTabs) {
        $tabsHtml = '';
        
        // Icon mapping for common tab names
        $iconMap = [
            'about' => 'person-outline',
            'skills' => 'bulb-outline',
            'projects' => 'code-working-outline',
            'experience' => 'briefcase-outline',
            'education' => 'school-outline',
            'admin' => 'settings-outline',
            'contact' => 'mail-outline'
        ];
        
        foreach ($navigationTabs as $tab) {
            $label = htmlspecialchars($tab['label']);
            $targetId = htmlspecialchars($tab['target']);
            $state = htmlspecialchars($tab['state'] ?? 'visible');
            $tabId = htmlspecialchars($tab['tabId'] ?? $targetId);
            $isProtected = !empty($tab['protected']);
            $icon = $tab['icon'] ?? ($iconMap[strtolower($tabId)] ?? 'ellipse-outline');
            
            // Generate minimal hash URL
            $hashUrl = "#{$targetId}";
            if ($state !== 'visible') {
                $hashUrl .= "/{$state}";
            }
            
            $tabsHtml .= '<li>';
            $tabsHtml .= '<a href="' . $hashUrl . '" class="nav-link" data-target="' . $targetId . '" data-state="' . $state . '" data-tab-id="' . $tabId . '"' . ($isProtected ? ' data-protected="true"' : '') . '>';
            $tabsHtml .= '<ion-icon name="' . htmlspecialchars($icon) . '"></ion-icon>';
            $tabsHtml .= '<span>' . $label . '</span>';
            $tabsHtml .= '</a>';
            $tabsHtml .= '</li>' . "\n";
        }
        
        return $tabsHtml;
    }
    
    private function generateBackgroundDiv($backgrounds) {
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
        
        // Generate background div that covers the entire scrollable content in sidebar layout
        // Position it to cover the main-content area which is the scrollable container
        $backgroundDiv = '<div class="site-background-layer" style="';
        $backgroundDiv .= 'position: absolute; top: 0; left: var(--sidebar-width, 280px); right: 0; bottom: 0; z-index: -999; pointer-events: none;';
        $backgroundDiv .= 'background-image: url(' . htmlspecialchars($lightContainer) . ');';
        $backgroundDiv .= 'background-size: cover; background-position: center; background-repeat: no-repeat;';
        $backgroundDiv .= 'opacity: 0.8; width: auto; height: 100%; border-radius: 0 16px 16px 0;';
        $backgroundDiv .= '"></div>';
        
        // Add dark theme background div
        $backgroundDiv .= '<div class="site-background-layer-dark" style="';
        $backgroundDiv .= 'position: absolute; top: 0; left: var(--sidebar-width, 280px); right: 0; bottom: 0; z-index: -999; pointer-events: none;';
        $backgroundDiv .= 'background-image: url(' . htmlspecialchars($darkContainer) . ');';
        $backgroundDiv .= 'background-size: cover; background-position: center; background-repeat: no-repeat;';
        $backgroundDiv .= 'opacity: 0.6; display: none; width: auto; height: 100%; border-radius: 0 16px 16px 0;';
        $backgroundDiv .= '"></div>';
        
        // Add JavaScript for both theme switching and height adjustment
        $backgroundDiv .= '<script>';
        $backgroundDiv .= 'function updateSidebarBackgrounds() {';
        $backgroundDiv .= '  const html = document.documentElement;';
        $backgroundDiv .= '  const isDark = html.classList.contains("theme-dark");';
        $backgroundDiv .= '  const lightBg = document.querySelector(".site-background-layer");';
        $backgroundDiv .= '  const darkBg = document.querySelector(".site-background-layer-dark");';
        $backgroundDiv .= '  const mainContent = document.querySelector(".main-content");';
        $backgroundDiv .= '  const siteContainer = document.querySelector(".site-container.sidebar-layout");';
        $backgroundDiv .= '  ';
        $backgroundDiv .= '  if (lightBg && darkBg) {';
        $backgroundDiv .= '    if (isDark) {';
        $backgroundDiv .= '      lightBg.style.display = "none";';
        $backgroundDiv .= '      darkBg.style.display = "block";';
        $backgroundDiv .= '    } else {';
        $backgroundDiv .= '      lightBg.style.display = "block";';
        $backgroundDiv .= '      darkBg.style.display = "none";';
        $backgroundDiv .= '    }';
        $backgroundDiv .= '    ';
        $backgroundDiv .= '    // Update height to cover all scrollable content';
        $backgroundDiv .= '    if (mainContent) {';
        $backgroundDiv .= '      const contentHeight = Math.max(mainContent.scrollHeight, window.innerHeight);';
        $backgroundDiv .= '      lightBg.style.height = contentHeight + "px";';
        $backgroundDiv .= '      darkBg.style.height = contentHeight + "px";';
        $backgroundDiv .= '    }';
        $backgroundDiv .= '    ';
        $backgroundDiv .= '    // Fix site container background color for themes';
        $backgroundDiv .= '    if (siteContainer) {';
        $backgroundDiv .= '      siteContainer.style.backgroundColor = "var(--bg)";';
        $backgroundDiv .= '    }';
        $backgroundDiv .= '  }';
        $backgroundDiv .= '}';
        $backgroundDiv .= '';
        $backgroundDiv .= '// Initial setup';
        $backgroundDiv .= 'document.addEventListener("DOMContentLoaded", function() {';
        $backgroundDiv .= '  setTimeout(updateSidebarBackgrounds, 100);';
        $backgroundDiv .= '});';
        $backgroundDiv .= '';
        $backgroundDiv .= '// Listen for theme changes';
        $backgroundDiv .= 'const observer = new MutationObserver(function(mutations) {';
        $backgroundDiv .= '  mutations.forEach(function(mutation) {';
        $backgroundDiv .= '    if (mutation.type === "attributes" && mutation.attributeName === "class") {';
        $backgroundDiv .= '      updateSidebarBackgrounds();';
        $backgroundDiv .= '    }';
        $backgroundDiv .= '  });';
        $backgroundDiv .= '});';
        $backgroundDiv .= '';
        $backgroundDiv .= 'observer.observe(document.documentElement, {';
        $backgroundDiv .= '  attributes: true,';
        $backgroundDiv .= '  attributeFilter: ["class"]';
        $backgroundDiv .= '});';
        $backgroundDiv .= '';
        $backgroundDiv .= '// Handle resize and load events';
        $backgroundDiv .= 'window.addEventListener("resize", updateSidebarBackgrounds);';
        $backgroundDiv .= 'window.addEventListener("load", updateSidebarBackgrounds);';
        $backgroundDiv .= '';
        $backgroundDiv .= '// Handle scroll events to update background height dynamically';
        $backgroundDiv .= 'if (document.querySelector(".main-content")) {';
        $backgroundDiv .= '  document.querySelector(".main-content").addEventListener("scroll", function() {';
        $backgroundDiv .= '    setTimeout(updateSidebarBackgrounds, 50);';
        $backgroundDiv .= '  });';
        $backgroundDiv .= '}';
        $backgroundDiv .= '</script>';
        
        return $backgroundDiv;
    }
    
    private function generateBackgroundStyles($backgrounds) {
        $defaults = [
            'light' => [
                'body' => 'definitions/media/backgrounds/general_background_light_v1.png',
                'container' => 'definitions/media/backgrounds/general_background_bubbles_v1.avif',
                'sidebar' => ''
            ],
            'dark' => [
                'body' => 'definitions/media/backgrounds/general_background_dark_v1.png',
                'container' => 'definitions/media/backgrounds/general_background_bubbles_dark_v1.jpg',
                'sidebar' => ''
            ]
        ];
        
        $lightBody = $backgrounds['light']['body'] ?? $defaults['light']['body'];
        $lightContainer = $backgrounds['light']['container'] ?? $defaults['light']['container'];
        $lightSidebar = $backgrounds['light']['sidebar'] ?? $defaults['light']['sidebar'];
        $darkBody = $backgrounds['dark']['body'] ?? $defaults['dark']['body'];
        $darkContainer = $backgrounds['dark']['container'] ?? $defaults['dark']['container'];
        $darkSidebar = $backgrounds['dark']['sidebar'] ?? $defaults['dark']['sidebar'];
        
        $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        
        $style = '<style id="site-background-variables">';
        $style .= ':root {';
        $style .= '--site-bg-light: url("' . $basePath . '/' . htmlspecialchars($lightContainer) . '");';
        $style .= '--body-bg-light: url("' . $basePath . '/' . htmlspecialchars($lightBody) . '");';
        $style .= '--site-bg-dark: url("' . $basePath . '/' . htmlspecialchars($darkContainer) . '");';
        $style .= '--body-bg-dark: url("' . $basePath . '/' . htmlspecialchars($darkBody) . '");';
        if (!empty($lightSidebar)) {
            $style .= '--sidebar-bg-light: url("' . $basePath . '/' . htmlspecialchars($lightSidebar) . '");';
        }
        if (!empty($darkSidebar)) {
            $style .= '--sidebar-bg-dark: url("' . $basePath . '/' . htmlspecialchars($darkSidebar) . '");';
        }
        $style .= '}';
        $style .= '</style>';
        
        return $style;
    }
    
    private function generateThemeStyles($theme) {
        if (empty($theme)) {
            return '';
        }
        
        $style = '<style id="site-theme-variables">';
        
        // Light theme variables
        $style .= ':root {';
        $style .= $this->generateThemeVariables($theme['light'] ?? []);
        $style .= $this->generateSharedVariables($theme['shared'] ?? []);
        $style .= '}';
        
        // Dark theme variables
        $style .= '.theme-dark {';
        $style .= $this->generateThemeVariables($theme['dark'] ?? []);
        $style .= '}';
        
        $style .= '</style>';
        
        return $style;
    }
    
    private function generateThemeVariables($themeConfig) {
        $css = '';
        
        if (!empty($themeConfig['colors'])) {
            foreach ($themeConfig['colors'] as $name => $value) {
                $css .= '--' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        if (!empty($themeConfig['fonts'])) {
            foreach ($themeConfig['fonts'] as $name => $value) {
                $css .= '--font-' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        if (!empty($themeConfig['custom'])) {
            foreach ($themeConfig['custom'] as $name => $value) {
                $css .= '--' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        return $css;
    }
    
    private function generateSharedVariables($sharedConfig) {
        $css = '';
        
        if (!empty($sharedConfig['spacing'])) {
            foreach ($sharedConfig['spacing'] as $name => $value) {
                $css .= '--spacing-' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        if (!empty($sharedConfig['radius'])) {
            foreach ($sharedConfig['radius'] as $name => $value) {
                $css .= '--radius-' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        if (!empty($sharedConfig['text-size'])) {
            foreach ($sharedConfig['text-size'] as $name => $value) {
                $css .= '--text-' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        if (!empty($sharedConfig['custom'])) {
            foreach ($sharedConfig['custom'] as $name => $value) {
                $css .= '--' . htmlspecialchars($name) . ': ' . htmlspecialchars($value) . ';';
            }
        }
        
        return $css;
    }
}

?>
