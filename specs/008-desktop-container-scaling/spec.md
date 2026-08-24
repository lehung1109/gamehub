# Feature Specification: Desktop Container Scaling

**Feature Branch**: `008-desktop-container-scaling`

**Created**: 2026-08-24

**Status**: Draft

**Input**: User description: "tăng mạnh container cho desktop, hạn chế text bị cắt, hoặc khối quá nhỏ"

**Current State Summary**: The root layout (`layout.tsx`) constrains all pages to `max-w-5xl` (1024px), locking the entire application to tablet-width on desktop. Even nested layouts declaring wider max-widths (e.g., admin's `max-w-7xl`) are trapped inside this 1024px ceiling. Game play areas are further constrained to 576px–896px. Text truncation is applied pervasively across student badges, game cards, tense cards, and stage scenarios. The `xl:` breakpoint is used only once in the entire codebase; `2xl:` is not used at all.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comfortable Reading on Large Screens (Priority: P1)

A teacher or student opens GameHub on a desktop or laptop with a screen width of 1440px or wider. Currently, the root layout constrains all content to a narrow 1024px column, leaving over 400–900px of dead space on each side. Even admin pages that declare wider containers are trapped inside this limit. After this feature, the page content expands to fill the screen naturally, making cards, text, and game areas feel spacious and proportional to the display size.

**Why this priority**: This is the core issue — the entire application feels cramped on modern desktop monitors. Fixing the outer container sizing affects every page and is the foundation for all other improvements.

**Independent Test**: Can be fully tested by opening any page on a 1920px-wide viewport and confirming that content uses significantly more horizontal space than before, without breaking the layout on smaller screens.

**Acceptance Scenarios**:

1. **Given** a user is on a 1920px-wide viewport, **When** they visit the dashboard, **Then** the main content area occupies at least 85% of the available width (minus sidebar)
2. **Given** a user is on a 1440px-wide viewport, **When** they visit any listing page, **Then** content containers are visibly wider than the previous 1280px limit
3. **Given** a user is on a 1024px or narrower viewport, **When** they visit any page, **Then** the layout remains identical to the current behavior (no regressions)

---

### User Story 2 - Full Text Visibility on Cards and Lists (Priority: P1)

A teacher browses game cards, tense cards, student badges, or stage scenarios and currently sees truncated names, titles, and descriptions. Specifically: student names in the navigation header are cut at 120–180px, student level titles at 90–120px, teacher emails at 160px, game descriptions limited to 2 lines, tense card descriptions to 2 lines within cards only ~220px wide, and stage scenario context cut to a single line. After this feature, text content is displayed in full or with generous enough limits that meaningful information is never lost on desktop viewports.

**Why this priority**: Truncated text directly harms usability — users cannot identify items at a glance. This is equally critical to container sizing because even wider containers won't help if text is still forcefully cut.

**Independent Test**: Can be fully tested by creating game entries and student records with long names/descriptions (30+ characters for names, 100+ characters for descriptions) and verifying all text is readable without truncation on desktop viewports.

**Acceptance Scenarios**:

1. **Given** a game card has a title of 40 characters, **When** displayed on a desktop viewport (≥1280px), **Then** the full title is visible without truncation
2. **Given** a student card has a full name of 30 characters, **When** displayed on a desktop viewport, **Then** the complete name is visible
3. **Given** a game card has a description of 150 characters, **When** displayed on a desktop viewport, **Then** at least the first 120 characters are visible (allowing soft wrap, not hard truncation)
4. **Given** the sidebar contains a navigation label of 25 characters, **When** the sidebar is expanded on desktop, **Then** the full label is readable

---

### User Story 3 - Proportionally Sized Content Blocks (Priority: P2)

A user opens a game on a 1920px monitor and currently sees a tiny play area surrounded by empty space. The flashcard game is only 576px wide, drag-and-drop boards and quiz engines are only 672px wide, and tense practice stages are capped at 896px. On listing pages, tense cards in a 4-column grid are squeezed to ~220px each. After this feature, game play areas and content blocks grow proportionally to the viewport, making the interface feel designed for the user's actual screen size.

**Why this priority**: This improves the visual density and professionalism of the app, but is secondary to the core container and text fixes because it builds on top of them.

**Independent Test**: Can be fully tested by opening the games listing page at 1920px width and confirming cards are visually larger and more columns are displayed compared to the current 3-column maximum.

**Acceptance Scenarios**:

1. **Given** a user is on a screen ≥1536px wide, **When** they view the games listing, **Then** the grid displays 4 or more columns of game cards
2. **Given** a user is on a screen ≥1920px wide, **When** they view game cards, **Then** each card is visibly wider than 288px
3. **Given** a user is on a screen ≥1440px wide, **When** they play a game, **Then** the game play area is wider than the current 896px limit
4. **Given** a user resizes the browser from 1920px down to 768px, **When** observing the layout, **Then** cards and grids gracefully reduce columns and sizes without breaking

---

### User Story 4 - Dashboard and Stats Scale for Desktop (Priority: P3)

An admin views the dashboard with stats cards and summary panels. On wide desktop screens, these panels currently sit in a narrow column. After this feature, dashboard elements expand and rearrange to take advantage of the available space, showing more information at a glance.

**Why this priority**: The dashboard is a secondary concern compared to the game and listing pages which are used more frequently by students. However, admin experience matters for productivity.

**Independent Test**: Can be fully tested by opening the dashboard at 1920px width and confirming stat cards and panels fill the viewport proportionally.

**Acceptance Scenarios**:

1. **Given** an admin opens the dashboard on a ≥1536px viewport, **When** the page loads, **Then** stat cards and content panels expand to utilize the wider space
2. **Given** multiple stat cards are displayed, **When** viewed on a ≥1920px screen, **Then** they are arranged in a row layout that fills the available width rather than stacking unnecessarily

---

### Edge Cases

- What happens when text is extremely long (200+ characters for a title)? The system should still wrap gracefully rather than overflow or break the layout
- How does the layout behave on ultra-wide monitors (3440px)? Content should remain usable with a reasonable maximum width cap to prevent excessively long line lengths
- What happens when the sidebar is collapsed vs expanded on wide screens? The content area should adjust fluidly
- How do game play areas scale for games that have fixed-aspect-ratio content? The container can grow but the game content within should maintain its intended aspect ratio

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST use extended responsive breakpoints (`xl` at 1280px and `2xl` at 1536px) to adapt layouts for large desktop screens
- **FR-002**: The root layout container MUST be expanded beyond the current 1024px maximum width to accommodate desktop viewports of 1440px and wider
- **FR-003**: Nested page layouts (admin, games, tenses) MUST no longer be trapped by the root container — their declared widths MUST take effect
- **FR-004**: Grid layouts MUST display additional columns on `xl` and `2xl` breakpoints (e.g., tense hub 4-column grid should have cards wider than 220px on desktop)
- **FR-005**: Text truncation on student badges, student profile badges, game card descriptions, tense card descriptions, and stage scenario headers MUST be relaxed or removed on desktop viewports so that content is fully visible
- **FR-006**: Navigation element labels (student names, teacher emails, level titles) MUST display full text without truncation on desktop viewports
- **FR-007**: Game play areas (flashcard stack, drag-and-drop board, quiz engine, tense practice stages) MUST expand their maximum width constraints on desktop viewports to provide a more immersive experience
- **FR-008**: All layout changes MUST be backwards-compatible — viewports of 1024px and below MUST render identically to the current behavior
- **FR-009**: Content containers MUST have a reasonable upper-bound maximum width to prevent excessively long line lengths on ultra-wide monitors
- **FR-010**: Card and block components MUST maintain readable proportions — wider cards must also adjust height and spacing proportionally
- **FR-011**: Drag-and-drop interactions (sentence building, spelling) MUST benefit from wider containers so that multi-word sentences and long words have room without aggressive line wrapping

### Key Entities

- **Root Layout Container**: The outermost wrapper in `layout.tsx` that constrains all page content; currently `max-w-5xl` (1024px) — the single biggest bottleneck
- **Game Play Area**: Interactive zones where games are played; flashcard stack at 576px, drag-and-drop board at 672px, quiz engine at 672px, tense stages at 896px
- **Content Card**: Reusable UI blocks for displaying games, tenses, students, or stats; tense cards squeezed to ~220px in 4-column grids
- **Student Badge / Profile Badge**: Navigation header elements showing student names and levels; hard-truncated at 90–180px
- **Grid Layout**: The responsive column system used in listing pages; currently maxes at `lg:` breakpoint with no `xl:` or `2xl:` adaptations

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a 1920px-wide viewport, the main content area utilizes at least 85% of the available width (excluding sidebar)
- **SC-002**: On a 1920px-wide viewport, zero instances of truncated text are visible on game cards, student cards, or sidebar labels for content within reasonable length (titles ≤50 chars, names ≤30 chars, descriptions ≤150 chars)
- **SC-003**: On a 1536px-wide viewport, listing page grids display at least 4 columns of content cards
- **SC-004**: On a 1024px-wide viewport, all pages render identically to their pre-change appearance (zero visual regressions)
- **SC-005**: Users can identify any game or student by reading the full title/name on desktop without hovering, clicking, or scrolling horizontally
- **SC-006**: The game play area on a 1920px viewport is at least 30% wider than the current implementation

## Assumptions

- The target audience primarily uses desktop screens of 1366px–1920px width; ultra-wide (3440px+) is a secondary concern
- Mobile layouts (below 768px) are out of scope for this feature — no changes will be made to mobile breakpoints
- The sidebar width will remain at its current size; only the content area to the right of the sidebar is being scaled
- Existing component APIs (props, className acceptance) will be preserved — this is a styling-only change with no functional behavior modifications
- Game content within play areas may have its own aspect ratio constraints; the container will expand but internal game content scaling is out of scope
- The shadcn/ui component library's default sizing patterns will be respected where applicable
