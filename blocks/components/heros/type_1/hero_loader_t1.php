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
        
        // Process image paths - add base path for relative URLs
        $basePath = '/website/react/portfolio3/portfolio-website/';
        
        $imagePath = $image;
        if (strpos($imagePath, '/') !== 0 && strpos($imagePath, 'http') !== 0) {
            $imagePath = $basePath . $imagePath;
        }
        
        $backdropLight = $backdrop['light'] ?? 'definitions/media/backgrounds/hero_backdrop_light.png';
        $backdropDark = $backdrop['dark'] ?? 'definitions/media/backgrounds/hero_backdrop_dark.png';
        
        if (strpos($backdropLight, '/') !== 0 && strpos($backdropLight, 'http') !== 0) {
            $backdropLight = $basePath . $backdropLight;
        }
        if (strpos($backdropDark, '/') !== 0 && strpos($backdropDark, 'http') !== 0) {
            $backdropDark = $basePath . $backdropDark;
        }
        
        $html = $this->fillTemplate($template, $name, $headline, $description, $imagePath, $social, $cvDownload);

        // Inject ID and nav config/handler
        $defaultState = $navConfig['defaultState'] ?? 'visible';
        $stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
        $navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

        $html = preg_replace(
            '/<section\\s+class=\\"hero hero-profile\\"\\s+data-nav-handler=\\"handleHeroNavigation\\"\\s*>/i',
            '<section class="hero hero-profile ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleHeroNavigation" data-nav-config="' . $navConfigJson . '">',
            $html,
            1
        );

        // Provide CSS variables for images on the element style (from JSON data)
        $cssVars = '--hero-backdrop-light: url(' . htmlspecialchars($backdropLight, ENT_QUOTES, 'UTF-8') . ');'
                 . ' --hero-backdrop-dark: url(' . htmlspecialchars($backdropDark, ENT_QUOTES, 'UTF-8') . ');'
                 . ' --avatar-image-light: url(' . htmlspecialchars($imagePath, ENT_QUOTES, 'UTF-8') . ');'
                 . ' --avatar-image-dark: url(' . htmlspecialchars($imagePath, ENT_QUOTES, 'UTF-8') . ');';
        $html = preg_replace('/<section([^>]*)>/i', '<section$1 style="' . $cssVars . '">', $html, 1);

        return $html;
    }

    private function fillTemplate($template, $name, $headline, $description, $image, $social, $cvDownload) {
        $html = str_replace('<!-- NAME_PLACEHOLDER -->', htmlspecialchars($name), $template);
        $html = str_replace('<!-- TITLE_PLACEHOLDER -->', htmlspecialchars($headline), $html);
        $html = str_replace('<!-- DESCRIPTION_PLACEHOLDER -->', nl2br(htmlspecialchars($description)), $html);
        $html = str_replace('<!-- IMAGE_SRC_PLACEHOLDER -->', htmlspecialchars($image), $html);
        $html = str_replace('<!-- SOCIAL_PLACEHOLDER -->', $this->renderSocial($social), $html);
        $html = str_replace('<!-- CV_DOWNLOAD_HREF -->', htmlspecialchars($cvDownload['href'] ?? '#'), $html);
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


