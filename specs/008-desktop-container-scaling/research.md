# Research: Desktop Container Scaling

**Feature**: 008-desktop-container-scaling | **Date**: 2026-08-24

## Research Summary

All technical unknowns have been resolved through codebase analysis and Tailwind CSS v4 documentation review. No external API research was needed — this is a pure CSS/Tailwind utility class modification.

---

## Decision 1: Root Layout Bottleneck Strategy

### Research Task
How to remove the `max-w-5xl` (1024px) ceiling in `src/app/layout.tsx` without breaking layouts at ≤1024px viewports.

### Decision: Responsive Max-Width Tiers on Root Container

Replace the single `max-w-5xl` with responsive breakpoint-based max-widths:

```
max-w-5xl lg:max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1800px]
```

### Rationale

- **Backwards compatibility** (FR-008): At viewports ≤1024px, `max-w-5xl` still applies, but the viewport itself is the limiting factor (content cannot exceed viewport width). Visual output is identical.
- **Progressive enhancement**: Each breakpoint tier allows proportionally more space:
  - `lg` (1024px+): `max-w-7xl` = 1280px — matches admin layout's intended width
  - `xl` (1280px+): 1400px — comfortable desktop
  - `2xl` (1536px+): 1800px — wide desktop / external monitors
- **SC-001 compliance**: At 1920px viewport, content width = 1800px → 1800/1920 = **93.75%** (exceeds 85% requirement)
- **Ultra-wide cap** (FR-009): 1800px prevents excessively long line lengths on 3440px+ monitors

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Route groups `(student)` / `(admin)` with separate root layouts | Too disruptive — requires moving 20+ files into route groups; higher risk of routing bugs for a styling-only feature |
| Remove `max-w` entirely (`w-full`) | No ultra-wide cap; violates FR-009; text lines become unreadable at 3440px |
| Use `container` query with `@container` | Tailwind v4 supports it but adds complexity; breakpoint-based approach is simpler and aligns with existing patterns |
| Single `max-w-screen-2xl` (1536px) | At 1920px: 1536/1920 = 80% — fails SC-001's 85% requirement |

---

## Decision 2: Nested Layout Unblocking

### Research Task
How nested layouts (`admin/layout.tsx` with `max-w-7xl`, `TenseHubMap` with `max-w-7xl`) should interact with the widened root.

### Decision: No Changes to Nested Layouts

Once the root container expands beyond 1280px at `xl:`, the admin layout's `max-w-7xl` (1280px) naturally takes effect. Nested layouts that already declare their own `max-w-*` will self-constrain correctly.

### Rationale

- Admin's `max-w-7xl` is intentional for admin content density; it should remain at 1280px
- `TenseHubMap`'s `max-w-7xl` is appropriate for the 4-column tense grid
- Game pages with `max-w-4xl` / `max-w-5xl` page containers need explicit widening (handled per-page)
- No cascade conflicts: child `max-w-*` always constrains within parent's available space

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Widen all nested layouts proportionally | Admin's 1280px is already appropriate; widening creates excessive density |
| Remove all nested `max-w-*` | Loss of intentional content width control per section |

---

## Decision 3: Text Truncation Relaxation Strategy

### Research Task
How to relax text truncation (`truncate`, `line-clamp-*`) on desktop viewports while preserving mobile behavior.

### Decision: Breakpoint-Conditional Truncation Override

Add `xl:` breakpoint overrides to relax or remove truncation on desktop:

**Pattern A — Fixed-Width Truncation (badges, nav labels):**
```
truncate max-w-[120px] sm:max-w-[180px]
→ truncate max-w-[120px] sm:max-w-[180px] xl:max-w-none xl:truncate-none
```
On desktop (`xl:` 1280px+), remove both the max-width constraint and truncation, allowing full text display.

**Pattern B — Line Clamping (card descriptions):**
```
line-clamp-2
→ line-clamp-2 xl:line-clamp-none
```
On desktop, descriptions wrap naturally instead of being cut at 2 lines.

**Pattern C — Contextual Line Clamping (stage scenarios):**
```
line-clamp-1
→ line-clamp-1 xl:line-clamp-2
```
For compact game stage UI, relax from 1 line to 2 lines rather than removing entirely.

### Rationale

- **Breakpoint-based**: Uses Tailwind's responsive prefix system — zero JavaScript, zero runtime cost
- **Mobile preservation**: Only `xl:` and above are affected; all mobile/tablet behavior is unchanged (FR-008)
- **Graceful degradation**: If container is still narrow (e.g., sidebar open), text wraps naturally
- **SC-002 compliance**: Zero truncated text visible for titles ≤50 chars, names ≤30 chars, descriptions ≤150 chars on desktop
- Tailwind v4 supports `truncate-none` as a utility to reset `text-overflow`, `overflow`, and `white-space`

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Remove all truncation globally | Breaks mobile layouts where truncation prevents overflow |
| JavaScript-based dynamic truncation | Violates constitution (no new dependencies); CSS-only is sufficient |
| Tooltip-on-hover for truncated text | Doesn't meet SC-002 "visible without hovering" requirement |

---

## Decision 4: Grid Column Scaling Strategy

### Research Task
How to add more columns to listing grids on `xl:` and `2xl:` viewports.

### Decision: Progressive Column Addition

Extend existing grid breakpoints with `xl:` and `2xl:` column counts:

| Grid | Current Max | `xl:` (1280px) | `2xl:` (1536px) |
|------|-------------|-----------------|-------------------|
| Home games listing | `lg:grid-cols-3` | `xl:grid-cols-4` | `2xl:grid-cols-5` |
| Flashcard topics | `lg:grid-cols-3` | `xl:grid-cols-4` | `2xl:grid-cols-5` |
| Tense hub map | `lg:grid-cols-4` | `xl:grid-cols-5` | `2xl:grid-cols-6` |
| Admin dashboard games | `lg:grid-cols-3` | `xl:grid-cols-4` | — |
| Admin config list | `lg:grid-cols-3` | `xl:grid-cols-4` | — |
| Admin class list | `xl:grid-cols-3` | — | `2xl:grid-cols-4` |
| Admin new config games | `lg:grid-cols-3` | `xl:grid-cols-4` | — |
| Alphabet letter grid | `lg:grid-cols-9` | `xl:grid-cols-11` | `2xl:grid-cols-13` |
| Class overview metrics | `lg:grid-cols-4` | — | — |

### Rationale

- **SC-003 compliance**: At 1536px, listing pages show ≥4 columns
- **Proportional scaling**: Columns increase by 1–2 per breakpoint tier, keeping card widths readable
- **Admin pages**: More conservative scaling (admin content is denser text, not cards)
- **No changes to metric grids**: Dashboard stat cards at `lg:grid-cols-4` already fit well at wider viewports

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| `auto-fill` / `auto-fit` grid | Less predictable column counts; harder to test specific assertions like "4 or more columns" |
| Fractional column widths (`grid-cols-[repeat(auto-fill,minmax(280px,1fr))]`) | Works well but harder to maintain and test; explicit breakpoints are clearer |

---

## Decision 5: Game Play Area Scaling

### Research Task
How to expand game play containers while respecting game content aspect ratios (per spec assumption).

### Decision: Responsive Max-Width Expansion

Expand play area containers with `xl:` breakpoint overrides:

| Component | Current | Desktop (`xl:` 1280px+) | Notes |
|-----------|---------|-------------------------|-------|
| `FlashcardStack` | `max-w-xl` (576px) | `xl:max-w-2xl` (672px) | +16.7% — card flip animation scales naturally |
| `DragDropBoard` | `max-w-2xl` (672px) | `xl:max-w-4xl` (896px) | +33.3% — more room for multi-word sentences (FR-011) |
| `QuizEngine` | `max-w-2xl` (672px) | `xl:max-w-3xl` (768px) | +14.3% — answer options spread better |
| Tense stages | `max-w-4xl` (896px) | `xl:max-w-5xl` (1024px) | +14.3% — conjugation/error/builder stages |
| Tense lesson container | `max-w-5xl` (1024px) | `xl:max-w-6xl` (1152px) | +12.5% |
| Flashcard topic page | `max-w-5xl` (1024px) | `xl:max-w-6xl` (1152px) | +12.5% |
| Flashcard play page | `max-w-4xl` (896px) | `xl:max-w-5xl` (1024px) | +14.3% |
| Sentences/Spelling page | `max-w-3xl` (768px) | `xl:max-w-4xl` (896px) | +16.7% — DnD boards benefit from width |
| Listening page | `max-w-3xl` (768px) | `xl:max-w-4xl` (896px) | +16.7% |
| Alphabet/Numbers page | `max-w-4xl` (896px) | `xl:max-w-5xl` (1024px) | +14.3% |

### Rationale

- **SC-006 compliance**: Game play areas are 12–33% wider than current on 1920px viewport (exceeds 30% for DnD board)
- **Content-appropriate scaling**: Flashcards scale less (single card view) while DnD boards scale more (multi-word sentences need room)
- **Spec boundary respected**: "internal game content scaling is out of scope" — only containers expand, not game element sizing
- **dnd-kit compatibility**: DnD containers expanding doesn't affect dnd-kit calculations — the library adapts to container dimensions automatically

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Scale all play areas by same percentage | Different games benefit differently from width (DnD > Flashcard) |
| Use viewport units (`max-w-[80vw]`) | Unpredictable on ultra-wide; fixed breakpoint tiers are more testable |
| Scale game content elements (card sizes, font sizes) | Out of scope per spec assumptions; only container widths change |

---

## Decision 6: Tailwind v4 Responsive Utility Compatibility

### Research Task
Verify that `xl:` and `2xl:` breakpoint prefixes and utilities like `truncate-none`, `line-clamp-none` work in Tailwind CSS v4.

### Decision: All Required Utilities Are Available

Tailwind CSS v4 supports:
- `xl:` (1280px) and `2xl:` (1536px) breakpoints out of the box — no configuration needed
- `line-clamp-none` to reset line clamping
- `truncate-none` to reset truncation (restores normal `overflow`, `text-overflow`, `white-space`)
- `max-w-none` to remove max-width constraints
- Arbitrary values like `max-w-[1400px]`, `max-w-[1800px]`
- No `tailwind.config.ts` needed — v4 uses CSS `@theme` in `globals.css`

### Rationale

- No theme configuration changes required
- No new dependencies
- All responsive utilities are first-class Tailwind v4 features
- The `@theme inline` block in `globals.css` only defines colors, radii, and animations — breakpoints use Tailwind defaults

---

## All NEEDS CLARIFICATION: Resolved

No unresolved technical unknowns remain. All decisions are implementable with existing Tailwind CSS v4 utilities and the current project structure.
