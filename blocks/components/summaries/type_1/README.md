# Summary Component (type_1)

Professional summary with highlight card and expertise grid.

## Features
- Header with icon and title
- Highlight card with icon
- Multi-paragraph content
- Expertise items grid with icons

## Data Structure
```json
{
  "decorationImage": "path/to/decoration.png",
  "highlight": {
    "icon": "bulb-outline",
    "title": "Highlight Title",
    "subtitle": "Highlight description"
  },
  "paragraphs": ["Paragraph 1...", "Paragraph 2..."],
  "expertiseItems": [
    { "icon": "code-outline", "title": "Skill", "description": "Description" }
  ]
}
```

## Usage
```json
{
  "type": "component",
  "component": "summaries/type_1",
  "id": "professional-summary",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Customization
- Modify grid layout in `summary_style_t1.css`
- Add expertise item styles with BEM modifiers
- Adjust responsive breakpoints as needed

## Files
- `summary_structure_t1.html` - Template
- `summary_style_t1.css` - Styles
- `summary_behavior_t1.js` - Navigation handler
- `summary_loader_t1.php` - Data injection
