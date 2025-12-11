# Competencies Component (type_1)

Skills list with category filtering and flowchart view.

## Features
- Tabbed view: List / Flowcharts
- Category dropdown filter
- Skill cards with proficiency
- Flowchart slideshow for processes
- Pagination for large lists

## Data Structure
```json
{
  "categories": [
    {
      "name": "Category Name",
      "skills": [
        {
          "name": "Skill Name",
          "proficiency": 85,
          "description": "Skill description..."
        }
      ],
      "flowcharts": [
        {
          "title": "Process Name",
          "image": "path/to/flowchart.png"
        }
      ]
    }
  ]
}
```

## Usage
```json
{
  "type": "component",
  "component": "competencies/type_1",
  "id": "core-competencies",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Customization
- Items per page in JS constants
- Proficiency bar colors in CSS
- Add new view tabs as needed

## Files
- `competencies_structure_t1.html` - Tabbed layout
- `competencies_style_t1.css` - Card and tab styles
- `competencies_behavior_t1.js` - Tab/filter/pagination logic
- `competencies_loader_t1.php` - Data rendering
