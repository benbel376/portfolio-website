# Media Centralization & File Manager Tasks

**Goal:** Centralize user media in `definitions/media/`, keep component defaults local, and build a comprehensive file manager.

**Created:** December 8, 2025

---

## Overview

### Current State
Media files are scattered across component folders:
- `blocks/components/{component}/type_1/assets/media/`

### Target State
- **User content** → `definitions/media/{category}/`
- **Component defaults** → Stay in `blocks/components/{component}/assets/defaults/`
- **JSON references** → Point to `definitions/media/` paths
- **Schema files** → Each component gets `{component}_data_schema.json` for validation reference

### New Folder Structure
```
definitions/
├── pages/
├── profiles/
├── sites/
├── entry.json
└── media/                          # NEW: Centralized user media
    ├── profile/                    # Avatar, CV, personal images
    ├── certifications/             # Certification badges
    ├── projects/                   # Project screenshots/banners
    ├── backgrounds/                # Hero backgrounds, etc.
    ├── slides/                     # Slideshow images
    └── misc/                       # Other media
```

---

## Phase 1: Media Migration (Component by Component)

### Task 1.1: Create Media Folder Structure
**Priority:** Critical  
**Status:** [ ]

**Subtasks:**
- [ ] Create `definitions/media/` folder
- [ ] Create `definitions/media/profile/` folder
- [ ] Create `definitions/media/certifications/` folder
- [ ] Create `definitions/media/projects/` folder
- [ ] Create `definitions/media/backgrounds/` folder
- [ ] Create `definitions/media/slides/` folder
- [ ] Create `definitions/media/misc/` folder

---

### Task 1.2: Migrate Hero Component Media
**Priority:** Critical  
**Component:** `blocks/components/heros/type_1/`  
**Status:** [✅] COMPLETED

**Current Media Files:**
```
blocks/components/heros/type_1/assets/media/
├── profile_hero_avatar_v1.png          → definitions/media/profile/avatar.png
├── profile_hero_backdrop_dark_v3.png   → definitions/media/backgrounds/hero_backdrop_dark.png
└── profile_hero_backdrop_light_v3.png  → definitions/media/backgrounds/hero_backdrop_light.png
```

**Subtasks:**
- [ ] Move avatar to `definitions/media/profile/avatar.png`
- [ ] Move backdrops to `definitions/media/backgrounds/`
- [ ] Update `definitions/pages/summary_page_t1.json` with new paths in data
- [ ] Update `hero_loader_t1.php` to read image paths from componentData
- [ ] Keep empty `assets/defaults/` folder for future default images
- [ ] Test hero component displays correctly
- [ ] Delete old media files after verification

**JSON Data Update Example:**
```json
{
  "data": {
    "main": {
      "name": "...",
      "image": "definitions/media/profile/avatar.png",
      "backdrop": {
        "light": "definitions/media/backgrounds/hero_backdrop_light.png",
        "dark": "definitions/media/backgrounds/hero_backdrop_dark.png"
      }
    }
  }
}
```

---

### Task 1.3: Migrate Certifications Component Media
**Priority:** Critical  
**Component:** `blocks/components/certifications/type_1/`  
**Status:** [✅] COMPLETED

**Current Media Files:**
```
blocks/components/certifications/type_1/assets/media/
├── profile_certification_aws_practitioner.png
├── profile_certification_aws_solutions_architect.png
├── profile_certification_azure_fundamentals.png
├── profile_certification_fortinet_intro.png
├── profile_certification_google_data_analytics.png
├── profile_certification_isc2.png
└── sky_diving.png
```

**Target Location:** `definitions/media/certifications/`

**Subtasks:**
- [ ] Move all certification images to `definitions/media/certifications/`
- [ ] Rename files to cleaner names (e.g., `aws_practitioner.png`)
- [ ] Update `definitions/pages/education_page_t1.json` with new paths
- [ ] Update `certifications_loader_t1.php` to read image paths from componentData
- [ ] Test certifications component displays correctly
- [ ] Delete old media files after verification

---

### Task 1.4: Migrate Competencies Component Media
**Priority:** Critical  
**Component:** `blocks/components/competencies/type_1/`  
**Status:** [✅] COMPLETED

**Current Media Files:**
```
blocks/components/competencies/type_1/assets/media/slides/
├── slide_1.svg
├── slide_2.svg
└── slide_3.svg
```

**Target Location:** `definitions/media/slides/`

**Subtasks:**
- [ ] Move slide images to `definitions/media/slides/`
- [ ] Update `definitions/pages/skills_page_t1.json` with new paths
- [ ] Update `competencies_loader_t1.php` to read slide paths from componentData
- [ ] Test competencies slideshow displays correctly
- [ ] Delete old media files after verification

---

### Task 1.5: Migrate Summaries Component Media
**Priority:** Critical  
**Component:** `blocks/components/summaries/type_1/`  
**Status:** [✅] COMPLETED

**Current Media Files:**
```
blocks/components/summaries/type_1/assets/
├── filter_nbg.gif
├── filter.gif
├── light_bulb.gif
├── machine.gif
├── profile_1.gif
└── profile.gif
```

**Target Location:** `definitions/media/misc/` or `definitions/media/profile/`

**Subtasks:**
- [ ] Analyze which files are actually used
- [ ] Move used files to appropriate folders
- [ ] Update `definitions/pages/summary_page_t1.json` with new paths
- [ ] Update `summary_loader_t1.php` to read paths from componentData
- [ ] Test summaries component displays correctly
- [ ] Delete old/unused media files after verification

---

### Task 1.6: Migrate Projects Grid Component Media
**Priority:** Critical  
**Component:** `blocks/components/projects_grid/type_1/`  
**Status:** [✅] COMPLETED (kept as defaults)

**Current Media Files:**
```
blocks/components/projects_grid/type_1/assets/media/
├── project_banner_placeholder.svg    → KEEP as default
└── project-placeholder.svg           → KEEP as default
```

**Decision:** These are placeholder/default images - keep them local.

**Subtasks:**
- [ ] Rename folder to `assets/defaults/`
- [ ] Update loader to use defaults when no image specified in data
- [ ] Ensure project images in JSON point to `definitions/media/projects/`
- [ ] Test projects grid displays correctly

---

### Task 1.7: Verify Components Without Media + Create Schemas
**Priority:** Medium  
**Status:** [✅] COMPLETED

**Components to verify (no media found):**
- [ ] `education_history/type_1/` - No assets folder
- [ ] `experience/type_1/` - No assets folder
- [ ] `testimonials/type_1/` - No assets folder
- [ ] `tools/type_1/` - No assets folder
- [ ] `workflow/type_2/` - No assets folder
- [ ] `placeholders/type_1/` - No assets folder
- [ ] `project_details/type_1/` - No assets folder
- [ ] `json_files_list/type_1/` - No assets folder (admin component)

**Subtasks:**
- [ ] Verify these components don't reference any media
- [ ] If they do, update to use centralized paths
- [ ] Document any media requirements for future

---

## Phase 2: File Manager Component

### Task 2.1: Extend JSON Files List to Universal File Manager
**Priority:** High  
**Component:** `blocks/components/json_files_list/type_1/`  
**Status:** [ ]

**Rename to:** `file_manager/type_1/`

**Subtasks:**
- [ ] Rename component folder and files
- [ ] Update all references in page definitions
- [ ] Update loader class name

---

### Task 2.2: Add Folder Navigation
**Priority:** High  
**Status:** [ ]

**Features:**
- [ ] Breadcrumb navigation (definitions > media > profile)
- [ ] Folder tree view or dropdown
- [ ] Click folder to navigate into it
- [ ] Back button to parent folder
- [ ] Root folders: `definitions/`, `blocks/` (read-only for blocks)

---

### Task 2.3: Add Media Preview
**Priority:** High  
**Status:** [ ]

**Features:**
- [ ] Thumbnail preview for images (png, jpg, svg, gif)
- [ ] Icon preview for other file types (pdf, json, etc.)
- [ ] Click to view full-size image in modal
- [ ] File info panel (size, dimensions, type, modified date)

---

### Task 2.4: Add File Upload
**Priority:** High  
**Status:** [ ]

**Features:**
- [ ] Drag and drop upload zone
- [ ] File picker button
- [ ] Upload progress indicator
- [ ] Automatic folder placement based on current location
- [ ] File type validation (images, pdfs, etc.)
- [ ] Size limit enforcement

**API Endpoint Updates:**
- [ ] Add `upload` action to `definition_management_t1.php`
- [ ] Or create new `media_management_t1.php` endpoint

---

### Task 2.5: Add Folder Management
**Priority:** Medium  
**Status:** [ ]

**Features:**
- [ ] Create new folder button
- [ ] Rename folder
- [ ] Delete empty folder
- [ ] Move files between folders (drag and drop)

---

### Task 2.6: Improve File List UI
**Priority:** Medium  
**Status:** [ ]

**Features:**
- [ ] Grid view option (thumbnails)
- [ ] List view option (current)
- [ ] Sort by name, date, size, type
- [ ] Multi-select for bulk operations
- [ ] Copy path to clipboard button
- [ ] File type icons

---

### Task 2.7: JSON Editor Improvements
**Priority:** Medium  
**Status:** [ ]

**Features:**
- [ ] Syntax highlighting (basic JSON colors)
- [ ] Auto-format on save
- [ ] Undo/redo support
- [ ] Find and replace
- [ ] Line jumping (Ctrl+G)

---

## Phase 3: Theme Customization via JSON

### Task 3.1: Analyze Current Theme System
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Identify where CSS variables are defined
- [ ] List all theme-related variables
- [ ] Understand how theme switching works
- [ ] Document current theme architecture

---

### Task 3.2: Create Theme Configuration Schema
**Priority:** High  
**Status:** [ ]

**Target:** Add theme config to site JSON

```json
{
  "type": "top_bar/type_2",
  "branding": { "title": "Portfolio" },
  "theme": {
    "colors": {
      "primary": "#4caf50",
      "secondary": "#2196f3",
      "background": {
        "light": "#ffffff",
        "dark": "#1a1a1a"
      },
      "text": {
        "primary": { "light": "#333333", "dark": "#ffffff" },
        "secondary": { "light": "#666666", "dark": "#aaaaaa" }
      }
    },
    "typography": {
      "fontFamily": "'Inter', sans-serif",
      "fontSize": { "base": "16px", "heading": "2rem" }
    },
    "spacing": {
      "base": "8px"
    },
    "borderRadius": {
      "sm": "4px",
      "md": "8px",
      "lg": "16px"
    }
  },
  "navigation": { ... }
}
```

---

### Task 3.3: Update Site Builder to Inject Theme
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Read theme config from site JSON
- [ ] Generate CSS variables from config
- [ ] Inject as `<style>` block in `<head>`
- [ ] Use defaults when values are null/missing
- [ ] Support both light and dark theme values

**Generated CSS Example:**
```css
:root {
  --color-primary: #4caf50;
  --color-secondary: #2196f3;
  --color-background-light: #ffffff;
  --color-background-dark: #1a1a1a;
  /* ... */
}
```

---

### Task 3.4: Create Theme Editor UI
**Priority:** Medium  
**Status:** [ ]

**Features:**
- [ ] Color pickers for theme colors
- [ ] Live preview of changes
- [ ] Save to site JSON
- [ ] Reset to defaults button
- [ ] Import/export theme

---

## Phase 4: Testing & Verification

### Task 4.1: Test All Components After Migration
**Priority:** Critical  
**Status:** [ ]

**Subtasks:**
- [ ] Test hero component with new media paths
- [ ] Test certifications component
- [ ] Test competencies slideshow
- [ ] Test summaries component
- [ ] Test projects grid with defaults
- [ ] Test all other components still work
- [ ] Test in both light and dark themes
- [ ] Test on mobile devices

---

### Task 4.2: Test File Manager
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Test folder navigation
- [ ] Test file upload
- [ ] Test file delete
- [ ] Test JSON editing
- [ ] Test media preview
- [ ] Test on different browsers

---

### Task 4.3: Test Theme Customization
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Test theme changes apply correctly
- [ ] Test theme persists after reload
- [ ] Test all components respect theme
- [ ] Test theme editor UI

---

## Progress Tracking

### Phase 1: Media Migration
- [ ] Task 1.1: Create folder structure
- [ ] Task 1.2: Hero component
- [ ] Task 1.3: Certifications component
- [ ] Task 1.4: Competencies component
- [ ] Task 1.5: Summaries component
- [ ] Task 1.6: Projects grid component
- [ ] Task 1.7: Verify other components

### Phase 2: File Manager
- [ ] Task 2.1: Rename component
- [ ] Task 2.2: Folder navigation
- [ ] Task 2.3: Media preview
- [ ] Task 2.4: File upload
- [ ] Task 2.5: Folder management
- [ ] Task 2.6: UI improvements
- [ ] Task 2.7: JSON editor improvements

### Phase 3: Theme Customization
- [ ] Task 3.1: Analyze current system
- [ ] Task 3.2: Create schema
- [ ] Task 3.3: Update builder
- [ ] Task 3.4: Theme editor UI

### Phase 4: Testing
- [ ] Task 4.1: Component testing
- [ ] Task 4.2: File manager testing
- [ ] Task 4.3: Theme testing

---

## Execution Order

1. **Phase 1.1** - Create folder structure
2. **Phase 1.2** - Migrate Hero (TEST)
3. **Phase 1.3** - Migrate Certifications (TEST)
4. **Phase 1.4** - Migrate Competencies (TEST)
5. **Phase 1.5** - Migrate Summaries (TEST)
6. **Phase 1.6** - Update Projects Grid (TEST)
7. **Phase 1.7** - Verify other components
8. **COMMIT** - Media migration complete
9. **Phase 2** - File Manager (iterative)
10. **COMMIT** - File manager complete
11. **Phase 3** - Theme customization
12. **COMMIT** - Theme system complete
13. **Phase 4** - Final testing

---

## Notes

- Test after each component migration before proceeding
- Keep old files until verification complete
- Update steering files after migration
- Document new media path conventions
