# Workflow Component (type_2)

Working methodology with scenario-based steps.

## Features
- Scenario dropdown selector
- Step-by-step list display
- Scenario description header
- Icon per scenario
- Expandable step details

## Data Structure
```json
{
  "scenarios": [
    {
      "name": "Scenario Name",
      "icon": "git-network-outline",
      "description": "Scenario description...",
      "steps": [
        {
          "title": "Step Title",
          "description": "Step description...",
          "details": ["Detail 1", "Detail 2"]
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
  "component": "workflow/type_2",
  "id": "working-methodology",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Customization
- Step numbering style in CSS
- Expand/collapse animations
- Add custom scenario icons

## Files
- `workflow_structure_t2.html` - List template
- `workflow_style_t2.css` - Step styles
- `workflow_behavior_t2.js` - Scenario switching
- `workflow_loader_t2.php` - Data rendering
