// src/hooks/useGrammarDetective.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { tokenizeCaseDocument } from '@/lib/grammar-detective-tokenizer';
import type {
  CaseFile,
  CaseError,
  TextToken,
  GameStatus,
  RankTier,
} from '@/types/grammar-detective';

const STORAGE_KEY = 'gamehub_grammar_detective_v1';

export interface DetectiveFeedback {
  type: 'false_alarm' | 'correct' | 'wrong_option' | 'resolved';
  messageEn: string;
  messageVi: string;
}

export function calculateRankTier(solvedCount: number): RankTier {
  if (solvedCount >= 9) return 'chief';
  if (solvedCount >= 6) return 'senior';
  if (solvedCount >= 3) return 'junior';
  return 'intern';
}

export function useGrammarDetective(initialCases: CaseFile[]) {
  const [currentCase, setCurrentCase] = useState<CaseFile | null>(null);
  const [tokens, setTokens] = useState<TextToken[]>([]);
  const [credibility, setCredibility] = useState<number>(3);
  const maxCredibility = 3;
  const [solvedErrorIds, setSolvedErrorIds] = useState<string[]>([]);
  const [activeError, setActiveError] = useState<CaseError | null>(null);
  const [status, setStatus] = useState<GameStatus>('selecting');
  const [highlighterActive, setHighlighterActive] = useState<boolean>(true);
  const [mistakes, setMistakes] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.highestStreak === 'number') {
          return parsed.highestStreak;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
    return 0;
  });
  const [lastFeedback, setLastFeedback] = useState<DetectiveFeedback | null>(null);
  const [mode, setMode] = useState<'case' | 'endless'>('case');

  const [completedCaseIds, setCompletedCaseIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.completedCaseIds)) {
          return parsed.completedCaseIds;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
    return [];
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save progress when completedCaseIds change
  const saveProgress = useCallback((newCompletedIds: string[], currentStreakVal?: number) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          completedCaseIds: newCompletedIds,
          highestStreak: currentStreakVal ?? streak,
        })
      );
    } catch {
      // Ignore localStorage write errors
    }
  }, [streak]);

  // Elapsed timer loop during investigation
  useEffect(() => {
    if (status === 'investigating' || status === 'deducing') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const selectCase = useCallback(
    (caseId: string) => {
      const target = initialCases.find((c) => c.id === caseId);
      if (!target) return;

      const newTokens = tokenizeCaseDocument(target.documentText, target.errors);
      setCurrentCase(target);
      setTokens(newTokens);
      setCredibility(3);
      setSolvedErrorIds([]);
      setActiveError(null);
      setMistakes(0);
      setElapsedSeconds(0);
      setStarsEarned(0);
      setStartTime(Date.now());
      setLastFeedback(null);
      setMode('case');
      setStatus('investigating');
    },
    [initialCases]
  );

  const toggleHighlighter = useCallback(() => {
    setHighlighterActive((prev) => !prev);
  }, []);

  const tapToken = useCallback(
    (tokenId: string) => {
      if (status !== 'investigating') return;

      const tokenIndex = tokens.findIndex((t) => t.id === tokenId);
      if (tokenIndex === -1) return;

      const token = tokens[tokenIndex];
      if (!token.isWord) return;

      // Already corrected
      if (token.isCorrected) {
        setLastFeedback({
          type: 'resolved',
          messageEn: 'This clue has already been solved.',
          messageVi: 'Manh mối này đã được sửa chính xác.',
        });
        return;
      }

      // If token is associated with an error
      if (token.errorId) {
        if (solvedErrorIds.includes(token.errorId)) {
          setLastFeedback({
            type: 'resolved',
            messageEn: 'Already resolved.',
            messageVi: 'Lỗi này đã được sửa xong.',
          });
          return;
        }

        const foundError = currentCase?.errors.find((e) => e.id === token.errorId);
        if (foundError) {
          setActiveError(foundError);
          setStatus('deducing');
          setLastFeedback(null);
        }
        return;
      }

      // False alarm (tapping innocent word)
      const nextCred = credibility - 1;
      setMistakes((prev) => prev + 1);
      setCredibility(nextCred);

      if (nextCred <= 0) {
        setStatus('cold');
        setLastFeedback({
          type: 'false_alarm',
          messageEn: 'Case Cold: Detective Credibility exhausted!',
          messageVi: 'Hết điểm uy tín! Vụ án bị đình chỉ.',
        });
      } else {
        setLastFeedback({
          type: 'false_alarm',
          messageEn: `No clue here. "${token.text}" is grammatically sound. (-1 Credibility)`,
          messageVi: `Không có lỗi. Từ "${token.text}" dùng đúng ngữ pháp. (-1 Uy tín)`,
        });
      }
    },
    [status, tokens, solvedErrorIds, currentCase, credibility]
  );

  const submitDeduction = useCallback(
    (optionId: string): boolean => {
      if (!activeError || !currentCase) return false;

      const selectedOption = activeError.options.find((opt) => opt.id === optionId);
      if (!selectedOption) return false;

      if (selectedOption.isCorrect) {
        // Mark error as solved
        const newSolved = [...solvedErrorIds, activeError.id];
        setSolvedErrorIds(newSolved);

        // Update token text in-place
        setTokens((prev) =>
          prev.map((tok) => {
            if (tok.errorId === activeError.id) {
              return {
                ...tok,
                text: selectedOption.text,
                isCorrected: true,
              };
            }
            return tok;
          })
        );

        setLastFeedback({
          type: 'correct',
          messageEn: `Correct deduction! ${selectedOption.feedbackEn}`,
          messageVi: `Suy luận chuẩn xác! ${selectedOption.feedbackVi}`,
        });

        // Check if all errors are solved
        if (newSolved.length >= currentCase.errors.length) {
          const stars = credibility === 3 ? 3 : credibility === 2 ? 2 : 1;
          setStarsEarned(stars);
          setStatus('solved');

          // Save completed case
          if (!completedCaseIds.includes(currentCase.id)) {
            const updatedCompleted = [...completedCaseIds, currentCase.id];
            setCompletedCaseIds(updatedCompleted);
            saveProgress(updatedCompleted);
          }
        } else {
          setStatus('investigating');
        }

        setActiveError(null);
        return true;
      } else {
        // Wrong option selected
        const nextCred = credibility - 1;
        setMistakes((prev) => prev + 1);
        setCredibility(nextCred);

        if (nextCred <= 0) {
          setStatus('cold');
          setActiveError(null);
          setLastFeedback({
            type: 'wrong_option',
            messageEn: 'Case Cold: Detective Credibility exhausted!',
            messageVi: 'Hết điểm uy tín! Vụ án bị đình chỉ.',
          });
        } else {
          setLastFeedback({
            type: 'wrong_option',
            messageEn: selectedOption.feedbackEn,
            messageVi: selectedOption.feedbackVi,
          });
        }
        return false;
      }
    },
    [activeError, currentCase, solvedErrorIds, credibility, completedCaseIds, saveProgress]
  );

  const closeDeduction = useCallback(() => {
    setActiveError(null);
    if (status === 'deducing') {
      setStatus('investigating');
    }
  }, [status]);

  const retryCase = useCallback(() => {
    if (currentCase) {
      selectCase(currentCase.id);
    }
  }, [currentCase, selectCase]);

  const returnToDossier = useCallback(() => {
    setStatus('selecting');
    setCurrentCase(null);
    setActiveError(null);
    setTokens([]);
    setLastFeedback(null);
  }, []);

  const userRank = calculateRankTier(completedCaseIds.length);

  return {
    mode,
    currentCase,
    tokens,
    credibility,
    maxCredibility,
    solvedErrorIds,
    activeError,
    status,
    highlighterActive,
    mistakes,
    startTime,
    elapsedSeconds,
    starsEarned,
    userRank,
    completedCaseIds,
    streak,
    setStreak,
    lastFeedback,
    selectCase,
    toggleHighlighter,
    tapToken,
    submitDeduction,
    closeDeduction,
    retryCase,
    returnToDossier,
  };
}
