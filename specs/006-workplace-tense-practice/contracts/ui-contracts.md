# UI Component Contracts & Interactions

## 1. Component Hierarchy

```
src/app/tenses/page.tsx (Server Component)
└── TenseHubMap (Client Component)
    ├── TenseGroupSection (Present / Past / Future)
    │   └── TenseCard (Active vs Coming Soon + Progress Badge)
    └── GlobalTenseHeader

src/app/tenses/[slug]/page.tsx (Server Component)
└── TenseLessonContainer (Client Component)
    ├── LessonHeader (Breadcrumbs, Title, Progress Bar, Audio support indicator)
    ├── TabsContainer ("Quy Tắc Cốt Lõi" vs "Luyện Tập 3 Chặng")
    │   ├── QuickRulesView
    │   │   ├── GrammarCard (To Be, Action Verbs, Spelling Rules)
    │   │   ├── AdverbsFrequencyTable
    │   │   └── WorkplaceTipsList
    │   └── PracticeStageManager (Current Stage 1 / 2 / 3)
    │       ├── ConjugationStage (Stage 1: Email & Context Cloze)
    │       ├── ErrorHunterStage (Stage 2: Workplace Sentence Proofreading)
    │       ├── SentenceBuilderStage (Stage 3: dnd-kit & Tap Token Builder)
    │       └── CompletionDashboard (Summary, Accuracy Score, Retry actions)
```

---

## 2. Component Contract Specifications

### 2.1 `TenseHubMap`
- **Props**:
  - `tenses: TenseMetadata[]` (Static master catalog passed from Server Component).
- **Behavior**:
  - Reads `localStorage` (`gamehub_tense_progress_v1`) on mount to display dynamic badges (e.g. "Đã hoàn thành • 100%").
  - Groups tenses into Present, Past, and Future sections.
  - Active tenses navigate to `/tenses/[slug]`.
  - Inactive tenses render disabled state with "Sắp ra mắt" badge.

### 2.2 `ConjugationStage` (Stage 1)
- **Props**:
  - `items: ConjugationItem[]`
  - `onStageComplete: (score: number, total: number) => void`
- **State**:
  - `currentIndex: number`
  - `selectedAnswer: string | null`
  - `isSubmitted: boolean`
  - `isCorrect: boolean | null`
  - `score: number`
- **Events**:
  - `onSelectOption(option: string)`
  - `onSubmitAnswer()`
  - `onNextQuestion()`

### 2.3 `ErrorHunterStage` (Stage 2)
- **Props**:
  - `items: ErrorHunterItem[]`
  - `onStageComplete: (score: number, total: number) => void`
- **State**:
  - `currentIndex: number`
  - `selectedTokenIndex: number | null`
  - `selectedReplacement: string | null`
  - `isCorrectTokenSelected: boolean`
  - `isSolved: boolean`
- **Events**:
  - `onTokenClick(index: number)`
  - `onSelectReplacement(value: string)`
  - `onNextQuestion()`

### 2.4 `SentenceBuilderStage` (Stage 3)
- **Props**:
  - `items: SentenceBuilderItem[]`
  - `onStageComplete: (score: number, total: number) => void`
- **State**:
  - `currentIndex: number`
  - `placedTokens: Array<{ id: string; text: string }>`
  - `bankTokens: Array<{ id: string; text: string }>`
  - `isSubmitted: boolean`
  - `isCorrect: boolean | null`
- **Sensors / Interactions**:
  - Tap-to-place / tap-to-remove.
  - `@dnd-kit/core` with `PointerSensor` (distance: 8px) and `KeyboardSensor`.
  - Speaks sentence on success using `useSpeech`.

### 2.5 `CompletionDashboard`
- **Props**:
  - `tenseMetadata: TenseMetadata`
  - `progress: TenseUserProgressRecord`
  - `onReplayStage: (stage: 'conjugation' | 'errorHunting' | 'sentenceBuilding') => void`
  - `onResetAll: () => void`
- **Actions**:
  - "Luyện tập lại" (clears current run and restarts Stage 1).
  - "Quay về Hub 12 Thì" (`/tenses`).
