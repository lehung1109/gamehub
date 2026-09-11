# Sub-project 2 Design Specification: Workplace English Parts of Speech & Supabase Sync

## 1. Overview
The Parts of Speech Hub in GameHub (`/parts-of-speech`) currently only contains the `noun` module as active. The other four modules (`verb`, `adjective`, `adverb`, `mixed`) are marked `coming_soon` and lack curriculum JSON files. Furthermore, progress in Parts of Speech is currently confined to `localStorage`, with no sync to Supabase when a student participates in a class session.

This sub-project completes the entire Workplace English Parts of Speech hub by:
1. Creating curriculum content JSON files for `verb`, `adjective`, `adverb`, and `mixed` adhering strictly to `PartsOfSpeechModuleData`.
2. Setting all 5 modules to `active` in `src/data/parts-of-speech/index.json`.
3. Integrating `useGameTracking` into `PartsOfSpeechLessonContainer` to automatically sync stage completions and session answers to Supabase (`game_sessions` and `session_details`) when a student is logged into an active class session.
4. Providing 100% test coverage through Vitest unit/schema tests and Playwright E2E tests.

---

## 2. Curriculum & Schema Architecture

Each module JSON file (`verb.json`, `adjective.json`, `adverb.json`, `mixed.json`) conforms to `PartsOfSpeechModuleData`:
```typescript
interface PartsOfSpeechModuleData {
  metadata: PartsOfSpeechMetadata;
  quickRules: GrammarRuleCard[];
  challenges: {
    wordFamily: WordFamilyItem[];
    fillInBlank: FillInBlankItem[];
    errorHunting: ErrorHunterItem[];
  };
}
```

### 2.1 Verb Module (`verb.json`)
- **Metadata**: id: `verb`, name: `Verb`, vietnameseName: `Động từ`, estimatedMinutes: 10
- **Quick Rules**:
  - Rule 1: Common Verb Suffixes (`-ize`/`-ise`, `-ate`, `-en`, `-ify`) with workplace examples (`finalize`, `activate`, `broaden`, `simplify`).
  - Rule 2: Workplace Verb Positions: After subjects (`We *collaborate*...`), after modals (`You should *confirm*...`), with infinitives (`Plan to *expand*...`).
- **Challenges**:
  - `wordFamily`: 4 items (`final` -> `finalize`, `active` -> `activate`, `broad` -> `broaden`, `simple` -> `simplify`).
  - `fillInBlank`: 4 workplace context items (Email, Report, Meeting Chat).
  - `errorHunting`: 2 workplace error detection items (e.g. noun used where verb is required: `The team must *collaboration* closely`).

### 2.2 Adjective Module (`adjective.json`)
- **Metadata**: id: `adjective`, name: `Adjective`, vietnameseName: `Tính từ`, estimatedMinutes: 10
- **Quick Rules**:
  - Rule 1: Common Adjective Suffixes (`-ful`, `-able`/`-ible`, `-ive`, `-al`, `-ic`, `-ous`).
  - Rule 2: Workplace Adjective Positions: Before nouns (`an *effective* strategy`), after linking verbs (`the report is *comprehensive*`).
- **Challenges**:
  - `wordFamily`: 4 items (`success` -> `successful`, `flex` -> `flexible`, `create` -> `creative`, `finance` -> `financial`).
  - `fillInBlank`: 4 workplace context items.
  - `errorHunting`: 2 workplace error detection items.

### 2.3 Adverb Module (`adverb.json`)
- **Metadata**: id: `adverb`, name: `Adverb`, vietnameseName: `Trạng từ`, estimatedMinutes: 10
- **Quick Rules**:
  - Rule 1: Common Adverb Suffixes (`-ly` added to adjectives: `promptly`, `efficiently`, `accurately`).
  - Rule 2: Workplace Adverb Positions: Modifying verbs (`respond *promptly*`), modifying adjectives (`*extremely* helpful`), sentence-initial with comma (`*Fortunately*, the budget was approved`).
- **Challenges**:
  - `wordFamily`: 4 items (`prompt` -> `promptly`, `efficient` -> `efficiently`, `thorough` -> `thoroughly`, `clear` -> `clearly`).
  - `fillInBlank`: 4 workplace context items.
  - `errorHunting`: 2 workplace error detection items.

### 2.4 Mixed Module (`mixed.json`)
- **Metadata**: id: `mixed`, name: `Mixed`, vietnameseName: `Tổng hợp`, estimatedMinutes: 15
- **Quick Rules**:
  - Rule 1: S-V-O Word Order & Part-of-Speech Placement Matrix.
  - Rule 2: Word Form Transformation Traps in Business English.
- **Challenges**:
  - `wordFamily`: 4 items testing all 4 categories.
  - `fillInBlank`: 4 multi-part workplace sentences.
  - `errorHunting`: 3 comprehensive workplace proofreading challenges.

---

## 3. Data Sync to Supabase Architecture

In `PartsOfSpeechLessonContainer.tsx`:
- Hook into `useGameTracking({ gameType: 'parts-of-speech', topic: metadata.id })`.
- When a student completes a stage:
  1. Save locally via `saveStageProgress(metadata.id, stage, score, total)`.
  2. If `isTracking` is true:
     - For each question in the stage, call `recordQuestion({ prompt, selectedAnswer, correctAnswer, isCorrect, timeTakenMs })`.
     - Call `submitSession({ score, totalQuestions: total, topic: metadata.id, gameType: 'parts-of-speech' })`.
- This ensures seamless dual persistence: offline / anonymous students get full localStorage persistence, while classroom students automatically sync their performance to the teacher dashboard!

---

## 4. Verification & Testing

1. **Schema & Data Tests** (`tests/data/parts-of-speech.test.ts`):
   - Validates all 5 JSON files against schema requirements.
   - Ensures no empty rule lists or missing answers.
   - Ensures valid options for wordFamily, fillInBlank, errorHunting.
2. **Static Route Tests** (`tests/app/parts-of-speech/slug-page.test.tsx`):
   - Confirms `generateStaticParams()` returns all 5 slugs: `noun`, `verb`, `adjective`, `adverb`, `mixed`.
   - Confirms all 5 pages render without error.
3. **Tracking Integration Unit Tests** (`tests/components/parts-of-speech/PartsOfSpeechLessonContainer.test.tsx`):
   - Mocks `useGameTracking` to confirm `saveStageProgress` and `submitSession` are triggered when a stage completes.
4. **E2E Playwright Tests** (`tests/e2e/parts-of-speech-hub.spec.ts`):
   - Confirms navigation between hub and all active modules.
   - Confirms interactive stage gameplay and completion.
5. **Quality Gate**:
   - `npx tsc --noEmit` -> 0 errors.
   - `npm run lint` -> 0 errors.
   - `npm run test:run` -> 100% pass.
   - `npm run build:ci` -> SSG routes compiled cleanly for all 5 modules.
