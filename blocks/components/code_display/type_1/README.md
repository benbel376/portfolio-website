# Code Display Component (type_1)

Syntax-highlighted code block display.

## Features
- Language label
- Copy to clipboard button
- Line numbers (optional)
- Syntax highlighting via CSS

## Data Structure
```json
{
  "language": "javascript",
  "code": "const x = 1;",
  "showLineNumbers": true
}
```

## Usage
```json
{
  "type": "component",
  "component": "code_display/type_1",
  "id": "code-example",
  "variant": "main",
  "data": { "main": { ... } }
}
```

## Files
- `code_display_structure_t1.html`
- `code_display_style_t1.css`
- `code_display_behavior_t1.js`
- `code_display_loader_t1.php`
