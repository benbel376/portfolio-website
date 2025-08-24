<?php
// loaders/profile/experience/profile_experience_loader_v1.php

$dataFile = __DIR__ . '/../../../contents/profile/experience/profile_experience_data_v1.json';
$experienceData = [];

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $experienceData = json_decode($json, true);
}

// Default number of responsibilities to show initially
$max_visible_responsibilities = 3;

// Function to calculate years of experience
function calculateYears($startDate, $endDate = null) {
    try {
        $start = new DateTime($startDate);
        $end = $endDate ? new DateTime($endDate) : new DateTime();
        $interval = $start->diff($end);
        
        $years = $interval->y;
        $months = $interval->m;
        
        if ($years > 0) {
            return $years . ($years == 1 ? ' year' : ' years');
        } else {
            return $months . ($months == 1 ? ' month' : ' months');
        }
    } catch (Exception $e) {
        return '';
    }
}

ob_start();
?>

<div class="experience-component">
    <?php if (!empty($experienceData)): ?>
        <!-- Timeline Container -->
        <div class="experience-timeline">
            <?php foreach ($experienceData as $index => $job): ?>
                <div class="timeline-item">
                    <!-- Experience Card -->
                    <div class="experience-card">
                        <!-- Title Row - Number and Title -->
                        <div class="experience-card__title-row">
                            <div class="experience-card__title-group">
                                <div class="experience-card__title-content">
                                    <h3 class="experience-card__title"><?= htmlspecialchars($job['jobTitle'] ?? 'N/A') ?></h3>
                                    <div class="experience-card__company">
                                        <ion-icon name="business-outline" aria-hidden="true"></ion-icon>
                                        <?= htmlspecialchars($job['companyName'] ?? 'N/A') ?>
                                    </div>
                                </div>
                            </div>
                            <?php if (!empty($job['logoIcon'])): ?>
                                <div class="experience-card__logo">
                                    <ion-icon name="<?= htmlspecialchars($job['logoIcon']) ?>" aria-hidden="true"></ion-icon>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- Card Header -->
                        <div class="experience-card__header">
                            <?php 
                            // Calculate years of experience
                            $yearsText = '';
                            if (!empty($job['startDate'])) {
                                $endDate = !empty($job['endDate']) ? $job['endDate'] : null;
                                $yearsText = calculateYears($job['startDate'], $endDate);
                            }
                            ?>
                            <div class="experience-card__meta">
                                <div class="experience-card__meta-left">
                                    <div class="experience-card__meta-item">
                                        <ion-icon name="calendar-outline" aria-hidden="true"></ion-icon>
                                        <span class="experience-card__dates"><?= htmlspecialchars($job['dates'] ?? 'N/A') ?></span>
                                    </div>
                                    <?php if (!empty($job['location'])): ?>
                                        <div class="experience-card__meta-item">
                                            <ion-icon name="location-outline" aria-hidden="true"></ion-icon>
                                            <span class="experience-card__location"><?= htmlspecialchars($job['location']) ?></span>
                                        </div>
                                    <?php endif; ?>
                                </div>
                                <?php if ($yearsText): ?>
                                    <div class="experience-card__years"><?= $yearsText ?></div>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Responsibilities -->
                        <?php if (!empty($job['responsibilities'])): ?>
                            <div class="experience-card__responsibilities">
                                <div class="experience-responsibilities-title">Key Responsibilities</div>
                                <ul class="responsibilities-list">
                                    <?php foreach ($job['responsibilities'] as $respIndex => $responsibility): ?>
                                        <li class="responsibility-item <?= $respIndex >= 3 ? 'hidden' : '' ?>">
                                            <?= $responsibility ?>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                                
                                <?php if (count($job['responsibilities']) > 3): ?>
                                    <button class="expand-button" data-expanded="false">
                                        <span class="btn-text">Show More</span>
                                        <ion-icon name="chevron-down-outline" aria-hidden="true"></ion-icon>
                                    </button>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>

                        <!-- Tags Section -->
                        <?php if (!empty($job['tags'])): ?>
                            <div class="experience-card__tags">
                                <div class="experience-tags-title">Key Technologies & Tools</div>
                                <ul class="experience-tags-list">
                                    <?php foreach ($job['tags'] as $tag): ?>
                                        <li class="experience-tag"><?= htmlspecialchars($tag) ?></li>
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
        <div class="experience-empty">
            <ion-icon name="briefcase-outline" aria-hidden="true"></ion-icon>
            <p>No work experience information available.</p>
        </div>
    <?php endif; ?>
</div>

<?php
$output = ob_get_clean();
echo $output;
?> 