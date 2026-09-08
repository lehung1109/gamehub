# Word Knight: RPG Battle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Word Knight: RPG Battle", an educational turn-based RPG mini-game in GameHub where learners defeat monsters across 4 waves by solving vocabulary, listening/phonics, and sentence/grammar challenges.

**Architecture:** Decoupled finite state machine hook (`useBattleEngine`) driving modular React presentation components (`BattleArena`, `ActionDock`, `ChallengeDrawer`, `BattleReviewModal`) with dynamic question synthesis from GameHub's JSON vocabulary pools.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Framer Motion, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-08-word-knight-rpg-battle-design.md`

## Global Constraints
- All interactive game components must include `'use client'`.
- Use Tailwind CSS v4 classes for styling, fluid progress bars, and animations.
- Turn timer: 20s standard, 15s when Boss HP is under 30%.
- Hero stats: 100 Max HP, 0-100 Energy (+25 per correct basic attack, 100 required for Ultimate), 1 Potion (+40 HP).
- Stage 1 monsters: Wave 1 (Forest Slime: 50 HP, 15 DMG), Wave 2 (Shadow Goblin: 65 HP, 20 DMG), Wave 3 (Skeleton Archer: 80 HP, 25 DMG), Wave 4 Boss (Ancient Fire Dragon: 180 HP, 30 DMG).
- All unit and component tests run via Vitest (`npm run test:run`); E2E tests run via Playwright.

---

### Task 1: Type Definitions & Question Generator Engine

**Files:**
- Create: `src/types/vocab-defense.ts`
- Create: `src/lib/vocab-defense/question-generator.ts`
- Test: `tests/unit/vocab-defense/question-generator.test.ts`

**Interfaces:**
- Produces:
  - `BattleState` type: `'STAGE_INTRO' | 'PLAYER_TURN' | 'CHALLENGE_ACTIVE' | 'RESOLVING_ACTION' | 'CHECK_HEALTH' | 'WAVE_TRANSITION' | 'VICTORY' | 'DEFEAT'`
  - `SkillType` type: `'ATTACK' | 'SHIELD' | 'ULTIMATE'`
  - `ChallengeQuestion` interface: `{ id: string; type: SkillType; prompt: string; targetWord: string; options: string[]; correctIndex: number; explanation: string; phonetic?: string; emoji?: string; }`
  - `generateChallenge(skill: SkillType, usedWordIds?: string[]): ChallengeQuestion`

- [ ] **Step 1: Write the failing unit test for question generation**

```typescript
// tests/unit/vocab-defense/question-generator.test.ts
import { describe, it, expect } from "vitest";
import { generateChallenge } from "@/lib/vocab-defense/question-generator";

describe("Question Generator Engine", () => {
  it("generates an ATTACK vocabulary question with 4 unique options and valid correctIndex", () => {
    const question = generateChallenge("ATTACK");
    expect(question.type).toBe("ATTACK");
    expect(question.options.length).toBe(4);
    expect(new Set(question.options).size).toBe(4);
    expect(question.correctIndex).toBeGreaterThanOrEqual(0);
    expect(question.correctIndex).toBeLessThan(4);
    expect(question.targetWord).toBeTruthy();
    expect(question.explanation).toBeTruthy();
  });

  it("generates a SHIELD listening question with audio target and phonetic cue", () => {
    const question = generateChallenge("SHIELD");
    expect(question.type).toBe("SHIELD");
    expect(question.options.length).toBe(4);
    expect(question.targetWord).toBeTruthy();
  });

  it("generates an ULTIMATE sentence challenge", () => {
    const question = generateChallenge("ULTIMATE");
    expect(question.type).toBe("ULTIMATE");
    expect(question.prompt).toBeTruthy();
    expect(question.options.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/vocab-defense/question-generator.test.ts`
Expected: FAIL with Cannot find module `@/lib/vocab-defense/question-generator`

- [ ] **Step 3: Write types and implementation**

Create `src/types/vocab-defense.ts`:
```typescript
export type BattleState =
  | "STAGE_INTRO"
  | "PLAYER_TURN"
  | "CHALLENGE_ACTIVE"
  | "RESOLVING_ACTION"
  | "CHECK_HEALTH"
  | "WAVE_TRANSITION"
  | "VICTORY"
  | "DEFEAT";

export type SkillType = "ATTACK" | "SHIELD" | "ULTIMATE";

export interface ChallengeQuestion {
  id: string;
  type: SkillType;
  prompt: string;
  targetWord: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  phonetic?: string;
  emoji?: string;
}

export interface MonsterConfig {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  damage: number;
  avatar: string;
  color: string;
}

export interface MissedQuestionReview {
  question: ChallengeQuestion;
  selectedAnswer: string;
  correctAnswer: string;
  timestamp: number;
}
```

Create `src/lib/vocab-defense/question-generator.ts`:
```typescript
import { ChallengeQuestion, SkillType } from "@/types/vocab-defense";
import animalsData from "@/data/words/animals.json";
import fruitsData from "@/data/words/fruits.json";
import schoolData from "@/data/words/school.json";
import sentencesData from "@/data/sentences.json";

interface WordItem {
  id: string;
  english: string;
  phonetic: string;
  vietnamese: string;
  emoji: string;
  topicId: string;
}

const ALL_WORDS: WordItem[] = [
  ...(animalsData as WordItem[]),
  ...(fruitsData as WordItem[]),
  ...(schoolData as WordItem[]),
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateChallenge(skill: SkillType, usedWordIds: string[] = []): ChallengeQuestion {
  if (skill === "ULTIMATE") {
    const availableSentences = sentencesData.filter((s) => !usedWordIds.includes(s.id));
    const target = availableSentences.length > 0 ? shuffle(availableSentences)[0] : shuffle(sentencesData)[0];
    
    // Create distractors by swapping 2 words
    const words = [...target.words];
    const scrambled = shuffle([...words]).join(" ");
    const swapped = words.length > 2 
      ? [words[1], words[0], ...words.slice(2)].join(" ")
      : scrambled;
    const missingOne = words.slice(0, words.length - 1).join(" ");

    const optionsPool = [target.full, scrambled, swapped, missingOne];
    const uniqueOptions = Array.from(new Set(optionsPool)).slice(0, 4);
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`${target.full} (Variation)`);
    }

    const shuffledOptions = shuffle(uniqueOptions);
    const correctIndex = shuffledOptions.indexOf(target.full);

    return {
      id: target.id,
      type: "ULTIMATE",
      prompt: `Ghép câu hoàn chỉnh cho nghĩa: "${target.vietnamese}"`,
      targetWord: target.full,
      options: shuffledOptions,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      explanation: `Câu đúng: "${target.full}" (${target.vietnamese})`,
      emoji: target.emoji || "⚡",
    };
  }

  // ATTACK or SHIELD
  const availableWords = ALL_WORDS.filter((w) => !usedWordIds.includes(w.id));
  const pool = availableWords.length >= 4 ? availableWords : ALL_WORDS;
  const target = shuffle(pool)[0];

  const distractors = shuffle(ALL_WORDS.filter((w) => w.id !== target.id)).slice(0, 3);

  if (skill === "SHIELD") {
    // Audio / Listening quiz: Options are English words
    const optionItems = shuffle([target, ...distractors]);
    const options = optionItems.map((item) => item.english);
    const correctIndex = options.indexOf(target.english);

    return {
      id: target.id,
      type: "SHIELD",
      prompt: "Nghe phát âm và chọn từ vựng tương ứng:",
      targetWord: target.english,
      options,
      correctIndex,
      explanation: `"${target.english}" ${target.phonetic} có nghĩa là: ${target.vietnamese}`,
      phonetic: target.phonetic,
      emoji: target.emoji,
    };
  }

  // Default: ATTACK (English to Vietnamese meaning)
  const optionItems = shuffle([target, ...distractors]);
  const options = optionItems.map((item) => item.vietnamese);
  const correctIndex = options.indexOf(target.vietnamese);

  return {
    id: target.id,
    type: "ATTACK",
    prompt: `Từ "${target.english}" có nghĩa là gì?`,
    targetWord: target.english,
    options,
    correctIndex,
    explanation: `"${target.english}" ${target.phonetic} có nghĩa là: ${target.vietnamese}`,
    phonetic: target.phonetic,
    emoji: target.emoji,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/vocab-defense/question-generator.test.ts`
Expected: PASS (all 3 tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/types/vocab-defense.ts src/lib/vocab-defense/question-generator.ts tests/unit/vocab-defense/question-generator.test.ts
git commit -m "feat(vocab-defense): add types and question generator engine"
```

---

### Task 2: Core Battle Engine State Machine Hook (`useBattleEngine`)

**Files:**
- Create: `src/hooks/useBattleEngine.ts`
- Test: `tests/unit/vocab-defense/useBattleEngine.test.ts`

**Interfaces:**
- Consumes:
  - `BattleState`, `SkillType`, `ChallengeQuestion`, `MonsterConfig` from `src/types/vocab-defense.ts`
  - `generateChallenge` from `src/lib/vocab-defense/question-generator.ts`
- Produces:
  - `useBattleEngine()` returning:
    - State: `battleState`, `heroHp`, `maxHeroHp`, `heroEnergy`, `heroShield`, `potionsLeft`, `currentWaveIndex`, `currentMonster`, `currentMonsterHp`, `activeChallenge`, `turnTimer`, `score`, `comboStreak`, `missedQuestions`, `combatFeedback`
    - Actions: `selectSkill(skill: SkillType)`, `submitAnswer(index: number)`, `consumePotion()`, `restartGame()`, `skipIntro()`

- [ ] **Step 1: Write the failing unit test for `useBattleEngine`**

```typescript
// tests/unit/vocab-defense/useBattleEngine.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBattleEngine } from "@/hooks/useBattleEngine";

describe("useBattleEngine Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with full Hero HP, 0 Energy, and Wave 0 (1/4)", () => {
    const { result } = renderHook(() => useBattleEngine());
    expect(result.current.heroHp).toBe(100);
    expect(result.current.heroEnergy).toBe(0);
    expect(result.current.currentWaveIndex).toBe(0);
    expect(result.current.currentMonster.name).toBe("Forest Slime");
  });

  it("generates a challenge when selecting ATTACK skill", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
    });
    expect(result.current.battleState).toBe("PLAYER_TURN");

    act(() => {
      result.current.selectSkill("ATTACK");
    });
    expect(result.current.battleState).toBe("CHALLENGE_ACTIVE");
    expect(result.current.activeChallenge).not.toBeNull();
    expect(result.current.activeChallenge?.type).toBe("ATTACK");
  });

  it("reduces monster HP, increases energy (+25), and increments combo on correct answer", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
      result.current.selectSkill("ATTACK");
    });

    const correctIndex = result.current.activeChallenge!.correctIndex;
    const initialMonsterHp = result.current.currentMonsterHp;

    act(() => {
      result.current.submitAnswer(correctIndex);
    });

    expect(result.current.battleState).toBe("RESOLVING_ACTION");
    expect(result.current.heroEnergy).toBe(25);
    expect(result.current.comboStreak).toBe(1);
    expect(result.current.currentMonsterHp).toBeLessThan(initialMonsterHp);
  });

  it("reduces Hero HP and resets combo streak on wrong answer", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
      result.current.selectSkill("ATTACK");
    });

    const wrongIndex = (result.current.activeChallenge!.correctIndex + 1) % 4;

    act(() => {
      result.current.submitAnswer(wrongIndex);
    });

    expect(result.current.comboStreak).toBe(0);
    expect(result.current.heroHp).toBeLessThan(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/vocab-defense/useBattleEngine.test.ts`
Expected: FAIL with Cannot find module `@/hooks/useBattleEngine`

- [ ] **Step 3: Implement `useBattleEngine` hook**

Create `src/hooks/useBattleEngine.ts`:
```typescript
import { useState, useEffect, useCallback, useRef } from "react";
import {
  BattleState,
  SkillType,
  ChallengeQuestion,
  MonsterConfig,
  MissedQuestionReview,
} from "@/types/vocab-defense";
import { generateChallenge } from "@/lib/vocab-defense/question-generator";

export const STAGE_MONSTERS: MonsterConfig[] = [
  {
    id: "slime",
    name: "Forest Slime",
    title: "Wave 1/4 - Rookie Threat",
    maxHp: 50,
    damage: 15,
    avatar: "🟢",
    color: "from-emerald-500 to-green-600",
  },
  {
    id: "goblin",
    name: "Shadow Goblin",
    title: "Wave 2/4 - Sneaky Ambusher",
    maxHp: 65,
    damage: 20,
    avatar: "👺",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "skeleton",
    name: "Skeleton Archer",
    title: "Wave 3/4 - Precision Striker",
    maxHp: 80,
    damage: 25,
    avatar: "💀",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "dragon",
    name: "Ancient Fire Dragon",
    title: "Wave 4/4 - Boss of the Realm",
    maxHp: 180,
    damage: 30,
    avatar: "🐉",
    color: "from-rose-600 to-red-700",
  },
];

export function useBattleEngine() {
  const [battleState, setBattleState] = useState<BattleState>("STAGE_INTRO");
  const [heroHp, setHeroHp] = useState(100);
  const maxHeroHp = 100;
  const [heroEnergy, setHeroEnergy] = useState(0);
  const [heroShield, setHeroShield] = useState(0);
  const [potionsLeft, setPotionsLeft] = useState(1);
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const currentMonster = STAGE_MONSTERS[currentWaveIndex] || STAGE_MONSTERS[0];
  const [currentMonsterHp, setCurrentMonsterHp] = useState(currentMonster.maxHp);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeQuestion | null>(null);
  const [turnTimer, setTurnTimer] = useState(20);
  const [score, setScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<MissedQuestionReview[]>([]);
  const [combatFeedback, setCombatFeedback] = useState<{
    text: string;
    isCorrect: boolean;
    explanation?: string;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const usedWordIdsRef = useRef<string[]>([]);

  const clearTurnTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const skipIntro = useCallback(() => {
    setBattleState("PLAYER_TURN");
    setTurnTimer(20);
  }, []);

  const selectSkill = useCallback(
    (skill: SkillType) => {
      if (battleState !== "PLAYER_TURN") return;
      if (skill === "ULTIMATE" && heroEnergy < 100) return;

      const challenge = generateChallenge(skill, usedWordIdsRef.current);
      usedWordIdsRef.current.push(challenge.id);
      setActiveChallenge(challenge);
      setBattleState("CHALLENGE_ACTIVE");

      const isBoss = currentWaveIndex === STAGE_MONSTERS.length - 1;
      const isBossEnraged = isBoss && currentMonsterHp < currentMonster.maxHp * 0.3;
      setTurnTimer(isBossEnraged ? 15 : 20);
    },
    [battleState, heroEnergy, currentWaveIndex, currentMonsterHp, currentMonster.maxHp]
  );

  const resolveTurnOutcome = useCallback(
    (isCorrect: boolean, selectedAnswerText: string) => {
      clearTurnTimer();
      setBattleState("RESOLVING_ACTION");

      if (isCorrect) {
        let dmg = 40;
        if (activeChallenge?.type === "ULTIMATE") {
          dmg = 100;
          setHeroEnergy(0);
        } else if (activeChallenge?.type === "SHIELD") {
          dmg = 20;
          setHeroHp((prev) => Math.min(maxHeroHp, prev + 25));
          setHeroShield((prev) => prev + 20);
        } else {
          setHeroEnergy((prev) => Math.min(100, prev + 25));
        }

        const nextCombo = comboStreak + 1;
        setComboStreak(nextCombo);
        const comboMultiplier = nextCombo >= 7 ? 2.0 : nextCombo >= 5 ? 1.5 : nextCombo >= 3 ? 1.2 : 1.0;
        setScore((prev) => prev + Math.round(100 * comboMultiplier));

        setCurrentMonsterHp((prev) => Math.max(0, prev - dmg));
        setCombatFeedback({
          text: `CORRECT! -${dmg} DMG`,
          isCorrect: true,
          explanation: activeChallenge?.explanation,
        });
      } else {
        setComboStreak(0);
        if (activeChallenge) {
          setMissedQuestions((prev) => [
            ...prev,
            {
              question: activeChallenge,
              selectedAnswer: selectedAnswerText,
              correctAnswer: activeChallenge.options[activeChallenge.correctIndex],
              timestamp: Date.now(),
            },
          ]);
        }

        let rawDmg = currentMonster.damage;
        if (heroShield > 0) {
          rawDmg = Math.round(rawDmg * 0.5);
          setHeroShield((prev) => Math.max(0, prev - 20));
        }
        setHeroHp((prev) => Math.max(0, prev - rawDmg));
        setCombatFeedback({
          text: `MISSED! -${rawDmg} HP`,
          isCorrect: false,
          explanation: activeChallenge?.explanation,
        });
      }

      setTimeout(() => {
        setCombatFeedback(null);
        setActiveChallenge(null);

        // Check Health
        setHeroHp((latestHeroHp) => {
          if (latestHeroHp <= 0) {
            setBattleState("DEFEAT");
            return 0;
          }

          setCurrentMonsterHp((latestMonsterHp) => {
            if (latestMonsterHp <= 0) {
              if (currentWaveIndex + 1 < STAGE_MONSTERS.length) {
                setBattleState("WAVE_TRANSITION");
                setTimeout(() => {
                  setCurrentWaveIndex((prev) => {
                    const nextIdx = prev + 1;
                    setCurrentMonsterHp(STAGE_MONSTERS[nextIdx].maxHp);
                    return nextIdx;
                  });
                  setBattleState("PLAYER_TURN");
                }, 1500);
              } else {
                setBattleState("VICTORY");
              }
            } else {
              setBattleState("PLAYER_TURN");
            }
            return latestMonsterHp;
          });

          return latestHeroHp;
        });
      }, 2000);
    },
    [activeChallenge, comboStreak, currentMonster.damage, heroShield, currentWaveIndex]
  );

  const submitAnswer = useCallback(
    (index: number) => {
      if (battleState !== "CHALLENGE_ACTIVE" || !activeChallenge) return;
      const isCorrect = index === activeChallenge.correctIndex;
      resolveTurnOutcome(isCorrect, activeChallenge.options[index] || "None");
    },
    [battleState, activeChallenge, resolveTurnOutcome]
  );

  const consumePotion = useCallback(() => {
    if (potionsLeft <= 0 || heroHp >= maxHeroHp) return;
    setPotionsLeft((prev) => prev - 1);
    setHeroHp((prev) => Math.min(maxHeroHp, prev + 40));
  }, [potionsLeft, heroHp, maxHeroHp]);

  const restartGame = useCallback(() => {
    setHeroHp(100);
    setHeroEnergy(0);
    setHeroShield(0);
    setPotionsLeft(1);
    setCurrentWaveIndex(0);
    setCurrentMonsterHp(STAGE_MONSTERS[0].maxHp);
    setActiveChallenge(null);
    setScore(0);
    setComboStreak(0);
    setMissedQuestions([]);
    setCombatFeedback(null);
    setBattleState("STAGE_INTRO");
    usedWordIdsRef.current = [];
  }, []);

  // Timer Tick
  useEffect(() => {
    if (battleState === "CHALLENGE_ACTIVE") {
      timerRef.current = setInterval(() => {
        setTurnTimer((prev) => {
          if (prev <= 1) {
            clearTurnTimer();
            resolveTurnOutcome(false, "Timeout");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTurnTimer();
  }, [battleState, resolveTurnOutcome]);

  return {
    battleState,
    heroHp,
    maxHeroHp,
    heroEnergy,
    heroShield,
    potionsLeft,
    currentWaveIndex,
    currentMonster,
    currentMonsterHp,
    activeChallenge,
    turnTimer,
    score,
    comboStreak,
    missedQuestions,
    combatFeedback,
    skipIntro,
    selectSkill,
    submitAnswer,
    consumePotion,
    restartGame,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/vocab-defense/useBattleEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useBattleEngine.ts tests/unit/vocab-defense/useBattleEngine.test.ts
git commit -m "feat(vocab-defense): implement useBattleEngine finite state machine hook"
```

---

### Task 3: Battle Arena & Combatant Cards

**Files:**
- Create: `src/components/game/vocab-defense/HeroCard.tsx`
- Create: `src/components/game/vocab-defense/MonsterCard.tsx`
- Create: `src/components/game/vocab-defense/FloatingCombatText.tsx`
- Create: `src/components/game/vocab-defense/TurnTimerBar.tsx`
- Create: `src/components/game/vocab-defense/BattleArena.tsx`
- Test: `tests/components/vocab-defense/BattleArena.test.tsx`

**Interfaces:**
- Consumes:
  - Combat props from `useBattleEngine` (`heroHp`, `maxHeroHp`, `heroEnergy`, `heroShield`, `potionsLeft`, `currentMonster`, `currentMonsterHp`, `combatFeedback`, `consumePotion`)
- Produces:
  - `<BattleArena />` rendering both hero and monster side-by-side with animated HP/Energy meters, potion quick-bar, and floating text.

- [ ] **Step 1: Write the failing component test for BattleArena**

```typescript
// tests/components/vocab-defense/BattleArena.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BattleArena } from "@/components/game/vocab-defense/BattleArena";
import { STAGE_MONSTERS } from "@/hooks/useBattleEngine";

describe("BattleArena Component", () => {
  it("renders hero stats and monster card correctly", () => {
    render(
      <BattleArena
        heroHp={85}
        maxHeroHp={100}
        heroEnergy={50}
        heroShield={20}
        potionsLeft={1}
        currentMonster={STAGE_MONSTERS[0]}
        currentMonsterHp={30}
        combatFeedback={null}
        onConsumePotion={vi.fn()}
      />
    );

    expect(screen.getByText("Word Knight")).toBeInTheDocument();
    expect(screen.getByText("85 / 100")).toBeInTheDocument();
    expect(screen.getByText("Forest Slime")).toBeInTheDocument();
    expect(screen.getByText("30 / 50")).toBeInTheDocument();
  });

  it("displays combat feedback text when active", () => {
    render(
      <BattleArena
        heroHp={85}
        maxHeroHp={100}
        heroEnergy={50}
        heroShield={0}
        potionsLeft={1}
        currentMonster={STAGE_MONSTERS[0]}
        currentMonsterHp={30}
        combatFeedback={{ text: "CORRECT! -40 DMG", isCorrect: true }}
        onConsumePotion={vi.fn()}
      />
    );

    expect(screen.getByText("CORRECT! -40 DMG")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/vocab-defense/BattleArena.test.tsx`
Expected: FAIL with Cannot find module `@/components/game/vocab-defense/BattleArena`

- [ ] **Step 3: Implement components**

Create `src/components/game/vocab-defense/HeroCard.tsx`:
```tsx
"use client";

import React from "react";
import { Shield, Zap, Heart, Sparkles } from "lucide-react";

interface HeroCardProps {
  hp: number;
  maxHp: number;
  energy: number;
  shield: number;
  potionsLeft: number;
  onConsumePotion: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  hp,
  maxHp,
  energy,
  shield,
  potionsLeft,
  onConsumePotion,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  return (
    <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
            🛡️
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Word Knight</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Lv. 1 Realm Defender
            </span>
          </div>
        </div>

        {shield > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold animate-pulse">
            <Shield className="w-3.5 h-3.5" /> +{shield} Shield
          </div>
        )}
      </div>

      {/* HP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="flex items-center gap-1 text-rose-400">
            <Heart className="w-3.5 h-3.5 fill-rose-500" /> HP
          </span>
          <span className="text-slate-300">
            {hp} / {maxHp}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Energy / Ultimate Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="flex items-center gap-1 text-amber-400">
            <Zap className="w-3.5 h-3.5 fill-amber-400" /> Energy
          </span>
          <span className="text-slate-300">{energy} / 100</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              energy >= 100
                ? "bg-gradient-to-r from-amber-400 to-yellow-300 shadow-md shadow-amber-400/50 animate-pulse"
                : "bg-gradient-to-r from-amber-600 to-amber-400"
            }`}
            style={{ width: `${energy}%` }}
          />
        </div>
      </div>

      {/* Potion Button */}
      <button
        type="button"
        disabled={potionsLeft <= 0 || hp >= maxHp}
        onClick={onConsumePotion}
        className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
          potionsLeft > 0 && hp < maxHp
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer"
            : "bg-slate-800/40 border-slate-700 text-slate-500 cursor-not-allowed"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" /> Dùng Potion Hồi Máu (+40 HP) ({potionsLeft} còn lại)
      </button>
    </div>
  );
};
```

Create `src/components/game/vocab-defense/MonsterCard.tsx`:
```tsx
"use client";

import React from "react";
import { MonsterConfig } from "@/types/vocab-defense";
import { Swords, Flame } from "lucide-react";

interface MonsterCardProps {
  monster: MonsterConfig;
  hp: number;
}

export const MonsterCard: React.FC<MonsterCardProps> = ({ monster, hp }) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / monster.maxHp) * 100));
  const isEnraged = hp < monster.maxHp * 0.3;

  return (
    <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${monster.color} flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-105`}
          >
            {monster.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">{monster.name}</h3>
              {isEnraged && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse">
                  <Flame className="w-3 h-3" /> ENRAGED
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-medium">{monster.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20">
          <Swords className="w-3.5 h-3.5" /> {monster.damage} DMG
        </div>
      </div>

      {/* Monster HP Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-rose-400">Enemy Health</span>
          <span className="text-slate-300">
            {hp} / {monster.maxHp}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isEnraged
                ? "bg-gradient-to-r from-red-600 to-rose-500 animate-pulse"
                : "bg-gradient-to-r from-purple-500 to-rose-500"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
```

Create `src/components/game/vocab-defense/FloatingCombatText.tsx`:
```tsx
"use client";

import React from "react";

interface FloatingCombatTextProps {
  feedback: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  } | null;
}

export const FloatingCombatText: React.FC<FloatingCombatTextProps> = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none text-center animate-bounce">
      <div
        className={`px-5 py-2.5 rounded-2xl font-black text-xl md:text-2xl shadow-2xl border ${
          feedback.isCorrect
            ? "bg-emerald-500/90 text-white border-emerald-300 shadow-emerald-500/50"
            : "bg-rose-600/90 text-white border-rose-400 shadow-rose-600/50"
        }`}
      >
        {feedback.text}
      </div>
    </div>
  );
};
```

Create `src/components/game/vocab-defense/TurnTimerBar.tsx`:
```tsx
"use client";

import React from "react";
import { Timer } from "lucide-react";

interface TurnTimerBarProps {
  timer: number;
  maxTimer?: number;
}

export const TurnTimerBar: React.FC<TurnTimerBarProps> = ({ timer, maxTimer = 20 }) => {
  const percent = Math.max(0, Math.min(100, (timer / maxTimer) * 100));

  const getColor = () => {
    if (percent > 50) return "from-emerald-400 to-green-500";
    if (percent > 25) return "from-amber-400 to-yellow-500";
    return "from-rose-500 to-red-600 animate-pulse";
  };

  return (
    <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur px-4 py-2 rounded-xl border border-slate-800">
      <Timer className={`w-4 h-4 ${percent <= 25 ? "text-rose-400 animate-spin" : "text-amber-400"}`} />
      <div className="flex-1 w-32 md:w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${getColor()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-slate-300 w-6 text-right">{timer}s</span>
    </div>
  );
};
```

Create `src/components/game/vocab-defense/BattleArena.tsx`:
```tsx
"use client";

import React from "react";
import { MonsterConfig } from "@/types/vocab-defense";
import { HeroCard } from "./HeroCard";
import { MonsterCard } from "./MonsterCard";
import { FloatingCombatText } from "./FloatingCombatText";

interface BattleArenaProps {
  heroHp: number;
  maxHeroHp: number;
  heroEnergy: number;
  heroShield: number;
  potionsLeft: number;
  currentMonster: MonsterConfig;
  currentMonsterHp: number;
  combatFeedback: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  } | null;
  onConsumePotion: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  heroHp,
  maxHeroHp,
  heroEnergy,
  heroShield,
  potionsLeft,
  currentMonster,
  currentMonsterHp,
  combatFeedback,
  onConsumePotion,
}) => {
  return (
    <div className="relative w-full rounded-3xl bg-slate-950/60 p-4 md:p-6 border border-slate-800/80 shadow-2xl backdrop-blur-md">
      <FloatingCombatText feedback={combatFeedback} />

      <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
        <HeroCard
          hp={heroHp}
          maxHp={maxHeroHp}
          energy={heroEnergy}
          shield={heroShield}
          potionsLeft={potionsLeft}
          onConsumePotion={onConsumePotion}
        />

        <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs">
            VS
          </div>
        </div>

        <MonsterCard monster={currentMonster} hp={currentMonsterHp} />
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/vocab-defense/BattleArena.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/game/vocab-defense/ tests/components/vocab-defense/BattleArena.test.tsx
git commit -m "feat(vocab-defense): implement BattleArena, HeroCard, MonsterCard and combat feedback"
```

---

### Task 4: Interactive Challenge Drawer & Action Dock

**Files:**
- Create: `src/components/game/vocab-defense/ActionDock.tsx`
- Create: `src/components/game/vocab-defense/ChallengeDrawer.tsx`
- Create: `src/components/game/vocab-defense/FeedbackOverlay.tsx`
- Test: `tests/components/vocab-defense/ChallengeDrawer.test.tsx`

**Interfaces:**
- Consumes:
  - `SkillType`, `ChallengeQuestion` from `src/types/vocab-defense.ts`
- Produces:
  - `<ActionDock />` rendering 3 skill triggers with hotkeys `1`, `2`, `3` and mana lock indicators.
  - `<ChallengeDrawer />` with audio synthesis playback, 4 interactive answer options, and instant feedback.

- [ ] **Step 1: Write the failing test for ChallengeDrawer**

```typescript
// tests/components/vocab-defense/ChallengeDrawer.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChallengeDrawer } from "@/components/game/vocab-defense/ChallengeDrawer";
import { ChallengeQuestion } from "@/types/vocab-defense";

const mockQuestion: ChallengeQuestion = {
  id: "test-1",
  type: "ATTACK",
  prompt: "What is the meaning of 'Adventure'?",
  targetWord: "Adventure",
  options: ["Thám hiểm", "Nghỉ ngơi", "Nấu ăn", "Ngủ"],
  correctIndex: 0,
  explanation: "'Adventure' có nghĩa là thám hiểm, phiêu lưu.",
};

describe("ChallengeDrawer Component", () => {
  it("renders prompt and 4 options", () => {
    render(
      <ChallengeDrawer
        question={mockQuestion}
        onSelectAnswer={vi.fn()}
        disabled={false}
      />
    );

    expect(screen.getByText("What is the meaning of 'Adventure'?")).toBeInTheDocument();
    expect(screen.getByText("Thám hiểm")).toBeInTheDocument();
    expect(screen.getByText("Nghỉ ngơi")).toBeInTheDocument();
  });

  it("calls onSelectAnswer with option index when clicked", () => {
    const handleSelect = vi.fn();
    render(
      <ChallengeDrawer
        question={mockQuestion}
        onSelectAnswer={handleSelect}
        disabled={false}
      />
    );

    fireEvent.click(screen.getByText("Thám hiểm"));
    expect(handleSelect).toHaveBeenCalledWith(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/vocab-defense/ChallengeDrawer.test.tsx`
Expected: FAIL with Cannot find module `@/components/game/vocab-defense/ChallengeDrawer`

- [ ] **Step 3: Implement ActionDock, ChallengeDrawer, FeedbackOverlay**

Create `src/components/game/vocab-defense/ActionDock.tsx`:
```tsx
"use client";

import React, { useEffect } from "react";
import { SkillType } from "@/types/vocab-defense";
import { Swords, Shield, Zap } from "lucide-react";

interface ActionDockProps {
  heroEnergy: number;
  onSelectSkill: (skill: SkillType) => void;
  disabled: boolean;
}

export const ActionDock: React.FC<ActionDockProps> = ({
  heroEnergy,
  onSelectSkill,
  disabled,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "1") onSelectSkill("ATTACK");
      if (e.key === "2") onSelectSkill("SHIELD");
      if (e.key === "3" && heroEnergy >= 100) onSelectSkill("ULTIMATE");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, heroEnergy, onSelectSkill]);

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl">
      <div className="text-xs font-bold text-slate-400 mb-3 text-center uppercase tracking-wider">
        Chọn Kỹ Năng Xuất Chiêu (Phím tắt 1, 2, 3)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* Attack */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectSkill("ATTACK")}
          className="group relative flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-800/80 hover:from-amber-600/30 hover:to-amber-500/20 border border-slate-700 hover:border-amber-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <span>⚔️ Tấn Công Thường</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">1</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Từ vựng • +25 Nộ • 35-45 DMG</p>
          </div>
        </button>

        {/* Shield */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectSkill("SHIELD")}
          className="group relative flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-800/80 hover:from-sky-600/30 hover:to-sky-500/20 border border-slate-700 hover:border-sky-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <span>🛡️ Thủ Hộ & Hồi Máu</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">2</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Luyện Nghe • +25 HP & Khiên</p>
          </div>
        </button>

        {/* Ultimate */}
        <button
          type="button"
          disabled={disabled || heroEnergy < 100}
          onClick={() => onSelectSkill("ULTIMATE")}
          className={`group relative flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
            heroEnergy >= 100
              ? "bg-gradient-to-r from-amber-500/30 to-rose-500/30 border-amber-400/80 shadow-lg shadow-amber-500/20 hover:scale-[1.02] cursor-pointer animate-pulse"
              : "bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-60"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              heroEnergy >= 100
                ? "bg-amber-400 text-slate-950 border-amber-300 font-bold"
                : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
          >
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <span>⚡ Tuyệt Chiêu Rồng</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">3</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {heroEnergy >= 100 ? "SẴN SÀNG! • 80-120 DMG" : `Cần 100 Nộ (${heroEnergy}/100)`}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
```

Create `src/components/game/vocab-defense/ChallengeDrawer.tsx`:
```tsx
"use client";

import React, { useEffect } from "react";
import { ChallengeQuestion } from "@/types/vocab-defense";
import { Volume2 } from "lucide-react";

interface ChallengeDrawerProps {
  question: ChallengeQuestion;
  onSelectAnswer: (index: number) => void;
  disabled: boolean;
}

export const ChallengeDrawer: React.FC<ChallengeDrawerProps> = ({
  question,
  onSelectAnswer,
  disabled,
}) => {
  const playAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.targetWord);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (question.type === "SHIELD") {
      playAudio();
    }
  }, [question.id, question.type]);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            {question.type === "ATTACK" && "⚔️ Thử thách Từ vựng"}
            {question.type === "SHIELD" && "🛡️ Thử thách Luyện nghe"}
            {question.type === "ULTIMATE" && "⚡ Thử thách Ngữ pháp"}
          </span>
          <h2 className="text-lg md:text-xl font-bold text-white mt-1">{question.prompt}</h2>
        </div>

        {question.type === "SHIELD" && (
          <button
            type="button"
            onClick={playAudio}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-sm font-bold transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> Nghe lại âm thanh
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectAnswer(idx)}
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 transition-all text-left text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="text-sm md:text-base">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

Create `src/components/game/vocab-defense/FeedbackOverlay.tsx`:
```tsx
"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface FeedbackOverlayProps {
  isCorrect: boolean;
  explanation?: string;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  isCorrect,
  explanation,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border mb-4 flex items-start gap-3 animate-in fade-in duration-200 ${
        isCorrect
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          : "bg-rose-500/10 border-rose-500/30 text-rose-300"
      }`}
    >
      {isCorrect ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      )}
      <div className="text-xs md:text-sm">
        <p className="font-bold">{isCorrect ? "Chính xác! Đòn đánh thành công!" : "Chưa chính xác! Quái vật phản công!"}</p>
        {explanation && <p className="text-slate-300 mt-1">{explanation}</p>}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/vocab-defense/ChallengeDrawer.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/game/vocab-defense/ActionDock.tsx src/components/game/vocab-defense/ChallengeDrawer.tsx src/components/game/vocab-defense/FeedbackOverlay.tsx tests/components/vocab-defense/ChallengeDrawer.test.tsx
git commit -m "feat(vocab-defense): add ActionDock and ChallengeDrawer components"
```

---

### Task 5: Post-Battle Summary & Remediation Modal

**Files:**
- Create: `src/components/game/vocab-defense/BattleReviewModal.tsx`
- Test: `tests/components/vocab-defense/BattleReviewModal.test.tsx`

**Interfaces:**
- Consumes:
  - `MissedQuestionReview` from `src/types/vocab-defense.ts`
- Produces:
  - `<BattleReviewModal />` displaying victory/defeat state, earned XP, star ratings, and the missed question list with audio replay and explanations.

- [ ] **Step 1: Write the failing test for BattleReviewModal**

```typescript
// tests/components/vocab-defense/BattleReviewModal.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BattleReviewModal } from "@/components/game/vocab-defense/BattleReviewModal";

describe("BattleReviewModal Component", () => {
  it("renders Victory header, score, and Play Again button", () => {
    render(
      <BattleReviewModal
        isOpen={true}
        isVictory={true}
        score={850}
        stars={3}
        missedQuestions={[]}
        onPlayAgain={vi.fn()}
      />
    );

    expect(screen.getByText("VICTORY!")).toBeInTheDocument();
    expect(screen.getByText("850")).toBeInTheDocument();
    expect(screen.getByText("Chơi Lại")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/vocab-defense/BattleReviewModal.test.tsx`
Expected: FAIL with Cannot find module `@/components/game/vocab-defense/BattleReviewModal`

- [ ] **Step 3: Implement BattleReviewModal**

Create `src/components/game/vocab-defense/BattleReviewModal.tsx`:
```tsx
"use client";

import React from "react";
import { MissedQuestionReview } from "@/types/vocab-defense";
import { Trophy, Skull, Star, RotateCcw, Volume2, BookOpen } from "lucide-react";

interface BattleReviewModalProps {
  isOpen: boolean;
  isVictory: boolean;
  score: number;
  stars: number;
  missedQuestions: MissedQuestionReview[];
  onPlayAgain: () => void;
}

export const BattleReviewModal: React.FC<BattleReviewModalProps> = ({
  isOpen,
  isVictory,
  score,
  stars,
  missedQuestions,
  onPlayAgain,
}) => {
  if (!isOpen) return null;

  const playAudio = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center max-h-[90vh] overflow-y-auto">
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-xl ${
            isVictory
              ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/20"
              : "bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-500/20"
          }`}
        >
          {isVictory ? <Trophy className="w-10 h-10" /> : <Skull className="w-10 h-10" />}
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white">
          {isVictory ? "VICTORY!" : "DEFEAT"}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isVictory
            ? "Chúc mừng bạn đã bảo vệ vương quốc thành công!"
            : "Đừng nản lòng! Hãy ôn lại các câu hỏi và thử lại nhé!"}
        </p>

        {/* Stars */}
        {isVictory && (
          <div className="flex items-center gap-2 my-4">
            {[1, 2, 3].map((starIndex) => (
              <Star
                key={starIndex}
                className={`w-8 h-8 ${
                  starIndex <= stars
                    ? "text-amber-400 fill-amber-400 filter drop-shadow-md"
                    : "text-slate-700 fill-slate-800"
                }`}
              />
            ))}
          </div>
        )}

        {/* Score & XP */}
        <div className="grid grid-cols-2 gap-4 w-full my-4">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-bold block">Tổng Điểm</span>
            <span className="text-2xl font-black text-white">{score}</span>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-bold block">XP Nhận Được</span>
            <span className="text-2xl font-black text-amber-400">+{Math.round(score / 5)} XP</span>
          </div>
        </div>

        {/* Missed Questions Review */}
        {missedQuestions.length > 0 && (
          <div className="w-full text-left my-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Ôn tập {missedQuestions.length} câu đã sai:
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {missedQuestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span>{item.question.targetWord}</span>
                    <button
                      type="button"
                      onClick={() => playAudio(item.question.targetWord)}
                      className="p-1 rounded bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-400">{item.question.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-5 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold flex items-center justify-center gap-2 text-sm shadow-xl shadow-amber-500/20 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Chơi Lại
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/vocab-defense/BattleReviewModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/game/vocab-defense/BattleReviewModal.tsx tests/components/vocab-defense/BattleReviewModal.test.tsx
git commit -m "feat(vocab-defense): add BattleReviewModal with XP rewards and review queue"
```

---

### Task 6: Game Page Assembly, Hub Registration & E2E Test

**Files:**
- Create: `src/app/games/vocab-defense/page.tsx`
- Modify: `src/data/games.json`
- Create: `tests/e2e/vocab-defense.spec.ts`

**Interfaces:**
- Consumes:
  - All components from `src/components/game/vocab-defense/`
  - `useBattleEngine` hook
- Produces:
  - Complete Next.js route at `/games/vocab-defense`
  - Catalog listing in `src/data/games.json`

- [ ] **Step 1: Write the E2E test file**

```typescript
// tests/e2e/vocab-defense.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Word Knight: RPG Battle E2E Flow", () => {
  test("renders game page, starts turn, and allows action selection", async ({ page }) => {
    await page.goto("/games/vocab-defense");
    await expect(page.getByText("Word Knight")).toBeVisible();
    await expect(page.getByText("Forest Slime")).toBeVisible();

    // Click attack action
    const attackButton = page.getByRole("button", { name: /Tấn Công Thường/i });
    await attackButton.click();

    // Challenge drawer should open
    await expect(page.getByText(/Thử thách Từ vựng/i)).toBeVisible();
  });
});
```

- [ ] **Step 2: Create page component**

Create `src/app/games/vocab-defense/page.tsx`:
```tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Swords, Sparkles } from "lucide-react";
import { useBattleEngine } from "@/hooks/useBattleEngine";
import { BattleArena } from "@/components/game/vocab-defense/BattleArena";
import { TurnTimerBar } from "@/components/game/vocab-defense/TurnTimerBar";
import { ActionDock } from "@/components/game/vocab-defense/ActionDock";
import { ChallengeDrawer } from "@/components/game/vocab-defense/ChallengeDrawer";
import { FeedbackOverlay } from "@/components/game/vocab-defense/FeedbackOverlay";
import { BattleReviewModal } from "@/components/game/vocab-defense/BattleReviewModal";

export default function VocabDefenseGamePage() {
  const {
    battleState,
    heroHp,
    maxHeroHp,
    heroEnergy,
    heroShield,
    potionsLeft,
    currentWaveIndex,
    currentMonster,
    currentMonsterHp,
    activeChallenge,
    turnTimer,
    score,
    comboStreak,
    missedQuestions,
    combatFeedback,
    skipIntro,
    selectSkill,
    submitAnswer,
    consumePotion,
    restartGame,
  } = useBattleEngine();

  const isIntro = battleState === "STAGE_INTRO";
  const isResolving = battleState === "RESOLVING_ACTION";
  const isGameOver = battleState === "VICTORY" || battleState === "DEFEAT";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> GameHub
        </Link>

        <div className="flex items-center gap-3">
          {comboStreak > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> {comboStreak}x COMBO!
            </div>
          )}
          <TurnTimerBar timer={turnTimer} />
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex flex-col gap-6">
        {isIntro && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-bold">
              <Swords className="w-4 h-4" /> Chuẩn bị chiến đấu đợt {currentWaveIndex + 1}/4!
            </div>
            <button
              type="button"
              onClick={skipIntro}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
            >
              Vào Trận Ngay
            </button>
          </div>
        )}

        {/* Arena */}
        <BattleArena
          heroHp={heroHp}
          maxHeroHp={maxHeroHp}
          heroEnergy={heroEnergy}
          heroShield={heroShield}
          potionsLeft={potionsLeft}
          currentMonster={currentMonster}
          currentMonsterHp={currentMonsterHp}
          combatFeedback={combatFeedback}
          onConsumePotion={consumePotion}
        />

        {/* Feedback info when resolving */}
        {combatFeedback && (
          <FeedbackOverlay
            isCorrect={combatFeedback.isCorrect}
            explanation={combatFeedback.explanation}
          />
        )}

        {/* Dynamic Controls */}
        {activeChallenge ? (
          <ChallengeDrawer
            question={activeChallenge}
            onSelectAnswer={submitAnswer}
            disabled={isResolving}
          />
        ) : (
          <ActionDock
            heroEnergy={heroEnergy}
            onSelectSkill={selectSkill}
            disabled={isIntro || isResolving}
          />
        )}
      </main>

      {/* Post Battle Modal */}
      <BattleReviewModal
        isOpen={isGameOver}
        isVictory={battleState === "VICTORY"}
        score={score}
        stars={comboStreak >= 5 ? 3 : 2}
        missedQuestions={missedQuestions}
        onPlayAgain={restartGame}
      />
    </div>
  );
}
```

- [ ] **Step 3: Register in `src/data/games.json`**

Add the game entry to `src/data/games.json`:
```json
  {
    "id": "vocab-defense",
    "slug": "vocab-defense",
    "titleVi": "Hiệp sĩ Từ vựng",
    "titleEn": "Word Knight: RPG Battle",
    "description": "Chiến đấu theo lượt tiêu diệt quái vật bằng kiến thức từ vựng, phát âm và ngữ pháp",
    "emoji": "⚔️",
    "route": "/games/vocab-defense",
    "priority": 13
  }
```

- [ ] **Step 4: Run full test suite**

Run: `npm run test:run`
Expected: All unit and component tests pass without errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/games/vocab-defense/page.tsx src/data/games.json tests/e2e/vocab-defense.spec.ts
git commit -m "feat(vocab-defense): assemble page route and register game in GameHub catalog"
```
