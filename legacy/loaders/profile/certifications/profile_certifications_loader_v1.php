<?php
// loaders/profile/certifications/profile_certifications_loader_v1.php

$dataFile = __DIR__ . '/../../../contents/profile/certifications/profile_certifications_data_v1.json';
$certificationsData = [];

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $certificationsData = json_decode($json, true);
}

// Default number of skills to show initially
$max_visible_skills = 4;

ob_start();
?>

<div class="certifications-component">
    <?php if (!empty($certificationsData)): ?>
        <!-- Certifications Container -->
        <div class="certifications-container">
            <div class="certifications-grid" id="certificationsGrid">
                <?php foreach ($certificationsData as $index => $certification): ?>
                    <div class="certification-card" data-index="<?= $index ?>">
                        <!-- Card Header -->
                        <div class="certification-card__header">
                            <div class="certification-card__badge">
                                <!-- Remove ion-icon to show background image -->
                            </div>
                            
                            <div class="certification-card__title-section">
                                <h3 class="certification-card__title"><?= htmlspecialchars($certification['certificationName'] ?? 'N/A') ?></h3>
                                <div class="certification-card__issuer">
                                    <?php 
                                    // Add company icon based on issuer
                                    $issuer = $certification['issuer'] ?? '';
                                    $icon = 'business-outline'; // default icon
                                    
                                    if (strpos($issuer, 'AWS') !== false || strpos($issuer, 'Amazon') !== false) {
                                        $icon = 'cloud-outline';
                                    } elseif (strpos($issuer, 'Microsoft') !== false || strpos($issuer, 'Azure') !== false) {
                                        $icon = 'cube-outline';
                                    } elseif (strpos($issuer, 'Google') !== false) {
                                        $icon = 'analytics-outline';
                                    } elseif (strpos($issuer, 'ISC2') !== false || strpos($issuer, '(ISC)²') !== false) {
                                        $icon = 'shield-checkmark-outline';
                                    } elseif (strpos($issuer, 'Fortinet') !== false) {
                                        $icon = 'lock-closed-outline';
                                    }
                                    ?>
                                    <ion-icon name="<?= $icon ?>" aria-hidden="true"></ion-icon>
                                    <span><?= htmlspecialchars($certification['issuer'] ?? 'N/A') ?></span>
                                </div>
                            </div>
                        </div>

                        <!-- Skills Tags -->
                        <?php if (!empty($certification['skills'])): ?>
                            <div class="certification-card__skills">
                                <?php 
                                // Dynamic description based on certification
                                $descriptions = [
                                    'AWS Certified Solutions Architect' => 'Validates overall understanding of the AWS Cloud, focusing on cloud concepts, security, technology, and billing and pricing.',
                                    'Professional Machine Learning Engineer' => 'Demonstrates foundational knowledge of cloud services and how those services are provided with Microsoft Azure. Covers core Azure concepts, core Azure services, Azure pricing, SLA, and lifecycle.',
                                    'Certified Kubernetes Administrator (CKA)' => 'Validates skills in Kubernetes administration, including cluster management, troubleshooting, and security best practices for containerized applications.',
                                    'Azure DevOps Engineer Expert' => 'Demonstrates expertise in DevOps practices, CI/CD implementation, and infrastructure management using Microsoft Azure technologies.'
                                ];
                                $description = $descriptions[$certification['certificationName']] ?? 'Professional certification validating expertise in specialized technology domains.';
                                ?>
                                <h4 class="skills-title"><?= htmlspecialchars($description) ?></h4>
                                <div class="skills-tags">
                                    <?php foreach ($certification['skills'] as $skillIndex => $skill): ?>
                                        <span class="skill-tag <?= $skillIndex >= 4 ? 'hidden' : '' ?>">
                                            <?= htmlspecialchars($skill) ?>
                                        </span>
                                    <?php endforeach; ?>
                                </div>
                                
                                <?php if (count($certification['skills']) > 4): ?>
                                    <button class="expand-button" data-expanded="false">
                                        <span class="btn-text">Show More</span>
                                        <ion-icon name="chevron-down-outline" aria-hidden="true"></ion-icon>
                                    </button>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>

                        <!-- Verification Link -->
                        <?php if (!empty($certification['verificationUrl'])): ?>
                            <div class="certification-card__verification">
                                <a href="<?= htmlspecialchars($certification['verificationUrl']) ?>" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   class="verification-link">
                                    <ion-icon name="open-outline" aria-hidden="true"></ion-icon>
                                    <span>View Credential</span>
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Pagination Controls -->
        <div class="certifications-pagination">
            <button class="pagination-button" id="prevCertification" aria-label="Previous certification">
                <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
            
            <div class="pagination-indicators">
                <?php 
                $totalPages = ceil(count($certificationsData) / 2); // 2 certifications per page
                for ($i = 0; $i < $totalPages; $i++): 
                ?>
                    <div class="pagination-dot <?= $i === 0 ? 'active' : '' ?>" data-index="<?= $i ?>"></div>
                <?php endfor; ?>
            </div>
            
            <div class="pagination-info">
                <span id="currentCertification">1-<?= min(2, count($certificationsData)) ?></span> / <?= count($certificationsData) ?>
            </div>
            
            <button class="pagination-button" id="nextCertification" aria-label="Next certification">
                <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
        </div>
    <?php else: ?>
        <!-- Empty State -->
        <div class="certifications-empty">
            <ion-icon name="ribbon-outline" aria-hidden="true"></ion-icon>
            <p>No certifications information available.</p>
        </div>
    <?php endif; ?>
</div>

<?php
$output = ob_get_clean();
echo $output;
?> 