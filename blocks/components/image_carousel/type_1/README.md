# Image Carousel Component (type_1)

Image slideshow with navigation.

## Data Structure
```json
{
  "images": [
    { "src": "path/to/image.png", "alt": "Description", "caption": "Caption" }
  ],
  "autoAdvance": true,
  "interval": 5000
}
```

## Usage
```json
{
  "type": "component",
  "component": "image_carousel/type_1",
  "id": "gallery",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Files
- `image_carousel_structure_t1.html`
- `image_carousel_style_t1.css`
- `image_carousel_behavior_t1.js`
- `image_carousel_loader_t1.php`
