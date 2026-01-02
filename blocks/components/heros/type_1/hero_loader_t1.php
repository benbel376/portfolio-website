<?php

class HeroLoaderT1 {
    public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
        $navConfig = $this->processNavigationConfig($navigationConfig);
        $data = $componentMetadata['componentData'] ?? [];

        $name = $data['name'] ?? '';
        $headline = $data['title'] ?? $title;
        $description = $data['description'] ?? '';
        $image = $data['image'] ?? 'definitions/media/profile/avatar.png';
        $backdrop = $data['backdrop'] ?? [
            'light' => 'definitions/media/backgrounds/hero_backdrop_light.png',
            'dark' => 'definitions/media/backgrounds/hero_backdrop_dark.png'
        ];
        $social = $data['social'] ?? [];
        $cvDownload = $data['cvDownload'] ?? [];

        switch ($loadingMode) {
            case 'full':
            default:
                return $this->generateFullComponent($id, $navConfig, $name, $headline, $description, $image, $backdrop, $social, $cvDownload);
        }
    }

    private function generateFullComponent($id, $navConfig, $name, $headline, $description, $image, $backdrop, $social, $cvDownload) {
        $template = file_get_contents(__DIR__ . '/hero_structure_t1.html');
        
        // Generate web-relative paths that work on any deployment
        $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        $imagePath = $image;
        $backdropLight = $backdrop['light'] ?? 'definitions/media/backgrounds/hero_backdrop_light.png';
        $backdropDark = $backdrop['dark'] ?? 'definitions/media/backgrounds/hero_backdrop_dark.png';
        
        // Ensure paths are web-relative
        if (!empty($basePath) && $basePath !== '/') {
            $backdropLightUrl = $basePath . '/' . ltrim($backdropLight, '/');
            $backdropDarkUrl = $basePath . '/' . ltrim($backdropDark, '/');
        } else {
            $backdropLightUrl = '/' . ltrim($backdropLight, '/');
            $backdropDarkUrl = '/' . ltrim($backdropDark, '/');
        }
        
        $html = $this->fillTemplate($template, $name, $headline, $description, $imagePath, $social, $cvDownload);

        // Inject ID and nav config/handler
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        $html = preg_replace(
            '/<section\\s+class=\\"hero-component hero-profile\\"\\s+data-nav-handler=\\"handleHeroNavigation\\"\\s*>/i',
            '<section class="hero-component hero-profile ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleHeroNavigation" data-nav-config="' . $navConfigJson . '">',
            $html,
            1
        );

        // Inject background images with proper web-relative URLs
        $backgroundStyles = '<style>';
        $backgroundStyles .= '#' . htmlspecialchars($id) . '::before {';
        $backgroundStyles .= 'background-image: url("' . htmlspecialchars($backdropLightUrl) . '") !important;';
        $backgroundStyles .= '}';
        $backgroundStyles .= '.theme-dark #' . htmlspecialchars($id) . '::before {';
        $backgroundStyles .= 'background-image: url("' . htmlspecialchars($backdropDarkUrl) . '") !important;';
        $backgroundStyles .= '}';
        $backgroundStyles .= '</style>';
        
        // Inject the style tag right before the closing section tag
        $lastSectionPos = strrpos($html, '</section>');
        if ($lastSectionPos !== false) {
            $html = substr_replace($html, $backgroundStyles . '</section>', $lastSectionPos, 10);
        }

        return $html;
    }

    private function fillTemplate($template, $name, $headline, $description, $image, $social, $cvDownload) {
        // Generate web-relative path for avatar image
        $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        if (!empty($basePath) && $basePath !== '/') {
            $imageUrl = $basePath . '/' . ltrim($image, '/');
        } else {
            $imageUrl = '/' . ltrim($image, '/');
        }
        
        // Generate web-relative path for CV download
        $cvHref = $cvDownload['href'] ?? '#';
        if ($cvHref !== '#' && !preg_match('/^https?:\/\//', $cvHref)) {
            if (!empty($basePath) && $basePath !== '/') {
                $cvUrl = $basePath . '/' . ltrim($cvHref, '/');
            } else {
                $cvUrl = '/' . ltrim($cvHref, '/');
            }
        } else {
            $cvUrl = $cvHref; // Keep external URLs or # as-is
        }
        
        $html = str_replace('<!-- NAME_PLACEHOLDER -->', htmlspecialchars($name), $template);
        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($headline), $html);
        $html = str_replace('<!-- DESCRIPTION_PLACEHOLDER -->', nl2br(htmlspecialchars($description)), $html);
        $html = str_replace('<!-- IMAGE_SRC_PLACEHOLDER -->', htmlspecialchars($imageUrl), $html);
        $html = str_replace('<!-- SOCIAL_PLACEHOLDER -->', $this->renderSocial($social), $html);
        $html = str_replace('<!-- CV_DOWNLOAD_HREF -->', htmlspecialchars($cvUrl), $html);
        $html = str_replace('<!-- CV_DOWNLOAD_FILENAME -->', htmlspecialchars($cvDownload['filename'] ?? 'CV.pdf'), $html);
        return $html;
    }

    private function renderSocial($social) {
        if (!is_array($social) || empty($social)) return '';
        $iconMap = [
            'email' => 'mail-outline',
            'phone' => 'phone-portrait-outline',
            'linkedin' => 'logo-linkedin',
            'github' => 'logo-github'
        ];
        $out = '';
        foreach ($social as $item) {
            $type = isset($item['type']) ? (string)$item['type'] : '';
            $iconName = isset($iconMap[$type]) ? $iconMap[$type] : 'alert-circle-outline';
            $label = htmlspecialchars($item['label'] ?? '');
            $href = htmlspecialchars($item['href'] ?? '#');
            $target = ($type === 'email' || $type === 'phone') ? '_self' : '_blank';
            $out .= '<a href="' . $href . '" class="hero__icon" target="' . $target . '" aria-label="' . $label . '">'
                 . '<ion-icon name="' . htmlspecialchars($iconName) . '"></ion-icon>'
                 . '<span class="visually-hidden">' . $label . '</span>'
                 . '</a>';
        }
        return $out;
    }

    private function processNavigationConfig($navigationConfig) {
        $defaultConfig = [ 'defaultState' => 'visible', 'allowedStates' => ['visible','hidden'] ];
        $config = array_merge($defaultConfig, $navigationConfig);
        if (!in_array($config['defaultState'], $config['allowedStates'])) $config['defaultState'] = 'visible';
        return $config;
    }
}

?>


