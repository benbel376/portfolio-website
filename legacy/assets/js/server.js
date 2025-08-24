// PUBLIC PORTFOLIO JAVASCRIPT COORDINATION

// General Site-Level Utilities
import './general/navigation_behavior_v1.js';
import './general/theme_behavior_v1.js';
import './general/authentication_v1.js';
import './general/component_loader_v1.js';
import './general/mobile_menu_behavior.js';
import './general/collapsible_section_behavior_v1.js';
import './general/pagination_behavior_v1.js';

// Profile Component Behaviors
import './profile/experience/profile_experience_behavior.js';
import './profile/education/profile_education_behavior.js';
import './profile/certifications/profile_certifications_behavior.js';
import './profile/skills/profile_skills_behavior.js';

// Projects Component Behaviors
import './projects/projects_list/projects_projects_list_behavior.js';

// Blog Component Behaviors
import './blog/articles/blog_articles_behavior.js';

// Control Component Behaviors
import './control/json_editor/json_editor_behavior_v1.js';
import './control/media_manager/media_manager_behavior_v1.js';
import './control/pdf_viewer/control_pdf_viewer_behavior_v1.js';

// Initialize public portfolio
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 Public Portfolio Initializing...');

    // Initialize navigation
    if (window.initializeNavigation) {
        window.initializeNavigation();
    }

    // Initialize theme
    if (window.initializeTheme) {
        window.initializeTheme();
    }

    // Initialize components based on current page
    const currentHash = window.location.hash || '#profile';
    if (window.initializeComponents) {
        window.initializeComponents(currentHash);
    }

    console.log('✅ Public Portfolio Ready');
});

console.log('🌐 Public Portfolio JavaScript loaded');