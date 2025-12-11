# Portfolio Website Framework

A modular, component-based portfolio website system built with PHP, JavaScript, and CSS. Features dynamic content loading, theme switching, hash-based navigation, and a fully customizable component architecture.

## ✨ Features

- **Component Architecture** - Self-contained, reusable UI components
- **Dynamic Loading** - On-demand content loading with caching
- **Theme System** - Light/dark mode with CSS custom properties
- **Hash Navigation** - Deep-linking and state management via URL
- **Protected Content** - Authentication-gated sections
- **Responsive Design** - Mobile-first, works on all devices
- **File Manager** - Built-in JSON/media file management

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/benbel376/portfolio-website.git

# Serve with PHP
php -S localhost:8000

# Open in browser
open http://localhost:8000
```

## 📁 Project Structure

```
├── blocks/
│   ├── components/     # UI components (heros, summaries, etc.)
│   ├── containers/     # Layout containers (vertical, horizontal, slider)
│   └── sites/          # Site layouts (top_bar, side_bar)
├── builders/           # PHP build system
├── definitions/        # JSON configuration files
│   ├── pages/          # Page definitions
│   ├── profiles/       # Profile configurations
│   └── sites/          # Site configurations
├── endpoints/          # API endpoints
├── docs/               # Documentation
└── index.php           # Entry point
```

## 🧩 Components

| Component | Description |
|-----------|-------------|
| `heros` | Profile hero with avatar, social links, CV download |
| `summaries` | Professional summary with expertise grid |
| `experience` | Work history timeline |
| `education_history` | Education timeline |
| `certifications` | Certificate slideshow |
| `competencies` | Skills list with flowcharts |
| `tools` | Technology toolkit grid |
| `workflow` | Working methodology steps |
| `testimonials` | Client testimonials carousel |
| `projects_grid` | Filterable project portfolio |
| `project_details` | Individual project page |
| `file_manager` | Admin file management |

## ⚙️ Configuration

### Profile Setup
Edit `definitions/entry.json` to set the active profile:
```json
{
  "profile": "ml_mlops_t1",
  "builder": "builder_t1"
}
```

### Page Definition
Pages are defined in `definitions/pages/`:
```json
{
  "objects": [{
    "type": "component",
    "component": "heros/type_1",
    "id": "profile-hero",
    "variant": "main",
    "data": { "main": { "name": "John Doe" } }
  }]
}
```

## 🎨 Theming

CSS custom properties defined at site level:
```css
--bg, --text, --primary, --accent
--card-bg, --border, --nav-bg
--font-primary, --font-secondary
--spacing-xs/sm/md/lg/xl
--radius-sm/md/lg/xl
```

Components use these variables directly - no hardcoded colors.

## 🔒 Security

- Protected content requires authentication
- Session-based auth via `endpoints/security_t1.php`
- Protected components render as shells until authenticated

## 📖 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design and data flow
- [Component Guide](docs/COMPONENTS.md) - How to create/modify components

## 📄 License

MIT License - See LICENSE file for details.
