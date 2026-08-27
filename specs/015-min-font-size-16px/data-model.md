# Data Model: Typography Design System (Min 16px Font Size)

**Feature**: `015-min-font-size-16px` | **Date**: 2026-08-27

> This feature is **styling-only** — no database entities, API schemas, or backend data models are altered. This document details the **Typography & Design System Tokens Model** that defines font sizes, line heights, and component scaling across the application.

---

## Entity: Typography Token Scale

Defines the mapping of Tailwind utility tokens to computed font sizes and line heights.

### Fields

| Token | CSS Variable | Computed Font Size (px) | Computed Font Size (rem) | Computed Line Height (px) | Computed Line Height (rem) | Purpose |
|-------|--------------|-------------------------|--------------------------|---------------------------|----------------------------|---------|
| `text-xs` | `--text-xs` | 16px | 1rem | 24px | 1.5rem | Small badges, sub-labels, metadata (formerly 12px) |
| `text-sm` | `--text-sm` | 16px | 1rem | 24px | 1.5rem | Secondary text, buttons, tooltips (formerly 14px) |
| `text-base` | `--text-base` | 16px | 1rem | 24px | 1.5rem | Standard body text, inputs, cards |
| `text-lg` | `--text-lg` | 18px | 1.125rem | 28px | 1.75rem | Emphasized body, large buttons |
| `text-xl` | `--text-xl` | 20px | 1.25rem | 28px | 1.75rem | Section subheadings, card titles |
| `text-2xl` | `--text-2xl` | 24px | 1.5rem | 32px | 2rem | Section headings, dialog titles |
| `text-3xl` | `--text-3xl` | 30px | 1.875rem | 36px | 2.25rem | Page main headings, game score banner |
| `text-4xl` | `--text-4xl` | 36px | 2.25rem | 40px | 2.5rem | Hero titles, large celebration dialogs |

### Validation Rules

1. **VR-001**: For all tokens $T \in \{\text{xs}, \text{sm}, \text{base}, \dots\}$, $\text{FontSize}(T) \ge 16\text{px}$ ($1\text{rem}$).
2. **VR-002**: For all tokens $T \in \{\text{xs}, \text{sm}, \text{base}, \dots\}$, $\text{LineHeight}(T) \ge 24\text{px}$ ($1.5\text{rem}$) when $\text{FontSize}(T) = 16\text{px}$.
3. **VR-003**: No arbitrary font size class matching `/text-\[(?:[0-9]|1[0-5])px\]/` or `/text-\[0\.[0-9]+rem\]/` shall exist in the source code.

---

## Entity: Component Typography & Sizing Rules

Defines the styling invariants applied to UI and game components to accommodate the $\ge 16\text{px}$ minimum font size.

### Fields

| Component | Target File | Element / Variant | Previous Font Spec | New Font Spec | Height / Padding Adjustments |
|-----------|-------------|-------------------|--------------------|---------------|------------------------------|
| `Button` | `src/components/ui/button.tsx` | Size `sm` | `text-[0.8rem]` | `text-sm` (16px) | `h-8 min-w-8 px-3` |
| `Toggle` | `src/components/ui/toggle.tsx` | Size `sm` | `text-[0.8rem]` | `text-sm` (16px) | `h-8 min-w-8 px-3` |
| `Badge` | `src/components/ui/badge.tsx` | All variants | `text-xs` | `text-xs` (16px) | `px-2.5 py-0.5` |
| `Tooltip` | `src/components/ui/tooltip.tsx` | Content | `text-xs` | `text-xs` (16px) | `px-3 py-1.5` |
| `StudentProfileBadge` | `src/components/StudentProfileBadge.tsx` | Status dot & "Tối đa" label | `text-[10px]` | `text-xs font-bold` (16px) | Auto-layout flex wrap |
| `StudentBadge` | `src/components/student/StudentBadge.tsx` | Level sub-text & Link | `text-[11px]`, `text-[10px]` | `text-xs font-semibold` (16px) | Relaxed max-width |
| `TenseLessonContainer` | `src/components/tenses/TenseLessonContainer.tsx` | Stage category badges | `text-[10px]` | `text-xs font-medium` (16px) | `px-2 py-0.5` |
| `QuickRulesTab` | `src/components/tenses/QuickRulesTab.tsx` | Formula badges & rule text | `text-[10px]`, `text-[11px]` | `text-xs` / `text-sm` (16px) | `px-2 py-1` |
| `NumbersColorsGame` | `src/app/games/numbers-colors/page.tsx` | Color / Number card labels | `text-[10px] sm:text-xs` | `text-sm sm:text-base` (16px) | Truncation auto-fit |

### Validation Rules

4. **VR-004**: Interactive components (`Button`, `Toggle`) in compact variants MUST provide at least 32px (`h-8`) vertical touch target dimension.
5. **VR-005**: Text clipping or horizontal text collision MUST NOT occur when labels grow from 10px-14px to 16px.
6. **VR-006**: Visual hierarchy between primary headings and metadata MUST be maintained via font-weight (`font-semibold`, `font-bold`), letter-spacing, and contrast colors (`text-muted-foreground`).
