/**
 * General Collapsible Section Behavior
 */

function initializeCollapsibleSections() {
    const sections = document.querySelectorAll('.collapsible-section');
    let uniqueIdCounter = 0;

    sections.forEach(section => {
        const header = section.querySelector('.collapsible-section__header');
        const content = section.querySelector('.collapsible-section__content');
        const iconElement = section.querySelector('.collapsible-section__icon ion-icon');

        if (!header || !content || !iconElement) {
            console.warn('Collapsible section missing required elements:', section);
            return;
        }

        // Get section-specific icons based on title or data attributes
        const titleElement = header.querySelector('.collapsible-section__title');
        const sectionTitle = (titleElement ? titleElement.textContent : '').toLowerCase();
        const collapsedIcon = getSectionIcon(sectionTitle, false);
        const expandedIcon = getSectionIcon(sectionTitle, true);

        // Ensure content has a unique ID for ARIA
        let contentId = content.id;
        if (!contentId) {
            contentId = `collapsible-content-${uniqueIdCounter++}`;
            content.id = contentId;
        }
        header.setAttribute('aria-controls', contentId);

        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            header.setAttribute('aria-expanded', !isExpanded);

            if (!isExpanded) {
                // Expanding
                content.removeAttribute('hidden');
                // Force a reflow to ensure the browser picks up the state change before adding the class
                // Reading an offsetHeight is a common way to trigger reflow.
                void content.offsetHeight;
                section.classList.add('expanded');
                iconElement.setAttribute('name', expandedIcon);
            } else {
                // Collapsing
                section.classList.remove('expanded');
                iconElement.setAttribute('name', collapsedIcon);
                // Delay setting 'hidden' to allow the CSS transition (0.3s) to complete
                setTimeout(() => {
                    // Check if it's still collapsed before hiding, in case of rapid clicks or state changes
                    if (!section.classList.contains('expanded')) {
                        content.setAttribute('hidden', '');
                    }
                }, 300); // Duration should match CSS transition time
            }
        });

        // Optional: Initialize to open if it has a specific class or data attribute
        if (section.classList.contains('expanded-by-default')) {
            // Ensure it's not hidden if it should be open by default
            if (content.hasAttribute('hidden')) {
                content.removeAttribute('hidden');
            }
            header.click();
        }
    });

    console.log('Collapsible sections initialized (' + sections.length + ')');
}

/**
 * Get section-specific icons based on the section title
 * @param {string} sectionTitle - The title of the section (lowercase)
 * @param {boolean} isExpanded - Whether the section is expanded
 * @returns {string} - The icon name to use
 */
function getSectionIcon(sectionTitle, isExpanded) {
    const iconMappings = {
        'summary': {
            collapsed: 'document-text-outline',
            expanded: 'chevron-up-outline'
        },
        'experience': {
            collapsed: 'briefcase-outline',
            expanded: 'chevron-up-outline'
        },
        'education': {
            collapsed: 'school-outline',
            expanded: 'chevron-up-outline'
        },
        'projects': {
            collapsed: 'code-slash-outline',
            expanded: 'chevron-up-outline'
        },
        'skills': {
            collapsed: 'settings-outline',
            expanded: 'chevron-up-outline'
        },
        'contact': {
            collapsed: 'mail-outline',
            expanded: 'chevron-up-outline'
        }
    };

    // Find matching section
    for (const [key, icons] of Object.entries(iconMappings)) {
        if (sectionTitle.includes(key)) {
            return isExpanded ? icons.expanded : icons.collapsed;
        }
    }

    // Default fallback
    return isExpanded ? 'chevron-up-outline' : 'add-outline';
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeCollapsibleSections);

// Make it globally available if it needs to be called again (e.g., after dynamic content load)
window.initializeCollapsibleSections = initializeCollapsibleSections;