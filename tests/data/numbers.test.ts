import { describe, it, expect } from "vitest";
import numbersData from "@/data/numbers.json";
import { GameNumber } from "@/types";

describe("Numbers Data (src/data/numbers.json)", () => {
  const numbers = numbersData as GameNumber[];

  it("contains exactly 20 numbers from 1 to 20 in sequential order", () => {
    expect(numbers).toHaveLength(20);
    numbers.forEach((num, index) => {
      expect(num.value).toBe(index + 1);
    });
  });

  it("has valid non-empty english and vietnamese names for every number", () => {
    numbers.forEach((num) => {
      expect(num.english).toBeTruthy();
      expect(typeof num.english).toBe("string");
      expect(num.vietnamese).toBeTruthy();
      expect(typeof num.vietnamese).toBe("string");
    });

    // Check specific known values
    expect(numbers[0].english.toLowerCase()).toBe("one");
    expect(numbers[0].vietnamese.toLowerCase()).toBe("một");
    expect(numbers[19].english.toLowerCase()).toBe("twenty");
    expect(numbers[19].vietnamese.toLowerCase()).toBe("hai mươi");
  });

  it("has valid emoji representation for every number", () => {
    numbers.forEach((num) => {
      expect(num.emoji).toBeTruthy();
      expect(typeof num.emoji).toBe("string");
    });
  });

  it("has emoji count strictly matching number value for every number", () => {
    numbers.forEach((num) => {
      const emojiCount = Array.from(num.emoji).length;
      expect(emojiCount).toBe(num.value);
    });
  });
});
