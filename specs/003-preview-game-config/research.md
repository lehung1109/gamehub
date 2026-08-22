# Research: Preview Game Configuration

**Feature**: 003-preview-game-config | **Date**: 2026-08-22

## Research Tasks

### 1. URL-Safe Settings Encoding Strategy

**Decision**: Use `JSON.stringify()` → `btoa()` (base64) → URL-safe base64 encoding (replace `+` with `-`, `/` with `_`, strip `=` padding)

**Rationale**:
- All modern browsers support `btoa`/`atob` natively — no new dependencies needed
- JSON serialization handles all game settings types (strings, numbers, booleans, arrays)
- URL-safe base64 (RFC 4648 §5) avoids encoding issues in URL query parameters
- Estimated payload sizes for the 6 game types:
  - Flashcard: `{"gameId":"flashcard","topics":["animals","fruits"],"wordLimit":5,"autoSpeak":false}` → ~90 bytes JSON → ~120 chars base64
  - Numbers-Colors: `{"gameId":"numbers-colors","numberRange":[1,10],"includeColors":true,"mode":"quiz"}` → ~85 bytes JSON → ~114 chars base64
  - All games: worst case <200 bytes JSON → <270 chars base64, well within 2,000 char URL limit

**Alternatives considered**:
- `URLSearchParams` with individual keys: Rejected — doesn't scale well for nested settings (topics arrays), harder to decode generically
- `lz-string` compression: Rejected — unnecessary for <200 byte payloads, adds a dependency
- `encodeURIComponent(JSON.stringify(...))`: Viable but produces longer URLs than base64; URL encoding of `{`, `"`, `:` etc. doubles the length

### 2. Preview Detection in useGameConfig Hook

**Decision**: Add a `preview` search parameter to the URL. When present, decode and use the settings directly instead of fetching from Supabase.

**Rationale**:
- The existing `useGameConfig` hook already reads `config` from `useSearchParams()` — adding `preview` follows the same pattern
- The hook returns `{ config, settings, configName, configId, isLoading }` — for preview mode, we synthesize a `config` object with the decoded settings and set `configName` to indicate preview
- Adding an `isPreview` boolean to the return type lets game pages and banners distinguish preview mode
- The hook modification is backwards-compatible: no `preview` param = existing behavior unchanged

**Alternatives considered**:
- Separate route like `/preview/[gameId]`: Rejected — duplicates all game page logic, constitution prefers minimal route additions
- Hash fragment (`#preview=...`): Rejected — not accessible server-side, harder to debug, not standard for data passing

### 3. Settings Validation Before Preview

**Decision**: Reuse the existing `validateGameSettings()` function from `src/lib/game-config-schema.ts` before opening the preview tab.

**Rationale**:
- `validateGameSettings()` already handles all 6 game types with sanitization and validation
- It returns `{ valid, error, data }` — on invalid, we display the error message and block the preview
- Same validation path as save ensures preview always shows valid game state

**Alternatives considered**:
- Separate preview-specific validation: Rejected — would drift from save validation, causing inconsistencies
- No validation (let game handle bad settings): Rejected — spec FR-004 requires validation before preview

### 4. Preview Banner Component Design

**Decision**: Create a new `PreviewBanner` component alongside the existing `ConfigBanner`, with distinct amber/orange styling and clear "preview/unsaved" messaging.

**Rationale**:
- Separate component from `ConfigBanner` keeps concerns clean — preview banner has different messaging and styling
- Amber/orange color distinguishes from the indigo `ConfigBanner` at a glance
- Banner text: "⚠️ Chế độ xem trước — Cấu hình chưa được lưu" (Preview mode — Settings not saved)
- Following shadcn/ui patterns with Tailwind utilities, no custom CSS

**Alternatives considered**:
- Modify `ConfigBanner` with a `variant` prop: Viable but mixes concerns; the preview banner might evolve independently (e.g., adding a "close preview" action)
- Modal overlay instead of banner: Rejected — too intrusive for a testing workflow; banner is visible but non-blocking

### 5. "Chơi thử" Button Integration

**Decision**: Create a shared `PreviewButton` component used by both `ConfigCreateForm` and `ConfigEditForm`, placed in the card footer alongside existing buttons.

**Rationale**:
- Both forms manage `settings` and `gameId` in React state — `PreviewButton` accepts these as props
- Button calls `validateGameSettings()`, encodes on success, and opens `window.open()` to the game URL
- Placed to the left of "Lưu cấu hình" / "Lưu thay đổi" — secondary action, not primary
- Uses `variant="outline"` with a play icon to visually distinguish from the primary save button

**Alternatives considered**:
- Inline the preview logic in each form: Rejected — duplicates code between create and edit forms
- Form action / server action: Rejected — preview is entirely client-side (encode settings, open tab)

### 6. Preview Payload Shape

**Decision**: The preview URL query parameter encodes a `PreviewPayload` containing `gameId` and the game-specific `settings` object.

**Rationale**:
- Including `gameId` in the payload enables the hook to validate that the decoded settings match the expected game
- Settings use the existing typed structures (`FlashcardSettings`, `AlphabetSettings`, etc.)
- Payload shape: `{ gameId: GameId, settings: AnyGameSettings }`

**Alternatives considered**:
- Encode only settings without gameId: Rejected — no way to validate the payload matches the game page
- Include config name in payload: Rejected — unnecessary; preview banner shows "Xem trước" instead of a config name

## All NEEDS CLARIFICATION: Resolved

No remaining unknowns. All technical decisions are grounded in existing codebase patterns and capabilities.
