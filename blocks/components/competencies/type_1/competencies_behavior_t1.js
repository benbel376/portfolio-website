// Use global state to prevent redeclaration issues on dynamic reload
window.competenciesState = window.competenciesState || {
  currentCategory: null,
  currentPage: 0,
  itemsPerPage: 6,
  allSkills: {},
  slideshowData: [],
  currentSlide: 0,
  currentView: 'list'
};

class CompetenciesBehavior {
  constructor() {
    this.state = window.competenciesState;
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

    // List pagination arrows
    const listPrevBtn = document.getElementById('competencies-list-prev');
    const listNextBtn = document.getElementById('competencies-list-next');
    
    if (listPrevBtn) {
      listPrevBtn.addEventListener('click', () => this.previousPage());
    }
    
    if (listNextBtn) {
      listNextBtn.addEventListener('click', () => this.nextPage());
    }

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
      if (this.state.currentView === 'slideshow') {
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
    this.state.allSkills = skillsData;
    const select = document.getElementById('competencies-category-select');
    if (select && select.value) {
      console.log('Competencies: Rendering category after data load:', select.value);
      this.handleCategoryChange(select.value);
    }
  }

  setSlideshowData(slideshowData) {
    console.log('Competencies: Setting slideshow data:', slideshowData);
    this.state.slideshowData = slideshowData;
    this.renderSlideshow();
  }

  switchView(viewType) {
    console.log('Competencies: Switching to view:', viewType);
    this.state.currentView = viewType;
    
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
    this.state.currentCategory = categoryKey;
    this.state.currentPage = 0;
    this.renderCurrentPage();
    this.renderPagination();
  }

  renderCurrentPage() {
    const listContainer = document.getElementById('competencies-list');
    console.log('Competencies: Rendering page for category:', this.state.currentCategory);
    console.log('Competencies: List container found:', !!listContainer);
    console.log('Competencies: Skills data for category:', this.state.allSkills[this.state.currentCategory]);
    
    if (!listContainer || !this.state.allSkills[this.state.currentCategory]) {
      console.log('Competencies: Cannot render - missing container or data');
      return;
    }

    const skills = this.state.allSkills[this.state.currentCategory];
    const startIndex = this.state.currentPage * this.state.itemsPerPage;
    const endIndex = startIndex + this.state.itemsPerPage;
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

  previousPage() {
    if (this.state.currentPage > 0) {
      this.state.currentPage--;
      this.renderCurrentPage();
      this.renderPagination();
    }
  }

  nextPage() {
    const skills = this.state.allSkills[this.state.currentCategory] || [];
    const totalPages = Math.ceil(skills.length / this.state.itemsPerPage);
    if (this.state.currentPage < totalPages - 1) {
      this.state.currentPage++;
      this.renderCurrentPage();
      this.renderPagination();
    }
  }

  renderPagination() {
    const dotsContainer = document.getElementById('competencies-dots');
    const prevBtn = document.getElementById('competencies-list-prev');
    const nextBtn = document.getElementById('competencies-list-next');
    
    if (!dotsContainer || !this.state.allSkills[this.state.currentCategory]) {
      return;
    }

    const skills = this.state.allSkills[this.state.currentCategory];
    const totalPages = Math.ceil(skills.length / this.state.itemsPerPage);
    
    // Update arrow button states
    if (prevBtn) {
      prevBtn.disabled = this.state.currentPage === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.state.currentPage >= totalPages - 1;
    }
    
    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('div');
      dot.className = `competencies__dot ${i === this.state.currentPage ? 'competencies__dot--active' : ''}`;
      dot.addEventListener('click', () => {
        this.state.currentPage = i;
        this.renderCurrentPage();
        this.renderPagination();
      });
      dotsContainer.appendChild(dot);
    }
  }

  renderSlideshow() {
    const slideContainer = document.getElementById('competencies-slide-container');
    if (!slideContainer || !this.state.slideshowData.length) {
      console.log('Competencies: No slide container or slideshow data');
      return;
    }

    // Clear only the slides, not the controls
    const existingSlides = slideContainer.querySelectorAll('.competencies__slide');
    existingSlides.forEach(slide => slide.remove());
    
    this.state.slideshowData.forEach((slide, index) => {
      const slideElement = this.createSlideElement(slide, index);
      slideContainer.appendChild(slideElement);
    });

    console.log('Competencies: Rendered', this.state.slideshowData.length, 'slides');
    this.renderSlideshowPagination();
    this.updateSlideCounter();
    this.updateSlideVisibility();
    this.updateNavigationButtons();
  }

  createSlideElement(slide, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = `competencies__slide ${index === this.state.currentSlide ? 'competencies__slide--active' : ''}`;

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
    console.log('Competencies: Slideshow data length:', this.state.slideshowData.length);
    
    if (!dotsContainer || !this.state.slideshowData.length) return;

    dotsContainer.innerHTML = '';

    this.state.slideshowData.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `competencies__slideshow-dot ${index === this.state.currentSlide ? 'competencies__slideshow-dot--active' : ''}`;
      dot.addEventListener('click', () => {
        this.state.currentSlide = index;
        this.updateSlideVisibility();
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.renderSlideshowPagination();
      });
      dotsContainer.appendChild(dot);
    });
    
    console.log('Competencies: Created', this.state.slideshowData.length, 'pagination dots');
  }

  updateSlideVisibility() {
    const slides = document.querySelectorAll('.competencies__slide');
    slides.forEach((slide, index) => {
      if (index === this.state.currentSlide) {
        slide.classList.add('competencies__slide--active');
      } else {
        slide.classList.remove('competencies__slide--active');
      }
    });
  }

  updateSlideCounter() {
    const counter = document.getElementById('competencies-slide-counter');
    if (counter && this.state.slideshowData.length) {
      counter.textContent = `${this.state.currentSlide + 1} / ${this.state.slideshowData.length}`;
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.querySelector('#competencies-prev-btn .competencies__slideshow-btn');
    const nextBtn = document.querySelector('#competencies-next-btn .competencies__slideshow-btn');
    
    console.log('Competencies: Navigation buttons found - Prev:', !!prevBtn, 'Next:', !!nextBtn);

    if (prevBtn) {
      prevBtn.disabled = this.state.currentSlide === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = this.state.currentSlide === this.state.slideshowData.length - 1;
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
    if (this.state.currentSlide < this.state.slideshowData.length - 1) {
      this.state.currentSlide++;
      this.updateSlideVisibility();
      this.updateSlideCounter();
      this.updateNavigationButtons();
      this.renderSlideshowPagination();
    }
  }

  previousSlide() {
    if (this.state.currentSlide > 0) {
      this.state.currentSlide--;
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
    const competencies = document.querySelector('.competencies-component');
    if (competencies) {
      competencies.style.display = 'block';
    }
  }

  hide() {
    const competencies = document.querySelector('.competencies-component');
    if (competencies) {
      competencies.style.display = 'none';
    }
  }
}

// Global data setter function
function setCompetenciesData(skillsData, slideshowData) {
  console.log('Competencies: setCompetenciesData called');
  window.competenciesState.allSkills = skillsData || {};
  window.competenciesState.slideshowData = slideshowData || [];
  
  if (window.competenciesBehavior) {
    window.competenciesBehavior.setSkillsData(skillsData);
    window.competenciesBehavior.setSlideshowData(slideshowData);
  }
}
window.setCompetenciesData = setCompetenciesData;

// Navigation handler for global navigator integration
function handleCompetenciesNavigation(elementId, state, parameters = {}) {
  console.log('Competencies: Navigation handler called', { elementId, state, parameters });
  const element = document.getElementById(elementId);
  if (!element) return false;
  
  switch (state) {
    case 'visible':
      element.style.display = 'block';
      element.classList.remove('nav-hidden');
      element.classList.add('nav-visible');
      break;
    case 'hidden':
      element.classList.remove('nav-visible');
      element.classList.add('nav-hidden');
      setTimeout(() => {
        if (element.classList.contains('nav-hidden')) {
          element.style.display = 'none';
        }
      }, 300);
      break;
    case 'scrollTo':
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    default:
      console.log('Competencies: Unknown navigation state:', state);
      return false;
  }
  return true;
}
window.handleCompetenciesNavigation = handleCompetenciesNavigation;

// Init hook for dynamic content loading
function initializeCompetencies(componentElement) {
  console.log('Competencies: Initializing after dynamic load...');
  
  // Reinitialize the behavior if needed
  if (!window.competenciesBehavior) {
    window.competenciesBehavior = new CompetenciesBehavior();
  } else {
    // Rebind events
    window.competenciesBehavior.bindEvents();
    
    // Re-render if data exists
    if (window.competenciesState.allSkills && Object.keys(window.competenciesState.allSkills).length > 0) {
      const select = document.getElementById('competencies-category-select');
      if (select && select.value) {
        window.competenciesBehavior.handleCategoryChange(select.value);
      }
    }
    
    if (window.competenciesState.slideshowData && window.competenciesState.slideshowData.length > 0) {
      window.competenciesBehavior.renderSlideshow();
    }
  }
}
window.initializeCompetencies = initializeCompetencies;

// Initialize the behavior
document.addEventListener('DOMContentLoaded', () => {
  if (!window.competenciesBehavior) {
    window.competenciesBehavior = new CompetenciesBehavior();
  }
});

// Also initialize if script loads after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (!window.competenciesBehavior) {
      window.competenciesBehavior = new CompetenciesBehavior();
    }
  });
} else {
  if (!window.competenciesBehavior) {
    window.competenciesBehavior = new CompetenciesBehavior();
  }
}