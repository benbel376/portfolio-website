<?php

class SlideshowLoaderT1 {
	public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
		$nav = $this->mergeNav($navigationConfig);
		$data = $componentMetadata['componentData'] ?? [];
		switch ($loadingMode) {
			case 'shell': return $this->shell($id, $nav, $componentMetadata);
			case 'content': return $this->content($data);
			case 'full':
			default: return $this->full($id, $data, $nav);
		}
	}

	private function full($id, $data, $nav) {
		$template = file_get_contents(__DIR__ . '/slideshow_structure_t1.html');
		$html = $this->fill($template, $id, $data, $nav, false);
		return $html;
	}

	private function shell($id, $nav, $componentMetadata) {
		$template = file_get_contents(__DIR__ . '/slideshow_shell_t1.html');
		$defaultState = $nav['defaultState'] ?? 'visible';
		$stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
		$styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
		$navJson = htmlspecialchars(json_encode($nav), ENT_QUOTES, 'UTF-8');
		$metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
		$protectedAttr = !empty($nav['protected']) ? ' data-protected="true"' : '';

		$html = str_replace('<!--COMPONENT_ID-->', htmlspecialchars($id), $template);
		$html = str_replace('<!--STATE_CLASS-->', $stateClass, $html);
		$html = str_replace('<!--STYLE_ATTR-->', $styleAttr, $html);
		$html = str_replace('<!--NAV_CONFIG_JSON-->', $navJson, $html);
		$html = str_replace('<!--PROTECTED_ATTR-->', $protectedAttr, $html);
		$html = str_replace('<!--METADATA_JSON-->', $metadataJson, $html);
		return $html;
	}

	private function content($data) {
		return $this->renderSlides($data);
	}

	private function fill($template, $id, $data, $nav, $contentOnly) {
		$defaultState = $nav['defaultState'] ?? 'visible';
		$stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
		$styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
		$navJson = htmlspecialchars(json_encode($nav), ENT_QUOTES, 'UTF-8');

		$slides = $this->renderSlides($data);
		$template = str_replace('<!-- SLIDES_PLACEHOLDER -->', $slides, $template);
		$template = str_replace('<section class="slideshow-component"',
			'<section class="slideshow-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleSlideshowNavigation" data-nav-config="' . $navJson . '" data-init-hook="initSlideshow"' . $styleAttr,
			$template);
		return $template;
	}

	private function renderSlides($data) {
		$items = isset($data['slides']) && is_array($data['slides']) ? $data['slides'] : [];
		$out = '';
		foreach ($items as $i => $slide) {
			$type = $slide['type'] ?? 'image';
			$classes = 'slideshow__slide' . ($i === 0 ? ' is-active' : '');
			$out .= '<div class="' . $classes . '">';
			if ($type === 'image') {
				$src = htmlspecialchars((string)($slide['src'] ?? ''), ENT_QUOTES, 'UTF-8');
				$alt = htmlspecialchars((string)($slide['alt'] ?? ''), ENT_QUOTES, 'UTF-8');
				$out .= '<img src="' . $src . '" alt="' . $alt . '">';
			} elseif ($type === 'iframe') {
				$src = htmlspecialchars((string)($slide['src'] ?? ''), ENT_QUOTES, 'UTF-8');
				$out .= '<iframe src="' . $src . '" frameborder="0" loading="lazy" referrerpolicy="no-referrer"></iframe>';
			} elseif ($type === 'svg') {
				$out .= (string)($slide['svg'] ?? '');
			}
			$out .= '</div>';
		}
		// dots are built by JS based on slides count
		return $out;
	}

	private function mergeNav($nav) {
		$def = [
			'defaultState' => 'visible',
			'allowedStates' => ['visible','hidden','scrollTo'],
			'protected' => false
		];
		return array_merge($def, $nav ?? []);
	}
}

?>


