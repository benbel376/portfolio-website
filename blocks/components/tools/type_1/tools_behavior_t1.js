// Use global state to prevent redeclaration issues on dynamic reload
window.toolsState = window.toolsState || {
  currentCategory: null,
  currentPage: 0,
  itemsPerPage: 12,
  allTools: {}
};

class ToolsBehavior {
  constructor() {
    this.state = window.toolsState;
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadInitialData();
  }

  bindEvents() {
    const select = document.getElementById('tools-category-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.handleCategoryChange(e.target.value);
      });
    }

    // Modal events
    const modal = document.getElementById('tools-modal');
    const backdrop = document.getElementById('tools-modal-backdrop');
    const closeBtn = document.getElementById('tools-modal-close');

    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeModal());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('tools__modal--active')) {
        this.closeModal();
      }
    });
  }

  loadInitialData() {
    // This will be populated by the PHP loader
    const select = document.getElementById('tools-category-select');
    if (select && select.options.length > 0) {
      console.log('Tools: Loading initial category:', select.value);
      this.handleCategoryChange(select.value);
    } else {
      console.log('Tools: No select element or options found');
    }
  }

  setToolsData(toolsData) {
    console.log('Tools: Setting tools data:', toolsData);
    this.state.allTools = toolsData;
    const select = document.getElementById('tools-category-select');
    if (select && select.value) {
      console.log('Tools: Rendering category after data load:', select.value);
      this.handleCategoryChange(select.value);
    }
  }

  handleCategoryChange(categoryKey) {
    this.state.currentCategory = categoryKey;
    this.state.currentPage = 0;
    this.renderCurrentPage();
    this.renderPagination();
  }

  renderCurrentPage() {
    const gridContainer = document.getElementById('tools-grid');
    console.log('Tools: Rendering page for category:', this.state.currentCategory);
    console.log('Tools: Grid container found:', !!gridContainer);
    console.log('Tools: Tools data for category:', this.state.allTools[this.state.currentCategory]);
    
    if (!gridContainer || !this.state.allTools[this.state.currentCategory]) {
      console.log('Tools: Cannot render - missing container or data');
      return;
    }

    const tools = this.state.allTools[this.state.currentCategory];
    const startIndex = this.state.currentPage * this.state.itemsPerPage;
    const endIndex = startIndex + this.state.itemsPerPage;
    const pageTools = tools.slice(startIndex, endIndex);

    // Clear current tools with fade out
    const currentTools = gridContainer.querySelectorAll('.tools__tool');
    currentTools.forEach((tool, index) => {
      setTimeout(() => {
        tool.style.opacity = '0';
        tool.style.transform = 'translateY(-10px)';
      }, index * 50);
    });

    // Render new tools after fade out completes
    setTimeout(() => {
      gridContainer.innerHTML = '';
      
      pageTools.forEach((tool, index) => {
        const toolElement = this.createToolElement(tool, index);
        gridContainer.appendChild(toolElement);
      });

      // Trigger fade in animation
      setTimeout(() => {
        const newTools = gridContainer.querySelectorAll('.tools__tool');
        newTools.forEach((tool, index) => {
          setTimeout(() => {
            tool.style.opacity = '1';
            tool.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }, 50);
    }, 300);
  }

  createToolElement(tool, index) {
    const toolDiv = document.createElement('div');
    toolDiv.className = 'tools__tool';
    toolDiv.setAttribute('data-category', tool.category || 'general');
    toolDiv.style.opacity = '0';
    toolDiv.style.transform = 'translateY(20px)';
    toolDiv.style.transition = 'all 0.4s ease';

    let iconContent = '';
    if (tool.icon && tool.icon.startsWith('http')) {
      iconContent = `<img src="${tool.icon}" alt="${tool.name}">`;
    } else {
      iconContent = `<ion-icon name="${tool.icon || 'code-outline'}"></ion-icon>`;
    }

    toolDiv.innerHTML = `
      <div class="tools__tool-icon">
        ${iconContent}
      </div>
      <div class="tools__tool-name">${tool.name}</div>
    `;

    // Add click event to open modal
    toolDiv.addEventListener('click', () => {
      this.openModal(tool);
    });

    return toolDiv;
  }

  renderPagination() {
    const dotsContainer = document.getElementById('tools-dots');
    console.log('Tools: Pagination container found:', !!dotsContainer);
    console.log('Tools: Tools data length:', this.state.allTools[this.state.currentCategory]?.length);
    
    if (!dotsContainer || !this.state.allTools[this.state.currentCategory]) {
      return;
    }

    const tools = this.state.allTools[this.state.currentCategory];
    const totalPages = Math.ceil(tools.length / this.state.itemsPerPage);
    
    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('div');
      dot.className = `tools__dot ${i === this.state.currentPage ? 'tools__dot--active' : ''}`;
      dot.addEventListener('click', () => {
        this.state.currentPage = i;
        this.renderCurrentPage();
        this.renderPagination();
      });
      dotsContainer.appendChild(dot);
    }
    
    console.log('Tools: Created', totalPages, 'pagination dots');
  }

  openModal(tool) {
    const modal = document.getElementById('tools-modal');
    const modalIcon = document.getElementById('tools-modal-icon');
    const modalTitle = document.getElementById('tools-modal-title');
    const modalDescription = document.getElementById('tools-modal-description');
    const modalProjectsList = document.getElementById('tools-modal-projects-list');

    if (!modal) return;

    // Set modal content
    if (modalIcon) {
      let iconContent = '';
      if (tool.icon && tool.icon.startsWith('http')) {
        iconContent = `<img src="${tool.icon}" alt="${tool.name}">`;
      } else {
        iconContent = `<ion-icon name="${tool.icon || 'code-outline'}"></ion-icon>`;
      }
      modalIcon.innerHTML = iconContent;
    }

    if (modalTitle) {
      modalTitle.textContent = tool.name || 'Tool';
    }

    if (modalDescription) {
      modalDescription.textContent = tool.description || 'A powerful tool for development and productivity.';
    }

    if (modalProjectsList && tool.projects) {
      modalProjectsList.innerHTML = '';
      tool.projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'tools__modal-project';
        projectDiv.innerHTML = `
          <div class="tools__modal-project-name">${project.name}</div>
          <div class="tools__modal-project-description">${project.description}</div>
        `;
        modalProjectsList.appendChild(projectDiv);
      });
    } else if (modalProjectsList) {
      modalProjectsList.innerHTML = '<div class="tools__modal-project"><div class="tools__modal-project-name">No projects listed</div><div class="tools__modal-project-description">This tool hasn\'t been used in any documented projects yet.</div></div>';
    }

    // Show modal
    modal.classList.add('tools__modal--active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modal = document.getElementById('tools-modal');
    if (modal) {
      modal.classList.remove('tools__modal--active');
      document.body.style.overflow = '';
    }
  }

  // Navigation handler for the framework
  handleToolsNavigation(action, data) {
    switch (action) {
      case 'show':
        this.show();
        break;
      case 'hide':
        this.hide();
        break;
      case 'setCategory':
        if (data && data.category) {
          const select = document.getElementById('tools-category-select');
          if (select) {
            select.value = data.category;
            this.handleCategoryChange(data.category);
          }
        }
        break;
    }
  }

  show() {
    const tools = document.querySelector('.tools-component');
    if (tools) {
      tools.style.display = 'block';
    }
  }

  hide() {
    const tools = document.querySelector('.tools-component');
    if (tools) {
      tools.style.display = 'none';
    }
  }
}

// Global data setter function
function setToolsData(toolsData) {
  console.log('Tools: setToolsData called');
  window.toolsState.allTools = toolsData || {};
  
  if (window.toolsBehavior) {
    window.toolsBehavior.setToolsData(toolsData);
  }
}
window.setToolsData = setToolsData;

// Navigation handler for global navigator integration
function handleToolsNavigation(elementId, state, parameters = {}) {
  console.log('Tools: Navigation handler called', { elementId, state, parameters });
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
      console.log('Tools: Unknown navigation state:', state);
      return false;
  }
  return true;
}
window.handleToolsNavigation = handleToolsNavigation;

// Init hook for dynamic content loading
function initializeTools(componentElement) {
  console.log('Tools: Initializing after dynamic load...');
  
  // Reinitialize the behavior if needed
  if (!window.toolsBehavior) {
    window.toolsBehavior = new ToolsBehavior();
  } else {
    // Rebind events
    window.toolsBehavior.bindEvents();
    
    // Re-render if data exists
    if (window.toolsState.allTools && Object.keys(window.toolsState.allTools).length > 0) {
      const select = document.getElementById('tools-category-select');
      if (select && select.value) {
        window.toolsBehavior.handleCategoryChange(select.value);
      }
    }
  }
}
window.initializeTools = initializeTools;

// Initialize the behavior
document.addEventListener('DOMContentLoaded', () => {
  if (!window.toolsBehavior) {
    window.toolsBehavior = new ToolsBehavior();
  }
});

// Also initialize if script loads after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (!window.toolsBehavior) {
      window.toolsBehavior = new ToolsBehavior();
    }
  });
} else {
  if (!window.toolsBehavior) {
    window.toolsBehavior = new ToolsBehavior();
  }
}
