# Education History Component (type_1)

Education timeline with institution details.

## Features
- Vertical timeline layout
- Institution logos
- Degree and field display
- Date range formatting
- Achievement/honors list

## Data Structure
```json
{
  "education": [
    {
      "institution": "University Name",
      "logo": "path/to/logo.png",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "period": "2016 - 2020",
      "location": "City, Country",
      "description": "Program description...",
      "achievements": ["Honor 1", "Award 2"]
    }
  ]
}
```

## Usage
```json
{
  "type": "component",
  "component": "education_history/type_1",
  "id": "education",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Files
- `education_history_structure_t1.html` - Template
- `education_history_style_t1.css` - Timeline styles
- `education_history_behavior_t1.js` - Navigation handler
- `education_history_loader_t1.php` - Data rendering
