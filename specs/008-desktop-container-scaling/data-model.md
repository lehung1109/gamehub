# Data Model: Desktop Container Scaling

**Feature**: 008-desktop-container-scaling | **Date**: 2026-08-24

> This feature is **styling-only** — no database entities, API schemas, or application state models change. The "data model" documents the **responsive design system** that governs layout behavior across breakpoints.

---

## Entity: Container Tier

Defines the maximum width constraint applied to content containers at each responsive breakpoint.

### Fields

| Tier | Scope | `default` | `sm` (640px) | `md` (768px) | `lg` (1024px) | `xl` (1280px) | `2xl` (1536px) |
|------|-------|-----------|-------------|-------------|---------------|---------------|-----------------|
| **Root** | `src/app/layout.tsx` — outermost wrapper | `max-w-5xl` (1024px) | — | — | `max-w-7xl` (1280px) | `max-w-[1400px]` | `max-w-[1800px]` |
| **Admin** | `src/app/admin/layout.tsx` — header + main | — | — | — | `max-w-7xl` (1280px) | — (inherits) | — (inherits) |
| **Hub** | `TenseHubMap.tsx` | — | — | — | `max-w-7xl` (1280px) | — (inherits) | — (inherits) |
| **Page** | Individual game/tense pages | varies | — | — | varies | +1 tier | — |
| **Play Area** | Game interaction containers | varies | — | — | — | +1–2 tiers | — |
| **Card** | Content cards (game, tense, stat) | — | — | — | — | — (natural flow) | — |

### Relationships

```
Root Container
├── constrains → Admin Container (admin routes)
├── constrains → Hub Container (tense hub)
├── constrains → Page Container (game pages)
│   └── constrains → Play Area Container (game components)
│       └── constrains → Card Container (UI cards, badges)
└── constrains → Home Page (game listing grid)
```

### Validation Rules

1. **VR-001**: Root container MUST NOT exceed 1800px at any viewport (ultra-wide cap)
2. **VR-002**: At viewport ≤1024px, rendered content width MUST be identical to pre-change behavior
3. **VR-003**: Child container `max-w-*` MUST be ≤ parent container `max-w-*` at the same breakpoint
4. **VR-004**: Play area containers MUST NOT use viewport-relative units (`vw`, `dvw`)

---

## Entity: Grid Configuration

Defines column counts for listing and content grids across breakpoints.

### Fields

| Grid ID | Component | `default` | `sm` | `md` | `lg` | `xl` | `2xl` |
|---------|-----------|-----------|------|------|------|------|-------|
| `home-games` | `src/app/page.tsx` | 1 | 2 | — | 3 | 4 | 5 |
| `flashcard-topics` | `src/app/games/flashcard/page.tsx` | 1 | 2 | — | 3 | 4 | 5 |
| `tense-hub` | `TenseHubMap.tsx` | 1 | 2 | — | 4 | 5 | 6 |
| `admin-games` | `src/app/admin/dashboard/page.tsx` | 1 | — | 2 | 3 | 4 | — |
| `admin-configs` | `ConfigList.tsx` | 1 | — | 2 | 3 | 4 | — |
| `admin-classes` | `ClassList.tsx` | 1 | — | 2 | — | 3 | 4 |
| `admin-new-configs` | `src/app/admin/configs/new/page.tsx` | 1 | 2 | — | 3 | 4 | — |
| `letter-grid` | `LetterGrid.tsx` | 4 | 6 | 7 | 9 | 11 | 13 |
| `class-metrics` | `ClassOverview.tsx` | 1 | 2 | — | 4 | — | — |

### Validation Rules

1. **VR-005**: At `xl:` (1280px), student-facing listing grids MUST display ≥4 columns
2. **VR-006**: Column count increase between breakpoints MUST be ≤2 (prevent jarring jumps)
3. **VR-007**: Card minimum width within grid MUST be ≥200px (prevent illegible cards)

---

## Entity: Truncation Rule

Defines text truncation behavior per component type across breakpoints.

### Fields

| Rule ID | Component | Element | Mobile/Tablet | Desktop (`xl:` 1280px+) |
|---------|-----------|---------|---------------|-------------------------|
| `TR-001` | `StudentBadge` | Student name | `truncate max-w-[120px] sm:max-w-[180px]` | `xl:max-w-none xl:truncate-none` |
| `TR-002` | `StudentBadge` | Class name | `truncate max-w-[120px] sm:max-w-[180px]` | `xl:max-w-none xl:truncate-none` |
| `TR-003` | `StudentProfileBadge` | Student name | `truncate max-w-[90px] sm:max-w-[120px]` | `xl:max-w-[200px]` |
| `TR-004` | `AdminLayout` | Teacher email | `max-w-[160px] truncate` | `xl:max-w-none xl:truncate-none` |
| `TR-005` | `GameCard` | Description | `line-clamp-2` | `xl:line-clamp-none` |
| `TR-006` | `TenseCard` | Description | `line-clamp-2` | `xl:line-clamp-3` |
| `TR-007` | `LessonHeader` | Tense name | `truncate max-w-[200px] sm:max-w-none` | (already relaxed at `sm:`) |
| `TR-008` | `ConjugationStage` | Scenario | `line-clamp-1` | `xl:line-clamp-2` |
| `TR-009` | `ErrorHunterStage` | Scenario | `line-clamp-1` | `xl:line-clamp-2` |
| `TR-010` | `SentenceBuilderStage` | Scenario | `line-clamp-1` | `xl:line-clamp-2` |
| `TR-011` | `ConfigList` | Config name | `line-clamp-1` | `xl:line-clamp-none` |
| `TR-012` | `ClassList` | Class name | `line-clamp-1` | `xl:line-clamp-none` |
| `TR-013` | `ClassOverview` | Class name | `line-clamp-1` | `xl:line-clamp-none` |
| `TR-014` | `ClassOverview` | Student name | `line-clamp-1` | `xl:line-clamp-none` |
| `TR-015` | `StudentDetail` | Student name | `line-clamp-1` | `xl:line-clamp-none` |
| `TR-016` | `AdminDashboard` | Game description | `line-clamp-2` | `xl:line-clamp-3` |
| `TR-017` | `AdminNewConfig` | Game description | `line-clamp-2` | `xl:line-clamp-3` |

### Validation Rules

1. **VR-008**: On desktop (`xl:`+), titles ≤50 chars MUST display without truncation
2. **VR-009**: On desktop (`xl:`+), names ≤30 chars MUST display without truncation
3. **VR-010**: On desktop (`xl:`+), descriptions ≤150 chars MUST show ≥120 chars visible
4. **VR-011**: Mobile/tablet truncation MUST remain unchanged (no `sm:` or `md:` modifications)

---

## Entity: Play Area Dimension

Defines game play container max-width scaling.

### Fields

| Area ID | Component | Current Max-Width | Desktop `xl:` Max-Width | Expansion |
|---------|-----------|-------------------|-------------------------|-----------|
| `PA-001` | `FlashcardStack` | `max-w-xl` (576px) | `xl:max-w-2xl` (672px) | +16.7% |
| `PA-002` | `DragDropBoard` | `max-w-2xl` (672px) | `xl:max-w-4xl` (896px) | +33.3% |
| `PA-003` | `QuizEngine` | `max-w-2xl` (672px) | `xl:max-w-3xl` (768px) | +14.3% |
| `PA-004` | `ConjugationStage` | `max-w-4xl` (896px) | `xl:max-w-5xl` (1024px) | +14.3% |
| `PA-005` | `ErrorHunterStage` | `max-w-4xl` (896px) | `xl:max-w-5xl` (1024px) | +14.3% |
| `PA-006` | `SentenceBuilderStage` | `max-w-4xl` (896px) | `xl:max-w-5xl` (1024px) | +14.3% |
| `PA-007` | `CompletionDashboard` | `max-w-4xl` (896px) | `xl:max-w-5xl` (1024px) | +14.3% |

### State Transitions

N/A — no state machines. Play areas are statically sized by CSS breakpoint.

### Validation Rules

1. **VR-012**: At 1920px viewport, game play areas MUST be ≥30% wider than current for at least one game type (SC-006)
2. **VR-013**: DragDropBoard expansion MUST be the largest to accommodate multi-word sentences (FR-011)
3. **VR-014**: Play area expansion MUST NOT alter dnd-kit sensor configuration or collision detection
