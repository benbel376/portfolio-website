<?php

class SkillsCapabilitiesLoaderT1 {
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
		$template = file_get_contents(__DIR__ . '/skills_capabilities_structure_t1.html');
		$html = $this->fill($template, $id, $data, $nav, false);
		return $html;
	}

	private function shell($id, $nav, $componentMetadata) {
		$template = file_get_contents(__DIR__ . '/skills_capabilities_shell_t1.html');
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
		return $this->renderList($data);
	}

	private function fill($template, $id, $data, $nav, $contentOnly) {
		$defaultState = $nav['defaultState'] ?? 'visible';
		$stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
		$styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
		$navJson = htmlspecialchars(json_encode($nav), ENT_QUOTES, 'UTF-8');

		$list = $this->renderList($data);
		$template = str_replace('<!-- LIST_ITEMS_PLACEHOLDER -->', $list, $template);
		$template = str_replace('<section class="skills-capabilities"',
			'<section class="skills-capabilities ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleSkillsCapabilitiesNavigation" data-nav-config="' . $navJson . '" data-init-hook="initSkillsCapabilities"' . $styleAttr,
			$template);
		return $template;
	}

	private function renderList($data) {
		$items = isset($data['items']) && is_array($data['items']) ? $data['items'] : [];
		$out = '';
		foreach ($items as $it) {
			$title = (string)($it['title'] ?? '');
			$description = (string)($it['description'] ?? ($it['summary'] ?? ''));
			$link = isset($it['link']) && is_array($it['link']) ? $it['link'] : null;

			$safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
			$safeDesc = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
			$safeLink = htmlspecialchars(json_encode($link), ENT_QUOTES, 'UTF-8');

			$out .= '<li class="skills-capabilities__item" tabindex="0" data-title="' . $safeTitle . '" data-description="' . $safeDesc . '" data-link="' . $safeLink . '">';
			$out .= '<span class="cap__label">' . htmlspecialchars($title) . '</span>';
			$out .= '</li>';
		}
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


