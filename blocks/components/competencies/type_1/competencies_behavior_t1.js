class CompetenciesBehavior {
  constructor() {
    this.currentCategory = null;
    this.currentPage = 0;
    this.itemsPerPage = 6;
    this.allSkills = {};
    this.slideshowData = [];
    this.currentSlide = 0;
    this.currentView = 'list'; // 'list' or 'slideshow'
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadInitialData();
  }

  bindEvents() {
    const select = document.getElementById('competencies-category-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.handleCategoryChange(e.target.value);
      });
    }

    // Tab switching
    const tabs = document.querySelectorAll('.competencies__tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabType = e.currentTarget.getAttribute('data-tab');
        this.switchView(tabType);
      });
    });

    // Slideshow controls
    const prevBtn = document.querySelector('#competencies-prev-btn .competencies__slideshow-btn');
    const nextBtn = document.querySelector('#competencies-next-btn .competencies__slideshow-btn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousSlide());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Touch interactions for mobile
    const slideContainer = document.getElementById('competencies-slide-container');
    if (slideContainer) {
      slideContainer.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          this.toggleOverlay(e.currentTarget);
        }
      });

      // Prevent overlay toggle when clicking on controls
      const overlayElements = slideContainer.querySelectorAll('.competencies__slideshow-nav, .competencies__slideshow-pagination, .competencies__slide-counter');
      overlayElements.forEach(element => {
        element.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      });
    }

    // Keyboard navigation for slideshow
    document.addEventListener('keydown', (e) => {
      if (this.currentView === 'slideshow') {
        if (e.key === 'ArrowLeft') this.previousSlide();
        if (e.key === 'ArrowRight') this.nextSlide();
      }
    });
  }

  loadInitialData() {
    // This will be populated by the PHP loader
    // For now, we'll handle the initial category selection
    const select = document.getElementById('competencies-category-select');
    if (select && select.options.length > 0) {
      console.log('Competencies: Loading initial category:', select.value);
      this.handleCategoryChange(select.value);
    } else {
      console.log('Competencies: No select element or options found');
    }
  }

  setSkillsData(skillsData) {
    console.log('Competencies: Setting skills data:', skillsData);
    this.allSkills = skillsData;
    const select = document.getElementById('competencies-category-select');
    if (select && select.value) {
      console.log('Competencies: Rendering category after data load:', select.value);
      this.handleCategoryChange(select.value);
    }
  }

  setSlideshowData(slideshowData) {
    console.log('Competencies: Setting slideshow data:', slideshowData);
    this.slideshowData = slideshowData;
    this.renderSlideshow();
  }

  switchView(viewType) {
    console.log('Competencies: Switching to view:', viewType);
    this.currentView = viewType;
    
    // Update tab states
    const tabs = document.querySelectorAll('.competencies__tab');
    tabs.forEach(tab => {
      const tabType = tab.getAttribute('data-tab');
      if (tabType === viewType) {
        tab.classList.add('competencies__tab--active');
      } else {
        tab.classList.remove('competencies__tab--active');
      }
    });

    // Show/hide dropdown
    const dropdown = document.getElementById('competencies-dropdown');
    if (dropdown) {
      if (viewType === 'slideshow') {
        dropdown.classList.add('competencies__dropdown--hidden');
      } else {
        dropdown.classList.remove('competencies__dropdown--hidden');
      }
    }

    // Switch views
    const listView = document.getElementById('competencies-list-view');
    const slideshowView = document.getElementById('competencies-slideshow-view');
    
    if (listView && slideshowView) {
      if (viewType === 'slideshow') {
        listView.classList.remove('competencies__view--active');
        slideshowView.classList.add('competencies__view--active');
        this.renderSlideshow();
      } else {
        slideshowView.classList.remove('competencies__view--active');
        listView.classList.add('competencies__view--active');
      }
    }
  }

  handleCategoryChange(categoryKey) {
    this.currentCategory = categoryKey;
    this.currentPage = 0;
    this.renderCurrentPage();
    this.renderPagination();
  }

  renderCurrentPage() {
    const listContainer = document.getElementById('competencies-list');
    console.log('Competencies: Rendering page for category:', this.currentCategory);
    console.log('Competencies: List container found:', !!listContainer);
    console.log('Competencies: Skills data for category:', this.allSkills[this.currentCategory]);
    
    if (!listContainer || !this.allSkills[this.currentCategory]) {
      console.log('Competencies: Cannot render - missing container or data');
      return;
    }

    const skills = this.allSkills[this.currentCategory];
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageSkills = skills.slice(startIndex, endIndex);

    // Clear current skills with fade out
    const currentSkills = listContainer.querySelectorAll('.competencies__skill');
    currentSkills.forEach((skill, index) => {
      setTimeout(() => {
        skill.style.opacity = '0';
        skill.style.transform = 'translateY(-10px)';
      }, index * 50);
    });

    // Render new skills after fade out completes
    setTimeout(() => {
      listContainer.innerHTML = '';
      
      pageSkills.forEach((skill, index) => {
        const skillElement = this.createSkillElement(skill, index);
        listContainer.appendChild(skillElement);
      });

      // Trigger fade in animation
      setTimeout(() => {
        const newSkills = listContainer.querySelectorAll('.competencies__skill');
        newSkills.forEach((skill, index) => {
          setTimeout(() => {
            skill.style.opacity = '1';
            skill.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }, 50);
    }, 300);
  }

  createSkillElement(skill, index) {
    const skillDiv = document.createElement('div');
    skillDiv.className = `competencies__skill competencies__skill--${skill.type}`;
    skillDiv.style.opacity = '0';
    skillDiv.style.transform = 'translateY(10px)';
    skillDiv.style.transition = 'all 0.4s ease';

    skillDiv.innerHTML = `
      <div class="competencies__skill-header">
        <div class="competencies__skill-icon">
          <ion-icon name="${skill.icon}"></ion-icon>
        </div>
        <h3 class="competencies__skill-title">${skill.title}</h3>
      </div>
      <p class="competencies__skill-description">${skill.description}</p>
    `;

    return skillDiv;
  }

  renderPagination() {
    const dotsContainer = document.getElementById('competencies-dots');
    if (!dotsContainer || !this.allSkills[this.currentCategory]) {
      return;
    }

    const skills = this.allSkills[this.currentCategory];
    const totalPages = Math.ceil(skills.length / this.itemsPerPage);
    
    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('div');
      dot.className = `competencies__dot ${i === this.currentPage ? 'competencies__dot--active' : ''}`;
      dot.addEventListener('click', () => {
        this.currentPage = i;
        this.renderCurrentPage();
        this.renderPagination();
      });
      dotsContainer.appendChild(dot);
    }
  }

  renderSlideshow() {
    const slideContainer = document.getElementById('competencies-slide-container');
    if (!slideContainer || !this.slideshowData.length) {
      console.log('Competencies: No slide container or slideshow data');
      return;
    }

    // Clear only the slides, not the controls
    const existingSlides = slideContainer.querySelectorAll('.competencies__slide');
    existingSlides.forEach(slide => slide.remove());
    
    this.slideshowData.forEach((slide, index) => {
      const slideElement = this.createSlideElement(slide, index);
      slideContainer.appendChild(slideElement);
    });

    console.log('Competencies: Rendered', this.slideshowData.length, 'slides');
    this.renderSlideshowPagination();
    this.updateSlideCounter();
    this.updateSlideVisibility();
    this.updateNavigationButtons();
  }

  createSlideElement(slide, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = `competencies__slide ${index === this.currentSlide ? 'competencies__slide--active' : ''}`;

    let mediaElement = '';
    if (slide.type === 'video') {
      mediaElement = `<video autoplay muted loop>
        <source src="${slide.src}" type="video/mp4">
        Your browser does not support the video tag.
      </video>`;
    } else if (slide.type === 'gif' || slide.type === 'image') {
      mediaElement = `<img src="${slide.src}" alt="${slide.title || 'Pipeline visualization'}">`;
    }

    slideDiv.innerHTML = `
      ${mediaElement}
      <div class="competencies__slide-overlay">
        <h3 class="competencies__slide-title">${slide.title || 'Pipeline Visualization'}</h3>
        <p class="competencies__slide-description">${slide.description || 'Advanced data pipeline architecture'}</p>
      </div>
    `;

    return slideDiv;
  }

  renderSlideshowPagination() {
    const dotsContainer = document.getElementById('competencies-slideshow-dots');
    console.log('Competencies: Pagination container found:', !!dotsContainer);
    console.log('Competencies: Slideshow data length:', this.slideshowData.length);
    
    if (!dotsContainer || !this.slideshowData.length) return;

    dotsContainer.innerHTML = '';

    this.slideshowData.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `competencies__slideshow-dot ${index === this.currentSlide ? 'competencies__slideshow-dot--active' : ''}`;
      dot.addEventListener('click', () => {
        this.currentSlide = index;
        this.updateSlideVisibility();
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.renderSlideshowPagination();
      });
      dotsContainer.appendChild(dot);
    });
    
    console.log('Competencies: Created', this.slideshowData.length, 'pagination dots');
  }

  updateSlideVisibility() {
    const slides = document.querySelectorAll('.competencies__slide');
    slides.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.classList.add('competencies__slide--active');
      } else {
        slide.classList.remove('competencies__slide--active');
      }
    });
  }

  updateSlideCounter() {
    const counter = document.getElementById('competencies-slide-counter');
    if (counter && this.slideshowData.length) {
      counter.textContent = `${this.currentSlide + 1} / ${this.slideshowData.length}`;
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.querySelector('#competencies-prev-btn .competencies__slideshow-btn');
    const nextBtn = document.querySelector('#competencies-next-btn .competencies__slideshow-btn');
    
    console.log('Competencies: Navigation buttons found - Prev:', !!prevBtn, 'Next:', !!nextBtn);

    if (prevBtn) {
      prevBtn.disabled = this.currentSlide === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentSlide === this.slideshowData.length - 1;
    }
  }

  toggleOverlay(container) {
    if (container.classList.contains('show-overlay')) {
      container.classList.remove('show-overlay');
    } else {
      container.classList.add('show-overlay');
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        container.classList.remove('show-overlay');
      }, 3000);
    }
  }

  nextSlide() {
    if (this.currentSlide < this.slideshowData.length - 1) {
      this.currentSlide++;
      this.updateSlideVisibility();
      this.updateSlideCounter();
      this.updateNavigationButtons();
      this.renderSlideshowPagination();
    }
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlideVisibility();
      this.updateSlideCounter();
      this.updateNavigationButtons();
      this.renderSlideshowPagination();
    }
  }

  // Navigation handler for the framework
  handleCompetenciesNavigation(action, data) {
    switch (action) {
      case 'show':
        this.show();
        break;
      case 'hide':
        this.hide();
        break;
      case 'setCategory':
        if (data && data.category) {
          const select = document.getElementById('competencies-category-select');
          if (select) {
            select.value = data.category;
            this.handleCategoryChange(data.category);
          }
        }
        break;
    }
  }

  show() {
    const competencies = document.querySelector('.competencies');
    if (competencies) {
      competencies.style.display = 'block';
    }
  }

  hide() {
    const competencies = document.querySelector('.competencies');
    if (competencies) {
      competencies.style.display = 'none';
    }
  }
}

// Navigation handler for the framework (must be in global scope)
function handleCompetenciesNavigation(action, data) {
  if (window.competenciesBehavior) {
    window.competenciesBehavior.handleCompetenciesNavigation(action, data);
  }
}

// Initialize the behavior
document.addEventListener('DOMContentLoaded', () => {
  window.competenciesBehavior = new CompetenciesBehavior();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CompetenciesBehavior;
}