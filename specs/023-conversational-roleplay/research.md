# Research & Technical Decisions: Conversational Roleplay

## Decision: Data Storage for Scenarios
- **Decision**: Store conversation scenarios as static JSON files in `src/data/conversations/`.
- **Rationale**: Follows the existing pattern (e.g., `src/data/tenses`, `src/data/words`). Avoids database roundtrips for static educational content. Easy to version control.
- **Alternatives considered**: Supabase Database. Rejected because the content is static and doesn't require complex relational querying during gameplay.

## Decision: Text-to-Speech (TTS)
- **Decision**: Reuse the existing `autoSpeak` or Web Speech API integration that powers the Flashcard game.
- **Rationale**: Consistency across the application. Avoids adding new third-party dependencies or paid APIs.
- **Alternatives considered**: Third-party APIs (ElevenLabs, Google Cloud TTS). Rejected to keep the app lightweight and free of recurring costs for now.

## Decision: Chat UI State Management
- **Decision**: Use React `useState` and `useReducer` to manage the chat flow (current turn, message history, score).
- **Rationale**: The state is localized to the game session and doesn't need global state management like Redux or Zustand.
- **Alternatives considered**: Zustand. Rejected because the state is entirely local to the game component.
