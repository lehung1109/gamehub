import { describe, it, expect } from "vitest";
import { shuffle } from "@/lib/shuffle";

describe("shuffle utility", () => {
  it("returns a new array with the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);

    expect(result).toHaveLength(input.length);
    expect(result.sort((a, b) => a - b)).toEqual(input);
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);

    expect(input).toEqual(copy);
  });

  it("handles empty array and single element array", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([42])).toEqual([42]);
  });

  it("randomizes order over multiple runs", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let isDifferent = false;
    for (let i = 0; i < 10; i++) {
      const result = shuffle(input);
      if (result.some((val, idx) => val !== input[idx])) {
        isDifferent = true;
        break;
      }
    }
    expect(isDifferent).toBe(true);
  });

  it("handles null, undefined, or non-array gracefully without crashing", () => {
    expect(shuffle(undefined as unknown as number[])).toEqual([]);
    expect(shuffle(null as unknown as number[])).toEqual([]);
  });
});
