# Experience Component (type_1)

Work history timeline with expandable job details.

## Features
- Vertical timeline layout
- Company logo/icon support
- Expandable job descriptions
- Technology tags
- Achievement highlights

## Data Structure
```json
{
  "experiences": [
    {
      "company": "Company Name",
      "logo": "path/to/logo.png",
      "position": "Job Title",
      "period": "2020 - Present",
      "location": "City, Country",
      "description": "Role description...",
      "achievements": ["Achievement 1", "Achievement 2"],
      "technologies": ["Tech1", "Tech2"]
    }
  ]
}
```

## Usage
```json
{
  "type": "component",
  "component": "experience/type_1",
  "id": "work-experience",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Customization
- Timeline styling in `experience_style_t1.css`
- Expand/collapse animation timing
- Add custom achievement icons

## Files
- `experience_structure_t1.html` - Template
- `experience_style_t1.css` - Timeline styles
- `experience_behavior_t1.js` - Expand/collapse logic
- `experience_loader_t1.php` - Data rendering
