# Certifications Component (type_1)

Certificate slideshow with navigation.

## Features
- Slideshow with prev/next navigation
- Pagination dots
- Certificate image display
- Issuer and date info
- Link to verify certificate

## Data Structure
```json
{
  "certifications": [
    {
      "name": "Certificate Name",
      "issuer": "Issuing Organization",
      "dateIssued": "2023-01",
      "image": "path/to/certificate.png",
      "description": "Certificate description...",
      "link": "https://verify.example.com/..."
    }
  ]
}
```

## Usage
```json
{
  "type": "component",
  "component": "certifications/type_1",
  "id": "my-certifications",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Customization
- Slide transition timing in JS
- Auto-advance interval (optional)
- Image aspect ratio in CSS

## Files
- `certifications_structure_t1.html` - Slideshow template
- `certifications_style_t1.css` - Slide styles
- `certifications_behavior_t1.js` - Slideshow logic
- `certifications_loader_t1.php` - Data injection
