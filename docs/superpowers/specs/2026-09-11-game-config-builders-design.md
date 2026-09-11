# Sub-project 4 Design Specification: 11 Game Config Builders for Teachers

## 1. Overview
In GameHub, teachers can customize game settings (word limits, topics, hints, difficulty, audio narration) to create tailored class activities. However, currently only 8 out of 19 games have dedicated config forms. The remaining 11 games have no config forms in `ConfigCreateForm` and `ConfigEditForm` (rendering `null`), and 5 of them are not even recognized in `VALID_GAME_IDS`.

This sub-project completes teacher customization support for ALL 19 games by:
1. Extending `src/types/config.ts` and `src/lib/game-config-schema.ts` to include all 19 games in `VALID_GAME_IDS`, `DEFAULT_SETTINGS`, and TypeScript schemas.
2. Creating 11 dedicated, accessible, and intuitive teacher config form components in `src/components/config/`.
3. Wiring all 11 forms into `ConfigCreateForm.tsx` and `ConfigEditForm.tsx`.
4. Providing 100% test coverage with schema validation tests and component unit tests.

---

## 2. The 11 Config Forms & Settings Specification

### 2.1 Reading (`ReadingConfigForm.tsx`)
- Settings: `difficulty: 1 | 2 | 3`, `showTranslation: boolean`
- UI: Difficulty select/radio (Dễ / Trung bình / Nâng cao), toggle for Vietnamese translation hints.

### 2.2 Typing (`TypingConfigForm.tsx`)
- Settings: `topics: string[]`, `timeLimitSeconds: number` (0 = no limit), `showVirtualKeyboard: boolean`
- UI: Topic selector, duration input, virtual keyboard toggle.

### 2.3 Roleplay (`RoleplayConfigForm.tsx`)
- Settings: `difficulty: 1 | 2 | 3`, `autoSpeak: boolean`, `scenarioTopic?: string`
- UI: Difficulty select, auto-speak toggle, scenario filter.

### 2.4 Wordle (`WordleConfigForm.tsx`)
- Settings: `allowedLengths: (4 | 5 | 6)[]`, `categories: string[]`, `maxAttempts: number`, `allowHints: boolean`
- UI: Length checkboxes (4, 5, 6 chữ cái), category multi-select, max attempts stepper (4-8), hint toggle.

### 2.5 Word Connect (`WordConnectConfigForm.tsx`)
- Settings: `difficultyRange: ('easy' | 'medium' | 'hard')[]`, `allowHints: boolean`, `allowShuffle: boolean`, `enableBonusWords: boolean`
- UI: Difficulty checkboxes, hint toggle, shuffle toggle, bonus words toggle.

### 2.6 Odd One Out (`OddOneOutConfigForm.tsx`)
- Settings: `difficulty: ('easy' | 'medium' | 'hard')[]`, `questionCount: number`, `allowHints: boolean`
- UI: Difficulty checkboxes, question count stepper (5, 10, 15), hint toggle.

### 2.7 Grammar Detective (`GrammarDetectiveConfigForm.tsx`)
- Settings: `rankTiers: ('intern' | 'junior' | 'senior' | 'chief')[]`, `allowHints: boolean`, `showExplanations: boolean`
- UI: Rank tier checkboxes, hint toggle, explanations toggle.

### 2.8 Vocab Defense (`VocabDefenseConfigForm.tsx`)
- Settings: `difficulty: 'easy' | 'medium' | 'hard'`, `initialHearts: number` (1-5), `showHints: boolean`
- UI: Difficulty radio, hearts stepper, hints toggle.

### 2.9 Crossword (`CrosswordConfigForm.tsx`)
- Settings: `topics: string[]`, `gridSize: 'small' | 'medium' | 'large'`, `allowHints: boolean`
- UI: Topics multi-select, grid size radio, hints toggle.

### 2.10 Falling Words (`FallingWordsConfigForm.tsx`)
- Settings: `speed: 'slow' | 'medium' | 'fast'`, `wordTopics: string[]`, `lives: number` (1-5)
- UI: Speed radio, topics multi-select, lives stepper.

### 2.11 Hangman (`HangmanConfigForm.tsx`)
- Settings: `topics: string[]`, `maxBalloons: number` (3-8), `allowHints: boolean`
- UI: Topics multi-select, balloons count stepper, hints toggle.

---

## 3. Integration & Schema Validation

- Update `VALID_GAME_IDS` to include all 19 games.
- Update `DEFAULT_SETTINGS` with clean defaults for all 19 games.
- Update `validateGameSettings(gameId, settings)` to validate all 19 game schemas.
- In `ConfigCreateForm.tsx` and `ConfigEditForm.tsx`, add the 11 switch cases so that every game renders its dedicated form seamlessly.
