<?php

class TopBarSiteLoader {
    
    public function load($navigationTabs, $title = 'Portfolio') {
        // Load the HTML structure template
        $htmlTemplate = file_get_contents(__DIR__ . '/top_bar_site_structure_t1.html');
        
        // Generate navigation links from provided tabs data
        $navLinks = $this->generateNavLinks($navigationTabs);
        
        // Replace placeholders in HTML
        $html = str_replace(
            '<!-- to be filled dynamically <li><a href="#profile">Profile</a></li> -->',
            $navLinks,
            $htmlTemplate
        );
        
        // Update title
        $html = str_replace(
            '<title>Portfolio</title>',
            '<title>' . htmlspecialchars($title) . '</title>',
            $html
        );
        
        // Leave page content placeholder empty - will be filled by page loaders later
        // <!-- to be filled dynamically with pages--> remains as is
        
        return $html;
    }
    
    private function generateNavLinks($tabs) {
        $navLinks = '';
        
        foreach ($tabs as $tab) {
            $activeClass = isset($tab['active']) && $tab['active'] ? ' class="active"' : '';
            $navLinks .= '<li><a href="#' . htmlspecialchars($tab['id']) . '"' . $activeClass . '>' . 
                         htmlspecialchars($tab['label']) . '</a></li>' . "\n    ";
        }
        
        return $navLinks;
    }
}

?>
