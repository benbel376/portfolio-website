# Codebase Cleanup Tasks

**Goal:** Align all components with design philosophy and steering file standards  
**Source:** DESIGN_DIVERGENCE_ANALYSIS.md  
**Created:** November 27, 2025

---

## Task Status Legend
- [ ] Not Started
- [⏳] In Progress
- [✅] Completed
- [🔍] Needs Review
- [❌] Blocked

---

## Phase 1: Critical Fixes (Must Fix)

### Task 1.1: Implement Shell and Content Modes - Testimonials Component
**Priority:** Critical  
**Component:** `blocks/components/testimonials/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Add `generateShell()` method to TestimonialsLoader
- [✅] Add `generateContent()` method to TestimonialsLoader
- [✅] Refactor `load()` to use switch statement with three modes
- [✅] Add shell attributes: `data-dynamic`, `data-load-state`, `data-init-hook`, `data-component-metadata`
- [✅] Test full mode (initial load)
- [✅] Test shell mode (dynamic placeholder)
- [✅] Test content mode (API response)

**Files to Modify:**
- `testimonials_loader_t1.php`

**Reference Implementation:**
- `blocks/components/heros/type_1/hero_loader_t1.php`
- `blocks/components/projects_grid/type_1/projects_grid_loader_t1.php`

---

### Task 1.2: Implement Shell and Content Modes - Competencies Component
**Priority:** Critical  
**Component:** `blocks/components/competencies/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Add `generateShell()` method to CompetenciesLoaderT1
- [✅] Add `generateContent()` method to CompetenciesLoaderT1
- [✅] Refactor `load()` to use switch statement with three modes
- [✅] Add shell attributes: `data-dynamic`, `data-load-state`, `data-init-hook`, `data-component-metadata`
- [✅] Test full mode (initial load)
- [✅] Test shell mode (dynamic placeholder)
- [✅] Test content mode (API response)

**Files to Modify:**
- `competencies_loader_t1.php`

**Reference Implementation:**
- `blocks/components/heros/type_1/hero_loader_t1.php`

---

### Task 1.3: Implement Shell and Content Modes - Tools Component
**Priority:** Critical  
**Component:** `blocks/components/tools/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Add `generateShell()` method to ToolsLoaderT1
- [✅] Add `generateContent()` method to ToolsLoaderT1
- [✅] Refactor `load()` to use switch statement with three modes
- [✅] Add shell attributes: `data-dynamic`, `data-load-state`, `data-init-hook`, `data-component-metadata`
- [✅] Test full mode (initial load)
- [✅] Test shell mode (dynamic placeholder)
- [✅] Test content mode (API response)

**Files to Modify:**
- `tools_loader_t1.php`

**Reference Implementation:**
- `blocks/components/heros/type_1/hero_loader_t1.php`

---

### Task 1.4: Consolidate External Data Files (Remove dataSource Pattern)
**Priority:** Critical  
**Status:** [✅]

**Subtasks:**
- [✅] Read `definitions/data/projects_data_ml_mlops_t1.json`
- [✅] Move projects data inline to `definitions/pages/projects_page_t1.json` data field
- [✅] Read `definitions/data/education_data_ml_mlops_t1.json`
- [✅] Move education data inline to `definitions/pages/education_page_t1.json` data field
- [✅] Read `data/experience_data_ml_mlops_t1.json` (was not being used)
- [✅] Experience data already inline in `definitions/pages/experience_page_t1.json`
- [✅] Remove `dataSource` field from all page definitions
- [✅] Delete `definitions/data/` folder
- [✅] Delete `data/` folder
- [✅] Update steering files to document inline-only data pattern
- [✅] Fix loaders to extract data from inline `componentData` instead of external files
- [✅] Remove `loadDataFromSource()` methods from all loaders

**Files Modified:**
- `definitions/pages/projects_page_t1.json`
- `definitions/pages/education_page_t1.json`
- `definitions/pages/experience_page_t1.json`
- `blocks/components/projects_grid/type_1/projects_grid_loader_t1.php`
- `blocks/components/education_history/type_1/education_history_loader_t1.php`

**Files Deleted:**
- `definitions/data/projects_data_ml_mlops_t1.json`
- `definitions/data/education_data_ml_mlops_t1.json`
- `data/experience_data_ml_mlops_t1.json`
- `definitions/data/` (folder)
- `data/` (folder)

**Rationale:**
- Original design: all data inline in page definitions
- External dataSource pattern adds unnecessary complexity
- Single source of truth is cleaner and more maintainable

---

### Task 1.5: Verify and Fix Workflow Component
**Priority:** Critical  
**Component:** `blocks/components/workflow/type_2/`  
**Status:** [✅]

**Subtasks:**
- [✅] Verify workflow/type_2 component exists
- [✅] Check current loading mode implementation - all three modes present
- [✅] Fix navigation handler to use standard signature (elementId, state, parameters)
- [✅] Add data setter function `setWorkflowData()`
- [✅] Add init hook function `initializeWorkflow()`
- [✅] Export functions to global scope
- [✅] Verify data extraction from inline componentData

**Files Modified:**
- `blocks/components/workflow/type_2/workflow_behavior_t2.js`

**Notes:**
- Workflow loader already had all three loading modes implemented correctly
- Navigation handler was using old signature (action, data) - fixed to (elementId, state, parameters)
- Added missing global exports for data setter and init hook

---

### Task 1.6: Verify Summaries Component Compliance
**Priority:** Critical  
**Component:** `blocks/components/summaries/type_1/`  
**Status:** [ ]

**Subtasks:**
- [ ] Verify if summaries/type_1 component exists
- [ ] Check if all three loading modes are implemented
- [ ] Verify data injection is inside container
- [ ] Test dynamic loading functionality
- [ ] Document compliance status

**Files to Check:**
- `blocks/components/summaries/type_1/summary_loader_t1.php`

---

### Task 1.7: Fix Data Injection - Testimonials Component
**Priority:** Critical  
**Component:** `blocks/components/testimonials/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Locate data injection script in `generateFullComponent()`
- [✅] Change from `return $html . $dataScript;` to inject inside container
- [✅] Use `strrpos()` to find last `</div>`
- [✅] Use `substr_replace()` to inject script before closing div
- [✅] Test that scripts are inside container in rendered HTML
- [✅] Verify dynamic content replacement works

**Files to Modify:**
- `testimonials_loader_t1.php`

**Code Pattern:**
```php
$lastDivPos = strrpos($html, '</div>');
if ($lastDivPos !== false) {
    $html = substr_replace($html, $dataScript . '</div>', $lastDivPos, 6);
}
return $html;
```

---

### Task 1.8: Fix Data Injection - Competencies Component
**Priority:** Critical  
**Component:** `blocks/components/competencies/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Locate data injection script in `generateFullComponent()`
- [✅] Change from `return $html . $dataScript;` to inject inside container
- [✅] Use `strrpos()` to find last `</section>` (component uses section tag)
- [✅] Use `substr_replace()` to inject script before closing tag
- [✅] Test that scripts are inside container in rendered HTML
- [✅] Verify dynamic content replacement works

**Files to Modify:**
- `competencies_loader_t1.php`

---

### Task 1.9: Fix Data Injection - Tools Component
**Priority:** Critical  
**Component:** `blocks/components/tools/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Locate data injection script in `generateFullComponent()`
- [✅] Change from `return $html . $dataScript;` to inject inside container
- [✅] Use `strrpos()` to find last `</section>` (component uses section tag)
- [✅] Use `substr_replace()` to inject script before closing tag
- [✅] Test that scripts are inside container in rendered HTML
- [✅] Verify dynamic content replacement works

**Files to Modify:**
- `tools_loader_t1.php`

---

### Task 1.10: Standardize Global Exports - Competencies Component
**Priority:** Critical  
**Component:** `blocks/components/competencies/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Remove `window.competenciesBehavior` object pattern
- [✅] Extract functions from behavior object
- [✅] Export functions directly to window: `window.setCompetenciesData`
- [✅] Update PHP loader to call direct function (not object method)
- [✅] Test data injection still works
- [✅] Update any code that references `competenciesBehavior`

**Files to Modify:**
- `competencies_behavior_t1.js`
- `competencies_loader_t1.php`

**Before:**
```javascript
window.competenciesBehavior = {
    setSkillsData: function(data) { ... }
};
```

**After:**
```javascript
function setCompetenciesData(data) { ... }
window.setCompetenciesData = setCompetenciesData;
```

---

### Task 1.11: Standardize Global Exports - Tools Component
**Priority:** Critical  
**Component:** `blocks/components/tools/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Remove `window.toolsBehavior` object pattern
- [✅] Extract functions from behavior object
- [✅] Export functions directly to window: `window.setToolsData`
- [✅] Update PHP loader to call direct function (not object method)
- [✅] Test data injection still works
- [✅] Update any code that references `toolsBehavior`

**Files to Modify:**
- `tools_behavior_t1.js`
- `tools_loader_t1.php`

---

### Task 1.12: Standardize Global Exports - Workflow Component (If Exists)
**Priority:** Critical  
**Component:** `blocks/components/workflow/type_2/`  
**Status:** [ ]

**Subtasks:**
- [ ] Verify if workflow component exists
- [ ] Check if it uses `window.workflowBehavior` pattern
- [ ] If yes, remove behavior object pattern
- [ ] Export functions directly to window
- [ ] Update PHP loader
- [ ] Test functionality

**Files to Check:**
- `blocks/components/workflow/type_2/workflow_behavior_t2.js`
- `blocks/components/workflow/type_2/workflow_loader_t2.php`

---

## Phase 2: High Priority Fixes (Should Fix)

### Task 2.1: Add Init Hooks - Testimonials Component
**Priority:** High  
**Component:** `blocks/components/testimonials/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Add `data-init-hook="initializeTestimonials"` to shell generation
- [✅] Create `initializeTestimonials()` function in behavior file
- [✅] Reattach event listeners in init function
- [✅] Reinitialize component state
- [✅] Export function to window
- [✅] Test dynamic content injection triggers init hook

**Files to Modify:**
- `testimonials_loader_t1.php` (shell generation)
- `testimonials_behavior_t1.js` (init function)

---

### Task 2.2: Add Init Hooks - Competencies Component
**Priority:** High  
**Component:** `blocks/components/competencies/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Add `data-init-hook="initializeCompetencies"` to shell generation
- [✅] Create `initializeCompetencies()` function in behavior file
- [✅] Reattach event listeners in init function
- [✅] Reinitialize component state
- [✅] Export function to window
- [✅] Test dynamic content injection triggers init hook

**Files to Modify:**
- `competencies_loader_t1.php`
- `competencies_behavior_t1.js`

---

### Task 2.3: Add Init Hooks - Tools Component
**Priority:** High  
**Component:** `blocks/components/tools/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Add `data-init-hook="initializeTools"` to shell generation
- [✅] Create `initializeTools()` function in behavior file
- [✅] Reattach event listeners in init function
- [✅] Reinitialize component state
- [✅] Export function to window
- [✅] Test dynamic content injection triggers init hook

**Files to Modify:**
- `tools_loader_t1.php`
- `tools_behavior_t1.js`

---

### Task 2.4: Audit and Add Init Hooks - All Other Components
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] List all components in blocks/components/
- [ ] Check each for `data-init-hook` attribute
- [ ] Check each for corresponding init function
- [ ] Add missing init hooks where needed
- [ ] Document which components need vs don't need init hooks
- [ ] Test all init hooks work after dynamic loading

**Components to Check:**
- [ ] heros/type_1
- [ ] projects_grid/type_1
- [ ] project_details/type_1
- [ ] experience/type_1
- [ ] education_history/type_1
- [ ] certifications/type_1
- [ ] summaries/type_1
- [ ] workflow/type_2 (if exists)

---

### Task 2.5: Fix Class Naming - Testimonials Loader
**Priority:** High  
**Component:** `blocks/components/testimonials/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Rename class from `TestimonialsLoader` to `TestimonialsLoaderT1`
- [✅] Update any references to the old class name
- [✅] Test that builder still finds and loads the class
- [✅] Verify no breaking changes

**Files to Modify:**
- `testimonials_loader_t1.php`

---

### Task 2.6: Audit Class Naming - All Components
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] List all loader classes in blocks/components/
- [ ] Check each follows `{ComponentName}LoaderT{Version}` pattern
- [ ] Document any that don't follow pattern
- [ ] Rename non-compliant classes
- [ ] Test builder still works with renamed classes

**Expected Pattern:** `HeroLoaderT1`, `ProjectsGridLoaderT1`, `TestimonialsLoaderT1`

---

### Task 2.7: Fix Variable Redeclaration - Audit All Components
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Search all behavior JS files for `let` declarations
- [ ] Search all behavior JS files for `const` declarations
- [ ] Identify which are global state (vs local scope)
- [ ] Replace global state declarations with `window.variable = window.variable || value`
- [ ] Test components work after dynamic reload
- [ ] Verify no console errors on reload

**Files to Audit:**
- All `*_behavior_t*.js` files in blocks/components/

**Pattern to Replace:**
```javascript
// BEFORE
let componentData = [];

// AFTER
window.componentData = window.componentData || [];
```

---

## Phase 3: Medium Priority Fixes (Nice to Fix)

### Task 3.1: Standardize Data Setter Naming - All Components
**Priority:** Medium  
**Status:** [ ]

**Subtasks:**
- [ ] List all data setter functions across components
- [ ] Document current naming patterns
- [ ] Rename to `set{ComponentName}Data` pattern
- [ ] Update PHP loaders to call renamed functions
- [ ] Test all data injection still works
- [ ] Update any external references

**Expected Names:**
- `setHeroData()`
- `setProjectsGridData()`
- `setTestimonialsData()`
- `setCompetenciesData()`
- `setToolsData()`
- `setExperienceData()`
- `setEducationData()`
- `setCertificationsData()`

---

### Task 3.2: Verify Navigation Handler Exports - All Components
**Priority:** Medium  
**Status:** [ ]

**Subtasks:**
- [ ] List all navigation handlers in behavior files
- [ ] Check each is exported to window
- [ ] Check each follows naming: `handle{ComponentName}Navigation`
- [ ] Add missing exports
- [ ] Test navigation works for all components
- [ ] Document which components have navigation handlers

**Pattern:**
```javascript
function handleComponentNavigation(id, state, params) { }
window.handleComponentNavigation = handleComponentNavigation;
```

---

### Task 3.3: Add Error Handling - Testimonials Loader
**Priority:** Medium  
**Component:** `blocks/components/testimonials/type_1/`  
**Status:** [✅]

**Subtasks:**
- [✅] Wrap `load()` method in try-catch
- [✅] Add error logging with `error_log()`
- [✅] Create `generateErrorPlaceholder()` method
- [✅] Return error placeholder on exception
- [✅] Test error handling with invalid data
- [✅] Verify errors logged to PHP error log

**Files to Modify:**
- `testimonials_loader_t1.php`

---

### Task 3.4: Add Error Handling - All Component Loaders
**Priority:** Medium  
**Status:** [ ]

**Subtasks:**
- [ ] Add try-catch to all loader `load()` methods
- [ ] Add error logging to all loaders
- [ ] Create error placeholders for all components
- [ ] Test error handling for each component
- [ ] Document error handling approach

**Pattern:**
```php
try {
    return $this->generateComponent($data);
} catch (Exception $e) {
    error_log("ComponentName error: " . $e->getMessage());
    return $this->generateErrorPlaceholder();
}
```

---

### Task 3.5: Accessibility Audit - Testimonials Component
**Priority:** Medium  
**Component:** `blocks/components/testimonials/type_1/`  
**Status:** [ ]

**Subtasks:**
- [ ] Add ARIA labels to interactive elements
- [ ] Add `aria-expanded` to collapsible elements
- [ ] Add `aria-hidden="true"` to decorative icons
- [ ] Add screen reader text where needed
- [ ] Test with keyboard navigation
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify focus indicators visible

**Files to Modify:**
- `testimonials_structure_t1.html`
- `testimonials_style_t1.css`

---

### Task 3.6: Accessibility Audit - All Components
**Priority:** Medium  
**Status:** [ ]

**Subtasks:**
- [ ] Create accessibility checklist
- [ ] Audit each component for ARIA attributes
- [ ] Audit each component for keyboard navigation
- [ ] Audit each component for screen reader support
- [ ] Add missing accessibility features
- [ ] Test with accessibility tools
- [ ] Document accessibility compliance

**Components to Audit:**
- [ ] heros/type_1
- [ ] projects_grid/type_1
- [ ] project_details/type_1
- [ ] testimonials/type_1
- [ ] competencies/type_1
- [ ] tools/type_1
- [ ] experience/type_1
- [ ] education_history/type_1
- [ ] certifications/type_1
- [ ] summaries/type_1
- [ ] workflow/type_2 (if exists)

---

## Phase 4: Low Priority Fixes (Consider Fixing)

### Task 4.1: CSS Variables Audit - Testimonials Component
**Priority:** Low  
**Component:** `blocks/components/testimonials/type_1/`  
**Status:** [ ]

**Subtasks:**
- [ ] Find all hardcoded color values
- [ ] Replace with CSS custom properties
- [ ] Find all hardcoded spacing values
- [ ] Replace with spacing variables
- [ ] Find all hardcoded font sizes
- [ ] Replace with typography variables
- [ ] Test component still looks correct
- [ ] Test in light and dark themes

**Files to Modify:**
- `testimonials_style_t1.css`

---

### Task 4.2: CSS Variables Audit - All Components
**Priority:** Low  
**Status:** [ ]

**Subtasks:**
- [ ] Audit all component CSS files
- [ ] Document hardcoded values
- [ ] Replace colors with `--color-*` variables
- [ ] Replace spacing with `--spacing-*` variables
- [ ] Replace typography with `--font-*` variables
- [ ] Replace borders with `--border-*` variables
- [ ] Test all components in both themes
- [ ] Document CSS variable usage

---

### Task 4.3: Add Component Documentation - Testimonials Loader
**Priority:** Low  
**Component:** `blocks/components/testimonials/type_1/`  
**Status:** [ ]

**Subtasks:**
- [ ] Add class-level PHPDoc comment
- [ ] Document expected data structure
- [ ] Document supported states
- [ ] Document dynamic loading support
- [ ] Document protected content support
- [ ] Add method-level comments
- [ ] Document parameters and return values

**Files to Modify:**
- `testimonials_loader_t1.php`

**Template:**
```php
/**
 * Testimonials Component Loader
 * 
 * Data Structure:
 * {
 *   "title": "Testimonials",
 *   "items": [
 *     {
 *       "name": "John Doe",
 *       "role": "CEO",
 *       "text": "Great work!",
 *       "image": "path/to/image.jpg"
 *     }
 *   ]
 * }
 * 
 * Supported States: visible, hidden
 * Dynamic Loading: Supported
 * Protected Content: Supported
 */
class TestimonialsLoaderT1 { }
```

---

### Task 4.4: Add Component Documentation - All Loaders
**Priority:** Low  
**Status:** [ ]

**Subtasks:**
- [ ] Add documentation to all loader classes
- [ ] Document data structures for each
- [ ] Document supported states
- [ ] Document capabilities
- [ ] Add method-level documentation
- [ ] Create documentation standards guide

---

### Task 4.5: Responsive Breakpoints Audit - All Components
**Priority:** Low  
**Status:** [ ]

**Subtasks:**
- [ ] List all media queries across all CSS files
- [ ] Document current breakpoint values
- [ ] Identify inconsistencies
- [ ] Standardize to: Mobile (<768px), Tablet (768-1023px), Desktop (≥1024px)
- [ ] Test all components at each breakpoint
- [ ] Verify mobile-first approach used

**Standard Breakpoints:**
```css
/* Mobile (default) */
.component { }

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

---

## Testing & Verification Tasks

### Task T.1: Create Component Testing Checklist
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Create comprehensive testing checklist
- [ ] Include all three loading modes
- [ ] Include dynamic loading scenarios
- [ ] Include navigation scenarios
- [ ] Include accessibility tests
- [ ] Include responsive tests
- [ ] Document testing procedures

---

### Task T.2: Test All Components - Full Mode
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Test each component loads in full mode
- [ ] Verify data displays correctly
- [ ] Verify styles applied correctly
- [ ] Verify JavaScript works
- [ ] Test in multiple browsers
- [ ] Document any issues

---

### Task T.3: Test All Components - Shell Mode
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Test each component generates shell
- [ ] Verify shell has required attributes
- [ ] Verify shell is lightweight
- [ ] Verify metadata embedded correctly
- [ ] Document any issues

---

### Task T.4: Test All Components - Content Mode
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Test each component generates content
- [ ] Verify content can be injected into shell
- [ ] Verify scripts execute after injection
- [ ] Verify init hooks trigger
- [ ] Document any issues

---

### Task T.5: Test Dynamic Loading End-to-End
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Create test page with dynamic components
- [ ] Test initial load (shells render)
- [ ] Test navigation triggers content load
- [ ] Test content injection works
- [ ] Test init hooks trigger
- [ ] Test component functionality after load
- [ ] Test with URL parameters
- [ ] Test caching works
- [ ] Document any issues

---

### Task T.6: Test Protected Content Flow
**Priority:** High  
**Status:** [ ]

**Subtasks:**
- [ ] Mark test component as protected
- [ ] Test shell renders on initial load
- [ ] Test content not loaded when not authenticated
- [ ] Test authentication flow
- [ ] Test content loads after authentication
- [ ] Test content not cached
- [ ] Document any issues

---

## Documentation Tasks

### Task D.1: Update Steering Files
**Priority:** Medium  
**Status:** [ ]

**Subtasks:**
- [ ] Review all steering files for accuracy
- [ ] Update with any new patterns discovered
- [ ] Add examples from fixed components
- [ ] Clarify ambiguous sections
- [ ] Add troubleshooting section

---

### Task D.2: Create Component Migration Guide
**Priority:** Medium  
**Status:** [ ]

**Subtasks:**
- [ ] Document step-by-step migration process
- [ ] Include before/after code examples
- [ ] Add common pitfalls section
- [ ] Add testing checklist
- [ ] Add troubleshooting guide

---

### Task D.3: Update DESIGN_DIVERGENCE_ANALYSIS.md
**Priority:** Low  
**Status:** [ ]

**Subtasks:**
- [ ] Mark completed tasks
- [ ] Update component compliance status
- [ ] Document any new divergences found
- [ ] Update recommendations based on learnings

---

## Progress Tracking

### Phase 1 Progress: 11/12 tasks completed (92%)
- Critical fixes for loading modes, data injection, and global exports
- ✅ Testimonials: Shell/content modes, data injection, global exports
- ✅ Competencies: Shell/content modes, data injection, global exports
- ✅ Tools: Shell/content modes, data injection, global exports
- ✅ Workflow: Navigation handler fixed, data setter and init hook added
- ✅ Data consolidation: All loaders now extract from inline componentData
- ⏳ Summaries: Needs verification

### Phase 2 Progress: 3/7 tasks completed (43%)
- High priority fixes for init hooks, naming, and variable declarations
- ✅ Testimonials: Init hooks, class naming, error handling
- ✅ Competencies: Init hooks
- ✅ Tools: Init hooks
- ⏳ Other components need audit

### Phase 3 Progress: 1/6 tasks completed (17%)
- Medium priority fixes for consistency and error handling
- ✅ Testimonials: Error handling added

### Phase 4 Progress: 0/5 tasks completed (0%)
- Low priority fixes for polish and documentation

### Testing Progress: 0/6 tasks completed (0%)
- Comprehensive testing of all fixes

### Documentation Progress: 0/3 tasks completed (0%)
- Update documentation and guides

---

## Notes

- Each task should be completed and tested before moving to the next
- Mark tasks as [✅] when fully completed and tested
- Mark tasks as [🔍] when completed but needs peer review
- Mark tasks as [❌] if blocked with explanation
- Update progress percentages as tasks complete
- Add new tasks if additional divergences discovered
- Reference steering files for implementation patterns
- Test in multiple browsers after each fix
- Document any issues or learnings in task notes

---

## Quick Reference

**Steering Files:**
- `.kiro/steering/page-and-container-definitions.md`
- `.kiro/steering/navigation-and-dynamic-loading.md`
- `.kiro/steering/component-design-standards.md`
- `.kiro/steering/architecture-and-flow.md`

**Reference Components:**
- `blocks/components/heros/type_1/` - Fully compliant
- `blocks/components/projects_grid/type_1/` - Fully compliant
- `blocks/components/project_details/type_1/` - Fully compliant

**Key Files:**
- `builders/builder_t1.php` - Builder system
- `endpoints/dynamic_content_t1.php` - Dynamic loading API
- `blocks/sites/top_bar/type_2/behaviors/dynamic_content_loader_t1.js` - Client loader
- `blocks/sites/top_bar/type_2/behaviors/global_navigator_t1.js` - Navigation system
