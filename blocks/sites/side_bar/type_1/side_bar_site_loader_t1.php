<?php

class SideBarSiteLoader {
    
    public function load($navigationTabs, $title, $pageContent, $defaultNavigation = null, $backgrounds = null, $theme = null, $branding = null) {
        $htmlTemplate = file_get_contents(__DIR__ . '/side_bar_site_structure_t1.html');
        $html = $htmlTemplate;
        
        // Replace title placeholders
        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $html);
        $html = str_replace('<!-- SITE_TITLE_PLACEHOLDER -->', htmlspecialchars($branding['title'] ?? $title), $html);
        
        // Replace logo placeholder
        $logo = $branding['logo'] ?? 'definitions/media/profile/avatar.png';
        $html = str_replace('<!-- LOGO_PLACEHOLDER -->', htmlspecialchars($logo), $html);
        
        // Generate navigation tabs
        $navigationHtml = $this->generateNavigationTabs($navigationTabs);
        $html = str_replace('<!-- NAVIGATION_TABS_PLACEHOLDER -->', $navigationHtml, $html);
        
        // Add default navigation config
        if ($defaultNavigation) {
            $defaultNavJson = htmlspecialchars(json_encode($defaultNavigation), ENT_QUOTES, 'UTF-8');
            $html = str_replace('<div class="site-container">', '<div class="site-container" data-default-navigation="' . $defaultNavJson . '">', $html);
        }
        
        // Inject background styles
        $backgroundStyles = $this->generateBackgroundStyles($backgrounds);
        $html = str_replace('<!-- BACKGROUND_STYLES_PLACEHOLDER -->', $backgroundStyles, $html);
        
        // Inject theme styles
        $themeStyles = $this->generateThemeStyles($theme);
        $html = str_replace('<!-- THEME_OVERRIDE_PLACEHOLDER -->', $themeStyles, $html);
        
        // Replace page content
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
            
            // Generate hash URL
            $hashUrl = "#{$targetId}";
            if ($state !== 'visible') {
                $hashUrl .= "/{$state}";
            }
            
            $tabsHtml .= '<li>';
            $tabsHtml .= '<a href="' . $hashUrl . '" class="sidebar-link" data-target="' . $targetId . '" data-state="' . $state . '" data-tab-id="' . $tabId . '"' . ($isProtected ? ' data-protected="true"' : '') . '>';
            $tabsHtml .= '<ion-icon name="' . htmlspecialchars($icon) . '"></ion-icon>';
            $tabsHtml .= '<span>' . $label . '</span>';
            $tabsHtml .= '</a>';
            $tabsHtml .= '</li>' . "\n";
        }
        
        return $tabsHtml;
    }
    
    private function generateBackgroundStyles($backgrounds) {
        $defaults = [
            'light' => ['body' => '', 'container' => ''],
            'dark' => ['body' => '', 'container' => '']
        ];
        
        $lightBody = $backgrounds['light']['body'] ?? $defaults['light']['body'];
        $lightContainer = $backgrounds['light']['container'] ?? $defaults['light']['container'];
        $darkBody = $backgrounds['dark']['body'] ?? $defaults['dark']['body'];
        $darkContainer = $backgrounds['dark']['container'] ?? $defaults['dark']['container'];
        
        $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        
        $style = '<style id="site-background-variables">';
        $style .= ':root {';
        if ($lightContainer) $style .= '--site-bg-light: url("' . $basePath . '/' . htmlspecialchars($lightContainer) . '");';
        if ($lightBody) $style .= '--body-bg-light: url("' . $basePath . '/' . htmlspecialchars($lightBody) . '");';
        if ($darkContainer) $style .= '--site-bg-dark: url("' . $basePath . '/' . htmlspecialchars($darkContainer) . '");';
        if ($darkBody) $style .= '--body-bg-dark: url("' . $basePath . '/' . htmlspecialchars($darkBody) . '");';
        $style .= '}';
        $style .= '</style>';
        
        return $style;
    }
    
    private function generateThemeStyles($theme) {
        if (empty($theme)) return '';
        
        $style = '<style id="site-theme-variables">';
        
        // Light theme
        $style .= ':root {';
        $style .= $this->generateThemeVariables($theme['light'] ?? []);
        $style .= $this->generateSharedVariables($theme['shared'] ?? []);
        $style .= '}';
        
        // Dark theme
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
        
        return $css;
    }
}

?>
