# Data Model: Present Continuous Tense

This feature relies entirely on static JSON data files. 

## Entities

### 1. Tense Index Entry
Stored in `src/data/tenses/index.json`.

**Fields:**
*   `id` (string): Unique identifier (e.g., "present-continuous")
*   `slug` (string): URL slug
*   `name` (string): English name ("Present Continuous")
*   `vietnameseName` (string): Vietnamese translation ("Thì Hiện Tại Tiếp Diễn")
*   `group` (string): "present", "past", or "future"
*   `status` (string): "active" or "coming_soon" (will be set to "active")
*   `level` (string): Difficulty level (e.g., "A1-A2 (Beginner)")
*   `description` (string): Brief usage description
*   `estimatedMinutes` (number): Expected completion time
*   `challengeCount` (number): Number of challenges

### 2. Tense Detail File
Stored in `src/data/tenses/present-continuous.json`.

**Structure:**
*   `metadata`: Object mirroring the Tense Index Entry.
*   `quickRules`: Array of rule objects.
    *   `id`, `category`, `titleVi`, `titleEn`, `summaryVi`.
    *   `formulas`: Array of structure formulas (khẳng định, phủ định, nghi vấn).
    *   `rulesList`: Detailed spelling/grammar rules with examples (e.g., adding "-ing").
    *   `workplaceTips`: Array of strings for professional usage context.
*   `challenges`: Array of challenge objects.
    *   `id`, `challengeType` (e.g., "errorHunting", "sentenceBuilding", "conjugation", "fillInTheBlank")
    *   `scenarioVi` (string)
    *   Other fields depend on `challengeType` (e.g., `tokens`, `correctTokenIndex`, `fullSentenceEn`, `options`, `explanation`, etc.).
