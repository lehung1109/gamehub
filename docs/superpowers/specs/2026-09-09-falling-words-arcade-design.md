# Falling Words: Word Rain — Design Specification

**Feature:** Falling Words: Word Rain (Mưa Từ Vựng) Mini-Game  
**Route:** `/games/falling-words`  
**Catalog Priority:** `12` (following `crossword` at 11)  
**Target Audience:** K-12 ESL students, teachers, and English language learners  
**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Web Speech API (`useSpeech`), Vitest, Playwright

---

## 1. Executive Summary & Educational Value

"Falling Words: Word Rain" (Mưa Từ Vựng) is an arcade-style educational typing and listening mini-game designed to improve English vocabulary spelling, typing reflexes, and word recognition under time pressure.

Words fall continuously from the top of the sky arena across 4 vertical lanes. Each word is accompanied by its Vietnamese translation, phonetic transcript, and audio pronunciation. The player types characters on their physical keyboard (or on-screen mobile keyboard) to shoot and pop words before they reach the danger zone at the bottom.

### Educational Value:
1. **Muscle Memory & Touch Typing:** Accelerates letter-by-letter spelling reflexes for common ESL vocabulary.
2. **Audio-Visual Reinforcement:** Each successfully popped word triggers automatic pronunciation via Web Speech API (`en-US`), reinforcing correct pronunciation alongside orthography.
3. **Bilingual Semantic Association:** Displays Vietnamese contextual meanings and emojis on falling bubbles to deepen vocabulary retention.
4. **Gamification & Engagement:** Combo streaks, special power-up bubbles (Double Score, Heart Recovery, Slow Freeze), and screen-clearing Smart Bombs keep learners motivated through fast-paced, 60-second sessions.

---

## 2. Core Gameplay Mechanics

### 2.1 Game Mode: 60-Second Timed Frenzy
- Each round lasts exactly **60 seconds**.
- The player starts with **3 Hearts (❤️❤️❤️)**.
- Words spawn at the top and fall downward at a speed scaled by elapsed time.
- The game concludes when:
  1. The 60-second timer reaches 0, OR
  2. All 3 Hearts are depleted.

### 2.2 Auto-Lock & Smart Targeting Input
- When no word is locked and the player presses a letter key (e.g. `C`):
  - The engine searches all active falling words whose first letter matches `C`.
  - If multiple words match, it targets the one lowest on the screen (closest to danger zone).
  - The targeted word is marked `isTargeted = true`, and its first letter is highlighted.
- Subsequent keypresses match the next letters of the currently targeted word:
  - **Correct Key:** Highlights the next character in emerald/amber, plays typing feedback sound.
  - **Incorrect Key:** Triggers a subtle visual shake on the targeted bubble; typing does not reset the matched prefix.
  - **Completion:** When the final letter is typed, the word pops with particle burst, triggers English audio pronunciation (`useSpeech`), increments combo streak, adds to score, and clears the target lock.

### 2.3 Danger Zone & Ground Collision
- The bottom 15% of the arena is designated as the **Danger Zone** with an ambient red pulse.
- When any falling word touches the ground (`y >= 100%`):
  - The player loses **1 Heart** (❤️).
  - The combo streak resets to 0.
  - The screen flashes red briefly.
  - If target was locked on that word, target lock is released.

### 2.4 Combo Meter & Smart Bombs
- Consecutive successfully popped words without ground collisions build the **Combo Streak**.
- **At 5 Combo:** Unlocks **Freeze Time** (delays falling motion for 3 seconds).
- **At 10 Combo (and every multiple of 10):** Awards **1 Smart Bomb 💣** (maximum 2 stored).
- Pressing `Space` (or clicking the on-screen Bomb button) detonates the Smart Bomb, instantly popping all words currently in the arena and awarding points for each.

### 2.5 Special Bonus Bubbles (Random 20% Spawn Chance)
Certain falling words spawn with rare elemental powers:
1. ⭐ **Double Score (Yellow Glow):** Awards 2x points upon popping.
2. 💖 **Heart Recovery (Pink Glow):** Restores 1 lost Heart (capped at 3).
3. ❄️ **Slow Freeze (Cyan Glow):** Slows all falling words by 50% for 4 seconds.

---

## 3. Scoring & Star Rating

### 3.1 Point Calculation
$$\text{Word Score} = 50 + \lfloor(100 - y) \times 0.5\rfloor + (\text{Combo} \times 10)$$
- **Height Bonus:** Popping a word near the top of the screen ($y \approx 10$) awards more bonus points than near the bottom ($y \approx 90$).
- **Combo Multiplier:** Each combo step adds $+10$ bonus points (capped at $+100$).
- **Double Score Bubble:** Multiplies final word points by $2$.
- **Smart Bomb:** Clears all visible words, granting $+50$ flat points per word cleared.

### 3.2 Star Rating Criteria
At game completion (either by surviving 60s or scoring high before 3 hearts loss):
- ⭐⭐⭐ **3 Stars:** Score $\ge 1200$ points AND 0 Hearts lost (or finished with all 3 Hearts intact).
- ⭐⭐ **2 Stars:** Score $\ge 700$ points AND at least 1 Heart remaining.
- ⭐ **1 Star:** Finished the round with score $> 0$.

---

## 4. Architecture & State Machine

### 4.1 State Machine Hook (`useFallingWordsEngine`)
Defined in `src/hooks/useFallingWordsEngine.ts`:

```typescript
export interface FallingWord {
  id: string;
  word: string;
  clue: string;
  phonetic?: string;
  emoji?: string;
  lane: number; // 0, 1, 2, 3
  y: number; // 0% (top) to 100% (bottom)
  speed: number; // percentage per second
  typedIndex: number; // index of next required char
  isTargeted: boolean;
  specialType?: "double_score" | "heal_life" | "slow_freeze";
}

export interface FallingWordsState {
  fallingWords: FallingWord[];
  targetWordId: string | null;
  score: number;
  combo: number;
  maxCombo: number;
  lives: number; // 3 to 0
  timeLeft: number; // 60 to 0
  bombsAvailable: number; // 0 to 2
  isFrozen: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  topicId: string;
  wordsPopped: Array<{ word: string; clue: string; phonetic?: string }>;
}
```

#### Hook Outputs:
- **State:** All fields from `FallingWordsState`.
- **Actions:**
  - `typeLetter(char: string)`: Handles single character input (from physical or virtual keyboard).
  - `triggerBomb()`: Detonates active Smart Bomb.
  - `restartGame(newTopicId?: string)`: Resets state, generates fresh word queue, resets timer and hearts.

### 4.2 Game Loop & Physics
- Runs using `requestAnimationFrame` with delta-time calculation (`dt` in seconds).
- Updates word positions: $y_{new} = y + \text{speed} \times dt \times (\text{isFrozen} ? 0 : 1)$.
- Spawns new words every $1.8$ to $2.5$ seconds into an unoccupied lane.
- Checks bottom collision at $y \ge 95\%$.

---

## 5. UI Component Hierarchy

```
src/app/games/falling-words/page.tsx
├── ArcadeHeader (Back link, topic selector, timer bar, hearts, score, bomb button)
├── FallingWordsArena (Responsive sky arena with 4 lanes and danger zone)
│   ├── FallingWordBubble (Word bubble with matched prefix highlight, emoji, Vietnamese clue)
│   └── DangerZoneBar (Bottom warning indicator)
├── VirtualKeyboard (Mobile 3-row QWERTY keyboard with min 44px touch targets and Space Bomb button)
└── WordRainSummaryModal (Victory/Game Over dialog with stars, WPM, vocabulary review list, and restart button)
```

---

## 6. Accessibility & Typography Standard

- **Typography Compliance:** All rendered text (labels, timer, scores, vocabulary words, clues) must compute to $\ge 16\text{px}$ font size (`text-base` or `text-lg`), completely avoiding sub-16px classes (`text-[10px]`, `text-[12px]`).
- **Touch Targets:** All virtual keyboard keys and action buttons must satisfy a minimum 44px vertical touch target (`min-h-[44px]`).
- **Keyboard Navigation:** Physical keyboard letters A-Z trigger auto-lock typing, `Space` detonates Smart Bomb.
- **ARIA Semantics:**
  - Game arena has `role="region"` and `aria-label="Khu vực từ rơi"`.
  - Hearts have `aria-label="Số mạng còn lại: X"`.
  - Completion modal has `role="dialog"` and `aria-modal="true"`.

---

## 7. Testing Strategy

1. **Unit Tests (`tests/unit/falling-words/`):**
   - State machine transition tests (`useFallingWordsEngine.test.ts`):
     - Auto-lock targeting on first letter.
     - Letter advance and word popping.
     - Wrong letter rejection without prefix reset.
     - Heart deduction on ground collision.
     - Smart Bomb detonation.
     - 60s timer countdown and game over trigger.
2. **Component Tests (`tests/components/falling-words/`):**
   - `FallingWordBubble.test.tsx`: Correct prefix highlighting and special power glow rendering.
   - `ArcadeHeader.test.tsx`: Hearts rendering, timer progress bar, and bomb availability.
   - `WordRainSummaryModal.test.tsx`: Stars, score, word list review, and replay action.
3. **E2E Tests (`tests/e2e/falling-words.spec.ts`):**
   - Full Playwright integration testing page load, word spawning, physical/virtual typing pop, and timer countdown on both Chromium and Mobile Chrome.

---

## 8. Catalog Integration

Entry appended to `src/data/games.json` with `priority: 12`:
```json
{
  "id": "falling-words",
  "slug": "falling-words",
  "titleVi": "Mưa Từ Vựng",
  "titleEn": "Falling Words",
  "description": "Luyện gõ nhanh và phản xạ tiếng Anh với các từ rơi tốc độ cao, combo streak và bom nổ toàn màn hình",
  "emoji": "🌧️",
  "route": "/games/falling-words",
  "priority": 12
}
```
Update `tests/data/games.test.ts` to expect 12 games in catalog.
