# Preview Settings Encoding Contract

**Feature**: 003-preview-game-config | **Date**: 2026-08-22

## Overview

This contract defines the encoding/decoding interface for serializing game settings into URL-safe query parameters. It serves as the bridge between the admin config forms and the game pages.

## Module: `src/lib/preview.ts`

### `encodePreviewSettings`

Encodes a game's settings into a URL-safe base64 string for use as a query parameter.

```typescript
function encodePreviewSettings(gameId: GameId, settings: AnyGameSettings): string
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `gameId` | `GameId` | The game identifier (`'flashcard' \| 'alphabet' \| 'listening' \| 'spelling' \| 'numbers-colors' \| 'sentences'`) |
| `settings` | `AnyGameSettings` | The game-specific settings object |

**Returns**: `string` — URL-safe base64-encoded string

**Encoding steps**:
1. Construct `PreviewPayload`: `{ gameId, settings }`
2. `JSON.stringify(payload)`
3. Encode UTF-8 bytes to base64: `btoa(String.fromCharCode(...new TextEncoder().encode(json)))`
4. Make URL-safe: replace `+` → `-`, `/` → `_`, strip trailing `=`

**Errors**: Does not throw. If serialization somehow fails, returns an empty string.

---

### `decodePreviewSettings`

Decodes a URL-safe base64 string back into a `PreviewPayload`.

```typescript
function decodePreviewSettings(encoded: string): PreviewPayload | null
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `encoded` | `string` | The URL-safe base64 string from the `preview` query parameter |

**Returns**: `PreviewPayload | null` — The decoded payload, or `null` if decoding fails

**Decoding steps**:
1. Restore base64 padding: re-add `=` characters as needed
2. Reverse URL-safe: replace `-` → `+`, `_` → `/`
3. `atob(base64)` → decode bytes → `new TextDecoder().decode()`
4. `JSON.parse(decoded)` → validate shape has `gameId` (string) and `settings` (object)
5. Return `PreviewPayload` or `null` on any failure

**Errors**: Never throws. Returns `null` for any malformed input.

---

### `buildPreviewUrl`

Constructs the full preview URL for a game.

```typescript
function buildPreviewUrl(gameId: GameId, settings: AnyGameSettings): string
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `gameId` | `GameId` | The game identifier |
| `settings` | `AnyGameSettings` | The settings to encode |

**Returns**: `string` — Relative URL path with encoded preview query parameter

**Example**:
```
Input:  gameId="flashcard", settings={ topics: ["animals"], wordLimit: 5, autoSpeak: false }
Output: "/games/flashcard?preview=eyJnYW1lSWQiOiJmbGFzaGNhcmQi..."
```

**Game route mapping** (uses `src/data/games.json` routes):
| `gameId` | Route |
|----------|-------|
| `flashcard` | `/games/flashcard` |
| `alphabet` | `/games/alphabet` |
| `listening` | `/games/listening` |
| `spelling` | `/games/spelling` |
| `numbers-colors` | `/games/numbers-colors` |
| `sentences` | `/games/sentences` |

---

## Hook Contract: `useGameConfig` Extension

### Modified return type

```typescript
interface UseGameConfigResult<T> {
  config: GameConfig<T> | null
  settings: T | null
  configName: string | null
  configId: string | null
  isLoading: boolean
  isPreview: boolean    // NEW
}
```

### Preview detection priority

The hook checks URL parameters in this order:
1. `preview` parameter → if present, decode and use preview settings; skip database fetch
2. `config` parameter → if present (and no `preview`), fetch from database (existing behavior)
3. Neither → no config applied (existing behavior)

### Validation on decode

When decoding a `preview` parameter:
- Decoded `gameId` MUST match `expectedGameId` argument
- If mismatch or decode failure → `isPreview = false`, `settings = null` (same as no config)
- If valid → `isPreview = true`, `settings` populated, `configName = null`, `configId = null`, `isLoading = false`

---

## Component Contract: `PreviewButton`

```typescript
interface PreviewButtonProps {
  gameId: GameId
  settings: AnyGameSettings
  disabled?: boolean
}
```

**Behavior**:
1. On click: validate `settings` via `validateGameSettings(gameId, settings)`
2. If invalid → return validation error string (caller displays it)
3. If valid → call `buildPreviewUrl(gameId, validatedSettings)` and `window.open(url, '_blank')`
4. Button text: "Chơi thử" with a Play icon
5. Button variant: `outline` (secondary action alongside Save)

---

## Component Contract: `PreviewBanner`

```typescript
interface PreviewBannerProps {
  // No props needed — presence alone indicates preview mode
}
```

**Behavior**:
- Rendered when `isPreview === true` from `useGameConfig`
- Displays an amber/orange banner with warning icon
- Text: "⚠️ Chế độ xem trước — Cấu hình chưa được lưu"
- Uses `role="status"` and `aria-label` for accessibility
- Does not replace `ConfigBanner` — they are mutually exclusive (preview mode shows `PreviewBanner`, normal config mode shows `ConfigBanner`)
