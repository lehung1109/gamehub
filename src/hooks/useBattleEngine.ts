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
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const waveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const usedWordIdsRef = useRef<string[]>([]);

  const battleStateRef = useRef<BattleState>("STAGE_INTRO");
  const activeChallengeRef = useRef<ChallengeQuestion | null>(null);
  const heroHpRef = useRef(100);
  const heroEnergyRef = useRef(0);
  const heroShieldRef = useRef(0);
  const comboStreakRef = useRef(0);
  const monsterHpRef = useRef(STAGE_MONSTERS[0].maxHp);
  const currentWaveIndexRef = useRef(0);
  const turnTimerRef = useRef(20);

  const clearTurnTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearTurnTimer();
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
      actionTimeoutRef.current = null;
    }
    if (waveTimeoutRef.current) {
      clearTimeout(waveTimeoutRef.current);
      waveTimeoutRef.current = null;
    }
  }, [clearTurnTimer]);

  const skipIntro = useCallback(() => {
    if (battleStateRef.current !== "STAGE_INTRO") return;
    battleStateRef.current = "PLAYER_TURN";
    setBattleState("PLAYER_TURN");
    turnTimerRef.current = 20;
    setTurnTimer(20);
  }, []);

  const resolveTurnOutcome = useCallback(
    (isCorrect: boolean, selectedAnswerText: string) => {
      clearTurnTimer();
      battleStateRef.current = "RESOLVING_ACTION";
      setBattleState("RESOLVING_ACTION");

      const challenge = activeChallengeRef.current;
      const waveIdx = currentWaveIndexRef.current;
      const monster = STAGE_MONSTERS[waveIdx] || STAGE_MONSTERS[0];

      if (isCorrect) {
        let dmg = 40;
        if (challenge?.type === "ULTIMATE") {
          dmg = 100;
          heroEnergyRef.current = 0;
          setHeroEnergy(0);
        } else if (challenge?.type === "SHIELD") {
          dmg = 20;
          heroHpRef.current = Math.min(maxHeroHp, heroHpRef.current + 25);
          setHeroHp(heroHpRef.current);
          heroShieldRef.current += 20;
          setHeroShield(heroShieldRef.current);
        } else {
          heroEnergyRef.current = Math.min(100, heroEnergyRef.current + 25);
          setHeroEnergy(heroEnergyRef.current);
        }

        const nextCombo = comboStreakRef.current + 1;
        comboStreakRef.current = nextCombo;
        setComboStreak(nextCombo);
        const comboMultiplier =
          nextCombo >= 7 ? 2.0 : nextCombo >= 5 ? 1.5 : nextCombo >= 3 ? 1.2 : 1.0;
        setScore((prev) => prev + Math.round(100 * comboMultiplier));

        monsterHpRef.current = Math.max(0, monsterHpRef.current - dmg);
        setCurrentMonsterHp(monsterHpRef.current);
        setCombatFeedback({
          text: `CORRECT! -${dmg} DMG`,
          isCorrect: true,
          explanation: challenge?.explanation,
        });
      } else {
        comboStreakRef.current = 0;
        setComboStreak(0);
        if (challenge) {
          setMissedQuestions((prev) => [
            ...prev,
            {
              question: challenge,
              selectedAnswer: selectedAnswerText,
              correctAnswer: challenge.options[challenge.correctIndex],
              timestamp: Date.now(),
            },
          ]);
        }

        let rawDmg = monster.damage;
        if (heroShieldRef.current > 0) {
          rawDmg = Math.round(rawDmg * 0.5);
          heroShieldRef.current = Math.max(0, heroShieldRef.current - 20);
          setHeroShield(heroShieldRef.current);
        }
        heroHpRef.current = Math.max(0, heroHpRef.current - rawDmg);
        setHeroHp(heroHpRef.current);
        setCombatFeedback({
          text: `MISSED! -${rawDmg} HP`,
          isCorrect: false,
          explanation: challenge?.explanation,
        });
      }

      actionTimeoutRef.current = setTimeout(() => {
        setCombatFeedback(null);
        activeChallengeRef.current = null;
        setActiveChallenge(null);

        // Check Health
        if (heroHpRef.current <= 0) {
          battleStateRef.current = "DEFEAT";
          setBattleState("DEFEAT");
          return;
        }

        if (monsterHpRef.current <= 0) {
          if (currentWaveIndexRef.current + 1 < STAGE_MONSTERS.length) {
            battleStateRef.current = "WAVE_TRANSITION";
            setBattleState("WAVE_TRANSITION");
            waveTimeoutRef.current = setTimeout(() => {
              const nextIdx = currentWaveIndexRef.current + 1;
              currentWaveIndexRef.current = nextIdx;
              setCurrentWaveIndex(nextIdx);
              monsterHpRef.current = STAGE_MONSTERS[nextIdx].maxHp;
              setCurrentMonsterHp(STAGE_MONSTERS[nextIdx].maxHp);
              battleStateRef.current = "PLAYER_TURN";
              setBattleState("PLAYER_TURN");
              turnTimerRef.current = 20;
              setTurnTimer(20);
            }, 1500);
          } else {
            battleStateRef.current = "VICTORY";
            setBattleState("VICTORY");
          }
        } else {
          battleStateRef.current = "PLAYER_TURN";
          setBattleState("PLAYER_TURN");
          turnTimerRef.current = 20;
          setTurnTimer(20);
        }
      }, 2000);
    },
    [clearTurnTimer]
  );

  const selectSkill = useCallback(
    (skill: SkillType) => {
      if (battleStateRef.current !== "PLAYER_TURN") return;
      if (skill === "ULTIMATE" && heroEnergyRef.current < 100) return;

      const challenge = generateChallenge(skill, usedWordIdsRef.current);
      usedWordIdsRef.current.push(challenge.id);
      activeChallengeRef.current = challenge;
      setActiveChallenge(challenge);
      battleStateRef.current = "CHALLENGE_ACTIVE";
      setBattleState("CHALLENGE_ACTIVE");

      const isBoss = currentWaveIndexRef.current === STAGE_MONSTERS.length - 1;
      const isBossEnraged =
        isBoss &&
        monsterHpRef.current < (STAGE_MONSTERS[currentWaveIndexRef.current]?.maxHp || 180) * 0.3;
      const timerVal = isBossEnraged ? 15 : 20;
      turnTimerRef.current = timerVal;
      setTurnTimer(timerVal);
    },
    []
  );

  const submitAnswer = useCallback(
    (index: number) => {
      if (battleStateRef.current !== "CHALLENGE_ACTIVE" || !activeChallengeRef.current) return;
      const challenge = activeChallengeRef.current;
      const isCorrect = index === challenge.correctIndex;
      resolveTurnOutcome(isCorrect, challenge.options[index] || "None");
    },
    [resolveTurnOutcome]
  );

  const consumePotion = useCallback(() => {
    if (
      potionsLeft <= 0 ||
      heroHpRef.current <= 0 ||
      heroHpRef.current >= maxHeroHp ||
      battleStateRef.current === "DEFEAT"
    ) {
      return;
    }
    setPotionsLeft((prev) => prev - 1);
    heroHpRef.current = Math.min(maxHeroHp, heroHpRef.current + 40);
    setHeroHp(heroHpRef.current);
  }, [potionsLeft]);

  const restartGame = useCallback(() => {
    clearAllTimers();
    heroHpRef.current = 100;
    heroEnergyRef.current = 0;
    heroShieldRef.current = 0;
    comboStreakRef.current = 0;
    monsterHpRef.current = STAGE_MONSTERS[0].maxHp;
    currentWaveIndexRef.current = 0;
    battleStateRef.current = "STAGE_INTRO";
    activeChallengeRef.current = null;
    turnTimerRef.current = 20;

    setHeroHp(100);
    setHeroEnergy(0);
    setHeroShield(0);
    setPotionsLeft(1);
    setCurrentWaveIndex(0);
    setCurrentMonsterHp(STAGE_MONSTERS[0].maxHp);
    setActiveChallenge(null);
    setTurnTimer(20);
    setScore(0);
    setComboStreak(0);
    setMissedQuestions([]);
    setCombatFeedback(null);
    setBattleState("STAGE_INTRO");
    usedWordIdsRef.current = [];
  }, [clearAllTimers]);

  // Timer Tick
  useEffect(() => {
    if (battleState === "CHALLENGE_ACTIVE") {
      timerRef.current = setInterval(() => {
        turnTimerRef.current -= 1;
        setTurnTimer(turnTimerRef.current);
        if (turnTimerRef.current <= 0) {
          clearTurnTimer();
          resolveTurnOutcome(false, "Timeout");
        }
      }, 1000);
    }
    return () => clearTurnTimer();
  }, [battleState, resolveTurnOutcome, clearTurnTimer]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

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
