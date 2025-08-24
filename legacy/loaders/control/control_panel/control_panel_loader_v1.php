<?php
// Control Panel Loader - Handles all content rendering for the control panel

$basePath = dirname(dirname(dirname(__FILE__)));
$contentsPath = $basePath . '/contents';

// Get request parameters
$view = isset($_GET['view']) ? $_GET['view'] : 'main';
$page = isset($_GET['page']) ? $_GET['page'] : '';
$component = isset($_GET['component']) ? $_GET['component'] : '';
$filename = isset($_GET['filename']) ? $_GET['filename'] : '';
$field = isset($_GET['field']) ? $_GET['field'] : '';
$index = isset($_GET['index']) ? intval($_GET['index']) : 0;

// Scan contents directory for pages data
function getPages() {
    global $contentsPath;
    $pages = [];
    
    if (is_dir($contentsPath)) {
        $directories = scandir($contentsPath);
        foreach ($directories as $dir) {
            if ($dir !== '.' && $dir !== '..' && is_dir($contentsPath . '/' . $dir)) {
                $pages[$dir] = [];
                
                // Scan for JSON files in the page directory
                $jsonFiles = glob($contentsPath . '/' . $dir . '/*.json');
                foreach ($jsonFiles as $jsonFile) {
                    $pages[$dir][] = basename($jsonFile);
                }
                
                // Also scan subdirectories for JSON files
                $subDirs = glob($contentsPath . '/' . $dir . '/*', GLOB_ONLYDIR);
                foreach ($subDirs as $subDir) {
                    $componentName = basename($subDir);
                    $jsonFiles = glob($subDir . '/*.json');
                    if (!empty($jsonFiles)) {
                        $pages[$dir][$componentName] = [];
                        foreach ($jsonFiles as $jsonFile) {
                            $pages[$dir][$componentName][] = basename($jsonFile);
                        }
                    }
                }
            }
        }
    }
    return $pages;
}

// Render page selector options
function renderPageOptions() {
    $pages = getPages();
    $html = '<option value="">Select a page...</option>';
    foreach ($pages as $page => $components) {
        $html .= '<option value="' . htmlspecialchars($page) . '">' . htmlspecialchars(ucfirst($page)) . '</option>';
    }
    return $html;
}

// Render file list for a page
function renderFileList($page) {
    $pages = getPages();
    
    if (!$page || !isset($pages[$page])) {
        return '<div class="control-error-message">No files available for this page</div>';
    }
    
    $html = '<ul class="control-file-list">';
    
    // Handle direct JSON files in page directory
    if (is_array($pages[$page]) && !empty($pages[$page])) {
        foreach ($pages[$page] as $file) {
            if (is_string($file)) { // Direct JSON file
                $html .= '<li class="control-file-item" data-page="' . htmlspecialchars($page) . '" data-component="" data-file="' . htmlspecialchars($file) . '">';
                $html .= htmlspecialchars($file);
                $html .= '</li>';
            }
        }
    }
    
    // Handle component directories
    foreach ($pages[$page] as $component => $files) {
        if (is_array($files)) {
            $html .= '<li class="control-component-group">';
            $html .= '<div class="control-component-title">' . htmlspecialchars($component) . '</div>';
            $html .= '<ul class="control-file-list">';
            
            foreach ($files as $file) {
                $html .= '<li class="control-file-item" data-page="' . htmlspecialchars($page) . '" data-component="' . htmlspecialchars($component) . '" data-file="' . htmlspecialchars($file) . '">';
                $html .= htmlspecialchars($file);
                $html .= '</li>';
            }
            
            $html .= '</ul></li>';
        }
    }
    
    $html .= '</ul>';
    return $html;
}

// Generate form fields recursively
function generateFormFields($data, $prefix = '') {
    $html = '';
    
    foreach ($data as $key => $value) {
        $fieldName = $prefix ? $prefix . '[' . $key . ']' : $key;
        
        if (is_array($value)) {
            $html .= '<div class="control-field-group">';
            $html .= '<label class="control-field-label">' . htmlspecialchars($key) . '</label>';
            $html .= '<div class="control-array-container" data-field="' . htmlspecialchars($fieldName) . '">';
            
            foreach ($value as $index => $item) {
                $html .= generateArrayItem($fieldName, $item, $index);
            }
            
            $html .= '<button type="button" class="control-array-add" data-field="' . htmlspecialchars($fieldName) . '">';
            $html .= '<ion-icon name="add-outline"></ion-icon> Add Item';
            $html .= '</button>';
            $html .= '</div></div>';
            
        } elseif (is_object($value) || (is_array($value) && !empty($value))) {
            $html .= '<div class="control-field-group">';
            $html .= '<label class="control-field-label">' . htmlspecialchars($key) . '</label>';
            $html .= '<div class="control-array-container">';
            $html .= generateFormFields($value, $fieldName);
            $html .= '</div></div>';
            
        } else {
            $html .= '<div class="control-field-group">';
            $html .= '<label class="control-field-label" for="' . htmlspecialchars($fieldName) . '">' . htmlspecialchars($key) . '</label>';
            $html .= generateInputField($fieldName, $value);
            $html .= '</div>';
        }
    }
    
    return $html;
}

// Generate array item
function generateArrayItem($fieldName, $item, $index) {
    $itemFieldName = $fieldName . '[' . $index . ']';
    
    $html = '<div class="control-array-item" data-index="' . $index . '">';
    $html .= '<div class="control-array-item-header">';
    $html .= '<span class="control-array-item-index">Item ' . ($index + 1) . '</span>';
    $html .= '<button type="button" class="control-array-item-delete" data-field="' . htmlspecialchars($fieldName) . '" data-index="' . $index . '">';
    $html .= '<ion-icon name="trash-outline"></ion-icon> Delete';
    $html .= '</button>';
    $html .= '</div>';
    
    if (is_array($item) || is_object($item)) {
        $html .= generateFormFields($item, $itemFieldName);
    } else {
        $html .= generateInputField($itemFieldName, $item);
    }
    
    $html .= '</div>';
    return $html;
}

// Generate input field
function generateInputField($name, $value) {
    if (is_bool($value)) {
        return '<select name="' . htmlspecialchars($name) . '" class="control-field-input">' .
               '<option value="true"' . ($value === true ? ' selected' : '') . '>true</option>' .
               '<option value="false"' . ($value === false ? ' selected' : '') . '>false</option>' .
               '</select>';
    } elseif (is_string($value) && strlen($value) > 50) {
        return '<textarea name="' . htmlspecialchars($name) . '" class="control-field-textarea">' . htmlspecialchars($value) . '</textarea>';
    } else {
        return '<input type="text" name="' . htmlspecialchars($name) . '" value="' . htmlspecialchars($value) . '" class="control-field-input">';
    }
}

// Render edit form for a file
function renderEditForm($page, $component, $filename) {
    global $contentsPath;
    
    $filePath = $contentsPath . '/' . $page . '/' . $component . '/' . $filename;
    
    if (!file_exists($filePath)) {
        return '<div class="control-error-message">File not found: ' . htmlspecialchars($filename) . '</div>';
    }
    
    $jsonContent = file_get_contents($filePath);
    $data = json_decode($jsonContent, true);
    
    if ($data === null) {
        return '<div class="control-error-message">Invalid JSON in file: ' . htmlspecialchars($filename) . '</div>';
    }
    
    $html = '<div class="control-form-container">';
    $html .= '<div class="control-form-header">';
    $html .= '<h2 class="control-form-title">' . htmlspecialchars($filename) . '</h2>';
    $html .= '<p class="control-form-subtitle">' . htmlspecialchars($page) . ' / ' . htmlspecialchars($component) . '</p>';
    $html .= '</div>';
    
    $html .= '<div id="messageContainer"></div>';
    
    $html .= '<form id="jsonEditForm" data-page="' . htmlspecialchars($page) . '" data-component="' . htmlspecialchars($component) . '" data-filename="' . htmlspecialchars($filename) . '">';
    $html .= generateFormFields($data);
    
    $html .= '<div class="control-form-actions">';
    $html .= '<button type="button" class="control-button control-button-secondary" id="resetFormButton">Reset</button>';
    $html .= '<button type="submit" class="control-button control-button-primary">Save Changes</button>';
    $html .= '</div>';
    
    $html .= '</form>';
    $html .= '</div>';
    
    return $html;
}

// Render new array item
function renderNewArrayItem($fieldName, $index) {
    $itemFieldName = $fieldName . '[' . $index . ']';
    
    $html = '<div class="control-array-item" data-index="' . $index . '">';
    $html .= '<div class="control-array-item-header">';
    $html .= '<span class="control-array-item-index">Item ' . ($index + 1) . '</span>';
    $html .= '<button type="button" class="control-array-item-delete" data-field="' . htmlspecialchars($fieldName) . '" data-index="' . $index . '">';
    $html .= '<ion-icon name="trash-outline"></ion-icon> Delete';
    $html .= '</button>';
    $html .= '</div>';
    
    // Create a simple text input for new items
    $html .= '<input type="text" name="' . htmlspecialchars($itemFieldName) . '" value="" class="control-field-input">';
    
    $html .= '</div>';
    return $html;
}

ob_start();

// Handle different views
switch ($view) {
    case 'check_auth':
        // Return JSON response for authentication check
        header('Content-Type: application/json');
        session_start();
        echo json_encode([
            'authenticated' => isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true
        ]);
        exit;
        break;
        
    case 'page-options':
        echo renderPageOptions();
        break;
        
    case 'file-list':
        echo renderFileList($page);
        break;
        
    case 'edit-form':
        echo renderEditForm($page, $component, $filename);
        break;
        
    case 'array-item':
        echo renderNewArrayItem($field, $index);
        break;
        
    case 'main':
    default:
        // Render main control panel
        $pages = getPages();
        ?>
        <script>
        window.controlPanelData = <?= json_encode($pages) ?>;
        </script>

        <div class="control-panel">
            <aside class="control-sidebar">
                <div class="control-page-selector">
                    <select class="control-page-dropdown" id="pageSelector">
                        <?= renderPageOptions() ?>
                    </select>
                </div>
                
                <div id="fileListContainer">
                    <!-- File list will be populated here -->
                </div>
            </aside>
            
            <main class="control-content">
                <div id="formContainer">
                    <div class="control-empty-state">
                        <div class="control-empty-icon">
                            <ion-icon name="document-text-outline"></ion-icon>
                        </div>
                        <p>Select a page and file to edit</p>
                    </div>
                </div>
            </main>
        </div>
        <?php
        break;
}

$output = ob_get_clean();
echo $output;
?> 