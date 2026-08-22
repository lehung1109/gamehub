# Data Model: Student Progress Tracking

## Entities

### 1. Classroom (`classrooms`)
Represents a class created by a teacher.

- **Fields**:
  - `id` (uuid, PK)
  - `teacher_id` (uuid, FK to auth.users)
  - `name` (text, max 200 chars): Display name of the class.
  - `code` (varchar(8), UNIQUE): Short 6-8 character alphanumeric code.
  - `is_active` (boolean, default true): Whether the class accepts new game sessions.
  - `created_at` (timestamptz)
- **Relationships**:
  - Belongs to one teacher (via Supabase auth).
  - Has many `students`.

### 2. Student (`students`)
Represents a student in a class. Auto-created when a student first joins with a class code and name.

- **Fields**:
  - `id` (uuid, PK)
  - `classroom_id` (uuid, FK to classrooms.id)
  - `name` (text, max 100 chars): Display name of the student.
  - `created_at` (timestamptz)
- **Relationships**:
  - Belongs to one `classroom`.
  - Has many `game_sessions`.
- **Note**: To handle students with the same name in the same class, they are treated as separate rows (differentiated by `id`). The frontend will group them for display if required, or they just appear as distinct entries.

### 3. Game Session (`game_sessions`)
Represents a completed game session by a student.

- **Fields**:
  - `id` (uuid, PK)
  - `student_id` (uuid, FK to students.id)
  - `game_type` (text): Type of game (e.g., 'listening', 'spelling', 'flashcard', 'alphabet').
  - `topic` (text): The topic played (e.g., 'animals', 'numbers').
  - `score` (integer): Number of correct answers (or null if not applicable).
  - `total_questions` (integer): Total questions in the session.
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `config_id` (text, nullable): Optional ID if the game was based on a specific config.
- **Relationships**:
  - Belongs to one `student`.
  - Has many `session_details`.

### 4. Session Detail (`session_details`)
Represents the result of a single question/interaction within a game session.

- **Fields**:
  - `id` (uuid, PK)
  - `session_id` (uuid, FK to game_sessions.id)
  - `prompt` (text): The question or prompt content.
  - `selected_answer` (text, nullable): What the student chose/typed.
  - `correct_answer` (text, nullable): The expected correct answer.
  - `is_correct` (boolean): Whether the answer was correct.
  - `time_taken_ms` (integer): Time taken in milliseconds.
  - `attempts` (integer, default 1): Number of attempts (useful for spelling/drag-drop games).
- **Relationships**:
  - Belongs to one `game_session`.

## Security & Access Control (RLS)

- `classrooms`: Teachers can create, read, update their own classes (`teacher_id = auth.uid()`). No access for anon.
- `students`: Teachers can read students in their own classes.
- `game_sessions`, `session_details`: Teachers can read data for students in their classes.
- **Note**: Inserts for `students`, `game_sessions`, and `session_details` will be handled by a secure API Route (`/api/track`) running with a service role, bypassing RLS to ensure unauthenticated students can submit data safely.
