---
inclusion: always
---

# Theme Variable Standards

## Design Philosophy
- **Site level**: Defines core theme variables in JSON (`--bg`, `--text`, `--primary`, `--accent`, `--card-bg`, `--border`, etc.)
- **Components**: Use site variables directly via `var(--variable-name)` - NO redefinition
- **Components can add**: Their own ADDITIONAL variables for component-specific sizing/spacing (like `--hero-avatar-size`)
- **No hardcoded colors**: All colors must use CSS variables from site-level theme

## Site-Level Variables (from JSON)
```
--bg                  Body background color
--text                Primary text color
--primary             Primary brand color
--border              Border color
--nav-bg              Navigation background
--site-container-bg   Main container background
--card-bg             Card/panel background
--card-border         Card border color
--error               Error state color
--success             Success state color
--accent              Accent/highlight color
--font-primary        Primary font family
--font-secondary      Secondary font family
--font-mono           Monospace font family
--spacing-xs/sm/md/lg/xl   Spacing values
--radius-sm/md/lg/xl       Border radius values
--text-xs/sm/base/lg/xl/2xl   Font sizes
```

## Light/Dark Theme Pattern
- Light theme: Use `rgba(0, 0, 0, opacity)` for darkening effects
- Dark theme: Use `rgba(255, 255, 255, opacity)` for lightening effects
- Keep visual consistency between themes (opposite tints)

## Migration Progress
- [x] Navigation bar (.main-nav.card) - background, border, text
- [x] Nav links hover/active states
- [x] Mobile menu toggle
- [x] Dark theme navigation overrides
- [x] Nav action buttons
- [x] Login modal
- [x] Secured component placeholder
- [x] Site layout (.card, .site-container)
- [x] json_files_list component
- [x] summaries component (already compliant)
- [x] experience component (mostly compliant, #FFFFFF for button text is intentional)
- [x] tools component (migrated critical colors)
- [x] workflow component (migrated critical colors)
- [x] testimonials component (fully redesigned + migrated)
- [x] certifications component (already compliant)
- [x] competencies component (migrated dropdown, slideshow colors)
- [x] education_history component (already compliant)
- [x] projects_grid component (migrated icon wrapper, pagination dots, filter select)
- [x] project_details component (migrated tech tags, link buttons)

## Notes
- Fallback values in `var(--variable, #fallback)` patterns are acceptable
- #FFFFFF for button text on gradient backgrounds is intentional (contrast)
- rgba() values for opacity effects are acceptable

## Rules
1. Never use hex colors directly in CSS - always use `var(--variable)`
2. Components inherit site variables automatically
3. Component-specific variables are for sizing/spacing only, not colors
4. Shadows can use rgba() with hardcoded opacity values
