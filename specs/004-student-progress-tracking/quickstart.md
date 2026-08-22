# Quickstart Validation Guide: Student Progress Tracking

This guide outlines runnable scenarios to prove the feature works end-to-end.

## Prerequisites

1. Ensure the development server is running (`npm run dev`).
2. Ensure you have seeded the database or manually authenticated as a teacher in the Admin interface.

## Scenarios

### 1. Teacher Class Management
**Goal**: Verify a teacher can create, view, and disable classes.
1. Open the Admin Dashboard.
2. Navigate to the Classes section (`/dashboard/classes`).
3. Click "Create Class", enter "Test Class 1", and submit.
4. **Expected**: A new class appears in the list with a generated 6-8 character code (e.g. `TEST-123`) and 0 students.
5. Click "Disable" on the class.
6. **Expected**: The class status updates to inactive.

### 2. Student Join Flow
**Goal**: Verify the popup appears and handles sessions correctly.
1. Create a new active class in the dashboard and note the code (e.g. `CODE123`).
2. Open a new incognito window and navigate to a game (e.g. `/games/listening`).
3. **Expected**: A popup prompts for Class Code and Student Name.
4. Enter an invalid code and submit.
5. **Expected**: A friendly error message is shown.
6. Enter the valid code `CODE123` and name "Alice", then submit.
7. **Expected**: Popup closes, game starts, name appears minimally on screen.
8. Navigate to another game (e.g. `/games/spelling`).
9. **Expected**: No popup appears; game starts immediately.

### 3. Tracking Submission & Verification
**Goal**: Verify game data is silently recorded and visible to the teacher.
1. Continuing as "Alice" in the game, complete a full session.
2. **Expected**: No visible changes or loading spinners interrupt the end screen.
3. Open the teacher browser (Admin Dashboard).
4. Navigate to the class dashboard for `CODE123`.
5. **Expected**: Dashboard shows 1 student, 1 game played.
6. Click on "Alice" to view details.
7. **Expected**: The session appears in the history with the correct score.
8. Click on the session details.
9. **Expected**: A list of questions, what Alice answered, the correct answers, and whether she was correct.

### 4. CSV Export
**Goal**: Verify data can be exported.
1. On the class dashboard for `CODE123`, click the "Export Report" button.
2. **Expected**: A file named `report-[class_id].csv` downloads.
3. Open the CSV file in Excel or a text editor.
4. **Expected**: Vietnamese characters render correctly (UTF-8 BOM), and the data includes Alice's session score and date.
