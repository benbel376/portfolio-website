// Use global state to prevent redeclaration issues on dynamic reload
window.workflowState = window.workflowState || {
  currentScenario: null,
  allWorkflows: {}
};

class WorkflowBehaviorT2 {
  constructor() {
    this.state = window.workflowState;
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
    this.state.allWorkflows = workflowData;
    const select = document.getElementById('workflow-scenario-select');
    if (select && select.value) {
      console.log('Workflow T2: Rendering scenario after data load:', select.value);
      this.handleScenarioChange(select.value);
    }
  }

  handleScenarioChange(scenarioKey) {
    this.state.currentScenario = scenarioKey;
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
    const scenarioData = this.getScenarioMetadata(this.state.currentScenario);
    
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
        iconElement.setAttribute('name', iconMap[this.state.currentScenario] || 'git-network-outline');
        
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
    console.log('Workflow T2: Workflow data for scenario:', this.state.allWorkflows[this.state.currentScenario]);
    
    if (!stepsContainer || !this.state.allWorkflows[this.state.currentScenario]) {
      console.log('Workflow T2: Cannot render - missing container or data');
      return;
    }

    const workflowSteps = this.state.allWorkflows[this.state.currentScenario];
    
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

}

// Navigation handler - Standard signature (elementId, state, parameters)
function handleWorkflowNavigation(elementId, state, parameters = {}) {
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
      element.scrollIntoView({ behavior: 'smooth' });
      break;
    default:
      console.warn(`Workflow: Unknown navigation state: ${state}`);
      return false;
  }
  return true;
}

// Export to global scope
window.handleWorkflowNavigation = handleWorkflowNavigation;

// Data setter function
function setWorkflowData(data) {
  console.log('Workflow T2: setWorkflowData called with data:', data);
  
  // Store in global state
  if (!window.workflowState) {
    window.workflowState = { currentScenario: null, allWorkflows: {} };
  }
  window.workflowState.allWorkflows = data || {};
  
  // If component is already initialized, pass data to the behavior instance
  if (window.workflowBehaviorT2) {
    window.workflowBehaviorT2.setWorkflowData(data);
  } else {
    console.log('Workflow T2: Data stored, waiting for behavior initialization');
  }
}

// Export to global scope
window.setWorkflowData = setWorkflowData;

// Init hook for dynamic loading
function initializeWorkflow(componentElement) {
  console.log('Workflow T2: Initializing after dynamic load...');
  
  if (window.workflowData && Object.keys(window.workflowData).length > 0) {
    // Reinitialize the behavior
    if (window.workflowBehaviorT2) {
      window.workflowBehaviorT2.loadInitialData();
    }
  }
}

// Export to global scope
window.initializeWorkflow = initializeWorkflow;

// Initialize the behavior
document.addEventListener('DOMContentLoaded', () => {
  window.workflowBehaviorT2 = new WorkflowBehaviorT2();
  
  // If data was set before initialization, load it now
  if (window.workflowState && window.workflowState.allWorkflows && Object.keys(window.workflowState.allWorkflows).length > 0) {
    console.log('Workflow T2: Loading pre-initialized data');
    window.workflowBehaviorT2.setWorkflowData(window.workflowState.allWorkflows);
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkflowBehaviorT2;
}
