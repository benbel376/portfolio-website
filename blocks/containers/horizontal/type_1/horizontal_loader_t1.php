<?php

class HorizontalLoaderT1 {
	public function load($id, $childrenHtml = [], $navigationConfig = []) {
		$template = file_get_contents(__DIR__ . '/horizontal_container_structure_t1.html');
		$children = '';
		foreach ($childrenHtml as $child) { $children .= $child . "\n"; }
		$html = str_replace('<!-- CHILDREN_PLACEHOLDER -->', $children, $template);

		$navConfig = $this->processNavigationConfig($navigationConfig);
		$attributes = 'data-nav-handler="handleHorizontalContainerNavigation"';
		if (!empty($navConfig['protected'])) { $attributes .= ' data-protected="true"'; }
		if (!empty($navConfig)) {
			$navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');
			$attributes .= ' data-nav-config="' . $navConfigJson . '"';
		}
		$html = str_replace('<div class="horizontal-container" data-nav-handler="handleHorizontalContainerNavigation">',
			'<div class="horizontal-container" id="' . htmlspecialchars($id) . '" ' . $attributes . '>',
			$html);

		$defaultState = $navConfig['defaultState'] ?? 'visible';
		if ($defaultState === 'hidden') {
			$html = str_replace('class="horizontal-container"', 'class="horizontal-container nav-hidden" style="display: none;"', $html);
		} else {
			$html = str_replace('class="horizontal-container"', 'class="horizontal-container nav-visible"', $html);
		}

		$html .= '\n<link rel="stylesheet" href="blocks/containers/horizontal/type_1/horizontal_container_style_t1.css">';
		$html .= '\n<script src="blocks/containers/horizontal/type_1/horizontal_container_behavior_t1.js" type="module"></script>';
		return $html;
	}

	private function processNavigationConfig($navigationConfig) {
		$defaultConfig = [
			'defaultState' => 'visible',
			'allowedStates' => ['visible', 'hidden'],
			'protected' => false,
			'initialParameters' => []
		];
		$config = array_merge($defaultConfig, $navigationConfig);
		if (!in_array($config['defaultState'], $config['allowedStates'])) { $config['defaultState'] = 'visible'; }
		return $config;
	}
}

?>


