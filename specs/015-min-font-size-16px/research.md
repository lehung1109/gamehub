# Research: Đảm bảo Font Size không nhỏ hơn 16px Toàn Ứng Dụng

**Feature**: `015-min-font-size-16px` | **Date**: 2026-08-27

## Research Summary

All technical decisions have been resolved through codebase investigation and Tailwind CSS v4 documentation review. The implementation is pure CSS & Tailwind utility refinement within Next.js App Router and shadcn/ui components. No additional dependencies or schema migrations are needed.

---

## Decision 1: Tailwind CSS v4 Typography Theme Overrides

### Research Task
How to enforce that standard utility classes like `text-xs` and `text-sm` never evaluate to less than 16px (1rem) across the entire application without breaking Tailwind CSS v4 build compilation.

### Decision: Theme Variable Overrides in `@theme inline` in `src/app/globals.css`

In Tailwind CSS v4, font sizes are controlled via theme variables. We will define explicit minimums in `@theme inline`:

```css
@theme inline {
  /* Enforce minimum 16px font size scale */
  --text-xs: 1rem;            /* 16px */
  --text-xs--line-height: 1.5rem; /* 24px */
  --text-sm: 1rem;            /* 16px */
  --text-sm--line-height: 1.5rem; /* 24px */
  --text-base: 1rem;          /* 16px */
  --text-base--line-height: 1.5rem; /* 24px */
}
```

### Rationale
- **Global Coverage**: Any existing component or third-party/shadcn component referencing `text-xs` or `text-sm` automatically inherits `1rem` (16px) with comfortable `1.5rem` (24px) line height.
- **Zero Runtime Overhead**: Handled entirely at compile-time by Tailwind CSS v4 PostCSS engine.
- **Maintainability**: Future components using standard Tailwind classes will never produce sub-16px text.

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Manually replace all `text-xs`/`text-sm` in 80+ files | Tedious, prone to regressions when new components are added or copied from shadcn/ui |
| Use CSS `* { font-size: 16px !important; }` | Destroys headings (`text-2xl`, `text-4xl`, etc.) and typography hierarchy |
| Set root `html { font-size: 20px; }` | Changes relative scaling of all REM values disproportionately across padding and margins |

---

## Decision 2: Base Layer HTML / Body Typography Rule

### Research Task
How to guarantee the root base font size is strictly locked to at least 16px.

### Decision: Set Base Font Rules in `@layer base`

Add base typography declaration in `src/app/globals.css`:

```css
@layer base {
  html {
    font-size: 16px;
    scrollbar-gutter: stable;
  }
  body {
    @apply bg-background text-foreground;
    font-size: 1rem;
    line-height: 1.5rem;
    min-height: 100vh;
  }
}
```

### Rationale
- **Predictable 1rem Calculation**: Ensures `1rem = 16px` across all browsers and environments.
- **Accessible Baseline**: Meets WCAG recommendations for standard educational and web applications.

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Leave html font size implicit | Default browser settings could vary slightly in unusual embedded webviews |

---

## Decision 3: Arbitrary Sub-16px Utility Classes Cleanup Strategy

### Research Task
How to address hardcoded arbitrary text sizes such as `text-[10px]`, `text-[11px]`, and `text-[0.8rem]` found in component files.

### Decision: Replace with Standard Semantic Classes (`text-sm` or `text-base` + font-weight / badge styles)

Search and replace all instances in the codebase:
- `src/components/StudentProfileBadge.tsx`: `text-[10px]` -> `text-sm font-bold`
- `src/components/student/StudentBadge.tsx`: `text-[10px]`, `text-[11px]` -> `text-sm font-semibold`
- `src/components/ui/button.tsx`: `text-[0.8rem]` (in `sm` size) -> `text-sm` (now 16px)
- `src/components/ui/toggle.tsx`: `text-[0.8rem]` (in `sm` size) -> `text-sm` (now 16px)
- `src/components/tenses/TenseLessonContainer.tsx`: `text-[10px]` -> `text-sm font-medium`
- `src/components/tenses/QuickRulesTab.tsx`: `text-[10px]`, `text-[11px]` -> `text-sm`
- `src/app/games/numbers-colors/page.tsx`: `text-[10px] sm:text-xs` -> `text-sm sm:text-base`

### Rationale
- Eliminates hardcoded pixel escapes that bypass the Tailwind theme.
- Unifies styling using semantic theme tokens.

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Keep arbitrary classes for small tags | Violates spec requirement (FR-003 and SC-001) of no sub-16px text anywhere |

---

## Decision 4: UI Components Adaptation & Spacing Strategy

### Research Task
Ensuring small components like `Badge`, `Tooltip`, and `Button (sm)` do not clip text or suffer from awkward line wrapping when rendered at 16px.

### Decision: Proportionate Padding and Min-Height Tweaks

1. **Badge (`src/components/ui/badge.tsx`)**:
   - Ensure badges have comfortable horizontal padding (`px-2.5 py-1`) and `leading-normal` to accommodate 16px text gracefully.
2. **Button sm / Toggle sm (`src/components/ui/button.tsx`, `toggle.tsx`)**:
   - Adjust `sm` variant height from `h-7` to `h-8` or `min-h-8` with `px-3` to prevent text truncation and ensure accessible touch target sizes.
3. **Tooltip (`src/components/ui/tooltip.tsx`)**:
   - Maintain `text-sm` (16px) with clean padding (`px-3 py-1.5`) and max-width bounds.

### Rationale
- Prevents UI overflow and clipping.
- Improves touch accessibility for children on tablets and touchscreens (touch targets become easier to tap).

---

## Decision 5: Preserving Visual Hierarchy

### Research Task
How to preserve visual distinction between secondary metadata (e.g. captions, badges) and primary content (titles, body text) when `text-xs`, `text-sm`, and `text-base` all have a font size of 16px.

### Decision: Leverage Color Contrast, Font Weight, Letter Spacing, and Badge Containers

Use typography styling techniques other than font size reduction:
- **Font Weight**: Use `font-semibold` / `font-bold` for primary elements, `font-normal` / `font-medium` for secondary metadata.
- **Color Contrast**: Use `text-muted-foreground`, `text-slate-500`, or badge background pills (`bg-muted`, `bg-emerald-50`, etc.) to denote secondary tags.
- **Uppercase / Tracking**: Use `uppercase tracking-wider` for category labels and badges where appropriate.
- **Larger Headings**: Heading sizes (`text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`) remain distinct and prominent.

### Rationale
- Preserves design beauty, clarity, and hierarchy without requiring small, unreadable font sizes.

---

## All NEEDS CLARIFICATION: Resolved

No unresolved technical unknowns remain. All decisions are implementable cleanly with standard Tailwind CSS v4 theme mechanics and component adjustments.
