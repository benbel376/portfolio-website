# Page and Container Definitions

## Page Definition Structure

### Basic Page Definition
```json
{
  "objects": [
    {
      "type": "container",
      "component": "vertical/type_1",
      "id": "main-container",
      "parentTab": "about",
      "dynamic": false,
      "navigation": {
        "defaultState": "hidden",
        "allowedStates": ["visible", "hidden"],
        "protected": false
      },
      "objects": [
        // Nested components here
      ]
    }
  ]
}
```

## Object Types

### Container Objects
Containers hold and organize other components:

```json
{
  "type": "container",
  "component": "vertical/type_1",
  "id": "summary-main-container",
  "parentTab": "about",
  "objects": [
    // Child components
  ]
}
```

**Available Container Types:**
- `vertical/type_1` - Stacks children vertically
- `horizontal/type_1` - Arranges children horizontally
- `slider/type_1` - Carousel functionality
- `collapsing/type_1` - Accordion-style layout

### Component Objects
Components are the actual content blocks:

```json
{
  "type": "component",
  "component": "heros/type_1",
  "id": "profile-hero",
  "variant": "main",
  "dynamic": false,
  "data": {
    "main": {
      "name": "John Doe",
      "title": "Software Engineer"
    }
  },
  "navigation": {
    "defaultState": "visible",
    "allowedStates": ["visible", "hidden"]
  }
}
```

## Required Fields

### All Objects
- `type`: "component" or "container"
- `component`: Component specification (e.g., "heros/type_1")
- `id`: Unique element identifier

### Container-Specific
- `objects`: Array of nested child objects (nested structure)
- `parent`: Parent container ID (flat structure)

### Component-Specific
- `variant`: Key to select data from data map
- `data`: Map of variant → component data

## Navigation Configuration

### Navigation Object Structure
```json
{
  "navigation": {
    "defaultState": "visible",
    "allowedStates": ["visible", "hidden", "scrollTo"],
    "protected": false
  }
}
```

### Default States
- `visible`: Component shown on page load
- `hidden`: Component hidden on page load

### Allowed States
Define which states the component can transition to:
- `visible`: Show component
- `hidden`: Hide component
- `scrollTo`: Scroll to component
- Custom states as needed

### Protected Flag
- `protected: true`: Requires authentication
- Automatically sets `dynamic: true`
- Content only delivered after authentication

## Parent Tab Association

### Purpose
Links page containers to navigation tabs for automatic highlighting:

```json
{
  "id": "summary-main-container",
  "parentTab": "about"
}
```

### How It Works
1. Page declares `parentTab` field
2. Builder adds `data-parent-tab="about"` attribute to HTML
3. Navigation system detects visible containers
4. Highlights corresponding tab automatically

### Examples
```json
// Main pages
{ "id": "summary-main-container", "parentTab": "about" }
{ "id": "skills-main-container", "parentTab": "skills" }
{ "id": "projects-main-container", "parentTab": "projects" }

// Child pages (inherit parent tab)
{ "id": "project-details-container", "parentTab": "projects" }
{ "id": "project-ai-platform-container", "parentTab": "projects" }
```

## Data Structure Patterns

### Variant-Based Data
Components can have multiple data variants:

```json
{
  "variant": "main",
  "data": {
    "main": {
      "title": "Primary Title",
      "description": "Primary description"
    },
    "alternative": {
      "title": "Alternative Title",
      "description": "Alternative description"
    }
  }
}
```

**Resolution Process:**
1. Builder reads `variant` field → "main"
2. Looks up `data["main"]`
3. Passes resolved data to loader
4. Loader uses data to populate template

### Data Management Philosophy

**IMPORTANT: All component data MUST be inline in page definitions.**

Components should have their data directly in the page definition JSON file:

```json
{
  "type": "component",
  "component": "projects_grid/type_1",
  "id": "my-projects-grid",
  "variant": "main",
  "data": {
    "main": {
      "projects": [
        {
          "name": "Project Name",
          "description": "Project description",
          "technologies": ["Tech1", "Tech2"]
        }
      ]
    }
  }
}
```

**Why Inline Data:**
- Single source of truth
- Simpler architecture
- Everything in one place
- No external file dependencies
- Easier to maintain and understand

**Note:** The `dataSource` pattern (external JSON files) is NOT part of the core design and should not be used. All data belongs in the page definition's `data` field.

## Dynamic Loading Configuration

### Marking Components as Dynamic
```json
{
  "type": "component",
  "component": "project_details/type_1",
  "id": "project-details",
  "dynamic": true
}
```

**Effects:**
- Component renders as shell on initial load
- Content loaded via API when container becomes visible
- Reduces initial page load time

### Automatic Dynamic Enforcement
Protected content automatically becomes dynamic:

```json
{
  "navigation": {
    "protected": true  // Automatically sets dynamic: true
  }
}
```

## Page Structure Patterns

### Nested Structure (Recommended)
Components nested inside containers:

```json
{
  "objects": [
    {
      "type": "container",
      "id": "main-container",
      "objects": [
        {
          "type": "component",
          "id": "hero-1"
        },
        {
          "type": "component",
          "id": "summary-1"
        }
      ]
    }
  ]
}
```

### Flat Structure (Legacy)
Components reference parent via `parent` field:

```json
{
  "objects": [
    {
      "type": "container",
      "id": "main-container"
    },
    {
      "type": "component",
      "id": "hero-1",
      "parent": "main-container"
    },
    {
      "type": "component",
      "id": "summary-1",
      "parent": "main-container"
    }
  ]
}
```

**Builder automatically detects structure type and processes accordingly.**

## Container Configuration

### Vertical Container
```json
{
  "type": "container",
  "component": "vertical/type_1",
  "id": "summary-main-container",
  "parentTab": "about",
  "navigation": {
    "defaultState": "hidden",
    "allowedStates": ["visible", "hidden"]
  },
  "objects": [
    // Child components
  ]
}
```

**Characteristics:**
- Stacks children vertically
- Full-width layout
- Flex-based positioning
- Fade in/out animations

### Horizontal Container
```json
{
  "type": "container",
  "component": "horizontal/type_1",
  "id": "features-container",
  "objects": [
    // Child components arranged horizontally
  ]
}
```

**Characteristics:**
- Arranges children horizontally
- Responsive wrapping
- Equal spacing
- Scroll support for overflow

## Component Configuration Examples

### Hero Component
```json
{
  "type": "component",
  "component": "heros/type_1",
  "id": "profile-hero",
  "variant": "main",
  "data": {
    "main": {
      "name": "John Doe",
      "title": "Software Engineer",
      "description": "Experienced developer...",
      "image": "blocks/components/heros/type_1/assets/media/avatar.png",
      "social": [
        {
          "type": "email",
          "label": "Email",
          "href": "mailto:john@example.com"
        },
        {
          "type": "linkedin",
          "label": "LinkedIn",
          "href": "https://linkedin.com/in/johndoe"
        }
      ],
      "cvDownload": {
        "href": "path/to/cv.pdf",
        "filename": "JohnDoe_CV.pdf"
      }
    }
  }
}
```

### Projects Grid Component
```json
{
  "type": "component",
  "component": "projects_grid/type_1",
  "id": "my-projects-grid",
  "dataSource": "definitions/data/projects_data_ml_mlops_t1.json",
  "navigation": {
    "defaultState": "visible"
  }
}
```

### Project Details Component
```json
{
  "type": "component",
  "component": "project_details/type_1",
  "id": "project-details-main",
  "dynamic": true,
  "dataSource": "definitions/data/projects_data_ml_mlops_t1.json",
  "navigation": {
    "defaultState": "visible"
  }
}
```

**Note:** Project details uses URL parameters to determine which project to display.

## Profile Configuration

### Profile Definition
```json
{
  "site": "top_bar_site_t2.json",
  "pages": [
    "summary_page_t1.json",
    "skills_page_t1.json",
    "projects_page_t1.json",
    "experience_page_t1.json",
    "education_page_t1.json",
    "control_page_t1.json"
  ]
}
```

**Fields:**
- `site`: Site layout configuration file
- `pages`: Array of page definition files to include

## Site Configuration

### Site Definition
```json
{
  "type": "top_bar/type_2",
  "branding": {
    "title": "Portfolio"
  },
  "navigation": {
    "defaultNavigation": {
      "hash": "summary-main-container/visible",
      "description": "Default navigation on first load"
    },
    "tabs": [
      {
        "label": "About",
        "target": "summary-main-container",
        "tabId": "about",
        "state": "visible"
      },
      {
        "label": "Skills",
        "target": "skills-main-container",
        "tabId": "skills",
        "state": "visible"
      },
      {
        "label": "Admin",
        "target": "admin-main-container",
        "tabId": "admin",
        "state": "visible",
        "protected": true
      }
    ]
  }
}
```

**Navigation Tab Fields:**
- `label`: Display text for tab
- `target`: Container ID to navigate to
- `tabId`: Tab identifier (matches `parentTab` in pages)
- `state`: Target state (usually "visible")
- `protected`: Requires authentication (optional)

## Best Practices

### ID Naming
- Use kebab-case: `summary-main-container`
- Be descriptive: `project-ai-platform-container`
- Include context: `my-projects-grid`, `profile-hero`

### Data Organization
- Use variant-based data for multiple versions
- Use external files for large datasets
- Keep data close to component definitions when small

### Navigation States
- Always define `defaultState`
- Include all states component supports in `allowedStates`
- Use `hidden` for containers not shown on initial load

### Protected Content
- Mark sensitive content as `protected: true`
- Don't manually set `dynamic: true` for protected content (automatic)
- Implement proper authentication in security endpoint

### Performance
- Mark heavy components as `dynamic: true`
- Use external data files for large datasets
- Keep initial page load minimal

### Maintainability
- Use consistent naming conventions
- Document data structures in comments
- Keep page definitions focused and organized
- Reuse component configurations when possible
