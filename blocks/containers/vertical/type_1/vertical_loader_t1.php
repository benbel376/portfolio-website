<?php

class VerticalLoader {
    
    public function load($id, $childrenHtml = []) {
        // Load the HTML structure template
        $htmlTemplate = file_get_contents(__DIR__ . '/vertical_structure_t1.html');
        
        // Combine all children HTML
        $childrenContent = '';
        foreach ($childrenHtml as $childHtml) {
            $childrenContent .= $childHtml . "\n";
        }
        
        // Replace placeholder with children content
        $html = str_replace('<!-- CHILDREN_PLACEHOLDER -->', $childrenContent, $htmlTemplate);
        
        // Add the unique ID to the container
        $html = str_replace('<div class="vertical-container">', '<div class="vertical-container" id="' . htmlspecialchars($id) . '">', $html);
        
        return $html;
    }
}

?> 