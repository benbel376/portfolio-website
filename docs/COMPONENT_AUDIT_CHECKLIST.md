# Component Audit Checklist

## Audit Criteria

Every component MUST pass ALL of the following checks:

### 1. HTML Structure
- [ ] Root element is `<section>` (NOT `<div>`)
- [ ] Root element has `data-nav-handler` attribute
- [ ] Class follows pattern: `{component-name}-component`
- [ ] CSS link is OUTSIDE the root element (before `<section>`)
- [ ] Script tag is OUTSIDE the root element (after `</section>`)
- [ ] No `type="module"` on script tags

### 2. Navigation Handler
- [ ] Has `handle{ComponentName}Navigation` function in behavior JS
- [ ] Function handles: `visible`, `hidden`, `scrollTo` states
- [ ] Function exported to `window` object
- [ ] Function is idempotent (safe to call multiple times)

### 3. Dynamic Loading Support
- [ ] PHP loader has `generateShell()` method
- [ ] PHP loader has `generateContent()` method  
- [ ] PHP loader has `generateFullComponent()` method
- [ ] Shell mode adds: `data-dynamic="true"`, `data-load-state="not-loaded"`, `data-init-hook`, `data-component-metadata`
- [ ] Data injection uses `</section>` (10 chars), not `</div>` (6 chars)

### 4. Security Support
- [ ] Component works with `protected: true` in page definition
- [ ] Protected content only delivered after authentication
- [ ] No sensitive data in shell mode

### 5. Schema Files
- [ ] Has `{component}_schema_t{version}.json` file
- [ ] Schema defines all configurable properties
- [ ] Schema includes data structure definition

### 6. CSS/Theme Compliance
- [ ] No hardcoded hex colors (use `var(--variable)`)
- [ ] Uses theme variables from site level
- [ ] Responsive design (mobile-first breakpoints)
- [ ] Component-scoped styles (no global selectors)

### 7. Responsiveness
- [ ] Works on mobile (< 768px)
- [ ] Works on tablet (768px - 1023px)
- [ ] Works on desktop (≥ 1024px)
- [ ] No horizontal overflow issues

---

## Component Status

### Detail Components (8 total)
| Component | Section Tag | Nav Handler | Loader Fixed | Schema | CSS Audit |
|-----------|-------------|-------------|--------------|--------|-----------|
| code_display | ✅ | ✅ | ✅ | ❓ | ❓ |
| feature_list | ✅ | ✅ | ✅ | ❓ | ❓ |
| image_carousel | ✅ | ✅ | ✅ | ❓ | ❓ |
| stats_grid | ✅ | ✅ | ✅ | ❓ | ❓ |
| text_section | ✅ | ✅ | ✅ | ❓ | ❓ |
| section_title | ✅ | ✅ | ✅ | ❓ | ❓ |
| tech_stack | ✅ | ✅ | ✅ | ❓ | ❓ |
| project_hero | ✅ | ✅ | ✅ | ❓ | ❓ |

### Page Components (14 total)
| Component | Section Tag | Nav Handler | Loader Fixed | Schema | CSS Audit |
|-----------|-------------|-------------|--------------|--------|-----------|
| heros | ❓ | ❓ | ❓ | ❓ | ❓ |
| summaries | ❓ | ❓ | ❓ | ❓ | ❓ |
| experience | ✅ | ✅ | ❓ | ❓ | ❓ |
| education_history | ✅ | ✅ | ❓ | ❓ | ❓ |
| certifications | ❓ | ❓ | ❓ | ❓ | ❓ |
| competencies | ❓ | ❓ | ❓ | ❓ | ❓ |
| tools | ❓ | ❓ | ❓ | ❓ | ❓ |
| workflow | ❓ | ❓ | ❓ | ❓ | ❓ |
| testimonials | ❓ | ❓ | ❓ | ❓ | ❓ |
| projects_grid | ❓ | ❓ | ❓ | ❓ | ❓ |
| project_details | ❓ | ❓ | ❓ | ❓ | ❓ |
| file_manager | ❓ | ❓ | ❓ | ❓ | ❓ |
| placeholders | ❓ | ❓ | ❓ | ❓ | ❓ |

### Known Issues to Fix
1. **Wrong class names**: competencies, tools, workflow, project_details (missing `-component` suffix)
2. **Missing nav handlers**: certifications, projects_grid, summaries, file_manager
3. **summaries**: Has `type="module"` on script tag
4. **certifications**: CSS link inside div (wrong position)

---

## Progress Log

- [x] Created audit checklist
- [x] Fixed 8 detail component HTML files (div → section)
- [x] Fixed 8 detail component loaders (section tag injection)
- [x] Fixed experience component (section + nav handler)
- [x] Fixed education_history component (section + nav handler)
- [ ] Fix remaining page components
- [ ] Verify/create schema files
- [ ] CSS audit for hardcoded colors
- [ ] Responsiveness testing
