import { describe, it, expect } from "vitest";
import colorsData from "@/data/colors.json";
import { Color } from "@/types";

describe("Colors Data (src/data/colors.json)", () => {
  const colors = colorsData as Color[];

  it("contains at least 8 colors (contains 10 primary & common colors)", () => {
    expect(colors.length).toBeGreaterThanOrEqual(8);
  });

  it("has valid id, english, vietnamese, hex, and tailwindClass for every color", () => {
    const ids = new Set<string>();
    const hexRegex = /^#([0-9A-Fa-f]{6})$/;

    colors.forEach((color) => {
      expect(color.id).toBeTruthy();
      expect(ids.has(color.id)).toBe(false);
      ids.add(color.id);

      expect(color.english).toBeTruthy();
      expect(color.vietnamese).toBeTruthy();
      expect(color.hex).toMatch(hexRegex);
      expect(color.tailwindClass).toBeTruthy();
    });
  });

  it("includes essential colors (red, blue, green, yellow, orange, purple, pink, brown, black, white)", () => {
    const requiredColors = [
      "red",
      "blue",
      "green",
      "yellow",
      "orange",
      "purple",
      "pink",
      "brown",
      "black",
      "white",
    ];
    const availableIds = colors.map((c) => c.id);
    requiredColors.forEach((req) => {
      expect(availableIds).toContain(req);
    });
  });
});
