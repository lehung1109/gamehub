# Design Spec: Word Knight: RPG Battle

**Feature Name:** Word Knight: RPG Battle (Vocab Quest)  
**Date:** 2026-09-08  
**Status:** Approved by User  
**Target Path:** `src/app/games/vocab-defense/` & `src/components/game/vocab-defense/`

---

## 1. Overview & Educational Objectives

### 1.1 Overview
**Word Knight: RPG Battle** is an interactive, turn-based educational role-playing game (RPG) designed for English as a Second Language (ESL) learners in GameHub. Learners assume the role of a knight defending the realm against mythical monsters across multi-wave dungeons by correctly answering English challenges to execute combat moves, generate protective shields, and trigger devastating ultimate attacks.

### 1.2 Educational Objectives
- **Vocabulary Mastery:** Reinforce word-meaning associations and bilingual contextual cues.
- **Auditory & Phonics Recognition:** Hone listening comprehension and spelling-sound correspondences via speech audio synthesis.
- **Syntactic & Grammatical Fluency:** Practice sentence construction and error correction in high-stakes ultimate turns.
- **Positive Reinforcement & Remediation:** Motivate learners through real-time combo multipliers, XP leveling, and immediate feedback on missed questions.

---

## 2. Core Battle Loop & State Machine

### 2.1 Battle States
The core battle loop is governed by a decoupled React hook finite state machine (`useBattleEngine`) transitioning through the following states:

1. `STAGE_INTRO`: Displays stage title (e.g. *Stage 1: Goblin Outpost*), monster wave counter (`Wave 1/4`), and animated monster introduction.
2. `PLAYER_TURN`: Initializes a 20-second turn countdown. Enables hero action selection: **Attack**, **Shield**, or **Ultimate** (if energy is 100/100).
3. `CHALLENGE_ACTIVE`: Displays the question modal/drawer mapped to the chosen action. The 20-second timer ticks down.
4. `RESOLVING_ACTION`:
   - **On Correct Answer:** Hero plays an attack/heal animation; monster takes damage (`-40 DMG` floating combat text) and screen shakes; hero gains `+25 Energy` and extends Combo Streak.
   - **On Incorrect Answer or Timeout:** The correct answer and a concise educational explanation are shown for 2.5 seconds. The monster then counter-attacks, dealing damage to the hero's HP and resetting the combo streak.
5. `CHECK_HEALTH`:
   - If Monster HP $\le 0$:
     - If more waves remain: Transitions to `WAVE_TRANSITION` to spawn the next monster.
     - If final wave monster (Boss) defeated: Transitions to `VICTORY`.
   - If Hero HP $\le 0$: Transitions to `DEFEAT`.
   - If both survive: Transitions back to `PLAYER_TURN`.
6. `WAVE_TRANSITION`: Smoothly fades in the next enemy with increased stats and audio fanfare.
7. `VICTORY` / `DEFEAT`: Displays the `BattleReviewModal` with XP, stars, accuracy statistics, and a dedicated question review list.

```
       [STAGE_INTRO]
             │
             ▼
     [PLAYER_TURN] ◄────────────────────────┐
             │                              │
             ▼ (select action)              │ (both alive)
   [CHALLENGE_ACTIVE]                       │
             │                              │
             ▼ (submit or timeout)          │
   [RESOLVING_ACTION]                       │
             │                              │
             ▼                              │
      [CHECK_HEALTH] ───────────────────────┘
        │          │
        ▼ (win)    ▼ (lose)
   [VICTORY]    [DEFEAT]
```

---

## 3. Combat Math & Skill Specifications

### 3.1 Combat Attributes
- **Hero Stats:**
  - `HP`: `100 / 100` max.
  - `Energy`: `0 / 100` max. Starts at 0. Increments by `+25` per correct basic attack.
  - `Shield`: `0` base. Absorbs up to 50% incoming damage from monster counter-attacks.
  - `Emergency Potion`: `1` potion per stage, restores `+40 HP`.
- **Monster & Boss Progression (Stage 1):**
  - **Wave 1 (Forest Slime):** 50 HP, 15 DMG.
  - **Wave 2 (Shadow Goblin):** 65 HP, 20 DMG.
  - **Wave 3 (Skeleton Archer):** 80 HP, 25 DMG.
  - **Wave 4 - Boss (Ancient Fire Dragon):** 180 HP, 30 DMG.
    - *Boss Special Phase:* Below 30% HP, Enrage mode reduces turn timer to 15s.

### 3.2 Action Specifications & Skill Mapping
| Action | Skill Name | Learning Domain | Cost / Condition | On Correct Effect |
| :--- | :--- | :--- | :--- | :--- |
| **Attack** | *Sword Slash* | Vocabulary & Meaning (4-choice MCQ) | 0 Mana (Free) | 35–45 DMG to monster, +25 Energy, audio pronunciation |
| **Defend / Heal** | *Divine Aegis* | Listening & Phonics (Audio quiz) | 2-Turn Cooldown | +25 HP restored, +20 Shield, blocks 50% next hit |
| **Ultimate** | *Dragon Strike* | Sentence Builder / Grammar Clashes | 100 / 100 Energy | 80–120 Heavy AOE DMG, screen shake, resets Energy to 0 |

---

## 4. Question Generation Engine

### 4.1 Data Sources
- Leverages existing GameHub vocabulary pools in `src/data/` (`categories.ts`, `flashcards.ts`, `sentences.ts`) and custom teacher classroom configurations.
- Compatible with existing word categories: *Animals, Food, School, Family, Workplace Tenses*.

### 4.2 Dynamic Question Generator
- **Distractor Selection:** Randomly picks 1 target word and 3 distinct non-target words from the same category/difficulty tier to form 4 viable options.
- **Audio Integration:** Utilizes browser `window.speechSynthesis` (Web Speech API) with graceful fallback to phonetics/IPA text display.
- **Missed Question Queue (`reviewQueue`):** Automatically registers any question answered incorrectly or timed out with its target word, student answer, correct answer, and diagnostic tip.

---

## 5. Component Architecture & UI Layout

### 5.1 Directory & File Layout
```
src/
├── app/games/vocab-defense/
│   └── page.tsx                     # Route entry point with layout and class session hooks
├── components/game/vocab-defense/
│   ├── BattleHeader.tsx             # Wave indicator, score/combo, turn timer, exit button
│   ├── BattleArena.tsx              # Combat arena container rendering hero, enemy, and FX
│   ├── HeroCard.tsx                 # Hero sprite, HP/Energy/Shield bars, potion quick-slot
│   ├── MonsterCard.tsx              # Monster SVG/avatar, health bar, intent indicator
│   ├── FloatingCombatText.tsx       # Animated damage and healing numbers (-40 DMG, +25 HP)
│   ├── TurnTimerBar.tsx             # Animated 20s countdown bar with green -> yellow -> red gradient
│   ├── ActionDock.tsx               # Action buttons (Attack, Shield, Ultimate, Potion) with shortcuts
│   ├── ChallengeDrawer.tsx          # Responsive sliding question drawer with options
│   ├── FeedbackOverlay.tsx          # 2.5s explanation banner on incorrect answer or timeout
│   └── BattleReviewModal.tsx        # Post-battle summary dialog with stars, XP, and remediation list
└── hooks/
    └── useBattleEngine.ts           # Pure FSM battle state hook and combat math
```

### 5.2 Layout & Responsive Design
- **Desktop (>= 1024px):** Side-by-side arena staging with Hero on the left, clash animations in the center, and Monster on the right; action dock anchored at the bottom.
- **Mobile / Tablet (< 1024px):** Stacked vertical view with compact status bars, touch-friendly answer tiles (min touch target 48px), and keyboard shortcuts disabled or supplemented with touch icons.
- **Keyboard Navigation:** `1`, `2`, `3` for skills; `A`, `B`, `C`, `D` or `1-4` for answer selection.

---

## 6. Scoring, Gamification & Data Persistence

### 6.1 Scoring Formula
- **Base Score:** 100 points per correct answer.
- **Speed Bonus:** +50 points if answered within the first 5 seconds.
- **Combo Multipliers:**
  - 1-2 streak: x1.0
  - 3-4 streak: x1.2
  - 5-6 streak: x1.5
  - 7+ streak: x2.0
- **Flawless Bonus:** +300 points if the stage is cleared without consuming the emergency potion.

### 6.2 Star Rating
- ⭐ **1 Star:** Complete stage (defeat Boss at Wave 4).
- ⭐⭐ **2 Stars:** Clear stage with $\ge 75\%$ accuracy.
- ⭐⭐⭐ **3 Stars:** Clear stage with $\ge 90\%$ accuracy and zero potions consumed.

### 6.3 Data Persistence
- **Guest / Anonymous Play:** Saved to `localStorage` under `gamehub_vocab_defense_progress` and syncs with global student XP in `StudentProfileBadge`.
- **Authenticated / Classroom Play:** Writes completed session results to Supabase `game_attempts` with `game_type = 'vocab-defense'`, recording score, stars, accuracy, and error logs for teacher analytics.

---

## 7. Error Handling & Edge Cases

1. **Speech Synthesis Unavailable:** If `window.speechSynthesis` is blocked or unavailable, the UI gracefully falls back to phonetic IPA text with visual replay cues.
2. **Action Lock / Debouncing:** During `RESOLVING_ACTION` and animation transitions, all action buttons and answer inputs are strictly disabled to prevent race conditions and duplicate damage calls.
3. **Timer Cleanup:** Turn intervals and timeout handlers are cleaned up on unmount or navigation to prevent memory leaks and ghost state updates.
4. **Offline Resilience:** If network connection to Supabase fails, match progress is cached locally and synchronized when online connectivity resumes.

---

## 8. Verification & Testing Strategy

### 8.1 Unit & Hook Tests (`Vitest`)
- `useBattleEngine.test.ts`:
  - Verify initial state: Hero HP 100, Energy 0, Wave 1/4.
  - Verify correct attack updates monster HP, grants +25 Energy, and advances combo streak.
  - Verify incorrect attack/timeout reduces Hero HP and resets combo streak.
  - Verify Ultimate skill is locked when Energy < 100 and executable at 100.
  - Verify Potion consumption restores 40 HP and cannot be used more than once.
  - Verify wave advancement when monster HP $\le 0$.
  - Verify `VICTORY` condition when final boss is defeated and `DEFEAT` when Hero HP $\le 0$.
- `questionGenerator.test.ts`:
  - Verify questions generated contain 1 target and 3 distinct distractors.
  - Verify error handling on empty category pools.

### 8.2 Component & Integration Tests (`React Testing Library`)
- Render `BattleArena` with dummy state and verify HP/Energy bars reflect numerical values.
- Click "Attack" button -> verify `ChallengeDrawer` opens.
- Click correct answer -> verify feedback overlay triggers and damage text displays.

### 8.3 E2E Tests (`Playwright`)
- `tests/e2e/vocab-defense.spec.ts`:
  - Navigate to `/games/vocab-defense`.
  - Simulate a complete battle session across 4 waves.
  - Verify victory dialog displays earned XP, star rating, and "Play Again" button.
  - Verify responsive behavior on mobile viewports (375px width).
