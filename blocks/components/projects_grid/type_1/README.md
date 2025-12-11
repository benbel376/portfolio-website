# Projects Grid Component (type_1)

Filterable project portfolio grid.

## Features
- Search by project name
- Category filter dropdown
- Project cards with thumbnails
- Pagination controls
- Click to view details

## Data Structure
```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "Project Name",
      "description": "Short description...",
      "category": "Category",
      "thumbnail": "path/to/thumb.png",
      "technologies": ["Tech1", "Tech2"],
      "status": "Completed",
      "year": "2023"
    }
  ]
}
```

## Usage
```json
{
  "type": "component",
  "component": "projects_grid/type_1",
  "id": "my-projects",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Navigation
Clicking a project navigates to:
```
#project-details-container?project={project-id}
```

## Customization
- Grid columns in CSS
- Items per page in JS
- Card hover effects

## Files
- `projects_grid_structure_t1.html` - Grid template
- `projects_grid_style_t1.css` - Card styles
- `projects_grid_behavior_t1.js` - Filter/search/pagination
- `projects_grid_loader_t1.php` - Data rendering
