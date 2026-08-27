# Quickstart Validation Guide: Đảm bảo Font Size không nhỏ hơn 16px

**Feature**: `015-min-font-size-16px` | **Date**: 2026-08-27

> This guide contains runnable commands to validate that the font size across the entire application complies with the minimum 16px standard and that no regressions occur.

---

## 1. Static Validation (Zero Sub-16px Class Invariant)

Verify that no arbitrary pixel text classes below 16px exist in `src/`:

```powershell
# Search for sub-16px arbitrary classes (10px - 15px, 0.1rem - 0.9rem)
git grep -n -E "text-\[(1[0-5]|[0-9])px\]" src/
git grep -n -E "text-\[0\.[0-9]+rem\]" src/
```

**Expected Result**: Zero matches found.

---

## 2. Linter and Typecheck

Ensure strict TypeScript and ESLint standards are maintained without errors:

```powershell
npm run lint
npx tsc --noEmit
```

**Expected Result**: Exit code 0, 0 errors, 0 warnings.

---

## 3. Unit Tests Verification

Run unit tests across all components and pages:

```powershell
npm run test:run
```

**Expected Result**: All Vitest test suites pass successfully.

---

## 4. Production Build Check

Verify that Tailwind CSS v4 compiles correctly with the theme variables and Next.js builds the static output without issues:

```powershell
npm run build:ci
```

**Expected Result**: Build succeeds and static pages export cleanly.

---

## 5. Visual Spot-Check in Development Mode

Run the local development server:

```powershell
npm run dev
```

Navigate to:
1. `http://localhost:3000/` (Home page & Student Badges)
2. `http://localhost:3000/games/flashcard/animals` (Flashcard game)
3. `http://localhost:3000/games/numbers-colors` (Numbers & Colors game)
4. `http://localhost:3000/games/tenses` (Workplace Tenses Hub & Quick Rules tab)
5. `http://localhost:3000/admin/dashboard` (Admin dashboard & Configs)

Open Browser DevTools (F12) -> Inspect any badge, tooltip, or helper text.  
Verify in the **Computed** tab that `font-size` is $\ge 16\text{px}$ (`1rem`).
