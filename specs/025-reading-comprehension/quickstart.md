# Quickstart Validation: Reading Comprehension

## Prerequisites
- Node.js/Bun installed.

## Validation Scenario 1: Layout and Vocabulary
1. Run `bun dev`.
2. Navigate to `/games/reading/test-module`.
3. **Expected Outcome**: The passage is displayed. Specific vocabulary words are highlighted. Clicking a highlighted word opens a tooltip showing its definition.

## Validation Scenario 2: Answering Questions
1. Look at the first multiple-choice question next to/below the text.
2. Select the correct answer.
3. **Expected Outcome**: The option is marked correct (green), an explanation is shown, and the user can proceed to the next question. The text passage remains visible the entire time.

## Validation Scenario 3: Completion
1. Answer all questions in the module.
2. **Expected Outcome**: The screen transitions to a summary showing the score. Progress is recorded.
