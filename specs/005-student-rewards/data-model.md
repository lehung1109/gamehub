# Data Model: Student Rewards & Leveling

## Overview

This feature extends the Gamification capabilities by introducing a Level System and calculating Total Stars dynamically based on the existing `game_sessions` table. No new database tables are created.

## 1. Entities (Logical)

### LevelSystem

A static configuration (hardcoded in the application) that maps a student's total stars to a specific level and badge.

**Fields**:
- `level` (number): The level number (1, 2, 3, etc.)
- `threshold` (number): The minimum number of stars required to reach this level.
- `badge` (string): The emoji representing the badge for this level (e.g., 🐣, 🐱).
- `title` (string): Optional descriptive title (e.g., "Beginner", "Explorer").

**Rules**:
- The system evaluates the highest level where `totalStars >= threshold`.
- Levels are progressive and linear.

### StudentProgress

A computed entity representing a student's current standing.

**Fields**:
- `classCode` (string): The classroom code.
- `studentName` (string): The student's name.
- `totalStars` (number): The sum of `score` from all `game_sessions` associated with this student.
- `currentLevel` (LevelSystem): The computed level based on `totalStars`.
- `nextLevel` (LevelSystem | null): The next level to achieve, or null if at max level.

## 2. State & Storage Updates

- **Database**: No schema changes. `game_sessions.score` continues to be used.
- **Client State**:
  - `StudentSessionProvider` Context: Stores `classCode`, `studentName`, `totalStars`, and `level` in React State to synchronize the Navbar badge with game completions.
  - `localStorage`: Continues to store `{ classCode, studentName }` to persist login across sessions and tabs.

## 3. Relationships

- `Student` -> `GameSessions` (1:N): Existing database relationship. Total stars is calculated by aggregating `score` on these related records.
- `StudentProgress` -> `LevelSystem` (1:1): Computed at runtime.
