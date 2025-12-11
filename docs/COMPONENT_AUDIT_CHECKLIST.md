# Component Design Philosophy Audit Checklist

## Purpose
This checklist ensures all components are perfectly aligned with the design philosophy and standards defined in the steering files.

---

## Per-Component Checklist

### 1. File Structure
- [ ] Has `*_structure_t1.html` - HTML template
- [ ] Has `*_style_t1.css` - Scoped styles
- [ ] Has `*_behavior_t1.js` - JavaScript with global exports
- [ ] Has `*_loader_t1.php` - PHP loader with 3 modes
- [ ] Has `*_schema_t1.json` - Data structure documentation

### 2. HTML Structure Standards
- [ ] Root element is `<section>` (not `<div>`)
- [ ] Single root container with component class (`.{component-name}-component`)
- [ ] `data-nav-handler` attribute on root element
- [ ] CSS `<link>` at top of file
- [ ] JS `<script>` at bottom of file
- [ ] Semantic HTML elements where appropriate

### 3. CSS Standards
- [ ] Uses only CSS variables for colors (`var(--color-*)`) - NO hardcoded hex
- [ ] Uses only CSS variables for spacing (`var(--spacing-*)`)
- [ ] Uses only CSS variables for typography (`var(--font-*)`)
- [ ] Uses only CSS variables for borders/radius (`var(--border-*)`)
- [ ] Has proper dark theme support (`.theme-dark` overrides where needed)
- [ ] Has responsive breakpoints:
  - Desktop: default
  - Tablet: `@media (max-width: 768px)`
  - Mobile: `@media (max-width: 480px)`
- [ ] Exception: #FFFFFF allowed for button text on gradient backgrounds
- [ ] Component class follows `.{component-name}-component` pattern
- [ ] Perfectly responsive at all breakpoints

### 4. JavaScript Standards
- [ ] Navigation handler: `handle{ComponentName}Navigation(elementId, state, parameters)`
- [ ] Init hook: `initialize{ComponentName}(componentElement)`
- [ ] Data setter: `set{ComponentName}Data(componentId, data)`
- [ ] All functions exported to `window` object
- [ ] Global state uses `window.{name} = window.{name} || {}`
- [ ] No `let`/`const` for global state (prevents redeclaration errors on dynamic reload)
- [ ] Navigation flow is consistent with global navigator pattern

### 5. PHP Loader Standards
- [ ] Class name: `{ComponentName}LoaderT{Version}` (PascalCase)
- [ ] `load()` method with 5 parameters: `($id, $title, $navigationConfig, $loadingMode, $componentMetadata)`
- [ ] Switch statement with 3 modes: `shell`, `content`, `full`
- [ ] `generateShell()` method with attributes:
  - `data-dynamic="true"`
  - `data-load-state="not-loaded"`
  - `data-init-hook="initialize{ComponentName}"`
  - `data-component-metadata`
- [ ] `generateContent()` method - returns data script only
- [ ] `generateFullComponent()` method - complete with data injection
- [ ] Data script injected INSIDE container (before closing tag, not after)
- [ ] Supports dynamic loading (shell mode)
- [ ] Supports static loading (full mode)
- [ ] Supports protected/secured content flow

### 6. Schema Standards
- [ ] Has `*_schema_t1.json` file
- [ ] Documents all configurable properties
- [ ] Documents all data fields
- [ ] Includes examples
- [ ] JSON Schema format ($schema, title, description, properties, required)

### 7. Dynamic Loading Support
- [ ] Shell mode generates lightweight placeholder
- [ ] Content mode returns data for API responses
- [ ] Full mode renders complete component
- [ ] Init hook properly rebinds DOM after dynamic injection
- [ ] Works with protected content (authentication flow)

### 8. Navigation Consistency
- [ ] Handler registered on root element via `data-nav-handler`
- [ ] Handles `visible`, `hidden`, `scrollTo` states
- [ ] Returns boolean indicating success
- [ ] Idempotent (safe to call multiple times)

---

## Components to Audit

### Page Components
| # | Component | Files | CSS | JS | PHP | Schema | HTML | Responsive | Dynamic |
|---|-----------|-------|-----|----|----|--------|------|------------|---------|
| 1 | heros/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2 | summaries/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3 | experience/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 4 | education_history/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 5 | certifications/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 6 | competencies/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 7 | tools/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 8 | workflow/type_2 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 9 | testimonials/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 10 | projects_grid/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 11 | project_details/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 12 | project_hero/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### Detail Components
| # | Component | Files | CSS | JS | PHP | Schema | HTML | Responsive | Dynamic |
|---|-----------|-------|-----|----|----|--------|------|------------|---------|
| 13 | code_display/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 14 | image_carousel/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 15 | feature_list/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 16 | text_section/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 17 | section_title/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 18 | stats_grid/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 19 | tech_stack/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### Admin Components
| # | Component | Files | CSS | JS | PHP | Schema | HTML | Responsive | Dynamic |
|---|-----------|-------|-----|----|----|--------|------|------------|---------|
| 20 | file_manager/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 21 | json_files_list/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 22 | json_file_creator/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 23 | placeholders/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### Containers
| # | Component | Files | CSS | JS | PHP | Schema | HTML | Responsive | Dynamic |
|---|-----------|-------|-----|----|----|--------|------|------------|---------|
| 24 | vertical/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 25 | horizontal/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 26 | slider/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 27 | collapsing/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### Site Layouts
| # | Component | Files | CSS | JS | PHP | Schema | HTML | Responsive | Dynamic |
|---|-----------|-------|-----|----|----|--------|------|------------|---------|
| 28 | top_bar/type_2 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 29 | side_bar/type_1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## Common Issues to Fix

### CSS Issues
- Hardcoded hex colors → Replace with `var(--color-*)`
- Missing dark theme → Add `.theme-dark` overrides
- Missing responsive → Add media queries

### JS Issues
- Missing global exports → Add `window.functionName = functionName`
- `let`/`const` global state → Change to `window.name = window.name || {}`
- Wrong handler signature → Use `(elementId, state, parameters)`

### PHP Issues
- Data injection outside container → Move before closing `</section>`
- Missing loading modes → Add shell/content/full switch
- Wrong class name → Use `{ComponentName}LoaderT{Version}`

### HTML Issues
- Root is `<div>` → Change to `<section>`
- Missing `data-nav-handler` → Add attribute
- Wrong file order → CSS at top, JS at bottom

---

## Audit Progress

**Started:** December 11, 2025
**Status:** In Progress

### Completed Fixes (Detail Components)
- [x] code_display - Changed div to section, updated loader
- [x] feature_list - Changed div to section, updated loader
- [x] image_carousel - Changed div to section
- [x] stats_grid - Changed div to section
- [x] text_section - Changed div to section
- [x] section_title - Changed div to section
- [x] tech_stack - Changed div to section
- [x] project_hero - Changed div to section

### Remaining Loader Updates Needed
- [ ] image_carousel_loader_t1.php - Update to section
- [ ] stats_grid_loader_t1.php - Update to section
- [ ] text_section_loader_t1.php - Update to section
- [ ] section_title_loader_t1.php - Update to section
- [ ] tech_stack_loader_t1.php - Update to section
- [ ] project_hero_loader_t1.php - Update to section

### Page Components Needing Full Audit
- [ ] experience - div to section, add data-nav-handler
- [ ] education_history - div to section, add data-nav-handler
- [ ] certifications - div to section, fix CSS link position, add data-nav-handler
- [ ] projects_grid - div to section, add data-nav-handler
- [ ] testimonials - div to section
- [ ] summaries - remove type="module" from script, add data-nav-handler
- [ ] file_manager - div to section

### Components with Non-Standard Class Names
- [ ] competencies - class="competencies" → "competencies-component"
- [ ] tools - class="tools" → "tools-component"
- [ ] workflow - class="workflow" → "workflow-component"
- [ ] project_details - class="project-details" → "project-details-component"

---

## Notes
- Audit one component at a time
- Fix issues as they are found
- Mark checkboxes when verified
- Document any exceptions or special cases
- All loaders need `</section>` instead of `</div>` for data injection (10 chars not 6)
