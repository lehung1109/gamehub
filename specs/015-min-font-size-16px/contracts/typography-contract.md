# Typography Contract: Enforce Minimum 16px Font Size

**Feature**: `015-min-font-size-16px` | **Date**: 2026-08-27

> This contract defines the formal typography rules and computed style guarantees for all visual components in GameHub. It serves as the acceptance criteria for UI styling.

---

## Contract 1: Global Theme Token Guarantees

**Provider**: `src/app/globals.css` (`@theme inline`, `@layer base`)  
**Consumer**: All React components, Tailwind utility classes, shadcn UI components

| Utility Class | CSS Variable | Expected Computed Font Size | Expected Computed Line Height |
|---------------|--------------|-----------------------------|-------------------------------|
| `text-xs` | `--text-xs` | **16px** (1rem) | **24px** (1.5rem) |
| `text-sm` | `--text-sm` | **16px** (1rem) | **24px** (1.5rem) |
| `text-base` | `--text-base` | **16px** (1rem) | **24px** (1.5rem) |
| `text-lg` | `--text-lg` | **18px** (1.125rem) | **28px** (1.75rem) |
| `text-xl` | `--text-xl` | **20px** (1.25rem) | **28px** (1.75rem) |
| `text-2xl` | `--text-2xl` | **24px** (1.5rem) | **32px** (2rem) |
| `text-3xl` | `--text-3xl` | **30px** (1.875rem) | **36px** (2.25rem) |
| `text-4xl` | `--text-4xl` | **36px** (2.25rem) | **40px** (2.5rem) |

**Invariant**: At no viewport or screen size shall any rendered DOM element text have a computed `font-size` $< 16\text{px}$.

---

## Contract 2: Shared UI Components Invariants

**Provider**: `src/components/ui/*`  
**Consumer**: Application pages, game engines, admin dashboard

| Component | Variant / Slot | Minimum Height | Minimum Font Size | Padding Guarantee |
|-----------|----------------|----------------|-------------------|-------------------|
| `Button` | `size="default"` | `h-9` (36px) | 16px | `px-4 py-2` |
| `Button` | `size="sm"` | `h-8` (32px) | **16px** | `px-3` |
| `Button` | `size="lg"` | `h-10` (40px) | 16px | `px-6` |
| `Toggle` | `size="sm"` | `h-8` (32px) | **16px** | `px-3` |
| `Badge` | all variants | `min-h-[24px]` | **16px** | `px-2.5 py-0.5` |
| `Tooltip` | content slot | auto | **16px** | `px-3 py-1.5` |
| `Input` | text input | `h-9` (36px) | **16px** | `px-3 py-1` |

**Invariant**: Buttons and Toggles with `size="sm"` must not clip icon (`size-3.5` / `size-4`) or text when rendered at 16px.

---

## Contract 3: Student & Game Elements Font Invariants

**Provider**: `src/components/student/*`, `src/components/game/*`, `src/app/games/*`  
**Consumer**: Students, game players

| UI Location | Element | Font Size | Behavior & Hierarchy |
|-------------|---------|-----------|----------------------|
| `StudentProfileBadge` | Level & Points | 16px | `font-bold`, clear contrast |
| `StudentBadge` | Class Name & Rank | 16px | `font-semibold text-muted-foreground` |
| `LetterGrid` | Alphabet Tiles | $\ge 20\text{px}$ | Large, child-friendly touch targets |
| `FlashcardStack` | Word & Phonetic | $\ge 24\text{px}$ | High contrast, large centered cards |
| `DragDropBoard` | Word Chips | $\ge 18\text{px}$ | Spacious chips with clear boundaries |
| `QuickRulesTab` | Grammar formulas | 16px | Monospace / bold pill formatting |

**Invariant**: Sub-16px custom classes (`text-[10px]`, `text-[11px]`, etc.) are completely forbidden.
