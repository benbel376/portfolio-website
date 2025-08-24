<?php
// Profile Page Header Loader

$heroDataFile = __DIR__ . '/../../../contents/profile/hero/profile_hero_data_v1.json';
$resumeLink = '#'; // Default link if data file or resume key is not found
$buttonText = 'Download Resume'; // Static button text

if (file_exists($heroDataFile)) {
    $json = file_get_contents($heroDataFile);
    $data = json_decode($json, true);
    if (isset($data['resume']) && !empty($data['resume'])) {
        $resumeLink = htmlspecialchars($data['resume']);
    }
}

ob_start();
?>
<header class="profile-page-header">
    <div class="profile-page-header__container container">
        <h2 class="profile-page-header__title">
            Profile
            <span class="profile-page-header__title-underline"></span>
        </h2>
        <a href="<?= $resumeLink ?>" class="profile-page-header__resume-button">
            <?= htmlspecialchars($buttonText) ?>
        </a>
    </div>
</header>
<?php
$output = ob_get_clean();
echo $output;
?> 