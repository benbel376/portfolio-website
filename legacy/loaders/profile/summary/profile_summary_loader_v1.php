<?php
// loaders/profile/summary/profile_summary_loader_v1.php

$dataFile = __DIR__ . '/../../../contents/profile/summary/profile_summary_data_v1.json';
$summaryData = [
    'icon_name' => 'help-circle-outline', // Default icon
    'title' => 'Default Summary Title',
    'subtitle' => 'Default summary subtitle.',
    'main_content' => [
        "This is default content. Please check if the JSON data file is correctly linked and formatted."
    ],
    'expertise_items' => [] // Default empty expertise items
];

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $jsonData = json_decode($json, true);
    if ($jsonData) {
        // Merge JSON data with defaults, JSON takes precedence
        $summaryData = array_merge($summaryData, $jsonData);
    }
}

ob_start();
?>

<div class="summary-component">
    <div class="summary-component__highlight-card">
        <div class="summary-component__icon-wrapper">
            <ion-icon name="<?= htmlspecialchars($summaryData['icon_name']) ?>" aria-hidden="true"></ion-icon>
        </div>
        <div class="summary-component__text-wrapper">
            <h3 class="summary-component__title"><?= htmlspecialchars($summaryData['title']) ?></h3>
            <p class="summary-component__subtitle"><?= htmlspecialchars($summaryData['subtitle']) ?></p>
        </div>
    </div>

    <div class="summary-component__main-content">
        <?php foreach ($summaryData['main_content'] as $paragraph): ?>
            <p><?= $paragraph // HTML (e.g. <strong>) is allowed here ?></p>
        <?php endforeach; ?>
    </div>

    <?php if (!empty($summaryData['expertise_items'])): ?>
    <div class="summary-component__expertise-grid">
        <?php foreach ($summaryData['expertise_items'] as $item): ?>
            <div class="summary-component__expertise-item card">
                <div class="summary-component__expertise-icon-wrapper">
                    <ion-icon name="<?= htmlspecialchars($item['icon_name']) ?>" aria-hidden="true"></ion-icon>
                </div>
                <h4 class="summary-component__expertise-item-title"><?= htmlspecialchars($item['title']) ?></h4>
                <p class="summary-component__expertise-item-description"><?= htmlspecialchars($item['description']) ?></p>
            </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>
</div>

<?php
$output = ob_get_clean();
echo $output;
?> 