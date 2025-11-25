class WorkflowBehavior {
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
      if (e.target.closest('.workflow__step-card')) {
        const stepCard = e.target.closest('.workflow__step-card');
        this.handleStepClick(stepCard);
      }
    });
  }

  loadInitialData() {
    // This will be populated by the PHP loader
    const select = document.getElementById('workflow-scenario-select');
    if (select && select.options.length > 0) {
      console.log('Workflow: Loading initial scenario:', select.value);
      this.handleScenarioChange(select.value);
    } else {
      console.log('Workflow: No select element or options found');
    }
  }

  setWorkflowData(workflowData) {
    console.log('Workflow: Setting workflow data:', workflowData);
    this.allWorkflows = workflowData;
    const select = document.getElementById('workflow-scenario-select');
    if (select && select.value) {
      console.log('Workflow: Rendering scenario after data load:', select.value);
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
    
    if (!titleElement || !descriptionElement) {
      console.log('Workflow: Scenario info elements not found');
      return;
    }

    // Get scenario data from the select option
    const select = document.getElementById('workflow-scenario-select');
    if (!select) return;

    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption) return;

    // Get the scenario data from the workflow data structure
    const scenarioData = this.getScenarioMetadata(this.currentScenario);
    
    if (scenarioData) {
      // Animate out
      titleElement.style.opacity = '0';
      descriptionElement.style.opacity = '0';
      
      setTimeout(() => {
        titleElement.textContent = scenarioData.title;
        descriptionElement.textContent = scenarioData.description;
        
        // Animate in
        titleElement.style.opacity = '1';
        descriptionElement.style.opacity = '1';
      }, 200);
    }
  }

  getScenarioMetadata(scenarioKey) {
    // This will be populated by PHP with scenario metadata
    const scenarioMeta = window.workflowScenarioMeta || {};
    return scenarioMeta[scenarioKey] || null;
  }

  renderWorkflow() {
    const stepsContainer = document.getElementById('workflow-steps');
    console.log('Workflow: Steps container found:', !!stepsContainer);
    console.log('Workflow: Workflow data for scenario:', this.allWorkflows[this.currentScenario]);
    
    if (!stepsContainer || !this.allWorkflows[this.currentScenario]) {
      console.log('Workflow: Cannot render - missing container or data');
      return;
    }

    const workflowSteps = this.allWorkflows[this.currentScenario];
    
    // Clear current steps with fade out
    const currentSteps = stepsContainer.querySelectorAll('.workflow__step');
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
        const newSteps = stepsContainer.querySelectorAll('.workflow__step');
        newSteps.forEach((step, index) => {
          setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
          }, index * 150);
        });
      }, 50);
    }, 300);

    console.log('Workflow: Rendered', workflowSteps.length, 'workflow steps');
  }

  createStepElement(step, stepNumber) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'workflow__step';
    stepDiv.style.opacity = '0';
    stepDiv.style.transform = 'translateY(30px)';

    const toolsHtml = step.tools ? step.tools.map(tool => 
      `<span class="workflow__step-tool">${tool}</span>`
    ).join('') : '';

    stepDiv.innerHTML = `
      <div class="workflow__step-connector">
        <span class="workflow__step-number">${stepNumber}</span>
      </div>
      <div class="workflow__step-card">
        <div class="workflow__step-icon">
          <ion-icon name="${step.icon || 'checkmark-circle-outline'}"></ion-icon>
        </div>
        <h3 class="workflow__step-title">${step.title || 'Process Step'}</h3>
        <p class="workflow__step-description">${step.description || 'Step description'}</p>
        ${toolsHtml ? `<div class="workflow__step-tools">${toolsHtml}</div>` : ''}
      </div>
    `;

    return stepDiv;
  }

  handleStepClick(stepCard) {
    // Add subtle bounce animation on click
    stepCard.style.transform = 'translateY(-12px) scale(0.98)';
    setTimeout(() => {
      stepCard.style.transform = 'translateY(-8px) scale(1)';
    }, 150);
    
    console.log('Workflow: Step clicked');
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
        console.warn(`WorkflowBehavior: Unknown navigation action: ${action}`);
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
  if (window.workflowBehavior) {
    window.workflowBehavior.handleWorkflowNavigation(action, data);
  }
}

// Initialize the behavior
document.addEventListener('DOMContentLoaded', () => {
  window.workflowBehavior = new WorkflowBehavior();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkflowBehavior;
}
