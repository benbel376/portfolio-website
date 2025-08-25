class WorkflowBehaviorT2 {
  constructor() {
    this.currentScenario = null;
    this.allWorkflows = {};
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadInitialData();
  }

  bindEvents() {
    const select = document.getElementById('workflow-scenario-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.handleScenarioChange(e.target.value);
      });
    }

    // Add click events for workflow steps if needed
    document.addEventListener('click', (e) => {
      if (e.target.closest('.workflow__step-item')) {
        const stepItem = e.target.closest('.workflow__step-item');
        this.handleStepClick(stepItem);
      }
    });
  }

  loadInitialData() {
    // This will be populated by the PHP loader
    const select = document.getElementById('workflow-scenario-select');
    if (select && select.options.length > 0) {
      console.log('Workflow T2: Loading initial scenario:', select.value);
      this.handleScenarioChange(select.value);
    } else {
      console.log('Workflow T2: No select element or options found');
    }
  }

  setWorkflowData(workflowData) {
    console.log('Workflow T2: Setting workflow data:', workflowData);
    this.allWorkflows = workflowData;
    const select = document.getElementById('workflow-scenario-select');
    if (select && select.value) {
      console.log('Workflow T2: Rendering scenario after data load:', select.value);
      this.handleScenarioChange(select.value);
    }
  }

  handleScenarioChange(scenarioKey) {
    this.currentScenario = scenarioKey;
    this.updateScenarioInfo();
    this.renderWorkflow();
  }

  updateScenarioInfo() {
    const titleElement = document.getElementById('workflow-scenario-title');
    const descriptionElement = document.getElementById('workflow-scenario-description');
    const iconElement = document.getElementById('workflow-scenario-icon');
    
    if (!titleElement || !descriptionElement || !iconElement) {
      console.log('Workflow T2: Scenario info elements not found');
      return;
    }

    // Get the scenario data from the workflow data structure
    const scenarioData = this.getScenarioMetadata(this.currentScenario);
    
    if (scenarioData) {
      // Animate out
      titleElement.style.opacity = '0';
      descriptionElement.style.opacity = '0';
      iconElement.style.opacity = '0';
      
      setTimeout(() => {
        titleElement.textContent = scenarioData.title;
        descriptionElement.textContent = scenarioData.description;
        
        // Update icon based on scenario
        const iconMap = {
          'scenario_0': 'brain-outline',      // ML/AI Projects
          'scenario_1': 'code-slash-outline', // Full-Stack Development
          'scenario_2': 'analytics-outline'   // Data Analytics Projects
        };
        iconElement.setAttribute('name', iconMap[this.currentScenario] || 'git-network-outline');
        
        // Animate in
        titleElement.style.opacity = '1';
        descriptionElement.style.opacity = '1';
        iconElement.style.opacity = '1';
      }, 200);
    }
  }

  getScenarioMetadata(scenarioKey) {
    // This will be populated by PHP with scenario metadata
    const scenarioMeta = window.workflowScenarioMeta || {};
    return scenarioMeta[scenarioKey] || null;
  }

  renderWorkflow() {
    const stepsContainer = document.getElementById('workflow-steps-list');
    console.log('Workflow T2: Steps container found:', !!stepsContainer);
    console.log('Workflow T2: Workflow data for scenario:', this.allWorkflows[this.currentScenario]);
    
    if (!stepsContainer || !this.allWorkflows[this.currentScenario]) {
      console.log('Workflow T2: Cannot render - missing container or data');
      return;
    }

    const workflowSteps = this.allWorkflows[this.currentScenario];
    
    // Clear current steps with fade out
    const currentSteps = stepsContainer.querySelectorAll('.workflow__step-item');
    currentSteps.forEach((step, index) => {
      setTimeout(() => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(-20px)';
      }, index * 50);
    });

    // Render new steps after fade out completes
    setTimeout(() => {
      stepsContainer.innerHTML = '';
      
      workflowSteps.forEach((step, index) => {
        const stepElement = this.createStepElement(step, index + 1);
        stepsContainer.appendChild(stepElement);
      });

      // Trigger fade in animation
      setTimeout(() => {
        const newSteps = stepsContainer.querySelectorAll('.workflow__step-item');
        newSteps.forEach((step, index) => {
          setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }, 50);
    }, 300);

    console.log('Workflow T2: Rendered', workflowSteps.length, 'workflow steps');
  }

  createStepElement(step, stepNumber) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'workflow__step-item';
    stepDiv.style.opacity = '0';
    stepDiv.style.transform = 'translateY(10px)';

    stepDiv.innerHTML = `
      <div class="workflow__step-bullet"></div>
      <p class="workflow__step-description">${step.description || 'Step description'}</p>
    `;

    return stepDiv;
  }

  handleStepClick(stepItem) {
    // Add subtle bounce animation on click
    stepItem.style.transform = 'translateY(-4px) scale(0.98)';
    setTimeout(() => {
      stepItem.style.transform = 'translateY(0) scale(1)';
    }, 150);
    
    console.log('Workflow T2: Step clicked');
  }

  // Navigation handler for the framework
  handleWorkflowNavigation(action, data) {
    switch (action) {
      case 'show':
        this.show();
        break;
      case 'hide':
        this.hide();
        break;
      case 'scrollTo':
        this.scrollTo();
        break;
      default:
        console.warn(`WorkflowBehaviorT2: Unknown navigation action: ${action}`);
    }
  }

  show() {
    const workflow = document.querySelector('.workflow');
    if (workflow) {
      workflow.classList.remove('nav-hidden');
      workflow.classList.add('nav-visible');
    }
  }

  hide() {
    const workflow = document.querySelector('.workflow');
    if (workflow) {
      workflow.classList.remove('nav-visible');
      workflow.classList.add('nav-hidden');
    }
  }

  scrollTo() {
    const workflow = document.querySelector('.workflow');
    if (workflow) {
      workflow.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// Navigation handler for the framework (must be in global scope)
function handleWorkflowNavigation(action, data) {
  if (window.workflowBehaviorT2) {
    window.workflowBehaviorT2.handleWorkflowNavigation(action, data);
  }
}

// Initialize the behavior
document.addEventListener('DOMContentLoaded', () => {
  window.workflowBehaviorT2 = new WorkflowBehaviorT2();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkflowBehaviorT2;
}
