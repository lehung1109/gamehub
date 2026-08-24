import { expect, test, describe } from 'vitest';
import { shuffleArray } from '../../src/lib/utils';

describe('shuffleArray', () => {
  test('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.length).toBe(arr.length);
  });

  test('preserves all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled).toEqual(expect.arrayContaining(arr));
    expect(arr).toEqual(expect.arrayContaining(shuffled));
  });

  test('changes the order of elements for arrays with sufficient elements', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const shuffled = shuffleArray(arr);
    // There is a very small chance this fails randomly, but practically 0 for length 100
    expect(shuffled).not.toEqual(arr);
  });
  
  test('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const arrCopy = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(arrCopy);
  });
});
