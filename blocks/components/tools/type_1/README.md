# Tools Component (type_1)

Technology toolkit grid with category filtering.

## Features
- Category dropdown filter
- Tool cards with icons
- Modal with tool details
- Projects using each tool
- Pagination for large lists

## Data Structure
```json
{
  "categories": [
    {
      "name": "Category Name",
      "tools": [
        {
          "name": "Tool Name",
          "icon": "logo-python",
          "description": "Tool description...",
          "projects": ["Project 1", "Project 2"]
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
  "component": "tools/type_1",
  "id": "tech-toolkit",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Customization
- Grid columns in CSS media queries
- Modal animation timing
- Icon library (uses Ionicons)

## Files
- `tools_structure_t1.html` - Grid and modal template
- `tools_style_t1.css` - Card and modal styles
- `tools_behavior_t1.js` - Filter/modal logic
- `tools_loader_t1.php` - Data rendering
