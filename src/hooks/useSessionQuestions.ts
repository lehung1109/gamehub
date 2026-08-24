import { useState, useEffect } from 'react';
import { shuffleArray } from '../lib/utils';

export function useSessionQuestions<T extends { id: string }>(
  questions: T[],
  count: number,
  storageKey: string
): T[] {
  const [selectedQuestions, setSelectedQuestions] = useState<T[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadQuestions = () => {
      try {
        const storedIdsStr = sessionStorage.getItem(storageKey);
        if (storedIdsStr) {
          const storedIds: string[] = JSON.parse(storedIdsStr);
          const mapped = storedIds
            .map(id => questions.find(q => q.id === id))
            .filter((q): q is T => q !== undefined);
          
          if (mapped.length === count) {
            setSelectedQuestions(mapped);
            return;
          }
        }
      } catch (e) {
        console.error('Error reading from sessionStorage:', e);
      }

      const shuffled = shuffleArray(questions);
      const selected = shuffled.slice(0, count);
      
      sessionStorage.setItem(storageKey, JSON.stringify(selected.map(q => q.id)));
      setSelectedQuestions(selected);
    };

    loadQuestions();
  }, [questions, count, storageKey]);

  return selectedQuestions;
}
