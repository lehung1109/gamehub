# Quickstart Validation Guide: Desktop Container Scaling

**Feature**: 008-desktop-container-scaling | **Date**: 2026-08-24

> This guide documents how to validate that the desktop container scaling feature works correctly end-to-end. It covers prerequisites, test scenarios, and expected outcomes. For full implementation details, see [data-model.md](./data-model.md) and [responsive-contract.md](./contracts/responsive-contract.md).

---

## Prerequisites

1. **Development server running**:
   ```bash
   npm run dev
   ```
   App available at `http://localhost:3000`

2. **Browser with DevTools**: Chrome or Firefox with responsive design mode

3. **Test data**: Games with long titles (40+ chars), students with long names (30+ chars), game descriptions with 150+ characters. Use existing seed data or create entries via admin panel at `/admin`.

4. **Viewport sizes to test**:
   - 768px (tablet — regression check)
   - 1024px (laptop — regression check)
   - 1280px (`xl` breakpoint)
   - 1536px (`2xl` breakpoint)
   - 1920px (standard desktop — primary target)
   - 3440px (ultrawide — edge case)

---

## Validation Scenario 1: Root Container Expansion

**Validates**: FR-002, SC-001

### Steps

1. Open `http://localhost:3000` (home page)
2. Set viewport to **1920px** width
3. Open DevTools → inspect the root content `<div>` inside `<body>`

### Expected Outcome

- The content container's computed `max-width` is `1800px`
- Content visually fills ~93% of the viewport width
- At **1024px** viewport: content container is `1024px` (identical to pre-change)

### Verification Command

```bash
# Unit test: root layout renders correct responsive classes
npm run test:run -- --grep "root layout"

# E2E test: measure content width at multiple viewports
npm run test:e2e -- --grep "container scaling"
```

---

## Validation Scenario 2: Grid Column Scaling

**Validates**: FR-004, SC-003

### Steps

1. Open `http://localhost:3000` (home page with game cards)
2. Set viewport to **1536px** (`2xl` breakpoint)
3. Count the number of game card columns

### Expected Outcome

- At **1536px**: 5 columns of game cards visible
- At **1280px**: 4 columns
- At **1024px**: 3 columns (same as before — no regression)

### Additional Grid Tests

| Page | URL | Expected Columns at 1536px |
|------|-----|---------------------------|
| Home | `/` | 5 |
| Flashcard Topics | `/games/flashcard` | 5 |
| Tense Hub | `/tenses` | 6 |
| Admin Dashboard | `/admin/dashboard` | 4 |
| Admin Configs | `/admin/games/[gameId]` | 4 |

### Verification Command

```bash
npm run test:e2e -- --grep "grid columns"
```

---

## Validation Scenario 3: Text Truncation Relaxation

**Validates**: FR-005, FR-006, SC-002, SC-005

### Steps

1. Create a game with a 40-character title (e.g., "Advanced English Vocabulary Practice Game")
2. Create a student with a 30-character name (e.g., "Nguyễn Hoàng Phương Thảo Anh")
3. Set viewport to **1280px** (`xl` breakpoint)
4. Navigate to game listing and student badge areas

### Expected Outcome

- **Game title**: Full 40 characters visible, no ellipsis
- **Student name**: Full 30 characters visible in badge, no ellipsis
- **Game description**: 150-char description wraps naturally, at least 120 chars visible
- **Teacher email**: Full email visible in admin nav (no 160px truncation)
- At **768px**: All truncation unchanged from current behavior

### Verification Command

```bash
npm run test:e2e -- --grep "text truncation"
```

---

## Validation Scenario 4: Game Play Area Expansion

**Validates**: FR-007, SC-006

### Steps

1. Open any game at **1920px** viewport
2. Inspect the play area container's computed width

### Expected Outcome

| Game | Expected Width at 1920px |
|------|-------------------------|
| Flashcard (`/games/flashcard/[topicId]`) | 672px (was 576px, **+16.7%**) |
| Sentences (`/games/sentences`) | Container 896px (was 768px), DnD board 896px (was 672px, **+33.3%**) |
| Spelling (`/games/spelling`) | Container 896px (was 768px), DnD board 896px (was 672px) |
| Listening (`/games/listening`) | Container 896px (was 768px), Quiz 768px (was 672px) |
| Tenses (`/tenses/[slug]`) | Stage area 1024px (was 896px, **+14.3%**) |

### Verification Command

```bash
npm run test:e2e -- --grep "play area"
```

---

## Validation Scenario 5: Backwards Compatibility (No Regressions)

**Validates**: FR-008, SC-004

### Steps

1. Set viewport to **1024px**
2. Navigate through all main pages: `/`, `/games/*`, `/tenses`, `/admin/dashboard`
3. Compare visual appearance with the pre-change version (screenshot comparison)

### Expected Outcome

- **Zero visual differences** at 1024px and below
- All cards, grids, text, and game areas render identically
- No horizontal scrollbars appear
- No layout shifts or broken alignments

### Verification Command

```bash
# Full regression test suite
npm run test:e2e

# Unit tests
npm run test:run
```

---

## Validation Scenario 6: Ultra-Wide Safety

**Validates**: FR-009, Edge Case

### Steps

1. Set viewport to **3440px** (ultrawide)
2. Open any page

### Expected Outcome

- Content is centered with large margins on both sides
- Content width does not exceed 1800px
- Text lines do not become excessively long
- Layout remains usable and readable

---

## Full Test Suite Commands

```bash
# Run all unit tests
npm run test:run

# Run all E2E tests
npm run test:e2e

# Run lint check
npm run lint

# Run type check
npx tsc --noEmit

# Run build
npm run build
```

All of the above MUST pass before the feature is considered complete (per Constitution Quality Gates).
