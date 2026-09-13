# Phase 17: Interactive Phonics Comic Storybooks & Voice-Acting Adventures Implementation Plan

## Overview
Implement Interactive Phonics Comic Storybooks featuring visual paneling, speech-recognition voice-acting assessments, branching story decisions, and kid-friendly typography ($\ge 16$px).

---

## Tasks

### Task 1: TypeScript Contracts & Storybook Models
- Files:
  - `src/types/comic-story.ts`
  - `tests/unit/types/comic-story-types.test.ts`
- Scope:
  - Define `StoryCefrLevel` (`'Pre-A1' | 'A1' | 'A2'`).
  - Define `BranchChoice` (id, textEn, textVi, targetPanelId).
  - Define `ComicPanel` (id, panelNumber, sceneEmoji, narratorTextVi, characterName, characterAvatar, dialogueEn, dialogueIpa, dialogueMeaningVi, soundEffect, requiresVoiceActing, branchChoices).
  - Define `ComicStory` (id, title, titleVi, level, coverEmoji, themeColor, synopsisVi, focusPhonemes, panels).
  - Define `StorySessionProgress` (storyId, currentPanelId, completedPanelIds, branchesChosen, score, isCompleted).
- Verification: Vitest unit tests verifying model constraints.

### Task 2: Curated Story Content & Narrative Engine
- Files:
  - `src/data/stories/comic-stories.ts`
  - `src/lib/comic-story-engine.ts`
  - `tests/unit/lib/comic-story-engine.test.ts`
- Scope:
  - 3 curated stories:
    - Story 1: *The Lost Kitten in Whispering Woods* (Pre-A1, /s/, /t/, short vowels)
    - Story 2: *Robot Sparky's Space Bakery* (A1, ending consonants /k/, /p/, /d/)
    - Story 3: *The Mystery of the Magic Clock* (A2, fricatives /θ/, /ð/, /ʃ/)
  - Helper functions: `getAllStories()`, `getStoryById(id: string)`, `getNextPanel(story: ComicStory, currentPanelId: string, choiceId?: string): ComicPanel | null`.
- Verification: Vitest unit tests validating story data integrity and branch traversal.

### Task 3: Server Actions for Storybook Progression
- Files:
  - `src/app/actions/comic-story.ts`
  - `tests/unit/actions/comic-story.test.ts`
- Scope:
  - `getStoryDetailsAction(storyId: string): Promise<ActionResponse<ComicStory>>`.
  - `evaluateStoryLineAction(targetText: string, spokenText: string): Promise<ActionResponse<PhonemeAssessmentResult>>`.
  - `completeStoryAction(storyId: string, studentId: string): Promise<ActionResponse<{ expGained: number; isBadgeUnlocked: boolean }>>`.
- Verification: Vitest unit tests for server actions.

### Task 4: Interactive Comic Reader Component
- Files:
  - `src/components/story/ComicStoryReader.tsx`
  - `src/components/story/StoryCompletedModal.tsx`
  - `tests/components/story/ComicStoryReader.test.tsx`
- Scope:
  - Fullscreen panel presentation with scene emojis, sound effect banners, and dual-language captions.
  - Interactive speech bubble with native Web Speech listen button and microphone voice-actor recording.
  - Granular phoneme evaluation chips with dropped-sound alerts.
  - Branching decision buttons with smooth transitions.
  - Strict $\ge 16$px typography.
- Verification: Vitest component tests verifying speech evaluation, branching, and typography audit.

### Task 5: Storybook Hub Page Routes
- Files:
  - `src/components/story/StoryHub.tsx`
  - `src/app/stories/page.tsx`
  - `src/app/stories/[storyId]/page.tsx`
  - `tests/components/story/StoryHub.test.tsx`
- Scope:
  - Story catalog with CEFR level filters and cover illustrations.
  - Dynamic page route `/stories/[storyId]` loading the reader.
  - Strict $\ge 16$px typography.
- Verification: Vitest component tests verifying catalog rendering and link targets.

### Task 6: Playwright E2E Tests
- Files:
  - `tests/e2e/interactive-comic-storybooks.spec.ts`
- Scope:
  - Navigate from `/stories` to `/stories/the-lost-kitten`.
  - Verify panel dialogue, listen button, voice-actor controls, and strict typography.
- Verification: Playwright test execution across desktop and mobile.

### Task 7: Whole-Branch Quality Gate & PR Merge
- Steps:
  1. `npx tsc --noEmit` (0 errors).
  2. `npm run lint` (0 errors/warnings).
  3. `npm run test:run` (100% passing).
  4. `npm run build` (Turbopack production build passing).
  5. Push branch `feat/phase-17-interactive-comic-storybooks`.
  6. Create Pull Request and squash-merge into `main`.
  7. Switch to `main` and pull.
