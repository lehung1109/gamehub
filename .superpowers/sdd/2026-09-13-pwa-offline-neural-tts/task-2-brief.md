# Task 2 Brief: Multi-Accent Neural TTS Engine & Voice Discovery

## Requirements
- Files created:
  - `src/lib/speech/tts-engine.ts` (pure functions for neural voice detection, accent mapping, voice ranking, best voice selection with fallback, parameter clamping, utterance generation, Web Audio API tone fallback).
  - `tests/unit/lib/tts-engine.test.ts` (10/10 passing tests).
- Constraints:
  - Pure functions, robust across browsers (US, UK, AU detection).
  - Neural voice prioritization.
  - Safe pedagogical rate/pitch clamping.
  - Zero `any`.
