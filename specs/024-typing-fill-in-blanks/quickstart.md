# Quickstart Validation: Typing / Fill-in-the-Blanks

## Prerequisites
- Node.js/Bun installed.

## Validation Scenario 1: Typing and Submitting
1. Run `bun dev`.
2. Navigate to `/games/typing/present-simple`.
3. The screen displays a sentence like "She _____ (to read) a book." with a text input.
4. Type "reads" (lowercase or uppercase) and press Enter.
5. **Expected Outcome**: The input turns green, a success sound plays, and the game advances to the next question.

## Validation Scenario 2: Trailing Whitespace
1. In the input, type "reads   " with extra spaces at the end.
2. Submit.
3. **Expected Outcome**: The system trims the whitespace and accepts it as correct.

## Validation Scenario 3: Incorrect Answer
1. Type "read".
2. Submit.
3. **Expected Outcome**: The input is marked incorrect (red outline). The correct answer "reads" is shown below the input, along with the grammar rule explanation.
