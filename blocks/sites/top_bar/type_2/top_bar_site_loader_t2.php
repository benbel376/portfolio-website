<?php

class TopBarSiteLoader {
    
    public function load($navigationTabs, $title, $pageContent, $defaultNavigation = null) {
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
        
        // Replace page content placeholder
        $html = str_replace('<!-- PAGE_CONTENT_PLACEHOLDER -->', $pageContent, $html);
        
        return $html;
    }
    
    private function generateNavigationTabs($navigationTabs) {
        $tabsHtml = '';
        
        foreach ($navigationTabs as $tab) {
            $label = htmlspecialchars($tab['label']);
            $targetId = htmlspecialchars($tab['target']);
            $state = htmlspecialchars($tab['state'] ?? 'visible');
            $tabId = htmlspecialchars($tab['tabId'] ?? $targetId);
            $isProtected = !empty($tab['protected']);
            
            // Generate clean hash URL - tab highlighting is automatic via data-parent-tab
            // Format: #elementId/state (no tab ID needed)
            $hashUrl = "#{$targetId}/{$state}";
            
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