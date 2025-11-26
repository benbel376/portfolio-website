# CSS Refactor: Testimonials Component

**Component:** `blocks/components/testimonials/type_1/`  
**Status:** 🔄 In Progress  
**Date:** November 27, 2025

---

## Objectives

1. ✅ Replace all hardcoded spacing with CSS variables
2. ✅ Replace all hardcoded font sizes with CSS variables
3. ✅ Replace all hardcoded colors with appropriate variables (global or component-specific)
4. ✅ Ensure responsive design remains intact
5. ✅ Verify visual appearance is unchanged

---

## Current State Analysis

### ✅ Good Practices Already in Place
- Has responsive breakpoints (768px, 480px)
- Uses some CSS variables already
- Has `.theme-dark` selectors for dark mode
- Mobile-first approach

### ⚠️ Issues to Fix

#### Hardcoded Spacing Values
- `padding: 0 3rem` → should use `var(--spacing-12)`
- `margin-bottom: 6rem` → should use appropriate spacing variable
- `gap: 1rem` → should use `var(--spacing-4)`
- `width: 50px` → should use `var(--spacing-12)` or similar
- Many more instances

#### Hardcoded Font Sizes
- `font-size: 1.5rem` → should use `var(--font-size-2xl)`
- `font-size: 1rem` → should use `var(--font-size-base)`
- `font-size: 0.95rem` → should use `var(--font-size-sm)`

#### Hardcoded Colors
- `#ffffff` → should use `var(--color-background-light)`
- `#e0e0e0` → should use `var(--color-border)`
- `#666` → should use `var(--color-text-secondary)`
- `#FF8F00` → should use `var(--color-primary)`

#### Hardcoded Border Radius
- `border-radius: 16px` → should use `var(--border-radius-xl)`
- `border-radius: 8px` → should use `var(--border-radius-md)`

#### Hardcoded Transitions
- `transition: all 0.5s ease-in-out` → should use `var(--transition-normal)`
- `transition: all 0.3s ease` → should use `var(--transition-fast)`

---

## Refactoring Plan (Step-by-Step)

### Phase 1: Global Variables Setup
**Task:** Verify global variables file exists and has all needed variables

**File:** `blocks/sites/top_bar/type_2/styles/variables.css`

**Required Variables:**
```css
:root {
  /* Colors */
  --color-primary: #FF8F00;
  --color-primary-light: #FFB74D;
  --color-text-primary: #2C2C2C;
  --color-text-secondary: #666666;
  --color-text-inverse: #FFFFFF;
  --color-background-light: #FFFFFF;
  --color-background-card: #FFFFFF;
  --color-border: #E0E0E0;
  
  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-7: 28px;
  --spacing-8: 32px;
  --spacing-9: 36px;
  --spacing-10: 40px;
  --spacing-11: 44px;
  --spacing-12: 48px;
  
  /* Typography */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.2;
  --line-height-normal: 1.4;
  --line-height-relaxed: 1.6;
  
  /* Border Radius */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
  --border-radius-2xl: 20px;
  --border-radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.theme-dark {
  --color-text-primary: #FAFAFA;
  --color-text-secondary: #B0B0B0;
  --color-background-light: #1a1a1a;
  --color-background-card: #2a2a2a;
  --color-border: #404040;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.4);
}
```

**Action:** Check if variables file exists, create/update if needed

---

### Phase 2: Component-Specific Variables
**Task:** Define testimonials-specific variables

**File:** `blocks/components/testimonials/type_1/testimonials_style_t1.css`

**Add at top of file:**
```css
/* Testimonials Component Variables */
.testimonials-component {
  /* Component-specific colors */
  --testimonials-slide-bg: var(--color-background-card);
  --testimonials-slide-border: var(--color-border);
  --testimonials-slide-shadow: var(--shadow-md);
  --testimonials-avatar-border: #FFFFFF;
  --testimonials-indicator-inactive: rgba(255, 255, 255, 0.3);
  --testimonials-indicator-active: var(--color-primary);
}

.theme-dark .testimonials-component {
  --testimonials-avatar-border: #1a1a1a;
  --testimonials-indicator-inactive: rgba(255, 255, 255, 0.2);
}
```

**Action:** Add these variables, verify they don't break anything

---

### Phase 3: Replace Spacing Values
**Task:** Replace all hardcoded spacing with variables

**Changes:**
1. `padding: 0 3rem` → `padding: 0 var(--spacing-12)`
2. `margin-bottom: 6rem` → `margin-bottom: var(--spacing-12)` (6rem is too large, use 48px)
3. `gap: 1rem` → `gap: var(--spacing-4)`
4. `width: 50px` → `width: var(--spacing-12)`
5. `height: 50px` → `height: var(--spacing-12)`
6. And all other spacing instances...

**Action:** Make these changes, test visually

---

### Phase 4: Replace Typography Values
**Task:** Replace all hardcoded font sizes and weights

**Changes:**
1. `font-size: 1.5rem` → `font-size: var(--font-size-2xl)`
2. `font-size: 1rem` → `font-size: var(--font-size-base)`
3. `font-weight: 600` → `font-weight: var(--font-weight-semibold)`
4. And all other typography instances...

**Action:** Make these changes, test visually

---

### Phase 5: Replace Color Values
**Task:** Replace all hardcoded colors with variables

**Changes:**
1. `background: #ffffff` → `background: var(--testimonials-slide-bg)`
2. `border: 1px solid #e0e0e0` → `border: 1px solid var(--testimonials-slide-border)`
3. `color: #666` → `color: var(--color-text-secondary)`
4. `color: #FF8F00` → `color: var(--color-primary)`
5. And all other color instances...

**Action:** Make these changes, test in both light and dark themes

---

### Phase 6: Replace Border Radius Values
**Task:** Replace all hardcoded border radius with variables

**Changes:**
1. `border-radius: 16px` → `border-radius: var(--border-radius-xl)`
2. `border-radius: 8px` → `border-radius: var(--border-radius-md)`
3. `border-radius: 50%` → `border-radius: var(--border-radius-full)`

**Action:** Make these changes, test visually

---

### Phase 7: Replace Transition Values
**Task:** Replace all hardcoded transitions with variables

**Changes:**
1. `transition: all 0.5s ease-in-out` → `transition: all var(--transition-slow)`
2. `transition: all 0.3s ease` → `transition: all var(--transition-fast)`

**Action:** Make these changes, test animations

---

### Phase 8: Replace Shadow Values
**Task:** Replace all hardcoded box-shadow with variables

**Changes:**
1. `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1)` → `box-shadow: var(--testimonials-slide-shadow)`

**Action:** Make these changes, test in both themes

---

## Verification Checklist

After each phase, verify:
- [ ] Component looks identical in light theme
- [ ] Component looks identical in dark theme
- [ ] Responsive design works on mobile (< 768px)
- [ ] Responsive design works on tablet (768px - 1024px)
- [ ] Responsive design works on desktop (> 1024px)
- [ ] Animations/transitions still work smoothly
- [ ] No console errors
- [ ] Theme toggle works correctly

---

## Testing Instructions

1. **Visual Test - Light Theme:**
   - Load page in light theme
   - Check testimonials component appearance
   - Verify spacing, colors, fonts match original

2. **Visual Test - Dark Theme:**
   - Toggle to dark theme
   - Check testimonials component appearance
   - Verify dark theme colors applied correctly

3. **Responsive Test:**
   - Resize browser to mobile width (< 768px)
   - Verify layout adapts correctly
   - Test on tablet width (768px)
   - Test on desktop width (> 1024px)

4. **Interaction Test:**
   - Click navigation arrows
   - Click indicator dots
   - Verify smooth transitions
   - Check hover states

---

## Rollback Plan

If any phase breaks the design:
1. Git revert the specific change
2. Document what broke
3. Adjust the variable value or approach
4. Retry

---

## Notes

- Take screenshots before starting
- Test after EACH phase, not at the end
- If something looks off, stop and investigate
- Better to be slow and careful than fast and broken

