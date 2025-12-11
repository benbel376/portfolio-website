# Testimonials Component (type_1)

Client testimonials carousel.

## Features
- Slideshow with navigation
- Quote display with author
- Author photo and title
- Indicator dots
- Auto-advance (optional)

## Data Structure
```json
{
  "testimonials": [
    {
      "quote": "Testimonial text...",
      "author": "Author Name",
      "title": "Job Title",
      "company": "Company Name",
      "image": "path/to/photo.png"
    }
  ]
}
```

## Usage
```json
{
  "type": "component",
  "component": "testimonials/type_1",
  "id": "client-testimonials",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Customization
- Quote styling and max-width
- Slide transition effects
- Auto-advance interval in JS

## Files
- `testimonials_structure_t1.html` - Carousel template
- `testimonials_style_t1.css` - Quote card styles
- `testimonials_behavior_t1.js` - Carousel logic
- `testimonials_loader_t1.php` - Data injection
