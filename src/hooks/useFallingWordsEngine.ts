"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  FallingWord,
  PoppedWordSummary,
  VocabularyItem,
} from "@/types/falling-words";
import {
  getWordsForTopic,
  createFallingWord,
  selectAvailableLane,
} from "@/lib/falling-words/falling-words-spawner";

export function useFallingWordsEngine(initialTopicId: string = "animals") {
  const [topicId, setTopicIdState] = useState(initialTopicId);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [targetWordId, setTargetWordId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [bombsAvailable, setBombsAvailable] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [wordsPopped, setWordsPopped] = useState<PoppedWordSummary[]>([]);
  const [lastPoppedWord, setLastPoppedWord] = useState<PoppedWordSummary | null>(null);

  // Synchronous refs to prevent stale closure issues in high-frequency event loops
  const fallingWordsRef = useRef<FallingWord[]>([]);
  const targetWordIdRef = useRef<string | null>(null);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const timeLeftRef = useRef(60);
  const bombsAvailableRef = useRef(0);
  const isFrozenRef = useRef(false);
  const isGameOverRef = useRef(false);
  const topicIdRef = useRef(initialTopicId);

  const wordQueueRef = useRef<VocabularyItem[]>([]);
  const spawnTimerRef = useRef(0);
  const freezeTimerRef = useRef(0);

  const initQueue = useCallback((topic: string) => {
    const list = getWordsForTopic(topic);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    wordQueueRef.current = shuffled;
  }, []);

  useEffect(() => {
    topicIdRef.current = topicId;
    initQueue(topicId);
  }, [topicId, initQueue]);

  const setTopicId = useCallback(
    (newTopicId: string) => {
      topicIdRef.current = newTopicId;
      setTopicIdState(newTopicId);
      initQueue(newTopicId);
    },
    [initQueue]
  );

  const restartGame = useCallback(
    (newTopicId?: string) => {
      const tId = newTopicId || topicIdRef.current;
      topicIdRef.current = tId;
      setTopicIdState(tId);
      initQueue(tId);

      fallingWordsRef.current = [];
      setFallingWords([]);

      targetWordIdRef.current = null;
      setTargetWordId(null);

      scoreRef.current = 0;
      setScore(0);

      comboRef.current = 0;
      setCombo(0);

      maxComboRef.current = 0;
      setMaxCombo(0);

      livesRef.current = 3;
      setLives(3);

      timeLeftRef.current = 60;
      setTimeLeft(60);

      bombsAvailableRef.current = 0;
      setBombsAvailable(0);

      isFrozenRef.current = false;
      setIsFrozen(false);

      isGameOverRef.current = false;
      setIsGameOver(false);
      setIsVictory(false);

      setWordsPopped([]);
      setLastPoppedWord(null);

      spawnTimerRef.current = 0;
      freezeTimerRef.current = 0;
    },
    [initQueue]
  );

  const spawnWordWithProperties = useCallback(
    (props: Partial<FallingWord> & { word: string; clue: string }) => {
      const newWord: FallingWord = {
        id: props.id ?? `word-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        word: props.word.toUpperCase(),
        clue: props.clue,
        phonetic: props.phonetic,
        emoji: props.emoji,
        lane: props.lane ?? 0,
        y: props.y ?? 0,
        speed: props.speed ?? 12,
        typedIndex: props.typedIndex ?? 0,
        isTargeted: props.isTargeted ?? false,
        specialType: props.specialType,
      };

      fallingWordsRef.current = [...fallingWordsRef.current, newWord];
      setFallingWords(fallingWordsRef.current);
    },
    []
  );

  const awardBomb = useCallback(() => {
    const next = Math.min(2, bombsAvailableRef.current + 1);
    bombsAvailableRef.current = next;
    setBombsAvailable(next);
  }, []);

  const typeLetter = useCallback((char: string) => {
    if (isGameOverRef.current || livesRef.current <= 0 || timeLeftRef.current <= 0) {
      return { matched: false, popped: false };
    }

    const inputChar = char.toUpperCase();
    const currentWords = fallingWordsRef.current;
    let currentTargetId = targetWordIdRef.current;
    let targetedWord = currentWords.find((w) => w.id === currentTargetId);

    // Auto-lock lowest matching word when untargeted
    if (!targetedWord) {
      const candidates = currentWords
        .filter((w) => w.word.length > 0 && w.word[0] === inputChar)
        .sort((a, b) => b.y - a.y);

      if (candidates.length > 0) {
        targetedWord = candidates[0];
        currentTargetId = targetedWord.id;
        targetWordIdRef.current = currentTargetId;
        setTargetWordId(currentTargetId);
      }
    }

    if (!targetedWord) {
      return { matched: false, popped: false };
    }

    const expectedChar = targetedWord.word[targetedWord.typedIndex];
    if (inputChar === expectedChar) {
      const nextIndex = targetedWord.typedIndex + 1;

      // Check if word is completely typed
      if (nextIndex >= targetedWord.word.length) {
        const poppedItem: PoppedWordSummary = {
          word: targetedWord.word,
          clue: targetedWord.clue,
          phonetic: targetedWord.phonetic,
          emoji: targetedWord.emoji,
        };

        const heightBonus = Math.floor((100 - targetedWord.y) * 0.5);
        const comboBonus = Math.min(100, comboRef.current * 10);
        let wordScore = 50 + heightBonus + comboBonus;

        if (targetedWord.specialType === "double_score") {
          wordScore *= 2;
        } else if (targetedWord.specialType === "heal_life") {
          const newLives = Math.min(3, livesRef.current + 1);
          livesRef.current = newLives;
          setLives(newLives);
        } else if (targetedWord.specialType === "slow_freeze") {
          isFrozenRef.current = true;
          setIsFrozen(true);
          freezeTimerRef.current = 4;
        }

        scoreRef.current += wordScore;
        setScore(scoreRef.current);

        const nextCombo = comboRef.current + 1;
        comboRef.current = nextCombo;
        setCombo(nextCombo);

        if (nextCombo > maxComboRef.current) {
          maxComboRef.current = nextCombo;
          setMaxCombo(nextCombo);
        }

        // Combo milestones: 5 combo -> freeze 3s; 10, 20... combo -> +1 bomb
        if (nextCombo === 5) {
          isFrozenRef.current = true;
          setIsFrozen(true);
          freezeTimerRef.current = 3;
        } else if (nextCombo > 0 && nextCombo % 10 === 0) {
          const nextBombs = Math.min(2, bombsAvailableRef.current + 1);
          bombsAvailableRef.current = nextBombs;
          setBombsAvailable(nextBombs);
        }

        setWordsPopped((wp) => [...wp, poppedItem]);
        setLastPoppedWord(poppedItem);

        targetWordIdRef.current = null;
        setTargetWordId(null);

        const nextWords = currentWords.filter((w) => w.id !== targetedWord!.id);
        fallingWordsRef.current = nextWords;
        setFallingWords(nextWords);

        return { matched: true, popped: true, word: poppedItem };
      } else {
        const nextWords = currentWords.map((w) =>
          w.id === targetedWord!.id
            ? { ...w, typedIndex: nextIndex, isTargeted: true }
            : { ...w, isTargeted: false }
        );
        fallingWordsRef.current = nextWords;
        setFallingWords(nextWords);

        return { matched: true, popped: false };
      }
    }

    return { matched: false, popped: false };
  }, []);

  const triggerBomb = useCallback(() => {
    if (
      bombsAvailableRef.current <= 0 ||
      fallingWordsRef.current.length === 0 ||
      isGameOverRef.current
    ) {
      return false;
    }

    const nextBombs = Math.max(0, bombsAvailableRef.current - 1);
    bombsAvailableRef.current = nextBombs;
    setBombsAvailable(nextBombs);

    const wordsToClear = fallingWordsRef.current;
    const points = wordsToClear.length * 50;
    scoreRef.current += points;
    setScore(scoreRef.current);

    const cleared: PoppedWordSummary[] = wordsToClear.map((w) => ({
      word: w.word,
      clue: w.clue,
      phonetic: w.phonetic,
      emoji: w.emoji,
    }));
    setWordsPopped((prev) => [...prev, ...cleared]);

    fallingWordsRef.current = [];
    setFallingWords([]);

    targetWordIdRef.current = null;
    setTargetWordId(null);

    return true;
  }, []);

  const updatePhysics = useCallback(
    (dt: number) => {
      if (isGameOverRef.current || livesRef.current <= 0 || timeLeftRef.current <= 0) {
        return;
      }

      if (isFrozenRef.current) {
        freezeTimerRef.current -= dt;
        if (freezeTimerRef.current <= 0) {
          isFrozenRef.current = false;
          setIsFrozen(false);
        }
      }

      const currentWords = fallingWordsRef.current;
      const remaining: FallingWord[] = [];
      let livesLost = 0;

      for (const word of currentWords) {
        const moveSpeed = isFrozenRef.current ? 0 : word.speed;
        const newY = word.y + moveSpeed * dt;

        if (newY >= 95) {
          livesLost++;
          if (targetWordIdRef.current === word.id) {
            targetWordIdRef.current = null;
            setTargetWordId(null);
          }
        } else {
          remaining.push({
            ...word,
            y: newY,
            isTargeted: word.id === targetWordIdRef.current,
          });
        }
      }

      if (livesLost > 0) {
        comboRef.current = 0;
        setCombo(0);

        const nextLives = Math.max(0, livesRef.current - livesLost);
        livesRef.current = nextLives;
        setLives(nextLives);

        if (nextLives === 0) {
          isGameOverRef.current = true;
          setIsGameOver(true);
          setIsVictory(false);
        }
      }

      let nextWords = remaining;

      // Word Spawning
      spawnTimerRef.current += dt;
      const currentTimeLeft = timeLeftRef.current;
      const spawnInterval = Math.max(1.5, 2.2 - ((60 - currentTimeLeft) / 60) * 0.7);

      if (spawnTimerRef.current >= spawnInterval) {
        spawnTimerRef.current = 0;

        if (nextWords.length < 6) {
          if (wordQueueRef.current.length === 0) {
            initQueue(topicIdRef.current);
          }
          const nextVocab = wordQueueRef.current.shift();
          if (nextVocab) {
            const activeLanes = nextWords.map((w) => w.lane);
            const lane = selectAvailableLane(activeLanes);
            const baseSpeed = 9 + ((60 - currentTimeLeft) / 60) * 6;
            const newWord = createFallingWord(nextVocab, lane, baseSpeed);
            nextWords = [...nextWords, newWord];
          }
        }
      }

      fallingWordsRef.current = nextWords;
      setFallingWords(nextWords);
    },
    [initQueue]
  );

  // 60-second countdown timer
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          isGameOverRef.current = true;
          setIsGameOver(true);
          setIsVictory(livesRef.current > 0);
          timeLeftRef.current = 0;
          return 0;
        }
        const next = t - 1;
        timeLeftRef.current = next;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver]);

  return {
    topicId,
    fallingWords,
    targetWordId,
    score,
    combo,
    maxCombo,
    lives,
    timeLeft,
    bombsAvailable,
    isFrozen,
    isGameOver,
    isVictory,
    wordsPopped,
    lastPoppedWord,
    typeLetter,
    triggerBomb,
    updatePhysics,
    restartGame,
    setTopicId,
    awardBomb,
    spawnWordWithProperties,
  };
}
