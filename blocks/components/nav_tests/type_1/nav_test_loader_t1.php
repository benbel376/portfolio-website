<?php

class NavTestLoader {
    public function load($id, $title = 'Navigation Test', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        // Process config
        $navConfig = $this->processNavigationConfig($navigationConfig);

        // Always render full HTML for test component; dynamic shell not required
        $template = file_get_contents(__DIR__ . '/nav_test_structure_t1.html');

        // Replace title
        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($title), $template);

        // Prepare attrs
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        // Data attributes for test targets populated from component metadata.componentData
        $sameTarget = $componentMetadata['componentData']['sameTarget'] ?? 'summary-placeholder';
        $sameState = $componentMetadata['componentData']['sameState'] ?? 'visible';
        $sameTab = $componentMetadata['componentData']['sameTab'] ?? 'about';
        $crossContainer = $componentMetadata['componentData']['crossContainer'] ?? 'skills-main-container';
        $crossTarget = $componentMetadata['componentData']['crossTarget'] ?? 'skills-frontend-placeholder';
        $crossState = $componentMetadata['componentData']['crossState'] ?? 'scrollTo';
        $crossTab = $componentMetadata['componentData']['crossTab'] ?? 'skills';
        $html = str_replace('id="NAV_TEST_ROOT"', 'id="' . htmlspecialchars($id) . '"', $html);
        $html = str_replace('data-nav-config="{}"', 'data-nav-config="' . $navConfigJson . '"', $html);
        $html = str_replace('class="nav-test ' . '"', 'class="nav-test ' . $stateClass . '"', $html);
        $html = str_replace('data-same-target="summary-placeholder"', 'data-same-target="' . htmlspecialchars($sameTarget) . '"', $html);
        $html = str_replace('data-same-state="visible"', 'data-same-state="' . htmlspecialchars($sameState) . '"', $html);
        $html = str_replace('data-same-tab="about"', 'data-same-tab="' . htmlspecialchars($sameTab) . '"', $html);
        $html = str_replace('data-cross-container="skills-main-container"', 'data-cross-container="' . htmlspecialchars($crossContainer) . '"', $html);
        $html = str_replace('data-cross-target="skills-frontend-placeholder"', 'data-cross-target="' . htmlspecialchars($crossTarget) . '"', $html);
        $html = str_replace('data-cross-state="scrollTo"', 'data-cross-state="' . htmlspecialchars($crossState) . '"', $html);
        $html = str_replace('data-cross-tab="skills"', 'data-cross-tab="' . htmlspecialchars($crossTab) . '"', $html);

        return $html;
    }

    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [
            'defaultState' => 'visible',
            'allowedStates' => ['visible', 'hidden', 'scrollTo']
        ];
        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) {
            $config['defaultState'] = 'visible';
        }
        return $config;
    }
}

?>


