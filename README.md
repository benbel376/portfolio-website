# Portfolio Website Scaffolding System

A sophisticated, component-based portfolio website framework that's data-driven and highly modular. Build multiple portfolio variations through simple JSON configuration changes.

## Features

- **Configuration-Driven**: Content managed through JSON files
- **Component-Based**: Modular, reusable blocks with versioning
- **Multiple Profiles**: Support different portfolio types from single codebase
- **Clean Architecture**: Separation of data, structure, style, and behavior
- **Extensible**: Easy to add new components and site layouts

## Quick Start

1. Configure your profile in `definitions/entry.json`
2. Customize site layout in `definitions/sites/`
3. Access via `index.php` to see your portfolio

## Documentation

### Core Documentation
- **[System Architecture & Technical Design Guide](docs/system-architecture.md)** - Complete system overview, design philosophy, data flow architecture, component system, build patterns, and technical specifications

### Configuration Files
- `definitions/entry.json` - Entry point configuration
- `definitions/profiles/` - Profile configurations
- `definitions/sites/` - Site layout configurations
- `definitions/pages/` - Page definitions

### Component System
- `blocks/sites/` - Site-level layout blocks
- `blocks/components/` - Reusable UI components
- `blocks/containers/` - Layout containers

### Build System
- `index.php` - Main entry point
- `builders/` - Build orchestration
- `api.php` - API endpoints

## File Naming Convention

All files follow the `_t1` suffix pattern for type versioning:
- Configuration: `[name]_t1.json`
- Templates: `[component]_structure_t1.html`
- Loaders: `[component]_loader_t1.php`
- Styles: `[component]_style_[purpose]_t1.css`
- Behaviors: `[component]_behavior_[purpose]_t1.js`

## Current Status

✅ **Completed**: Site scaffolding, top bar navigation, configuration system
🚧 **Next**: Page components, content loaders, API endpoints

## Requirements

- PHP 7.4+
- Modern browser with ES6 support
- Web server (Apache/Nginx/PHP dev server)