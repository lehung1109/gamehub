import { useState, useEffect } from 'react';
import { shuffleArray } from '../lib/utils';

export function useSessionQuestions<T extends { id: string }>(
  questions: T[],
  count: number,
  storageKey: string
): T[] {
  const [selectedQuestions, setSelectedQuestions] = useState<T[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || questions.length === 0) return;

    const actualCount = Math.min(count, questions.length);
    const historyKey = `${storageKey}-history`;

    const loadQuestions = () => {
      try {
        // 1. Try to load existing session (page reload persistence)
        const storedIdsStr = sessionStorage.getItem(storageKey);
        if (storedIdsStr) {
          const storedIds: string[] = JSON.parse(storedIdsStr);
          const mapped = storedIds
            .map(id => questions.find(q => q.id === id))
            .filter((q): q is T => q !== undefined);
          
          console.log('MAPPED LENGTH:', mapped.length, 'ACTUAL COUNT:', actualCount, 'STORED:', storedIdsStr); if (mapped.length === actualCount) {
            setSelectedQuestions(prev => {
              // Compare IDs to prevent unnecessary re-renders
              const isSame = prev.length === mapped.length && prev.every((p, i) => p.id === mapped[i].id);
              return isSame ? prev : mapped;
            });
            return; // We have a valid session, don't update history
          }
        }
      } catch (e) {
        console.error('Error reading from sessionStorage:', e);
      }

      // 2. We need to generate a new session. Let's use the history tracker.
      let seenIds: string[] = [];
      try {
        const historyStr = sessionStorage.getItem(historyKey);
        if (historyStr) {
          seenIds = JSON.parse(historyStr);
        }
      } catch (e) {
        console.error('Error reading history from sessionStorage:', e);
      }

      const unseen = questions.filter(q => !seenIds.includes(q.id));
      let selected: T[] = [];

      if (unseen.length >= actualCount) {
        // We have enough unseen questions
        const shuffledUnseen = shuffleArray(unseen);
        selected = shuffledUnseen.slice(0, actualCount);
        seenIds = [...seenIds, ...selected.map(q => q.id)];
      } else if (unseen.length > 0 && unseen.length < actualCount) {
        // Not enough unseen questions, we need to wrap around
        const unseenPicked = [...unseen];
        const remainingNeeded = actualCount - unseen.length;
        
        // Exclude the ones we just picked
        const remainingPool = questions.filter(q => !unseenPicked.map(s => s.id).includes(q.id));
        const shuffledRemaining = shuffleArray(remainingPool);
        const additional = shuffledRemaining.slice(0, remainingNeeded);
        
        // Combine and shuffle so unseen aren't predictably first
        selected = shuffleArray([...unseenPicked, ...additional]);
        seenIds = selected.map(q => q.id); // Reset history to just the newly picked
      } else {
        // unseen.length === 0, completely exhausted
        seenIds = [];
        const shuffledPool = shuffleArray(questions);
        selected = shuffledPool.slice(0, actualCount);
        seenIds = selected.map(q => q.id); // Reset history to just the newly picked
      }

      try {
        sessionStorage.setItem(storageKey, JSON.stringify(selected.map(q => q.id)));
        sessionStorage.setItem(historyKey, JSON.stringify(seenIds));
      } catch (e) {
        console.error('Error saving to sessionStorage:', e);
      }

      setSelectedQuestions(prev => {
        const isSame = prev.length === selected.length && prev.every((p, i) => p.id === selected[i].id);
        return isSame ? prev : selected;
      });
    };

    loadQuestions();
  }, [questions, count, storageKey]);

  return selectedQuestions;
}
