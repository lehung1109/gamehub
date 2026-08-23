# Phase 0: Outline & Research

## Technical Context Recap

- **Language/Version**: TypeScript 5.x
- **Primary Dependencies**: Next.js 16.x, React 19.x, Tailwind CSS 4.x, Supabase
- **Storage**: PostgreSQL via Supabase (`students`, `game_sessions` tables)
- **Testing**: Vitest (Unit), Playwright (E2E)
- **Target Platform**: Web browsers (mobile & desktop)
- **Project Type**: Next.js App Router Web Application
- **Performance Goals**: < 1s for badge display, < 200ms latency for saving score
- **Constraints**: No new storage schemas. Dynamically calculate total score.

## Clarifications & Research

### 1. How to efficiently calculate `total_stars`?
**Context**: FR-001 & FR-006 require calculating total stars dynamically from `game_sessions` without fetching full history details, optimizing for performance.
- **Alternative 1**: Create a Supabase Database View or RPC (`SUM(score)`). This requires a schema migration and managing SQL functions.
- **Alternative 2**: Next.js API Route / Server Action that fetches only the `score` column for a student and sums it in memory.
- **Decision**: **Alternative 2 (Server Action `getStudentProgress`)**. We will create a Server Action that queries the `students` table to get the `student_id`, then queries `game_sessions` selecting only `score` (e.g., `.select('score')`). Given the scale of a classroom app, summing an array of integers in Node.js is extremely fast. This avoids adding new SQL schemas or RPCs, strictly adhering to "KHÔNG TẠO khu vực lưu trữ mới" and keeping the implementation simple.

### 2. How to implement fixed stars for non-scoring games (FR-007)?
**Context**: Games like Flashcards don't have right/wrong answers but need to reward 5 stars upon completion.
- **Alternative 1**: Modify the Tracking API to auto-assign 5 stars if `score` is missing and `gameType` matches certain types.
- **Alternative 2**: Update the frontend game engine components (e.g., Flashcard game) to explicitly pass `score: 5` in the tracking payload when they fire the completion event.
- **Decision**: **Alternative 2**. The Tracking API already accepts an optional `score` property. By having the client pass `score: 5`, we keep the API generic and place the game-specific logic in the game components where it belongs.

### 3. How to manage Level configurations (FR-003)?
**Context**: We need to define thresholds and badges (emojis) for levels.
- **Alternative 1**: Store level configurations in the database.
- **Alternative 2**: Hardcode the configuration in the codebase.
- **Decision**: **Alternative 2**. The spec explicitly suggests hardcoding this in the client source code to simplify the architecture (Assumptions section). We will create a `src/lib/levels.ts` file exporting the configuration and a helper function `getLevelInfo(totalStars)`.

### 4. How to share session state across pages for the Navbar Badge?
**Context**: The Student Profile Badge (FR-002) needs to show up on all pages if a student is "logged in".
- **Alternative 1**: Next.js Context API with `localStorage` sync.
- **Alternative 2**: Read directly from `localStorage` / `sessionStorage` in a Client Component.
- **Decision**: **Alternative 2 with a twist**. The current system likely uses `localStorage` or URL params to track `classCode` and `studentName`. The `StudentProfileBadge` will be a Client Component that reads from `localStorage` on mount, then calls the Server Action `getStudentProgress` to fetch the up-to-date stars. To handle real-time updates after a game ends (so the navbar updates instantly without refresh), we will create a lightweight React Context (`StudentSessionProvider`) to hold `totalStars` and trigger updates globally.
