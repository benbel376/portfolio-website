<main id="blog" data-layer="primary" data-parent="blog">

  <!-- Pagination Container (ready for future pagination) -->
  <div class="pagination-container container section">
    <!-- Pagination Page -->
    <div class="pagination-page">
      <!-- Blog Page Header -->
      <section id="blog-page-header-anchor">
        <header class="blog-page-header">
            <div class="blog-page-header__container container">
                <h2 class="blog-page-header__title">
                    Blog
                    <span class="blog-page-header__title-underline"></span>
                </h2>
            </div>
        </header>
      </section>

      <!-- Blog List Component -->
      <section id="blog-list-section" class="container">
        <?php include __DIR__ . '/../loaders/blog/blog_list/blog_list_loader_v1.php'; ?>
      </section>

    </div>
  </div>
</main>
