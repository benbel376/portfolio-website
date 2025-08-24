<main id="profile" data-layer="primary" data-parent="profile" class="visible">


  <!-- Pagination Container (ready for future pagination) -->
  <div class="pagination-container container section">
    <!-- Pagination Page (empty for now) -->
    <div class="pagination-page">
      <!-- Profile Page Header -->
      <section id="profile-page-header-anchor">
        <?php include __DIR__ . '/../loaders/profile/header/profile_header_loader_v1.php'; ?>
      </section>
      <!-- Profile Hero Component (server-side dynamic loading) -->
      <section id="profile-hero-anchor">
        <?php include __DIR__ . '/../loaders/profile/hero/profile_hero_loader_v1.php'; ?>
      </section>

      <!-- Collapsible Sections Example -->
      <div class="profile-collapsible-container container" style="margin-top: 2em;">

        <!-- Summary Section -->
        <div class="collapsible-section card">
            <button class="collapsible-section__header" 
                    aria-expanded="false">
                <span class="collapsible-section__title">Summary</span>
                <span class="collapsible-section__icon" aria-hidden="true">
                    <ion-icon name="document-text-outline"></ion-icon>
                </span>
            </button>
            <div class="collapsible-section__content" hidden>
                <section id="profile-summary-anchor">
                    <?php include __DIR__ . '/../loaders/profile/summary/profile_summary_loader_v1.php'; ?>
                </section>
            </div>
        </div>

        <!-- Experience Section - Updated -->
        <div class="collapsible-section card">
            <button class="collapsible-section__header" 
                    aria-expanded="false">
                <span class="collapsible-section__title">Work Experience</span>
                <span class="collapsible-section__icon" aria-hidden="true">
                    <ion-icon name="briefcase-outline"></ion-icon>
                </span>
            </button>
            <div class="collapsible-section__content" hidden>
                <section id="profile-experience-anchor">
                    <?php include __DIR__ . '/../loaders/profile/experience/profile_experience_loader_v1.php'; ?>
                </section>
            </div>
        </div>

        <!-- Education Section -->
        <div class="collapsible-section card">
            <button class="collapsible-section__header" 
                    aria-expanded="false">
                <span class="collapsible-section__title">Education</span>
                <span class="collapsible-section__icon" aria-hidden="true">
                    <ion-icon name="school-outline"></ion-icon>
                </span>
            </button>
            <div class="collapsible-section__content" hidden>
                <section id="profile-education-anchor">
                    <?php include __DIR__ . '/../loaders/profile/education/profile_education_loader_v1.php'; ?>
                </section>
            </div>
        </div>

        <!-- Certifications Section -->
        <div class="collapsible-section card">
            <button class="collapsible-section__header" 
                    aria-expanded="false">
                <span class="collapsible-section__title">Professional Certifications</span>
                <span class="collapsible-section__icon" aria-hidden="true">
                    <ion-icon name="ribbon-outline"></ion-icon>
                </span>
            </button>
            <div class="collapsible-section__content" hidden>
                <section id="profile-certifications-anchor">
                    <?php include __DIR__ . '/../loaders/profile/certifications/profile_certifications_loader_v1.php'; ?>
                </section>
            </div>
        </div>

        <!-- Skills Section -->
        <div class="collapsible-section card">
            <button class="collapsible-section__header" 
                    aria-expanded="false">
                <span class="collapsible-section__title">Skills & Technologies</span>
                <span class="collapsible-section__icon" aria-hidden="true">
                    <ion-icon name="code-outline"></ion-icon>
                </span>
            </button>
            <div class="collapsible-section__content" hidden>
                <section id="profile-skills-anchor">
                    <?php include __DIR__ . '/../loaders/profile/skills/profile_skills_loader_v1.php'; ?>
                </section>
            </div>
        </div>

        <!-- Testimonials Section -->
        <div class="collapsible-section card">
            <button class="collapsible-section__header" 
                    aria-expanded="false">
                <span class="collapsible-section__title">Client Testimonials</span>
                <span class="collapsible-section__icon" aria-hidden="true">
                    <ion-icon name="chatbubbles-outline"></ion-icon>
                </span>
            </button>
            <div class="collapsible-section__content" hidden>
                <section id="profile-testimonials-anchor">
                    <?php include __DIR__ . '/../loaders/profile/testimonials/profile_testimonials_loader_v1.php'; ?>
                </section>
            </div>
        </div>

        <?php
        // Add more sections here as direct HTML 
        // following the pattern above if desired, or load components within them.
        ?>
      </div>

      <!-- Expertise Section (Corrected Placement) -->
      <!-- <section id="profile-expertise-anchor" class="section">
        <?php include __DIR__ . '/../loaders/profile/expertise/profile_expertise_loader_v1.php'; ?>
      </section> -->

    </div>
  </div>
</main> 