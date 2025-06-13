<?php

class TopBarSiteLoader {
    
    public function load($navigationTabs, $title, $pageContent) {
        // Load the HTML structure template
        $htmlTemplate = file_get_contents(__DIR__ . '/top_bar_site_structure_t2.html');
        
        // Initialize HTML with template content
        $html = $htmlTemplate;
        
        // Replace title placeholder
        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $html);
        
        // Generate navigation tabs with hash-based navigation
        $navigationHtml = $this->generateNavigationTabs($navigationTabs);
        $html = str_replace('<!-- NAVIGATION_TABS_PLACEHOLDER -->', $navigationHtml, $html);
        
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
            
            // Generate hash URL for navigation
            $hashUrl = "#{$targetId}/{$state}";
            
            // Add parameters if specified
            if (isset($tab['parameters']) && !empty($tab['parameters'])) {
                $paramPairs = [];
                foreach ($tab['parameters'] as $key => $value) {
                    $paramPairs[] = urlencode($key) . '=' . urlencode($value);
                }
                $hashUrl .= '/' . implode('&', $paramPairs);
            }
            
            $tabsHtml .= '<li>';
            $tabsHtml .= '<a href="' . $hashUrl . '" class="nav-link" data-target="' . $targetId . '" data-state="' . $state . '">';
            $tabsHtml .= $label;
            $tabsHtml .= '</a>';
            $tabsHtml .= '</li>' . "\n";
        }
        
        return $tabsHtml;
    }
}

?> 