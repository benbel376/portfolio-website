<?php
// Profile Hero Loader (Server-side dynamic)
$dataFile = __DIR__ . '/../../../contents/profile/hero/profile_hero_data_v1.json';
$heroData = [
  'name' => 'Default Name',
  'title' => 'Default Title',
  'description' => 'Default description.',
  'image' => 'assets/images/profile/hero/profile_hero-profile_avatar_v1.png',
  'social' => []
];
if (file_exists($dataFile)) {
  $json = file_get_contents($dataFile);
  // Provide default for image in case it's missing from JSON, otherwise use JSON value
  $jsonData = json_decode($json, true);
  if (isset($jsonData['image'])) {
    $heroData['image'] = $jsonData['image'];
  }
  $heroData = $jsonData + $heroData; // Merge with defaults, JSON takes precedence for existing keys
}

// Output buffering to build the HTML string
ob_start();
?>

<div class="hero-wrapper">
  <section class="hero hero-profile">
    <div class="hero__container">
      <!-- Left Section: Avatar and Info -->
      <div class="hero__avatar-section">
        <figure class="hero__avatar">
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="<?= htmlspecialchars($heroData['name']) ?>" width="300">
        </figure>
        <div class="hero__info">
          <h1 class="hero__name"><?= htmlspecialchars($heroData['name']) ?></h1>
          <p class="hero__title"><?= htmlspecialchars($heroData['title']) ?></p>
        </div>
      </div>

      <!-- Right Section: Description and Social Links -->
      <div class="hero__content">
        <p class="hero__description">
          <?= nl2br(htmlspecialchars($heroData['description'])) ?>
        </p>
        <div class="hero__social-links">
          <?php
            $iconMap = [
              'email' => 'mail-outline',
              'phone' => 'phone-portrait-outline',
              'linkedin' => 'logo-linkedin',
              'github' => 'logo-github'
            ];
            foreach ($heroData['social'] as $item):
            $iconName = isset($iconMap[$item['type']]) ? $iconMap[$item['type']] : 'alert-circle-outline'; // Fallback icon
            $label = htmlspecialchars($item['label']);
          ?>
            <a href="<?= htmlspecialchars($item['href']) ?>" class="hero__icon" target="<?= ($item['type'] === 'email' || $item['type'] === 'phone') ? '_self' : '_blank' ?>" aria-label="<?= $label ?>">
              <ion-icon name="<?= htmlspecialchars($iconName) ?>" aria-hidden="true"></ion-icon>
              <span class="visually-hidden"><?= $label ?></span>
            </a>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Floating Organic Elements -->
      <div class="floating-icons">
        <div class="floating-icon floating-blob-morph1" title="Data Flow"></div>
        <div class="floating-icon floating-blob-morph2" title="Innovation"></div>
        <div class="floating-icon floating-blob-morph3" title="Creativity"></div>
        
        <div class="floating-icon floating-icon-cloud" title="Cloud Computing">
          <ion-icon name="cloud-outline"></ion-icon>
        </div>
        <div class="floating-icon floating-blob-soft" title="Soft Background"></div>
        <div class="floating-icon floating-blob-sharp" title="Sharp Background"></div>
        <div class="floating-icon floating-blob-intense" title="Intense Background"></div>
        <div class="floating-icon floating-blob-subtle" title="Subtle Background"></div>
        <div class="floating-icon floating-blob-corner" title="Big Corner Bubble"></div>
        <!-- New Tool Icons Only -->
        <div class="floating-icon floating-icon-docker" title="Docker"></div>
        <div class="floating-icon floating-icon-kubernetes" title="Kubernetes"></div>
        <div class="floating-icon floating-icon-aws" title="AWS"></div>
        <div class="floating-icon floating-icon-mongodb" title="MongoDB"></div>
      </div>
    </div>
  </section>
</div>

<?php
$output = ob_get_clean();
echo $output;
?> 