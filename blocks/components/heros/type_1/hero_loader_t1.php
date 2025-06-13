<?php

class HeroLoader {
    
    public function load($id, $title = 'Default Title') {
        // Load the HTML structure template
        $htmlTemplate = file_get_contents(__DIR__ . '/hero_structure_t1.html');
        
        // Replace placeholders with actual data
        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $htmlTemplate);
        
        // Add the unique ID to the component
        $html = str_replace('<header class="header-component">', '<header class="header-component" id="' . htmlspecialchars($id) . '">', $html);
        
        return $html;
    }
}

?> 