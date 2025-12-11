# File Manager Component (type_1)

Admin file management for definitions folder.

## Features
- Folder tree navigation
- File list/grid view
- JSON editor with validation
- Media preview (images, videos, PDFs)
- Create/rename/delete files
- File upload with drag-drop

## Security
- Always `protected: true`
- Requires authentication
- API validates session

## Usage
```json
{
  "type": "component",
  "component": "file_manager/type_1",
  "id": "file-manager",
  "navigation": {
    "protected": true,
    "defaultState": "hidden"
  }
}
```

## API Endpoint
Uses `endpoints/file_manager_t1.php` for:
- `list` - Get folder contents
- `read` - Get file content
- `write` - Save file
- `delete` - Remove file
- `upload` - Upload files

## Customization
- Allowed file types in PHP
- Editor theme in CSS
- Tree depth limit

## Files
- `file_manager_structure_t1.html` - Full UI template
- `file_manager_style_t1.css` - Editor/tree styles
- `file_manager_behavior_t1.js` - All interactions
- `file_manager_loader_t1.php` - Component loading
