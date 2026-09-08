# Feature Specification: Grammar Detective Game

**Feature Branch**: `028-grammar-detective`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "/speckit-specify theo hướng tiếp cận 1 bên trên - Grammar Detective (Thám tử sửa lỗi) theo phong cách Detective Desk & Case Files với cơ chế Token Highlighter, trắc nghiệm sửa lỗi đa dạng bối cảnh công sở và đời sống, kết hợp chế độ Hồ sơ vụ án và Thử thách vô tận"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect and Solve a Detective Case with Token Highlighter (Priority: P1)

As an English learner,
I want to examine realistic workplace documents (such as customer emails, project incident reports, and chat messages) on a Detective Desk, highlight suspect words or phrases using a neon highlighter, and choose the correct grammatical fixes,
So that I can sharpen my proofreading instincts, understand grammatical errors in real contexts, and master workplace English communication.

**Why this priority**: This is the foundational gameplay loop of Grammar Detective. Without reading a document, identifying erroneous tokens, and correcting them with immediate feedback, the game has no core value.

**Independent Test**: Can be tested independently by loading a sample case document (e.g. an IT support email), activating the highlighter tool, tapping an erroneous word ("Yesterday we deploy"), selecting the correct past-tense correction ("deployed") from a multiple-choice deduction card, and verifying that the sentence updates cleanly in place with an educational explanation.

**Acceptance Scenarios**:

1. **Given** a learner opens a Case File on the Detective Desk,
   **When** they read the document,
   **Then** all words and punctuation are clearly legible in an authentic workplace document card (e.g., email header with sender, recipient, and subject).

2. **Given** the Highlighter tool is toggled active,
   **When** the learner taps or clicks on any word in the document,
   **Then** that specific token highlights in a vibrant neon color without triggering the native mobile/desktop text selection menu (Copy/Paste).

3. **Given** the learner highlights a word that contains an error,
   **When** the selection is registered,
   **Then** a Deduction Card panel opens displaying the suspect word in context, offering 3 to 4 plausible correction choices, and playing an audio cue.

4. **Given** the Deduction Card is open,
   **When** the learner selects the correct correction option,
   **Then** the document replaces the faulty word with the corrected word in-place, the card displays a bilingual explanation (English and Vietnamese) of the grammar rule, and the solved error counter increments by 1.

5. **Given** the Deduction Card is open,
   **When** the learner taps the speaker audio icon next to the sentence or word,
   **Then** high-quality English speech synthesis reads the corrected phrase aloud to reinforce natural pronunciation and rhythm.

---

### User Story 2 - Detective Credibility, Lives, and Case Debriefing (Priority: P2)

As an English learner,
I want my detective credibility (measured in investigation points or magnifier badges) to reflect my proofreading accuracy,
So that I feel a gamified incentive to inspect carefully rather than randomly tapping words across the text.

**Why this priority**: Gamification and error consequences prevent mindless brute-force guessing and encourage deliberate reading comprehension.

**Independent Test**: Can be tested independently by starting an investigation with 3 Credibility points, intentionally tapping 3 innocent/correct words or picking wrong distractors to reduce Credibility to 0, verifying that the case concludes with a "Case Cold" debriefing screen with retry options, and alternatively completing all errors to achieve a "Case Solved" victory summary with an earned detective badge.

**Acceptance Scenarios**:

1. **Given** an ongoing case investigation with 3 Detective Credibility points,
   **When** the learner highlights a word that does not contain any grammatical or vocabulary error,
   **Then** the word briefly flashes with a gentle warning cue ("No Clue Found"), 1 Credibility point is deducted, and a subtle toast explains that the selected word is already grammatically valid.

2. **Given** an open Deduction Card for a genuine error,
   **When** the learner selects an incorrect distractor choice,
   **Then** 1 Credibility point is deducted, the card explains why that option is incorrect, and the learner is given another chance or guided to the correct solution.

3. **Given** Credibility drops to 0,
   **When** the final point is lost,
   **Then** the investigation halts and displays a "Case Cold" screen detailing which errors remained undiscovered and inviting the learner to reopen the case.

4. **Given** the learner successfully corrects all errors in the case file with at least 1 Credibility point remaining,
   **When** the last error is resolved,
   **Then** a celebratory "Case Solved" screen appears showing stars earned (1 to 3 stars based on remaining Credibility), total time elapsed, Detective Experience gained, and a full summary of learned grammar rules.

---

### User Story 3 - Case Progression and Detective Rank Tiers (Priority: P3)

As an English learner,
I want to progress through structured investigation dossiers ranked by detective tiers (Intern Detective, Junior Investigator, Senior Inspector, Chief Detective),
So that I have a clear learning pathway from simple grammar slip-ups to complex workplace nuances.

**Why this priority**: Structured progression provides a long-term sense of achievement, goal-directed motivation, and organized curriculum mapping.

**Independent Test**: Can be tested independently by viewing the Case Files dossier menu, observing that higher tiers are locked until prerequisite cases are solved, completing early cases, and verifying that higher tiers unlock with richer scenarios.

**Acceptance Scenarios**:

1. **Given** a learner visits the Grammar Detective dossier screen,
   **When** they view the available case files,
   **Then** cases are grouped into clear thematic categories (Workplace Email, IT & Tech Incident Reports, Everyday Social Chats) and rank tiers (*Intern*, *Junior*, *Senior*, *Chief*).

2. **Given** a locked higher-tier case,
   **When** the learner taps on it,
   **Then** a clear tooltip or modal indicates the prerequisite requirements (e.g. "Solve 3 Junior cases to unlock Senior investigations").

3. **Given** a newly unlocked case,
   **When** the learner launches it,
   **Then** the document context introduces progressively advanced language challenges (e.g., subtle prepositions, workplace etiquette/politeness formulas, conditional verb tenses).

---

### User Story 4 - Endless Streak & Daily Investigation Mode (Priority: P4)

As a busy professional or student,
I want a quick, repeatable game mode where I can audit continuous snippets of text to maintain my daily proofreading streak,
So that I can engage in fast-paced 3-minute practice sessions anytime.

**Why this priority**: Endless and daily modes boost long-term retention and daily active engagement without requiring linear case completion.

**Independent Test**: Can be tested independently by selecting "Endless Audit" mode, resolving consecutive single-sentence or single-paragraph snippets, and verifying that streaks increment and end appropriately upon exhausting lives.

**Acceptance Scenarios**:

1. **Given** a learner selects "Endless Audit" mode,
   **When** each round begins,
   **Then** a randomized message snippet with exactly 1 or 2 targeted errors is presented with a countdown timer or combo multiplier.

2. **Given** the learner correctly spots and fixes the error within the time limit,
   **When** confirmed,
   **Then** their streak count increments by 1, bonus detective points are awarded, and the next snippet loads smoothly without full page reloads.

3. **Given** the learner's lives are exhausted in Endless mode,
   **When** the session concludes,
   **Then** their final streak, high score, and a breakdown of grammar categories practiced are displayed with an option to share or replay.

---

### Edge Cases

- **Tapping on Punctuation or Symbols**: When a learner taps a period, comma, quotation mark, or emoji, the system should ignore the tap gracefully or highlight only the adjacent word token rather than throwing an error or deducting credibility unfairly.
- **Tapping Already Corrected Words**: When a learner taps a word that has already been corrected in the current session, the system displays a mini-badge showing "Resolved" and allows reviewing the associated grammar rule without deducting credibility.
- **Multiple Errors in Close Proximity**: If two adjacent words are both erroneous (e.g. "he dont" -> "he doesn't"), each error is treated as a distinct or coordinated token so the learner can address both without visual overlap or layout breakage.
- **Audio Output Unavailable or Blocked**: If browser speech synthesis is restricted or unavailable on the user's platform, the audio button displays an unobtrusive disabled/fallback icon, allowing visual gameplay to continue smoothly without crashing.
- **Session Interruption & Window Resize**: If a user switches tabs, rotates their mobile device, or resizes the browser window mid-case, the document layout reflows adaptively while preserving the state of highlighted tokens, remaining credibility, and elapsed time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render case documents inside a themed Detective Desk container displaying metadata (Sender, Recipient, Subject, and Context Type).
- **FR-002**: The system MUST tokenize document content into individual words, whitespace, and punctuation so that words can be highlighted individually.
- **FR-003**: The system MUST provide an interactive Highlighter Tool toggle that enables and disables the token-marking mode.
- **FR-004**: When the Highlighter Tool is active, tapping or clicking an individual word MUST highlight that word with a high-contrast visual indicator.
- **FR-005**: When an erroneous word is highlighted, the system MUST immediately present a Deduction Card panel containing 3 to 4 multiple-choice correction alternatives.
- **FR-006**: Each correction alternative MUST include a concise rationale explaining why it is correct or incorrect.
- **FR-007**: When the user chooses the correct alternative, the system MUST replace the erroneous token with the corrected text in the live document.
- **FR-008**: When an error is resolved, the system MUST display a bilingual explanation (English and Vietnamese) detailing the relevant grammatical or lexical rule.
- **FR-009**: The system MUST support speech synthesis playback for the whole document sentence and individual corrected phrases.
- **FR-010**: The system MUST track Detective Credibility points (default 3 per case) and deduct 1 point for every false-positive word selection or incorrect deduction choice.
- **FR-011**: The system MUST conclude the case with a "Case Solved" victory screen when all errors in the file are corrected, displaying stars (1 to 3), time taken, and accuracy rate.
- **FR-012**: The system MUST conclude the case with a "Case Cold" screen if Detective Credibility reaches zero before all errors are resolved, providing full educational review and a retry option.
- **FR-013**: The system MUST support a dossier browser allowing learners to filter cases by context category (Workplace Email, IT & Tech Incidents, Everyday Chats).
- **FR-014**: The system MUST support progressive rank tiers (*Intern*, *Junior*, *Senior*, *Chief Inspector*) with unlock criteria based on completed cases.
- **FR-015**: The system MUST provide an Endless Audit mode with continuous randomized snippets and streak tracking.
- **FR-016**: The system MUST track learning session analytics (case ID, completion status, errors identified, mistakes made, duration) to support learner progress reports.

### Key Entities

- **CaseFile**: Represents a structured investigation document. Attributes include `id`, `title`, `titleVi`, `category` (email, incident, chat, social), `rankTier` (intern, junior, senior, chief), `sender`, `recipient`, `subject`, `documentText`, `totalErrors`, and an array of `errors`.
- **CaseError**: Represents a specific linguistic error inside a case file. Attributes include `id`, `targetWord`, `tokenIndex`, `errorType` (tense, preposition, collocation, politeness, spelling), `options` (array of text choices with correctness flag and distractor feedback), `explanationEn`, and `explanationVi`.
- **TextToken**: Represents a segmented fragment of the case document. Attributes include `index`, `rawText`, `isWord`, `isError`, `errorId`, and `status` (normal, suspect, solved).
- **DetectiveSession**: Represents a live play session. Attributes include `caseId`, `currentCredibility`, `maxCredibility`, `solvedErrorIds`, `mistakeCount`, `score`, `startTime`, `endTime`, and `status` (active, solved, failed).
- **DetectiveRank**: Represents a player's progression standing. Attributes include `tierId`, `name`, `titleVi`, `requiredSolvedCases`, `badgeIcon`, and `unlockedCasesCount`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Learners can identify and inspect a suspect word within 2 taps using the token highlighter tool.
- **SC-002**: 100% of case files feature bilingual explanations (English and Vietnamese) providing actionable pedagogical explanations for all included errors and distractors.
- **SC-003**: Learners complete an average 3-error case file within 2 to 4 minutes during self-paced study.
- **SC-004**: First-time players achieve a successful case completion rate of at least 70% in the *Intern Detective* tier.
- **SC-005**: Token-tapping and highlighting interaction maintains zero interference with native browser text-selection menus (no unwanted Copy/Paste/Share callouts on iOS and Android).
- **SC-006**: The game layout fully adapts across all screen widths from 360px (mobile) to 1440px+ (desktop) without horizontal scrolling of the investigation desk.
- **SC-007**: When playing with audio enabled, speech synthesis triggers within 500 milliseconds of tapping the speaker icon.

## Assumptions

- **Target Audience**: Designed for ESL students and professionals ranging from high-elementary (CEFR A2) to upper-intermediate (CEFR B2) English proficiency.
- **Language Scope**: Initial case library focuses on common high-frequency errors in business writing: present/past tenses, preposition misuse (e.g. *arrive to* vs *arrive at*), false collocations (e.g. *make a question* vs *ask a question*), and workplace tone/etiquette.
- **Hardware & Device Compatibility**: Works smoothly on touchscreens (smartphones and tablets) as well as desktop pointer environments (mouse and keyboard).
- **Audio Fallback**: Web Speech synthesis operates on standard browser APIs; if a browser blocks audio or lacks voices, visual indicators and textual explanations provide an equivalent learning experience.
- **Stateless & Progress Storage**: Anonymous players retain progress in local session storage, while authenticated learners sync progress with the platform's central database.
