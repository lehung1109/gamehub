# Research & Technical Decisions: Memory Match Game

## Decision: Card Flip Animation Approach
- **Decision**: Use Tailwind CSS 3D transforms with CSS perspective (`transform-style: preserve-3d`, `backface-visibility: hidden`, `rotate-y-180`) combined with lightweight CSS transition classes.
- **Rationale**: 
  - Pure CSS 3D transforms require zero runtime JS animation overhead, rendering at 60fps even on low-end mobile devices and tablets used in primary schools.
  - Fully accessible, compatible with Tailwind CSS v4 in the project without extra bundle weight.
- **Alternatives considered**: 
  - `framer-motion`: While installed in the project, animating 16 simultaneous interactive elements in a grid with framer-motion can sometimes cause layout reflows on mobile touch devices. CSS 3D transform is simpler, lighter, and bulletproof.

## Decision: Card Matching State Management (`useMemoryGame`)
- **Decision**: Encapsulate all gameplay logic in a custom hook `useMemoryGame`.
- **Rationale**:
  - Separates game engine mechanics (deck creation, random pairing, flip lock, audio triggers, star calculation, timer) from UI presentation (`MemoryBoard`, `MemoryCard`).
  - Enables 100% deterministic, high-speed unit testing of all game rules using Vitest without needing to mount complex UI trees.
- **Alternatives considered**:
  - Global state / Context: Rejected. Memory Match game state is ephemeral to the active session; a focused custom hook with standard React `useState`/`useCallback` follows GameHub's architecture and YAGNI principle.

## Decision: Audio Pronunciation & Web Speech Fallback
- **Decision**: Utilize the existing `useSpeech` hook for speech synthesis (`speak(text)`).
- **Rationale**:
  - Standardized across all GameHub games (`Flashcard`, `Listening`, `Alphabet`, etc.).
  - Re-uses `SpeechUnsupportedBanner` when browser Web Speech API is absent or disabled.
  - Supports audio replay when tapping matched cards without incrementing flip counters.
- **Alternatives considered**:
  - Pre-recorded MP3 audio files: Rejected because Web Speech API supports the entire vocabulary pool dynamically without requiring megabytes of audio assets in the repository.

## Decision: Board Layout & Touch Target Responsiveness
- **Decision**: Dynamic responsive grid based on `pairCount`:
  - 4 pairs (8 cards): 2 columns × 4 rows (mobile) / 4 columns × 2 rows (tablet/desktop)
  - 6 pairs (12 cards): 3 columns × 4 rows (mobile) / 4 columns × 3 rows (tablet/desktop)
  - 8 pairs (16 cards): 4 columns × 4 rows (mobile & desktop)
  - Card minimum touch target: at least 72px × 72px on mobile, ensuring WCAG 2.5.5 touch target compliance for young children.
- **Rationale**: Guarantees intuitive layout on all devices without vertical scrolling during gameplay.

## Decision: Star Rating & Progress Tracking Integration
- **Decision**: 
  - Formula:
    - 3 stars: `flips <= pairCount + 2`
    - 2 stars: `flips > pairCount + 2 && flips <= pairCount * 2`
    - 1 star: `flips > pairCount * 2`
  - When `classCode` and `studentName` exist, call `useGameTracking` / `/api/track` on completion.
- **Rationale**: Matches the specification clarification and integrates seamlessly with student progress tracking in classrooms.
