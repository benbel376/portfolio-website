/**
 * Education History Component Behavior
 * Handles dynamic content rendering and timeline display
 */

// Global education history data storage
let educationHistoryData = [];

/**
 * Initialize the education history component
 */
function initializeEducationHistory() {
    console.log('Education History: Initializing component...');
    
    // Find containers
    const timelineContainer = document.getElementById('education-history-timeline');
    const emptyState = document.getElementById('education-history-empty');
    
    if (!timelineContainer) {
        console.error('Education History: Timeline container not found');
        return;
    }
    
    console.log('Education History: Timeline container found:', !!timelineContainer);
    
    // Check if we have data to render
    if (educationHistoryData.length > 0) {
        console.log('Education History: Rendering with existing data');
        renderEducationHistory();
    } else {
        console.log('Education History: No data available, showing empty state');
        showEmptyState();
    }
}

/**
 * Set education history data from PHP loader
 */
function setEducationHistoryData(data) {
    console.log('Education History: Setting education data:', data);
    educationHistoryData = data || [];
    
    // If component is already initialized, render the data
    const timelineContainer = document.getElementById('education-history-timeline');
    if (timelineContainer) {
        renderEducationHistory();
    }
}

/**
 * Render the education history timeline
 */
function renderEducationHistory() {
    const timelineContainer = document.getElementById('education-history-timeline');
    const emptyState = document.getElementById('education-history-empty');
    
    if (!timelineContainer) return;
    
    // Clear existing content
    timelineContainer.innerHTML = '';
    
    // Hide empty state
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Check if we have education data
    if (!educationHistoryData || educationHistoryData.length === 0) {
        showEmptyState();
        return;
    }
    
    // Sort education data by end date (most recent first)
    const sortedEducation = [...educationHistoryData].sort((a, b) => {
        const endDateA = new Date(a.endDate || a.startDate || '1900-01-01');
        const endDateB = new Date(b.endDate || b.startDate || '1900-01-01');
        return endDateB - endDateA;
    });
    
    // Render each education item
    sortedEducation.forEach((education, index) => {
        const item = createEducationItem(education, index);
        timelineContainer.appendChild(item);
    });
    
    console.log('Education History: Rendered', educationHistoryData.length, 'education items');
}

/**
 * Create a single education timeline item
 */
function createEducationItem(education, index) {
    const item = document.createElement('div');
    item.className = 'education-history__item';
    item.setAttribute('data-education-index', index);
    
    // Format date period
    const period = formatEducationPeriod(education.startDate, education.endDate);
    
    // Create highlights section if available
    const highlightsSection = education.highlights && education.highlights.length > 0 ? `
        <div class="education-history__highlights">
            <h4 class="education-history__highlights-title">Key Achievements</h4>
            <ul class="education-history__highlights-list">
                ${education.highlights.map(highlight => 
                    `<li class="education-history__highlight-item">${escapeHtml(highlight)}</li>`
                ).join('')}
            </ul>
        </div>
    ` : '';
    
    // Determine degree icon and color based on degree type
    const degreeInfo = getDegreeInfo(education.degree || '');
    
    item.innerHTML = `
        <div class="education-history__dot"></div>
        <div class="education-history__content">
            <div class="education-history__header-section">
                <div class="education-history__header-content">
                    <h3 class="education-history__institution">${escapeHtml(education.institution || 'Institution')}</h3>
                    <p class="education-history__degree">${escapeHtml(education.degree || 'Degree')}</p>
                    <p class="education-history__period">${period}</p>
                </div>
                <div class="education-history__degree-icon" data-degree-type="${degreeInfo.type}">
                    <ion-icon name="${degreeInfo.icon}"></ion-icon>
                </div>
            </div>
            ${education.description ? `
                <p class="education-history__description">${escapeHtml(education.description)}</p>
            ` : ''}
            ${highlightsSection}
        </div>
    `;
    
    return item;
}

/**
 * Format education period dates
 */
function formatEducationPeriod(startDate, endDate) {
    if (!startDate) return 'Date not specified';
    
    try {
        const start = new Date(startDate);
        const startFormatted = start.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
        
        if (!endDate || endDate.toLowerCase() === 'present') {
            return `${startFormatted} - Present`;
        }
        
        const end = new Date(endDate);
        const endFormatted = end.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
        
        return `${startFormatted} - ${endFormatted}`;
    } catch (error) {
        console.warn('Education History: Error formatting dates:', error);
        return startDate + (endDate ? ` - ${endDate}` : ' - Present');
    }
}

/**
 * Show empty state
 */
function showEmptyState() {
    const timelineContainer = document.getElementById('education-history-timeline');
    const emptyState = document.getElementById('education-history-empty');
    
    if (timelineContainer) {
        timelineContainer.innerHTML = '';
    }
    
    if (emptyState) {
        emptyState.style.display = 'block';
    }
}

/**
 * Get appropriate degree icon and type based on degree text
 */
function getDegreeInfo(degree) {
    const degreeText = degree.toLowerCase();
    
    if (degreeText.includes('master') || degreeText.includes('msc') || degreeText.includes('m.s') || degreeText.includes('ms ')) {
        return { icon: 'school-outline', type: 'masters' };
    } else if (degreeText.includes('bachelor') || degreeText.includes('bsc') || degreeText.includes('b.s') || degreeText.includes('bs ')) {
        return { icon: 'library-outline', type: 'bachelors' };
    } else if (degreeText.includes('phd') || degreeText.includes('doctorate') || degreeText.includes('ph.d')) {
        return { icon: 'telescope-outline', type: 'doctorate' };
    } else if (degreeText.includes('associate') || degreeText.includes('diploma')) {
        return { icon: 'document-outline', type: 'associate' };
    } else {
        return { icon: 'school-outline', type: 'default' };
    }
}

/**
 * Utility function to escape HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Reset education history animations
 */
function resetEducationHistoryAnimations() {
    const items = document.querySelectorAll('.education-history__item');
    items.forEach((item, index) => {
        item.style.animation = 'none';
        item.offsetHeight; // Trigger reflow
        item.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
    });
}

/**
 * Add fade-in animation keyframes
 */
function addEducationHistoryAnimations() {
    if (document.getElementById('education-history-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'education-history-animations';
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .education-history__item {
            opacity: 0;
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .education-history__item:nth-child(1) { animation-delay: 0.1s; }
        .education-history__item:nth-child(2) { animation-delay: 0.2s; }
        .education-history__item:nth-child(3) { animation-delay: 0.3s; }
        .education-history__item:nth-child(4) { animation-delay: 0.4s; }
        .education-history__item:nth-child(5) { animation-delay: 0.5s; }
        .education-history__item:nth-child(n+6) { animation-delay: 0.6s; }
    `;
    document.head.appendChild(style);
}

// Export functions to global scope for framework integration
window.handleEducationHistoryNavigation = initializeEducationHistory;
window.setEducationHistoryData = setEducationHistoryData;
window.initializeEducationHistory = initializeEducationHistory;
window.resetEducationHistoryAnimations = resetEducationHistoryAnimations;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    addEducationHistoryAnimations();
    // Small delay to ensure all elements are ready
    setTimeout(initializeEducationHistory, 100);
});

// Listen for component loaded events
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.componentId && event.detail.componentId.includes('education-history')) {
        addEducationHistoryAnimations();
        setTimeout(initializeEducationHistory, 100);
    }
});

console.log('Education History: Component behavior script loaded');
