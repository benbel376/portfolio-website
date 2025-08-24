<?php
// loaders/profile/education/profile_education_loader_v1.php

$dataFile = __DIR__ . '/../../../contents/profile/education/profile_education_data_v1.json';
$educationData = [];

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $educationData = json_decode($json, true);
}

// Default number of achievements to show initially
$max_visible_achievements = 3;

ob_start();
?>

<div class="education-component">
    <?php if (!empty($educationData)): ?>
        <!-- Timeline Container -->
        <div class="education-timeline">
            <?php foreach ($educationData as $index => $education): ?>
                <div class="timeline-item" data-type="<?= htmlspecialchars($education['type'] ?? 'degree') ?>">
                    <!-- Timeline Node -->
                    <div class="timeline-node">
                    </div>

                    <!-- Education Card -->
                    <div class="education-card">
                        <!-- Title Row - Degree and Institution -->
                        <div class="education-card__title-row">
                            <div class="education-card__title-group">
                                <h3 class="education-card__title">
                                    <?= htmlspecialchars($education['degree'] ?? 'N/A') ?>
                                    <span class="education-card__type-badge">
                                        <?= ucfirst($education['type'] ?? 'Degree') ?>
                                    </span>
                                </h3>
                                <div class="education-card__institution"><?= htmlspecialchars($education['institutionName'] ?? 'N/A') ?></div>
                            </div>
                            <?php if (!empty($education['logoIcon'])): ?>
                                <div class="education-card__logo">
                                    <ion-icon name="<?= htmlspecialchars($education['logoIcon']) ?>" aria-hidden="true"></ion-icon>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- Card Header -->
                        <div class="education-card__header">
                            <?php if (!empty($education['field'])): ?>
                                <div class="education-card__field"><?= htmlspecialchars($education['field']) ?></div>
                            <?php endif; ?>
                            
                            <div class="education-card__meta">
                                <div class="education-card__meta-item">
                                    <ion-icon name="calendar-outline" aria-hidden="true"></ion-icon>
                                    <span class="education-card__dates"><?= htmlspecialchars($education['dates'] ?? 'N/A') ?></span>
                                </div>
                                <?php if (!empty($education['location'])): ?>
                                    <div class="education-card__meta-item">
                                        <ion-icon name="location-outline" aria-hidden="true"></ion-icon>
                                        <span class="education-card__location"><?= htmlspecialchars($education['location']) ?></span>
                                    </div>
                                <?php endif; ?>
                                <?php if (!empty($education['gpa'])): ?>
                                    <div class="education-card__meta-item">
                                        <ion-icon name="school-outline" aria-hidden="true"></ion-icon>
                                        <span class="education-card__gpa">GPA: <?= htmlspecialchars($education['gpa']) ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Achievements -->
                        <?php if (!empty($education['achievements'])): ?>
                            <div class="education-card__achievements">
                                <h4 class="education-achievements-title">Key Achievements</h4>
                                <ul class="education-achievements-list">
                                    <?php foreach ($education['achievements'] as $achievementIndex => $achievement): ?>
                                        <li class="education-achievement-item <?= $achievementIndex >= 3 ? 'hidden' : '' ?>">
                                            <?= $achievement ?>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                                
                                <?php if (count($education['achievements']) > 3): ?>
                                    <button class="expand-button" data-expanded="false">
                                        <span class="btn-text">Show More</span>
                                        <ion-icon name="chevron-down-outline" aria-hidden="true"></ion-icon>
                                    </button>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>

                        <!-- Tags Section -->
                        <?php if (!empty($education['tags'])): ?>
                            <div class="education-card__tags">
                                <div class="education-tags-title">Key Technologies & Tools</div>
                                <ul class="education-tags-list">
                                    <?php foreach ($education['tags'] as $tag): ?>
                                        <li class="education-tag"><?= htmlspecialchars($tag) ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php else: ?>
        <!-- Empty State -->
        <div class="education-empty">
            <p>No education information available.</p>
        </div>
    <?php endif; ?>
</div>

<?php
$output = ob_get_clean();
echo $output;
?> 