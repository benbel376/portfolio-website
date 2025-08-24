<main id="projects" data-layer="primary" data-parent="projects">

  <!-- Pagination Container (ready for future pagination) -->
  <div class="pagination-container container section">
    <!-- Pagination Page (empty for now) -->
    <div class="pagination-page">
      <!-- Profile Page Header -->
      <section id="projects-page-header-anchor">
        <header class="projects-page-header">
            <div class="projects-page-header__container container">
                <h2 class="projects-page-header__title">
                    Projects
                    <span class="projects-page-header__title-underline"></span>
                </h2>
            </div>
        </header>
      </section>

      <!-- Projects List Component -->
      <section id="projects-list-section" class="container">
        <?php 
        // ✅ FLEXIBLE CONTENT SPECIFICATION: Can specify any content file
        $CONTENT_FILE = 'projects_list_data_v1'; // Default content
        // $CONTENT_FILE = 'projects_list_featured_v1'; // Alternative: Featured projects only
        // $CONTENT_FILE = 'projects_list_recent_v1'; // Alternative: Recent projects only
        include __DIR__ . '/../loaders/projects/projects_list/projects_projects_list_loader_v1.php'; 
        ?>
      </section>

    </div>
  </div>
</main> 