# Placeholder Component (type_1)

Loading/empty state placeholder.

## Data Structure
```json
{
  "icon": "hourglass-outline",
  "message": "Loading content...",
  "type": "loading"
}
```

## Types
- `loading` - Spinner animation
- `empty` - Empty state message
- `error` - Error state

## Usage
```json
{
  "type": "component",
  "component": "placeholders/type_1",
  "id": "loading-state",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Files
- `placeholder_structure_t1.html`
- `placeholder_style_t1.css`
- `placeholder_behavior_t1.js`
- `placeholder_loader_t1.php`
