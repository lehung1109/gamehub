# Feature Specification: Preview Game Configuration

**Feature Branch**: `003-preview-game-config`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "Thêm tính năng cho phép admin test game với cấu hình trước khi quyết định save cấu hình đó hay không"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preview New Config Before Saving (Priority: P1)

An admin is creating a new game configuration. Before committing to saving it, they want to see exactly how the game will look and behave with their chosen settings. They click a "Chơi thử" (Test Play) button, which opens the game in a new browser tab using their current unsaved settings. After testing, they return to the config form tab and decide whether to save, adjust, or discard the configuration.

**Why this priority**: This is the core value proposition — admins cannot currently preview a configuration before saving, which leads to a trial-and-error workflow of save → test → edit → save → test. Preview eliminates wasted saved configs and lets admins make informed decisions.

**Independent Test**: Can be fully tested by creating a new flashcard config with specific settings (e.g., topics: Animals only, wordLimit: 5), clicking "Chơi thử", and verifying the game in the new tab shows only Animal flashcards with a 5-word limit.

**Acceptance Scenarios**:

1. **Given** admin is on the "Create Config" form with settings filled in, **When** they click the "Chơi thử" button, **Then** a new browser tab opens showing the selected game running with those exact settings
2. **Given** admin has the game preview open in a new tab, **When** they return to the original config form tab, **Then** the form retains all their settings exactly as they were
3. **Given** admin modifies settings in the config form after a preview, **When** they click "Chơi thử" again, **Then** a new tab opens reflecting the updated settings

---

### User Story 2 - Preview Edited Config Before Saving Changes (Priority: P1)

An admin is editing an existing game configuration. They change some settings (e.g., increase word limit, add new topics) and want to verify the changes look correct before saving. They click "Chơi thử" to open a preview with the modified (unsaved) settings and confirm the game behaves as expected.

**Why this priority**: Same core value as US1 but for the edit flow. Admins frequently adjust existing configs and need to validate changes before overwriting the saved version.

**Independent Test**: Can be fully tested by editing an existing flashcard config, changing wordLimit from 10 to 3, clicking "Chơi thử", and verifying the preview tab shows only 3 flashcards.

**Acceptance Scenarios**:

1. **Given** admin is editing an existing config and has changed settings, **When** they click "Chơi thử", **Then** the preview opens with the modified (unsaved) settings, not the currently saved version
2. **Given** admin previews edited settings, **When** they return to the edit form, **Then** all unsaved changes are still present in the form

---

### User Story 3 - Visual Distinction in Preview Mode (Priority: P2)

When a game is opened in preview mode, it must be visually distinct from a normal gameplay session. The admin should immediately understand they are in a temporary preview — the settings are not saved and this is not a shareable link.

**Why this priority**: Without visual distinction, admins may confuse preview mode with a live session, potentially sharing a preview URL (which would not work for students) or thinking the config is already saved.

**Independent Test**: Can be tested by opening a game in preview mode and verifying a prominent banner appears indicating "preview/unsaved" status, distinct from the normal config banner.

**Acceptance Scenarios**:

1. **Given** a game is opened in preview mode, **When** the page loads, **Then** a prominent banner is displayed indicating this is a preview with unsaved settings
2. **Given** a game is opened with a saved config (normal mode), **When** the page loads, **Then** the standard config banner is shown (no preview indicator)
3. **Given** a game is opened in preview mode, **When** the admin reads the banner, **Then** the banner text clearly communicates that settings are temporary and not saved

---

### User Story 4 - Settings Validation Before Preview (Priority: P2)

When the admin clicks "Chơi thử", the current form settings are validated before opening the preview. If settings are invalid, the preview does not open and the admin sees the same validation feedback as they would when saving.

**Why this priority**: Prevents confusion from opening a preview with broken settings that would cause game errors.

**Independent Test**: Can be tested by entering invalid settings (e.g., numberRange min > max) and clicking "Chơi thử", verifying that validation errors appear and no new tab opens.

**Acceptance Scenarios**:

1. **Given** admin has valid settings in the form, **When** they click "Chơi thử", **Then** the preview opens successfully in a new tab
2. **Given** admin has invalid settings in the form, **When** they click "Chơi thử", **Then** the preview does not open and validation errors are displayed on the form

---

### Edge Cases

- What happens when the admin opens multiple preview tabs with different settings? Each tab should independently reflect the settings that were active when that specific "Chơi thử" button was clicked.
- What happens when the admin opens a preview tab and then closes the config form tab? The preview tab continues to work since settings are self-contained in the URL.
- What happens when someone bookmarks or shares a preview URL? The game should still load correctly from the URL-encoded settings, but the preview banner remains visible.
- What happens when the encoded settings data exceeds URL length limits? For the current game settings structures (all under 500 bytes when serialized), this is not a practical concern. The settings remain well within browser URL limits (2,000+ characters for all modern browsers).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Chơi thử" (Test Play) button on the config creation form
- **FR-002**: System MUST provide a "Chơi thử" (Test Play) button on the config edit form
- **FR-003**: System MUST encode the current form settings into a URL-safe format and open the game in a new browser tab when "Chơi thử" is clicked
- **FR-004**: System MUST validate form settings before opening a preview; invalid settings MUST prevent the preview from opening and display validation errors
- **FR-005**: Game pages MUST detect when running in preview mode (via URL parameter) and use the URL-encoded settings instead of fetching from the database
- **FR-006**: Game pages MUST display a distinct visual banner when running in preview mode, clearly indicating the settings are temporary and unsaved
- **FR-007**: The config form MUST retain all current settings after the admin opens a preview tab (opening a preview MUST NOT modify form state)
- **FR-008**: Each preview tab MUST be self-contained — the encoded settings in the URL determine the game behavior, independent of other tabs or the config form

### Key Entities

- **Preview Settings Payload**: The game settings object serialized and encoded into a URL-safe format, containing the game ID and all game-specific settings needed to run the game
- **Preview Mode State**: A flag derived from the URL that indicates the game is running in preview mode, used to switch between database-fetched settings and URL-decoded settings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can preview any game configuration in under 2 seconds from clicking "Chơi thử" to seeing the game loaded in a new tab
- **SC-002**: 100% of game types (all 6 games) support preview mode with correct settings applied
- **SC-003**: Admin can complete the "create config → preview → adjust → save" workflow without needing to save intermediate configurations
- **SC-004**: Preview mode is visually distinguishable from normal gameplay within 1 second of page load (banner is immediately visible)
- **SC-005**: Zero data is persisted to the database when an admin previews a configuration (preview is entirely stateless)

## Assumptions

- Admin users have a modern browser that supports URLs of at least 2,000 characters (all mainstream browsers support 2,000+ characters; game settings serialized are well under this limit)
- The existing game rendering components do not need modification — they already accept settings as props/state and render accordingly; only the settings loading mechanism needs a new source
- Preview mode does not need to support the share flow (no share slug, no public access) — it is purely a local testing tool for the admin
- The config form is a client component that manages settings in local React state, making it straightforward to read current settings for encoding
- All 6 game types use the same `useGameConfig` hook pattern for loading settings, so a single change to the hook enables preview mode across all games
