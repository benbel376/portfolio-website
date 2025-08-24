<main id="control" data-layer="primary" data-parent="control" secured>

  <!-- Pagination Container (ready for future pagination) -->
  <div class="pagination-container container section">
    <!-- Pagination Page -->
    <div class="pagination-page">
      
      <!-- Control Page Header (Static Component) -->
      <section id="control-page-header-anchor">
        <header class="control-page-header">
          <div class="control-page-header__container container">
            <h2 class="control-page-header__title">
              Control Panel
              <span class="control-page-header__title-underline"></span>
            </h2>
          </div>
        </header>
      </section>
      
      <!-- Collapsible Sections Container -->
      <div class="control-collapsible-container container" style="margin-top: 2em;">

        <!-- JSON Editor Section -->
        <div class="collapsible-section card">
            <button class="collapsible-section__header" 
                    aria-expanded="false">
                <span class="collapsible-section__title">JSON Editor</span>
                <span class="collapsible-section__icon" aria-hidden="true">
                    <ion-icon name="code-outline"></ion-icon>
                </span>
            </button>
            <div class="collapsible-section__content" hidden>
                <section id="json-editor-anchor" data-secured="true" data-dynamic="true" 
                         data-fallback='{"loader":"component","page":"control","component":"json_editor","content":"default"}'>
                </section>
            </div>
        </div>

        <!-- Media Manager Section -->
        <div class="collapsible-section card">
            <button class="collapsible-section__header" 
                    aria-expanded="false">
                <span class="collapsible-section__title">Media Manager</span>
                <span class="collapsible-section__icon" aria-hidden="true">
                    <ion-icon name="images-outline"></ion-icon>
                </span>
            </button>
            <div class="collapsible-section__content" hidden>
                <section id="media-manager-anchor" data-secured="true" data-dynamic="true" 
                         data-fallback='{"loader":"component","page":"control","component":"media_manager","content":"default"}'>
                </section>
            </div>
        </div>

        <!-- PDF Viewer Section -->
        <div class="collapsible-section card">
            <button class="collapsible-section__header" 
                    aria-expanded="false">
                <span class="collapsible-section__title">PDF Viewer</span>
                <span class="collapsible-section__icon" aria-hidden="true">
                    <ion-icon name="document-text-outline"></ion-icon>
                </span>
            </button>
            <div class="collapsible-section__content" hidden>
                <section id="pdf-viewer-anchor" data-secured="true" data-dynamic="true" 
                         data-fallback='{"loader":"component","page":"control","component":"pdf_viewer","content":"default"}'>
                </section>
            </div>
        </div>

        <!-- Future components will go here -->

      </div>

    </div>
  </div>
</main> 