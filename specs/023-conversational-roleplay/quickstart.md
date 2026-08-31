# Quickstart Validation: Conversational Roleplay

## Prerequisites
- Node.js (or Bun, as per project standard) installed.
- Dependencies installed (`bun install`).

## Validation Scenario 1: Load Chat Interface
1. Run the development server: `bun dev` (or `npm run dev`).
2. Navigate to `/games/roleplay/test-scenario` (assuming a test scenario is created).
3. **Expected Outcome**: The screen displays the introductory context and the first message from the character. Audio plays if auto-speak is enabled.

## Validation Scenario 2: Selecting Answers
1. In the chat interface, select a correct response.
2. **Expected Outcome**: The response appears as a message sent by you (the user) on the right side. The character replies with the next turn immediately. Score increments.

## Validation Scenario 3: Incorrect Answers
1. In the chat interface, select an incorrect response.
2. **Expected Outcome**: Visual feedback (e.g., red highlight, shake animation) indicates an error. The feedback text is displayed. The game allows trying again or ends the turn with 0 points for that specific question, depending on implementation details.

## Validation Scenario 4: Completion
1. Reach the final turn of the scenario.
2. **Expected Outcome**: A summary screen appears showing the total score out of the maximum possible score.
