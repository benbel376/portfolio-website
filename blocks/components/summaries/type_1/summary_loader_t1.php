<?php

class SummaryLoaderT1 {
	public function load($id, $title = '', $navigationConfig = [], $loadingMode = 'full', $componentMetadata = []) {
		$navConfig = $this->processNavigationConfig($navigationConfig);
		$componentData = $componentMetadata['componentData'] ?? [];

		switch ($loadingMode) {
			case 'shell':
				return $this->generateShell($id, $navConfig, $componentMetadata);
			case 'content':
				return $this->generateContent($componentData);
			case 'full':
			default:
				return $this->generateFullComponent($id, $componentData, $navConfig);
		}
	}

	private function generateFullComponent($id, $data, $navConfig) {
		$template = file_get_contents(__DIR__ . '/summary_structure_t1.html');
		$html = $this->fillTemplate($template, $id, $data, $navConfig, false);
		return $html;
	}

	private function generateShell($id, $navConfig, $componentMetadata) {
		// Use HTML shell template that includes CSS/JS; PHP does not inject assets
		$template = file_get_contents(__DIR__ . '/summary_shell_t1.html');

		$metadataJson = htmlspecialchars(json_encode($componentMetadata), ENT_QUOTES, 'UTF-8');
		$protectedAttr = !empty($navConfig['protected']) ? ' data-protected="true"' : '';
		$defaultState = $navConfig['defaultState'] ?? 'visible';
		$stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
		$styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
		$navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

		$html = str_replace('<!--COMPONENT_ID-->', htmlspecialchars($id), $template);
		$html = str_replace('<!--STATE_CLASS-->', $stateClass, $html);
		$html = str_replace('<!--STYLE_ATTR-->', $styleAttr, $html);
		$html = str_replace('<!--NAV_CONFIG_JSON-->', $navConfigJson, $html);
		$html = str_replace('<!--PROTECTED_ATTR-->', $protectedAttr, $html);
		$html = str_replace('<!--METADATA_JSON-->', $metadataJson, $html);

		return $html;
	}

	private function generateContent($data) {
		$inner = $this->renderInner($data);
		return $inner;
	}

	private function fillTemplate($template, $id, $data, $navConfig, $isContentOnly) {
		$defaultState = $navConfig['defaultState'] ?? 'visible';
		$stateClass = $defaultState === 'hidden' ? 'nav-hidden' : 'nav-visible';
		$styleAttr = $defaultState === 'hidden' ? ' style="display: none;"' : '';
		$navConfigJson = htmlspecialchars(json_encode($navConfig), ENT_QUOTES, 'UTF-8');

		$highlightIcon = $data['highlightIcon'] ?? 'rocket-outline';
		$highlightTitle = $data['highlightTitle'] ?? '';
		$highlightSubtitle = $data['highlightSubtitle'] ?? '';
		$paragraphs = $data['paragraphs'] ?? [];
		$expertise = $data['expertise'] ?? [];

		// Replace highlight section
		$template = str_replace('<!-- HIGHLIGHT_ICON_NAME -->', htmlspecialchars($highlightIcon), $template);
		$template = str_replace('<!-- HIGHLIGHT_TITLE -->', htmlspecialchars($highlightTitle), $template);
		$template = str_replace('<!-- HIGHLIGHT_SUBTITLE -->', htmlspecialchars($highlightSubtitle), $template);

		// Build paragraphs
		$paragraphHtml = '';
		foreach ($paragraphs as $p) {
			$paragraphHtml .= '<p>' . $this->escapeHtmlAllowBasicTags($p) . '</p>';
		}
		$template = str_replace('<!-- PARAGRAPHS_PLACEHOLDER -->', $paragraphHtml, $template);

		// Build expertise items
		$itemsHtml = '';
		foreach ($expertise as $item) {
			$icon = htmlspecialchars($item['icon'] ?? 'analytics-outline');
			$title = htmlspecialchars($item['title'] ?? '');
			$desc = htmlspecialchars($item['description'] ?? '');
			$itemsHtml .= ''
				. '<div class="summary-component__expertise-item card">'
				. '  <div class="summary-component__expertise-icon-wrapper">'
				. '    <ion-icon name="' . $icon . '" aria-hidden="true"></ion-icon>'
				. '  </div>'
				. '  <h4 class="summary-component__expertise-item-title">' . $title . '</h4>'
				. '  <p class="summary-component__expertise-item-description">' . $desc . '</p>'
				. '</div>';
		}
		$template = str_replace('<!-- EXPERTISE_ITEMS_PLACEHOLDER -->', $itemsHtml, $template);

		// Inject ID, handler, nav-config if full template
		$template = str_replace('<section class="summary-component">',
			'<section class="summary-component ' . $stateClass . '" id="' . htmlspecialchars($id) . '" data-nav-handler="handleSummaryNavigation" data-nav-config="' . $navConfigJson . '" data-init-hook="initSummaryComponent"' . $styleAttr . '>',
			$template);

		return $template;
	}

	private function renderInner($data) {
		// Use the same template and extract only the inner section if needed
		$template = file_get_contents(__DIR__ . '/summary_structure_t1.html');
		$flooded = $this->fillTemplate($template, 'content-only', $data, ['defaultState' => 'visible'], true);
		// Extract inner markup (everything inside the section)
		if (preg_match('/<section[^>]*>([\s\S]*?)<\/section>/', $flooded, $m)) {
			return $m[1];
		}
		return $flooded;
	}

	private function processNavigationConfig($navigationConfig) {
		$defaultConfig = [
			'defaultState' => 'visible',
			'allowedStates' => ['visible', 'hidden'],
			'initialParameters' => [],
			'protected' => false
		];
		return array_merge($defaultConfig, $navigationConfig);
	}

	private function escapeHtmlAllowBasicTags($html) {
		// Allow basic tags like <strong>, <em>, <b>, <i>, <u>, <a>
		$allowed = '<strong><em><b><i><u><a>';
		return strip_tags($html, $allowed);
	}
}

?>


