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

  test('retrieves questions from sessionStorage if valid', () => {
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
});
