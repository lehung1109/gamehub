import { describe, it, expect } from "vitest";

function srgbToLuminance(r: number, g: number, b: number): number {
  const [lr, lg, lb] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.04045
      ? val / 12.92
      : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((x) => x + x)
      .join("");
  }
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = srgbToLuminance(r1, g1, b1);
  const l2 = srgbToLuminance(r2, g2, b2);
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

describe("Comprehensive Component Contrast Audit (WCAG 2.1)", () => {
  describe("Homepage & GameCard", () => {
    it("GameCard title (#1e293b) on Card background (#ffffff) passes AAA (>= 7:1)", () => {
      const cr = getContrastRatio("#1e293b", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it("GameCard description (#475569) on Card background (#ffffff) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#475569", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("GameCard category badge (#0369a1 on #e0f2fe) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#0369a1", "#e0f2fe");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("Homepage banner text (#065f46) on banner background (#d1fae5) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#065f46", "#d1fae5");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("Homepage highlighted title (#047857) on page background (#ffffff) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#047857", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("404 page title (#047857) on background (#ffffff) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#047857", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("GameCard call-to-action (#15803d) on Card background (#ffffff) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#15803d", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("Flashcard Component", () => {
    it("Flashcard English word (#15803d emerald-700) on Card background (#ffffff) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#15803d", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("Flashcard Vietnamese word (#0f172a) on Card background (#ffffff) passes AAA (>= 7:1)", () => {
      const cr = getContrastRatio("#0f172a", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it("Flashcard Phonetic text (#475569) on Card background (#ffffff) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#475569", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("Primary Next button: text (#0f3803) on Game Green (#58cc02) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#0f3803", "#58cc02");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("Finish button: text (#451a03) on Game Yellow (#ffc800) passes AAA (>= 7:1)", () => {
      const cr = getContrastRatio("#451a03", "#ffc800");
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });
  });

  describe("Feedback Dialog Overlay", () => {
    it("Correct feedback title (#047857) on background (#ecfdf5) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#047857", "#ecfdf5");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("Wrong feedback title (#be123c) on background (#fff1f2) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#be123c", "#fff1f2");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it("Continue button (white on emerald-700 #047857) passes AA (>= 4.5:1)", () => {
      const cr = getContrastRatio("#ffffff", "#047857");
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("SVG Icons Contrast (WCAG 2.1 Non-Text Contrast >= 3.0:1)", () => {
    it("BackButton ArrowLeft SVG (#047857) on White background (#ffffff) passes AA (>= 3.0:1)", () => {
      const cr = getContrastRatio("#047857", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(3.0);
    });

    it("SpeakButton Volume2 SVG (#047857) on Emerald button background (#ecfdf5) passes AA (>= 3.0:1)", () => {
      const cr = getContrastRatio("#047857", "#ecfdf5");
      expect(cr).toBeGreaterThanOrEqual(3.0);
    });

    it("Completion Sparkles SVG (#d97706 amber-600) on White background (#ffffff) passes AA (>= 3.0:1)", () => {
      const cr = getContrastRatio("#d97706", "#ffffff");
      expect(cr).toBeGreaterThanOrEqual(3.0);
    });

    it("SpeechUnsupportedBanner AlertTriangle SVG (#b45309) on Amber background (#fffbeb) passes AA (>= 3.0:1)", () => {
      const cr = getContrastRatio("#b45309", "#fffbeb");
      expect(cr).toBeGreaterThanOrEqual(3.0);
    });

    it("Navigation Chevron SVG (currentColor #0f3803) on Game Green button (#58cc02) passes AA (>= 3.0:1)", () => {
      const cr = getContrastRatio("#0f3803", "#58cc02");
      expect(cr).toBeGreaterThanOrEqual(3.0);
    });
  });
});
