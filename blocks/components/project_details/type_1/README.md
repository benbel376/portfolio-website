# Project Details Component (type_1)

Individual project page with full details.

## Features
- Full-width banner image
- Technology tags
- Feature list
- Demo and repo links
- Back to projects button

## Data Structure
```json
{
  "projects": [
    {
      "id": "project-id",
      "title": "Project Title",
      "category": "Category",
      "status": "Completed",
      "year": "2023",
      "banner": "path/to/banner.png",
      "description": "Full description...",
      "technologies": ["Tech1", "Tech2"],
      "features": ["Feature 1", "Feature 2"],
      "demoLink": "https://demo.example.com",
      "repoLink": "https://github.com/..."
    }
  ]
}
```

## URL Parameters
Component reads `?project={id}` from URL to display specific project.

## Usage
```json
{
  "type": "component",
  "component": "project_details/type_1",
  "id": "project-details",
  "dynamic": true,
  "data": { "main": { ... } }
}
```

## Files
- `project_details_structure_t1.html` - Detail template
- `project_details_style_t1.css` - Page styles
- `project_details_behavior_t1.js` - Back button, data loading
- `project_details_loader_t1.php` - URL param handling
