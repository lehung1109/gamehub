# Data Model: Present Perfect Tenses

This data model follows the existing `TenseModuleData` interface defined in `src/types/tenses.ts`.

## 1. TenseModuleData

The root JSON object for a tense file contains:
- `metadata`: `TenseMetadata`
- `quickRules`: `GrammarRuleCard[]`
- `challenges`: `TenseChallenges`

## 2. Entities

### TenseMetadata
- `id`: string (e.g., "present-perfect")
- `slug`: string (e.g., "present-perfect")
- `name`: string
- `vietnameseName`: string
- `group`: "present"
- `status`: "active" (updated from coming_soon)
- `level`: "B1-B2 (Intermediate)"
- `description`: string
- `estimatedMinutes`: number
- `challengeCount`: number (20 for the UI display)

### GrammarRuleCard (quickRules)
- `id`: string
- `category`: "to-be" | "action-verbs" | "spelling-rules" | "adverbs-frequency" | "workplace-usage"
- `titleVi`: string
- `titleEn`: string
- `summaryVi`: string
- `formulas` (optional): `RuleFormula[]`
- `rulesList` (optional): array of rule objects
- `workplaceTips` (optional): array of strings

### TenseChallenges
- `conjugation`: Array of 20 `ConjugationItem` objects
- `errorHunting`: Array of 20 `ErrorHunterItem` objects
- `sentenceBuilding`: Array of 20 `SentenceBuilderItem` objects
- `devOpsChallenge`: Array of 20 `DevOpsItem` objects

*(All specific fields for ConjugationItem, ErrorHunterItem, SentenceBuilderItem, and DevOpsItem map exactly to the TypeScript definitions in `src/types/tenses.ts`)*

## 3. Relationships

- `src/data/tenses/index.json` acts as the manifest. It holds a list of `TenseMetadata` objects. The `id` from the index matches the filename (e.g., `present-perfect.json`).
- `present-perfect.json` and `present-perfect-continuous.json` will adhere strictly to this schema.
