# Responsive Design Contract: Desktop Container Scaling

**Feature**: 008-desktop-container-scaling | **Date**: 2026-08-24

> This contract defines the visual behavior expectations at each responsive breakpoint. It serves as the acceptance test specification for the UI contract between the layout system and its consumers (pages, components).

---

## Breakpoint Definitions

| Token | Min-Width | Target Devices |
|-------|-----------|----------------|
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops, tablets landscape |
| `xl` | 1280px | Standard laptops, desktops |
| `2xl` | 1536px | Large desktops, external monitors |

---

## Contract 1: Root Container Width

**Provider**: `src/app/layout.tsx`
**Consumer**: All pages and nested layouts

| Viewport Width | Max Content Width | Width Utilization |
|----------------|-------------------|-------------------|
| ≤640px | viewport − 32px (p-4) | ~95% |
| 640–767px | viewport − 48px (sm:p-6) | ~93% |
| 768–1023px | viewport − 64px (md:p-8) | ~92% |
| 1024–1279px | 1280px − 64px = 1216px | 95% at 1280px |
| 1280–1535px | 1400px − 64px = 1336px | ~93% at 1440px |
| ≥1536px | 1800px − 64px = 1736px | **~93.75%** at 1920px |

**Invariant**: At viewport ≤1024px, rendered layout MUST be pixel-identical to pre-change behavior.

---

## Contract 2: Grid Column Counts

**Provider**: Grid container elements
**Consumer**: Card components (GameCard, TenseCard, ConfigCard, ClassCard)

### Student-Facing Grids

| Grid | `sm` (640px) | `lg` (1024px) | `xl` (1280px) | `2xl` (1536px) |
|------|-------------|---------------|---------------|-----------------|
| Home games | 2 cols | 3 cols | **4 cols** | **5 cols** |
| Flashcard topics | 2 cols | 3 cols | **4 cols** | **5 cols** |
| Tense hub | 2 cols | 4 cols | **5 cols** | **6 cols** |

### Admin Grids

| Grid | `md` (768px) | `lg` (1024px) | `xl` (1280px) | `2xl` (1536px) |
|------|-------------|---------------|---------------|-----------------|
| Dashboard games | 2 cols | 3 cols | **4 cols** | 4 cols |
| Configs | 2 cols | 3 cols | **4 cols** | 4 cols |
| Classes | 2 cols | 2 cols | 3 cols | **4 cols** |

**Invariant**: Minimum card width within any grid MUST be ≥200px.

---

## Contract 3: Text Visibility

**Provider**: Text-containing components
**Consumer**: End users (teachers and students)

### On Desktop (`xl:` ≥1280px)

| Content Type | Max Length Tested | Expected Behavior |
|--------------|-------------------|-------------------|
| Game title | 50 chars | Fully visible, no truncation |
| Student name | 30 chars | Fully visible, no truncation |
| Game description | 150 chars | ≥120 chars visible (natural wrap) |
| Tense description | 150 chars | ≥3 lines visible before clamp |
| Teacher email | 40 chars | Fully visible, no truncation |
| Stage scenario text | 80 chars | 2 lines visible |
| Config/Class names | 30 chars | Fully visible, no truncation |

### On Mobile/Tablet (≤1024px)

| Content Type | Expected Behavior |
|--------------|-------------------|
| All of the above | **Identical to current** — no truncation changes |

**Invariant**: SC-002 — zero truncated text visible on desktop for content within defined length bounds.

---

## Contract 4: Game Play Area Widths

**Provider**: Game play area components
**Consumer**: Game content (flashcards, DnD boards, quiz options)

| Play Area | Width at 1024px viewport | Width at 1920px viewport | Minimum Expansion |
|-----------|--------------------------|--------------------------|---------------------|
| FlashcardStack | 576px | **672px** | +16.7% |
| DragDropBoard | 672px | **896px** | **+33.3%** |
| QuizEngine | 672px | **768px** | +14.3% |
| Tense stages | 896px | **1024px** | +14.3% |

**Invariant**: SC-006 — at least one game play area ≥30% wider than current at 1920px viewport.
**Invariant**: dnd-kit drag-and-drop functionality MUST remain fully operational at all widths.

---

## Contract 5: Ultra-Wide Safety

**Provider**: Root container
**Consumer**: All content

| Viewport | Max Content Width | Behavior |
|----------|-------------------|----------|
| 2560px (QHD) | 1800px | Centered, 400px margin each side |
| 3440px (Ultrawide) | 1800px | Centered, 820px margin each side |
| 3840px (4K) | 1800px | Centered, 1020px margin each side |

**Invariant**: FR-009 — content NEVER exceeds 1800px regardless of viewport width.
**Invariant**: Text line length remains ≤120 characters for body text at all viewports.
