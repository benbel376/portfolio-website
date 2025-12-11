# Hero Component (type_1)

Profile hero section with avatar, social links, and CV download.

## Features
- Animated floating blobs background
- Floating tech icons
- Avatar with rotating ring effects
- Social media links
- CV download button
- Light/dark theme support

## Data Structure
```json
{
  "name": "John Doe",
  "title": "Software Engineer",
  "description": "Professional description...",
  "image": "path/to/avatar.png",
  "social": [
    { "type": "email", "label": "Email", "href": "mailto:..." },
    { "type": "linkedin", "label": "LinkedIn", "href": "https://..." }
  ],
  "cvDownload": {
    "href": "path/to/cv.pdf",
    "filename": "JohnDoe_CV.pdf"
  }
}
```

## Usage
```json
{
  "type": "component",
  "component": "heros/type_1",
  "id": "profile-hero",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Customization
- Edit `hero_style_t1.css` for visual changes
- Modify blob animations in CSS `@keyframes`
- Add social icon types in `hero_loader_t1.php` `buildSocialLinks()`

## Files
- `hero_structure_t1.html` - Template with placeholders
- `hero_style_t1.css` - Styles with theme variables
- `hero_behavior_t1.js` - Navigation handler
- `hero_loader_t1.php` - Data injection and rendering
