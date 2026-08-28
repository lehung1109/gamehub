import { renderHook } from '@testing-library/react';
import { useSessionQuestions } from '../../src/hooks/useSessionQuestions';
import { describe, expect, test, beforeEach, vi } from 'vitest';

const mockQuestions = [
  { id: 'q1', text: 'Question 1' },
  { id: 'q2', text: 'Question 2' },
  { id: 'q3', text: 'Question 3' },
  { id: 'q4', text: 'Question 4' },
  { id: 'q5', text: 'Question 5' },
];

describe('useSessionQuestions', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  test('selects and returns requested number of questions', () => {
    const { result } = renderHook(() => useSessionQuestions(mockQuestions, 3, 'test_key'));
    
    expect(result.current.length).toBe(3);
    // All returned items should be from mockQuestions
    result.current.forEach(q => {
      expect(mockQuestions).toContainEqual(q);
    });
  });

  test('saves selected question IDs to sessionStorage', () => {
    const { result } = renderHook(() => useSessionQuestions(mockQuestions, 3, 'test_key'));
    
    expect(result.current.length).toBe(3);
    
    const savedIds = JSON.parse(sessionStorage.getItem('test_key') || '[]');
    expect(savedIds).toEqual(result.current.map(q => q.id));
  });

  test('retrieves questions from sessionStorage if valid (page reload)', () => {
    // Pre-populate sessionStorage
    const preSavedIds = ['q2', 'q4', 'q1'];
    sessionStorage.setItem('test_key', JSON.stringify(preSavedIds));

    const { result } = renderHook(() => useSessionQuestions(mockQuestions, 3, 'test_key'));
    
    expect(result.current.length).toBe(3);
    expect(result.current.map(q => q.id)).toEqual(preSavedIds);
  });

  test('maintains stable list on re-renders when nothing changes', () => {
    const { result, rerender } = renderHook(() => useSessionQuestions(mockQuestions, 3, 'test_key'));
    
    const initialList = result.current;
    
    rerender();
    
    expect(result.current).toEqual(initialList);
  });

  test('does not infinite loop if questions reference changes', () => {
    let renderCount = 0;
    const { rerender } = renderHook(
      ({ questions }) => {
        renderCount++;
        return useSessionQuestions(questions, 3, 'test_key');
      },
      { initialProps: { questions: [...mockQuestions] } }
    );

    expect(renderCount).toBe(2); // Initial render + after effect setting state

    // Rerender with a NEW array reference but same contents
    rerender({ questions: [...mockQuestions] });

    // Should render once for the prop change. 
    // If it triggers another state update in the effect, renderCount would be 4.
    expect(renderCount).toBe(3);
  });

  describe('history tracking and deduplication', () => {
    test('updates history when generating a new session', () => {
      const { result } = renderHook(() => useSessionQuestions(mockQuestions, 3, 'test_key'));
      
      const history = JSON.parse(sessionStorage.getItem('test_key-history') || '[]');
      expect(history).toEqual(result.current.map(q => q.id));
    });

    test('avoids questions already in history (unseen.length >= count)', () => {
      // History has 2 items
      sessionStorage.setItem('test_key-history', JSON.stringify(['q1', 'q2']));
      
      const { result } = renderHook(() => useSessionQuestions(mockQuestions, 2, 'test_key'));
      
      expect(result.current.length).toBe(2);
      const ids = result.current.map(q => q.id);
      expect(ids).not.toContain('q1');
      expect(ids).not.toContain('q2');

      // History should now have 4 items
      const history = JSON.parse(sessionStorage.getItem('test_key-history') || '[]');
      expect(history).toHaveLength(4);
      expect(history).toEqual(expect.arrayContaining(['q1', 'q2', ...ids]));
    });

    test('wraps around when 0 < unseen.length < count', () => {
      // History has 4 items, leaving only 1 unseen ('q5')
      sessionStorage.setItem('test_key-history', JSON.stringify(['q1', 'q2', 'q3', 'q4']));
      
      const { result } = renderHook(() => useSessionQuestions(mockQuestions, 3, 'test_key'));
      
      expect(result.current.length).toBe(3);
      const ids = result.current.map(q => q.id);
      
      // The unseen item 'q5' MUST be included
      expect(ids).toContain('q5');
      
      // The other two should be picked from the refreshed pool (which means any of q1..q4)
      const others = ids.filter(id => id !== 'q5');
      expect(others.length).toBe(2);
      
      // The new history should just be the 3 recently picked ones
      const history = JSON.parse(sessionStorage.getItem('test_key-history') || '[]');
      expect(history).toEqual(expect.arrayContaining(ids));
      expect(history.length).toBe(3);
    });

    test('wraps around when unseen.length === 0', () => {
      // History contains all 5 items
      sessionStorage.setItem('test_key-history', JSON.stringify(['q1', 'q2', 'q3', 'q4', 'q5']));
      
      const { result } = renderHook(() => useSessionQuestions(mockQuestions, 2, 'test_key'));
      
      expect(result.current.length).toBe(2);
      
      // The new history should be reset and just contain the newly picked 2 items
      const history = JSON.parse(sessionStorage.getItem('test_key-history') || '[]');
      expect(history.length).toBe(2);
      expect(history).toEqual(expect.arrayContaining(result.current.map(q => q.id)));
    });

    test('does not update history when restoring from session', () => {
      // Suppose we have a saved session and some history
      sessionStorage.setItem('test_key', JSON.stringify(['q3', 'q4']));
      sessionStorage.setItem('test_key-history', JSON.stringify(['q1', 'q2', 'q3', 'q4']));

      renderHook(() => useSessionQuestions(mockQuestions, 2, 'test_key'));

      // History should be unmodified
      const history = JSON.parse(sessionStorage.getItem('test_key-history') || '[]');
      expect(history).toEqual(['q1', 'q2', 'q3', 'q4']);
    });
  });

  test('handles count > questions.length correctly', () => {
    const { result } = renderHook(() => useSessionQuestions(mockQuestions, 10, 'test_key'));
    expect(result.current.length).toBe(mockQuestions.length);
    
    // Check session storage
    const savedIds = JSON.parse(sessionStorage.getItem('test_key') || '[]');
    expect(savedIds.length).toBe(mockQuestions.length);
  });

  test('restores from session even if count > questions.length', () => {
    sessionStorage.setItem('test_key', JSON.stringify(['q1', 'q2', 'q3', 'q4', 'q5']));
    // Change some history to see if it mistakenly re-generates
    sessionStorage.setItem('test_key-history', JSON.stringify([])); 
    
    const { result } = renderHook(() => useSessionQuestions(mockQuestions, 10, 'test_key'));
    
    // It should have restored from session, so history should STILL be empty
    const history = JSON.parse(sessionStorage.getItem('test_key-history') || '[]');
    expect(history).toEqual([]);
    expect(result.current.length).toBe(5);
  });
});
