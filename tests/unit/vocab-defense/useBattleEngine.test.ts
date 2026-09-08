import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBattleEngine, STAGE_MONSTERS } from "@/hooks/useBattleEngine";

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
    expect(result.current.missedQuestions).toHaveLength(1);
  });

  it("handles turn timeout as a missed question", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
      result.current.selectSkill("ATTACK");
    });

    expect(result.current.battleState).toBe("CHALLENGE_ACTIVE");

    // Advance timers by 20 seconds
    act(() => {
      vi.advanceTimersByTime(20000);
    });

    expect(result.current.battleState).toBe("RESOLVING_ACTION");
    expect(result.current.heroHp).toBeLessThan(100);
    expect(result.current.missedQuestions).toHaveLength(1);
    expect(result.current.missedQuestions[0].selectedAnswer).toBe("Timeout");
  });

  it("handles potion consumption to restore HP", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
      result.current.selectSkill("ATTACK");
    });

    // Cause damage
    const wrongIndex = (result.current.activeChallenge!.correctIndex + 1) % 4;
    act(() => {
      result.current.submitAnswer(wrongIndex);
    });

    const damagedHp = result.current.heroHp;
    expect(damagedHp).toBeLessThan(100);
    expect(result.current.potionsLeft).toBe(1);

    act(() => {
      result.current.consumePotion();
    });

    expect(result.current.potionsLeft).toBe(0);
    expect(result.current.heroHp).toBe(Math.min(100, damagedHp + 40));

    // Consuming when 0 potions left does nothing
    act(() => {
      result.current.consumePotion();
    });
    expect(result.current.potionsLeft).toBe(0);
  });

  it("prevents ULTIMATE skill when energy < 100", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
      result.current.selectSkill("ULTIMATE");
    });

    // Should remain in PLAYER_TURN since energy is 0
    expect(result.current.battleState).toBe("PLAYER_TURN");
    expect(result.current.activeChallenge).toBeNull();
  });

  it("allows ULTIMATE skill when energy is 100 and deals 100 damage", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
    });

    // Hit 1 on Slime: 40 dmg (10 HP left, +25 energy)
    act(() => {
      result.current.selectSkill("ATTACK");
    });
    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Hit 2 on Slime: 40 dmg (Slime defeated, +25 energy -> 50)
    act(() => {
      result.current.selectSkill("ATTACK");
    });
    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });
    act(() => {
      vi.advanceTimersByTime(2000 + 1500); // 2000ms resolution + 1500ms wave transition
    });

    // Hit 3 on Goblin (65 HP): 40 dmg (25 HP left, +25 energy -> 75)
    act(() => {
      result.current.selectSkill("ATTACK");
    });
    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Hit 4 on Goblin: 40 dmg (Goblin defeated, +25 energy -> 100)
    act(() => {
      result.current.selectSkill("ATTACK");
    });
    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });
    act(() => {
      vi.advanceTimersByTime(2000 + 1500); // 2000ms resolution + 1500ms wave transition
    });

    expect(result.current.heroEnergy).toBe(100);
    expect(result.current.battleState).toBe("PLAYER_TURN");

    act(() => {
      result.current.selectSkill("ULTIMATE");
    });

    expect(result.current.battleState).toBe("CHALLENGE_ACTIVE");
    expect(result.current.activeChallenge?.type).toBe("ULTIMATE");

    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });

    expect(result.current.heroEnergy).toBe(0);
  });

  it("heals and adds shield when SHIELD skill is answered correctly", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
      result.current.selectSkill("ATTACK");
    });

    // Take damage first
    const wrongIndex = (result.current.activeChallenge!.correctIndex + 1) % 4;
    act(() => {
      result.current.submitAnswer(wrongIndex);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.battleState).toBe("PLAYER_TURN");
    const hpBeforeShield = result.current.heroHp;

    act(() => {
      result.current.selectSkill("SHIELD");
    });
    expect(result.current.battleState).toBe("CHALLENGE_ACTIVE");

    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });

    expect(result.current.heroHp).toBe(Math.min(100, hpBeforeShield + 25));
    expect(result.current.heroShield).toBe(20);
  });

  it("absorbs 50% damage with shield when answering incorrectly", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
      result.current.selectSkill("SHIELD");
    });

    // Gain shield
    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.heroShield).toBe(20);
    const hpBeforeDmg = result.current.heroHp;

    // Fail attack
    act(() => {
      result.current.selectSkill("ATTACK");
    });
    const wrongIndex = (result.current.activeChallenge!.correctIndex + 1) % 4;
    act(() => {
      result.current.submitAnswer(wrongIndex);
    });

    // Normal damage is 15 (Slime). With shield: Math.round(15 * 0.5) = 8
    expect(result.current.heroHp).toBe(hpBeforeDmg - 8);
    expect(result.current.heroShield).toBe(0);
  });

  it("transitions between waves when a monster is defeated", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
    });

    // Wave 0 monster: Forest Slime has 50 HP.
    // Attack 1: deals 40 dmg -> 10 HP left
    act(() => {
      result.current.selectSkill("ATTACK");
    });
    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.battleState).toBe("PLAYER_TURN");
    expect(result.current.currentMonsterHp).toBe(10);

    // Attack 2: deals 40 dmg -> 0 HP left (slime defeated)
    act(() => {
      result.current.selectSkill("ATTACK");
    });
    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });

    // State becomes RESOLVING_ACTION, then after 2000ms becomes WAVE_TRANSITION
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.battleState).toBe("WAVE_TRANSITION");

    // After 1500ms transition time, enters PLAYER_TURN of wave 1
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.battleState).toBe("PLAYER_TURN");
    expect(result.current.currentWaveIndex).toBe(1);
    expect(result.current.currentMonster.name).toBe("Shadow Goblin");
    expect(result.current.currentMonsterHp).toBe(STAGE_MONSTERS[1].maxHp);
  });

  it("triggers DEFEAT when hero HP reaches 0", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
    });

    // Forest Slime deals 15 damage per hit. Hero has 100 HP.
    // 7 misses * 15 = 105 dmg -> 0 HP
    for (let i = 0; i < 7; i++) {
      act(() => {
        result.current.selectSkill("ATTACK");
      });
      const wrongIndex = (result.current.activeChallenge!.correctIndex + 1) % 4;
      act(() => {
        result.current.submitAnswer(wrongIndex);
      });
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      if (result.current.battleState === "DEFEAT") break;
    }

    expect(result.current.battleState).toBe("DEFEAT");
    expect(result.current.heroHp).toBe(0);
  });

  it("resets state when restartGame is called", () => {
    const { result } = renderHook(() => useBattleEngine());
    act(() => {
      result.current.skipIntro();
      result.current.selectSkill("ATTACK");
    });

    act(() => {
      result.current.submitAnswer(result.current.activeChallenge!.correctIndex);
    });

    act(() => {
      result.current.restartGame();
    });

    expect(result.current.battleState).toBe("STAGE_INTRO");
    expect(result.current.heroHp).toBe(100);
    expect(result.current.heroEnergy).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.comboStreak).toBe(0);
    expect(result.current.currentWaveIndex).toBe(0);
  });
});
