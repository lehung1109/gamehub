import { describe, it, expect } from "vitest";
import tensesIndex from "@/data/tenses/index.json";
import presentSimpleData from "@/data/tenses/present-simple.json";
import {
  validateTenseMetadata,
  validateConjugationItem,
  validateErrorHunterItem,
  validateSentenceBuilderItem,
  validateTenseModuleData,
} from "@/lib/tenses/validation";
import { TenseModuleData } from "@/types/tenses";

describe("Tenses Schema & Data Integrity Tests", () => {
  describe("12-Tenses Master Catalog (src/data/tenses/index.json)", () => {
    it("contains exactly 12 tenses", () => {
      expect(Array.isArray(tensesIndex)).toBe(true);
      expect(tensesIndex).toHaveLength(12);
    });

    it("has exactly 4 tenses for each time group (present, past, future)", () => {
      const presentTenses = tensesIndex.filter((t) => t.group === "present");
      const pastTenses = tensesIndex.filter((t) => t.group === "past");
      const futureTenses = tensesIndex.filter((t) => t.group === "future");

      expect(presentTenses).toHaveLength(4);
      expect(pastTenses).toHaveLength(4);
      expect(futureTenses).toHaveLength(4);
    });

    it("has exactly 1 active tense (present-simple) and 11 coming_soon tenses", () => {
      const activeTenses = tensesIndex.filter((t) => t.status === "active");
      const comingSoonTenses = tensesIndex.filter((t) => t.status === "coming_soon");

      expect(activeTenses).toHaveLength(1);
      expect(activeTenses[0].id).toBe("present-simple");
      expect(comingSoonTenses).toHaveLength(11);
    });

    it("validates all 12 tense items with validateTenseMetadata", () => {
      tensesIndex.forEach((tense) => {
        const res = validateTenseMetadata(tense);
        expect(res.valid, `Tense ${tense.id} metadata errors: ${res.errors.join(", ")}`).toBe(true);
      });
    });

    it("ensures all IDs and slugs are unique", () => {
      const ids = tensesIndex.map((t) => t.id);
      const slugs = tensesIndex.map((t) => t.slug);

      expect(new Set(ids).size).toBe(12);
      expect(new Set(slugs).size).toBe(12);
    });
  });

  describe("Present Simple Lesson Dataset (src/data/tenses/present-simple.json)", () => {
    const data = presentSimpleData as unknown as TenseModuleData;

    it("validates entire present-simple module structure via validateTenseModuleData", () => {
      const res = validateTenseModuleData(data);
      expect(res.valid, `Module validation errors: ${res.errors.join(", ")}`).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    describe("Quick Rules", () => {
      it("contains 5 structured rule cards covering core categories", () => {
        expect(data.quickRules).toHaveLength(5);

        const categories = data.quickRules.map((r) => r.category);
        expect(categories).toContain("to-be");
        expect(categories).toContain("action-verbs");
        expect(categories).toContain("spelling-rules");
        expect(categories).toContain("adverbs-frequency");
        expect(categories).toContain("workplace-usage");
      });

      it("provides bilingual titles and Vietnamese summaries for every rule card", () => {
        data.quickRules.forEach((card) => {
          expect(card.titleVi.trim().length).toBeGreaterThan(0);
          expect(card.titleEn.trim().length).toBeGreaterThan(0);
          expect(card.summaryVi.trim().length).toBeGreaterThan(0);
        });
      });
    });

    describe("Stage 1: Conjugation (Email & Workplace Context)", () => {
      it("contains at least 15 conjugation challenge items", () => {
        expect(data.challenges.conjugation.length).toBeGreaterThanOrEqual(15);
      });

      it("validates all conjugation items with validateConjugationItem", () => {
        data.challenges.conjugation.forEach((item) => {
          const res = validateConjugationItem(item);
          expect(res.valid, `Conjugation ${item.id} errors: ${res.errors.join(", ")}`).toBe(true);
        });
      });

      it("contains detailed grammar explanations for all conjugation items", () => {
        data.challenges.conjugation.forEach((item) => {
          expect(item.explanation.ruleVi.trim().length).toBeGreaterThan(10);
          expect(item.explanation.detailedAnalysisVi.trim().length).toBeGreaterThan(10);
        });
      });
    });

    describe("Stage 2: Error Hunter (Workplace Proofreading)", () => {
      it("contains at least 12 error hunter challenge items", () => {
        expect(data.challenges.errorHunting.length).toBeGreaterThanOrEqual(12);
      });

      it("validates all 12 error hunter items with validateErrorHunterItem", () => {
        data.challenges.errorHunting.forEach((item: any) => {
          const res = validateErrorHunterItem(item);
          expect(res.valid, `ErrorHunter ${item.id} errors: ${res.errors.join(", ")}`).toBe(true);
        });
      });

      it("ensures errorTokenIndex correctly targets the flawed token", () => {
        data.challenges.errorHunting.forEach((item) => {
          expect(item.tokens[item.errorTokenIndex]).toBeDefined();
          expect(item.tokens[item.errorTokenIndex]).not.toBe(item.correctToken);
        });
      });
    });

    describe("Stage 3: Sentence Builder (dnd-kit & Tap tokens)", () => {
      it("contains exactly 6 sentence builder challenge items", () => {
        expect(data.challenges.sentenceBuilding).toHaveLength(6);
      });

      it("validates all 6 sentence builder items with validateSentenceBuilderItem", () => {
        data.challenges.sentenceBuilding.forEach((item) => {
          const res = validateSentenceBuilderItem(item);
          expect(res.valid, `SentenceBuilder ${item.id} errors: ${res.errors.join(", ")}`).toBe(true);
        });
      });

      it("ensures joined correctTokenOrder matches fullSentenceEn exactly", () => {
        data.challenges.sentenceBuilding.forEach((item) => {
          expect(item.correctTokenOrder.join(" ")).toBe(item.fullSentenceEn);
        });
      });
    });
  });
});
