# Data Model: Parts of Speech Hub

## Core Entities

### `PartsOfSpeechMetadata`
Metadata for a Parts of Speech lesson (e.g., Noun, Verb).
- `id` (string): Unique identifier (e.g., "noun")
- `slug` (string): URL slug
- `name` (string): English name (e.g., "Noun")
- `vietnameseName` (string): Vietnamese name (e.g., "Danh từ")
- `status` (string): "active" | "coming_soon"
- `description` (string): Short description
- `estimatedMinutes` (number): Estimated time to complete

### `WordFamilyItem`
A challenge item for the Word Family stage.
- `id` (string): Unique identifier
- `baseWord` (string): The base word (e.g., "manage")
- `targetWord` (string): The correct transformed word (e.g., "management")
- `options` (string[]): Available suffixes/prefixes or full word options (e.g., ["-ment", "-tion", "-ly"])
- `explanationVi` (string): Explanation in Vietnamese

### `FillInBlankItem`
A challenge item for the Fill-in Blank stage.
- `id` (string): Unique identifier
- `contextType` (string): "email" | "chat" | "report"
- `textBefore` (string): Text before the blank
- `textAfter` (string): Text after the blank
- `correctAnswer` (string): The correct word form
- `options` (string[]): Options to choose from (e.g., ["success", "successful", "succeed", "successfully"])
- `explanationVi` (string): Explanation of why this part of speech is correct in this position

### `ErrorHuntingItem`
A challenge item for the Error Hunting stage.
- `id` (string): Unique identifier
- `sentence` (string): The full sentence containing an error
- `tokens` (string[]): The sentence split into clickable tokens
- `errorTokenIndex` (number): Index of the incorrect word
- `correctWord` (string): The correct form of the word
- `options` (ErrorTokenOption[]): Options presented when the wrong word is clicked
- `explanationVi` (string): Explanation in Vietnamese

### `PartsOfSpeechModuleData`
The complete payload for a lesson.
- `metadata`: PartsOfSpeechMetadata
- `quickRules`: GrammarRuleCard[] (Reused or adapted from Tenses)
- `challenges`: {
    `wordFamily`: WordFamilyItem[],
    `fillInBlank`: FillInBlankItem[],
    `errorHunting`: ErrorHuntingItem[]
  }

### Progress Tracking
- `PartsOfSpeechProgressRecord`: Tracks completion of the 3 stages, similar to `TenseUserProgressRecord`.
- Stores stage scores, total score, and completion status.
