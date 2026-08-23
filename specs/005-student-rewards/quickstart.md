# Quickstart: Student Rewards & Leveling

This guide describes how to validate the Gamification features end-to-end.

## Prerequisites

1. Ensure the Supabase backend is running and seeded with at least one active classroom (e.g., `code: TEST1`).
2. Start the development server (`npm run dev`).

## 1. Validating the Level configuration

1. Open `src/lib/levels.ts` (once implemented) and verify the thresholds and badges.
2. For testing, you can temporarily set the thresholds very low (e.g., Level 2 = 10 stars, Level 3 = 20 stars).

## 2. Testing the Navbar Badge (FR-002)

1. Open the GameHub application in a browser window.
2. The Navbar should **not** display a Student Profile Badge initially.
3. Log in as a student by entering the class code `TEST1` and name `Minh`.
4. The Navbar should now display the Student Profile Badge: `Minh | 0 ⭐ | 🐣`.

## 3. Testing fixed score tracking (FR-007) & Real-time Update (FR-004, FR-005)

1. With the student logged in, navigate to a non-scoring game like Flashcards.
2. Complete the game session.
3. Observe the end screen. You should see a "Level Up!" animation/notification if the 5 stars pushed you over the threshold.
4. Check the Navbar immediately after the game. It should now display `Minh | 5 ⭐` and the badge should update if a level threshold was crossed. No page refresh should be required.

## 4. Cross-Device Synchronization (FR-001, FR-006)

1. Open an Incognito window or a different browser.
2. Log in using the same class code `TEST1` and name `Minh`.
3. The Navbar should immediately fetch and display the 5 stars and the correct badge without needing to play a game first.
