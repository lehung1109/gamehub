# Data Model: Expand Sentence Sorting Data

## Entities

### Sentence Item

Represents a single scrambled sentence puzzle for the sorting game.

- **`id`** (`string`): Unique identifier for the sentence (e.g., `the-small-brown-dog-runs`).
- **`words`** (`string[]`): An array of the words making up the sentence, split in the correct order. The length of this array **must** be between 10 and 12.
- **`full`** (`string`): The full sentence as a single string (e.g., `The small brown dog runs very quickly across the large green park.`).
- **`vietnamese`** (`string`): The Vietnamese translation of the sentence.
- **`emoji`** (`string`): A single emoji representing the meaning of the sentence.
- **`category`** (`string`): The topic category of the sentence (e.g., `nature`, `daily-actions`, `hobbies`, `animals`, `school`).

## Validation Rules

1. **Length Constraint**: `words.length >= 10` and `words.length <= 12`.
2. **Formatting**: `full` must match the joined `words` array (case-insensitive for the first letter and ignoring trailing punctuation, though exact formatting conventions in the existing file should be followed).
3. **Count**: The overall JSON array must contain exactly 50 items.
