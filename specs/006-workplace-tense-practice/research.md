# Phase 0 Research: Workplace English Tense Practice (Present Simple)

## Overview & Scope

The feature expands GameHub beyond young children to adult learners (working professionals & university students), introducing a dedicated 12-Tenses Hub (`/tenses`) with an in-depth modular learning module for **Present Simple** (`/tenses/present-simple`).

This research document analyzes the technical requirements, evaluates alternatives, and locks in architectural decisions to ensure clean decoupling from legacy code, compliance with the GameHub constitution, and optimal UX across desktop and mobile devices.

---

## 1. Hub Architecture & Routing Structure

### Problem
How to organize the routes and navigation for the 12-Tenses Hub and individual tense learning modules in Next.js App Router, while preserving SSG performance and maintaining clear entry points from the homepage.

### Decision
- **Homepage entry**: Add a prominent hero card / banner on the homepage (`/`) introducing the "Luyện Thì Tiếng Anh Cho Người Đi Làm & Sinh Viên" feature, directing to `/tenses`.
- **Hub Route**: `src/app/tenses/page.tsx` (Server Component, statically rendered / SSG). It displays the 12-Tenses grid organized into 3 temporal groups:
  1. *Present Tenses* (Hiện Tại): Present Simple (Active), Present Continuous, Present Perfect, Present Perfect Continuous (Coming Soon).
  2. *Past Tenses* (Quá Khứ): Past Simple, Past Continuous, Past Perfect, Past Perfect Continuous (Coming Soon).
  3. *Future Tenses* (Tương Lai): Future Simple, Future Continuous, Future Perfect, Future Perfect Continuous (Coming Soon).
- **Module Route**: `src/app/tenses/[slug]/page.tsx` (with `generateStaticParams` for pre-rendering `present-simple`).
- **Interactive Container**: `src/components/tenses/TenseLessonContainer.tsx` ("use client") manages stage progression, tab navigation ("Quy Tắc Cốt Lõi" vs "Luyện Tập"), score calculation, and progress saving.

### Rationale
- Complies with Constitution Principle I (Next.js App Router, SSG preferred).
- Dynamic route `[slug]` allows adding subsequent tenses (e.g. `past-simple`, `present-continuous`) by dropping JSON data into `src/data/tenses/` without rewriting route files.
- Static generation ensures fast loading, instant SEO indexing, and offline-friendliness.

### Alternatives Considered
- *Hardcoding route `/tenses/present-simple/page.tsx` directly*: Simpler for one tense, but violates DRY when adding the remaining 11 tenses later. `[slug]` with `generateStaticParams` provides future scalability with zero runtime performance cost.
- *Client-side SPA modal on homepage*: Clutters homepage, harms deep linking and bookmarking for adult learners.

---

## 2. Standalone Data Architecture & Decoupling

### Problem
Existing game data in `src/data/` (`games.json`, `words.json`, `sentences.json`) is tailored for 1st-2nd grade vocabulary games. The user explicitly required: *"đảm bảo data không phụ thuộc vào history của convention"* (ensure data does not depend on legacy conventions).

### Decision
- Create a dedicated, self-contained directory `src/data/tenses/` and type definition file `src/types/tenses.ts`:
  - `src/data/tenses/index.json`: Master catalog of all 12 tenses with metadata, status (`active` vs `coming_soon`), CEFR level, descriptions, and prerequisites.
  - `src/data/tenses/present-simple.json`: Complete data package for Present Simple, containing:
    1. `metadata`: Identification and localized names.
    2. `quickRules`: Core grammar cards (To Be, Action Verbs, Spelling rules for -s/-es, Adverbs of Frequency, Workplace usage context).
    3. `challenges`:
       - `conjugation`: 8+ workplace context items (Email announcements, meeting requests, daily workflows).
       - `errorHunting`: 6+ sentence proofreading items with interactive token targets and targeted fixes.
       - `sentenceBuilding`: 6+ scrambled sentence items with workplace schedules and routines.
- All tense schemas are strictly validated with TypeScript interfaces in `src/types/tenses.ts`.

### Rationale
- Absolute separation of concerns: Changes to kids games or admin configs do not affect the adult tense hub.
- Self-contained schema enables fast content expansion and automated schema validation in unit tests.

### Alternatives Considered
- *Extending `Game` and `Sentence` interfaces in `src/types/index.ts`*: Rejected because legacy schemas have fields like `emoji`, `topicId`, `grade` that do not fit multi-stage grammar lessons.

---

## 3. Interactive Challenge Mechanics & dnd-kit Integration

### Problem
The lesson requires 3 specialized challenge stages with responsive, accessible, and intuitive UI on mobile (from 360px) and desktop:
1. **Stage 1: Chia Động Từ Trong Email & Ngữ Cảnh (Conjugation)**
2. **Stage 2: Săn Lỗi Sai Văn Phòng (Workplace Error Hunter)**
3. **Stage 3: Ghép Câu Lịch Trình & Giao Tiếp (Sentence Builder)**

### Decision

#### Stage 1 (Conjugation)
- Renders workplace context (e.g., stylized email frame with Subject, From, To, and Body).
- Interactive target verb shows base verb in parentheses (e.g. `[approve]`).
- Supports both multiple-choice selection and direct text input with normalization (trimming whitespace, case-insensitivity where grammar permits).
- Immediate color-coded feedback (Green/Emerald for correct, Amber/Red for wrong) with instant display of rule breakdown.

#### Stage 2 (Workplace Error Hunter)
- Sentence split into interactive clickable token chips.
- Clicking a token selects it as the suspected error.
- If the token contains an error, a concise replacement selector appears (with 3-4 plausible workplace distractors and the correct form).
- Once corrected, the sentence re-assembles seamlessly in green highlight with an in-depth "Why it was wrong & how to fix it" explanation.
- If a correct token is clicked, gentle feedback ("Từ này đã đúng ngữ pháp") guides the learner without penalizing frustration.

#### Stage 3 (Sentence Builder)
- Complies with Constitution Principle IV (dnd-kit exclusively for drag-and-drop).
- Implements dual interaction:
  1. **Click / Tap to place**: Tapping a token in the bank instantly places it into the next empty slot; tapping a placed token removes it back to the bank.
  2. **Drag & Drop with dnd-kit**: `@dnd-kit/core` with `PointerSensor` (distance activation: 8px) and `KeyboardSensor` for accessible drag/drop reordering.
- Target tokens flow naturally in responsive flex-wrap containers with minimum 44px touch targets.
- Instant pronunciation upon successful sentence construction.

### Rationale
- Dual interaction (tap + dnd) ensures flawless mobile ergonomics and compliance with accessibility rules.
- Immediate grammar explanations turn mistakes into active learning moments.

---

## 4. Audio & Pronunciation Strategy (Web Speech API)

### Problem
Adult learners need clear, natural English pronunciation for examples and sentences. Browsers handle Web Speech API differently, and some speech synthesizers speak too quickly or fail silently.

### Decision
- Reuse/extend the existing `useSpeech` hook with configurable speech options:
  - Language: `en-US`
  - Rate: `0.9` (natural, clear pacing suitable for workplace learners)
  - Pitch: `1.0`
- Safe SSR handling using `useSyncExternalStore` (as in existing `useSpeech.ts`).
- Graceful degradation: If speech synthesis is not supported, the audio button displays a disabled state or is hidden without breaking lesson progress.

### Rationale
- Zero external audio API dependencies (no cost, zero network overhead, offline-capable).
- Consistent with existing audio architecture in GameHub.

---

## 5. Local Progress Persistence & Storage Strategy

### Problem
Requirements state: *"Hệ thống PHẢI lưu trữ tiến độ và điểm số hoàn thành cục bộ trên trình duyệt của người dùng (Local Session / Storage) mà không bắt buộc đăng nhập."* (FR-012).

### Decision
- Key: `gamehub_tense_progress_v1` in `localStorage`.
- Storage Schema:
  ```ts
  interface TenseUserProgressRecord {
    tenseId: string; // e.g. "present-simple"
    completed: boolean;
    stageScores: {
      conjugation: { score: number; total: number; passed: boolean };
      errorHunting: { score: number; total: number; passed: boolean };
      sentenceBuilding: { score: number; total: number; passed: boolean };
    };
    totalScore: number;
    maxScore: number;
    accuracyPercentage: number;
    lastStudiedAt: string; // ISO 8601
  }

  type AllTensesProgress = Record<string, TenseUserProgressRecord>;
  ```
- Hydration helper with SSR safety check (`typeof window !== 'undefined'`) and error handling (corrupted JSON recovery).
- Progress reflects dynamically in Hub badges (e.g. "Đã hoàn thành • 100%").

### Rationale
- Frictionless for self-study learners without sign-up hurdles.
- Decoupled from class/teacher tracking sessions to avoid polluting student classroom logs.

---

## Summary of Decisions & Milestones

| Domain | Chosen Solution | Key Benefit |
|--------|-----------------|-------------|
| **Routing** | `/tenses` (SSG) & `/tenses/[slug]` (SSG) | Scalable 12-tenses hub architecture |
| **Data Schema** | `src/data/tenses/` + `src/types/tenses.ts` | 100% decoupled from legacy kids games |
| **Stage 1 (Conjugation)** | Workplace Email Context + Instant Grammar breakdown | Solves common email verb tense mistakes |
| **Stage 2 (Error Hunter)** | Interactive token highlighting + contextual correction | Trains real-world proofreading skills |
| **Stage 3 (Sentence Builder)** | dnd-kit + tap-to-place with responsive flex wrapping | Seamless mobile & desktop ergonomics |
| **Speech** | Web Speech API (`en-US`, rate `0.9`) | Native, zero-latency pronunciation |
| **Progress Storage** | LocalStorage (`gamehub_tense_progress_v1`) | Frictionless persistence without login |

All technical unknowns and "NEEDS CLARIFICATION" items are fully resolved.
