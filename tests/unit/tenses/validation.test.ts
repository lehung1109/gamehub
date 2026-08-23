import { describe, it, expect } from "vitest";
import {
  normalizeAnswer,
  isConjugationAnswerCorrect,
  isErrorHunterAnswerCorrect,
  isSentenceOrderCorrect,
  validateTenseMetadata,
  validateConjugationItem,
  validateErrorHunterItem,
  validateSentenceBuilderItem,
  validateTenseModuleData,
} from "@/lib/tenses/validation";
import {
  ConjugationItem,
  ErrorHunterItem,
  SentenceBuilderItem,
  TenseMetadata,
} from "@/types/tenses";

describe("Tenses Validation Utilities", () => {
  describe("normalizeAnswer", () => {
    it("trims leading and trailing whitespace", () => {
      expect(normalizeAnswer("  meets  ")).toBe("meets");
    });

    it("converts uppercase to lowercase", () => {
      expect(normalizeAnswer("DOES NOT AGREE")).toBe("does not agree");
    });

    it("collapses multiple consecutive whitespace characters into a single space", () => {
      expect(normalizeAnswer("does   not    send")).toBe("does not send");
    });

    it("normalizes smart/curly apostrophes and quotes to standard ASCII", () => {
      expect(normalizeAnswer("doesn’t")).toBe("doesn't");
      expect(normalizeAnswer("‘quoted’")).toBe("'quoted'");
      expect(normalizeAnswer("“double quotes”")).toBe('"double quotes"');
    });

    it("normalizes en-dashes and em-dashes to standard hyphens", () => {
      expect(normalizeAnswer("all–hands")).toBe("all-hands");
      expect(normalizeAnswer("pre—meeting")).toBe("pre-meeting");
    });

    it("strips invisible zero-width characters (e.g. \\u200B, \\uFEFF)", () => {
      expect(normalizeAnswer("meets\u200B")).toBe("meets");
      expect(normalizeAnswer("\uFEFFdoes\u200Cnot\u200Dagree")).toBe("doesnotagree");
    });

    it("handles null, undefined, and empty string safely", () => {
      expect(normalizeAnswer(null)).toBe("");
      expect(normalizeAnswer(undefined)).toBe("");
      expect(normalizeAnswer("")).toBe("");
    });
  });

  describe("isConjugationAnswerCorrect", () => {
    const mockItem: ConjugationItem = {
      id: "conj-01",
      contextType: "email",
      scenarioVi: "Test scenario",
      textBefore: "He ",
      baseVerb: "approve",
      textAfter: " the plan.",
      correctAnswer: "approves",
      acceptableAlternatives: ["APPROVES", "is approving", "doesn't approve"],
      options: ["approve", "approves", "approving", "approved"],
      explanation: {
        ruleVi: "Rule",
        detailedAnalysisVi: "Details",
      },
    };

    it("returns true for exact match", () => {
      expect(isConjugationAnswerCorrect("approves", mockItem)).toBe(true);
    });

    it("returns true for match with extra whitespace and uppercase", () => {
      expect(isConjugationAnswerCorrect("  APPROVES  ", mockItem)).toBe(true);
    });

    it("returns true when user types with mobile smart curly apostrophes", () => {
      expect(isConjugationAnswerCorrect("doesn’t approve", mockItem)).toBe(true);
    });

    it("returns true when user input contains accidental trailing period", () => {
      expect(isConjugationAnswerCorrect("approves.", mockItem)).toBe(true);
      expect(isConjugationAnswerCorrect("  approves. ", mockItem)).toBe(true);
    });

    it("returns true for acceptable alternative", () => {
      expect(isConjugationAnswerCorrect("is approving", mockItem)).toBe(true);
      expect(isConjugationAnswerCorrect(" IS APPROVING ", mockItem)).toBe(true);
    });

    it("returns false for incorrect answer", () => {
      expect(isConjugationAnswerCorrect("approve", mockItem)).toBe(false);
      expect(isConjugationAnswerCorrect("wrong", mockItem)).toBe(false);
      expect(isConjugationAnswerCorrect("", mockItem)).toBe(false);
    });

    it("handles null, undefined, or missing items safely without throwing", () => {
      expect(isConjugationAnswerCorrect("approves", null)).toBe(false);
      expect(isConjugationAnswerCorrect("approves", undefined)).toBe(false);
      expect(isConjugationAnswerCorrect("approves", {} as ConjugationItem)).toBe(false);
    });
  });

  describe("isErrorHunterAnswerCorrect", () => {
    const mockItem: ErrorHunterItem = {
      id: "err-01",
      scenarioVi: "Test scenario",
      tokens: ["She", "don't", "agree", "with", "us."],
      errorTokenIndex: 1,
      correctToken: "doesn't",
      options: [
        { value: "doesn't", label: "doesn't", isCorrect: true },
        { value: "isn't", label: "isn't", isCorrect: false },
        { value: "don't", label: "don't", isCorrect: false },
      ],
      fullCorrectSentence: "She doesn't agree with us.",
      vietnameseMeaning: "Cô ấy không đồng ý với chúng tôi.",
      explanation: {
        whyWrongVi: "Why",
        workplaceImpactVi: "Impact",
      },
    };

    it("returns true when correct token index and correct replacement value are given", () => {
      expect(isErrorHunterAnswerCorrect(1, "doesn't", mockItem)).toBe(true);
      expect(isErrorHunterAnswerCorrect(1, " DOESN'T ", mockItem)).toBe(true);
    });

    it("returns false when wrong token index is selected", () => {
      expect(isErrorHunterAnswerCorrect(0, "doesn't", mockItem)).toBe(false);
      expect(isErrorHunterAnswerCorrect(2, "doesn't", mockItem)).toBe(false);
    });

    it("returns false when wrong replacement option is chosen", () => {
      expect(isErrorHunterAnswerCorrect(1, "isn't", mockItem)).toBe(false);
      expect(isErrorHunterAnswerCorrect(1, "don't", mockItem)).toBe(false);
    });
  });

  describe("isSentenceOrderCorrect", () => {
    const correctOrder = ["Our company", "always", "holds", "a meeting."];

    it("returns true when token order matches exactly", () => {
      expect(isSentenceOrderCorrect(["Our company", "always", "holds", "a meeting."], correctOrder)).toBe(true);
    });

    it("returns true when token order matches with case and whitespace tolerance", () => {
      expect(isSentenceOrderCorrect(["  our company  ", "ALWAYS", "holds", "a meeting."], correctOrder)).toBe(true);
    });

    it("returns false when tokens are in wrong order", () => {
      expect(isSentenceOrderCorrect(["always", "Our company", "holds", "a meeting."], correctOrder)).toBe(false);
    });

    it("returns false when token array length does not match", () => {
      expect(isSentenceOrderCorrect(["Our company", "always", "holds"], correctOrder)).toBe(false);
      expect(isSentenceOrderCorrect(["Our company", "always", "holds", "a meeting.", "extra"], correctOrder)).toBe(false);
    });
  });

  describe("validateTenseMetadata", () => {
    const validMeta: TenseMetadata = {
      id: "present-simple",
      slug: "present-simple",
      name: "Present Simple",
      vietnameseName: "Thì Hiện Tại Đơn",
      group: "present",
      status: "active",
      level: "A1-A2 (Beginner)",
      description: "Description",
      estimatedMinutes: 10,
      challengeCount: 20,
    };

    it("validates correct metadata without errors", () => {
      const res = validateTenseMetadata(validMeta);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it("flags missing or invalid fields", () => {
      const invalid = { ...validMeta, group: "invalid-group", estimatedMinutes: -1 };
      const res = validateTenseMetadata(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.length).toBeGreaterThan(0);
    });

    it("handles null or non-object input", () => {
      expect(validateTenseMetadata(null).valid).toBe(false);
      expect(validateTenseMetadata("not an object").valid).toBe(false);
    });
  });

  describe("validateConjugationItem", () => {
    const validItem: ConjugationItem = {
      id: "conj-01",
      contextType: "email",
      scenarioVi: "Scenario",
      textBefore: "She ",
      baseVerb: "work",
      textAfter: " hard.",
      correctAnswer: "works",
      options: ["work", "works", "working", "worked"],
      explanation: {
        ruleVi: "Rule",
        detailedAnalysisVi: "Analysis",
      },
    };

    it("validates correct ConjugationItem", () => {
      const res = validateConjugationItem(validItem);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it("flags when correctAnswer is missing from options", () => {
      const invalid = { ...validItem, options: ["work", "working", "worked"] };
      const res = validateConjugationItem(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes("options must contain correctAnswer"))).toBe(true);
    });

    it("flags invalid options length (<3 or >4)", () => {
      const invalid = { ...validItem, options: ["works", "work"] };
      const res = validateConjugationItem(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes("options must contain 3-4 choices"))).toBe(true);
    });
  });

  describe("validateErrorHunterItem", () => {
    const validItem: ErrorHunterItem = {
      id: "err-01",
      scenarioVi: "Scenario",
      tokens: ["She", "don't", "know."],
      errorTokenIndex: 1,
      correctToken: "doesn't",
      options: [
        { value: "doesn't", label: "doesn't", isCorrect: true },
        { value: "isn't", label: "isn't", isCorrect: false },
        { value: "don't", label: "don't", isCorrect: false },
      ],
      fullCorrectSentence: "She doesn't know.",
      vietnameseMeaning: "Cô ấy không biết.",
      explanation: {
        whyWrongVi: "Why",
        workplaceImpactVi: "Impact",
      },
    };

    it("validates correct ErrorHunterItem", () => {
      const res = validateErrorHunterItem(validItem);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it("flags errorTokenIndex out of bounds", () => {
      const invalid = { ...validItem, errorTokenIndex: 99 };
      const res = validateErrorHunterItem(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes("out of bounds"))).toBe(true);
    });

    it("flags when multiple correct options are present", () => {
      const invalid = {
        ...validItem,
        options: [
          { value: "doesn't", label: "doesn't", isCorrect: true },
          { value: "does not", label: "does not", isCorrect: true },
        ],
      };
      const res = validateErrorHunterItem(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes("exactly 1 correct option"))).toBe(true);
    });
  });

  describe("validateSentenceBuilderItem", () => {
    const validItem: SentenceBuilderItem = {
      id: "sb-01",
      scenarioVi: "Scenario",
      vietnameseMeaning: "Nghĩa",
      scrambledTokens: [
        { id: "1", text: "Our company" },
        { id: "2", text: "holds meetings." },
      ],
      correctTokenOrder: ["Our company", "holds meetings."],
      fullSentenceEn: "Our company holds meetings.",
      grammarTip: {
        titleVi: "Tip",
        tipVi: "Detail",
      },
    };

    it("validates correct SentenceBuilderItem", () => {
      const res = validateSentenceBuilderItem(validItem);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it("flags token count mismatch between scrambledTokens and correctTokenOrder", () => {
      const invalid = {
        ...validItem,
        correctTokenOrder: ["Our company", "holds", "meetings."],
      };
      const res = validateSentenceBuilderItem(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes("does not match"))).toBe(true);
    });

    it("flags when correctTokenOrder contains tokens missing from scrambledTokens", () => {
      const invalid = {
        ...validItem,
        correctTokenOrder: ["Our company", "missing token text"],
      };
      const res = validateSentenceBuilderItem(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes("missing from scrambledTokens"))).toBe(true);
    });

    it("flags when joined correctTokenOrder does not match fullSentenceEn", () => {
      const invalid = {
        ...validItem,
        fullSentenceEn: "Different sentence string entirely",
      };
      const res = validateSentenceBuilderItem(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes("does not match fullSentenceEn"))).toBe(true);
    });
  });

  describe("validateTenseModuleData", () => {
    it("handles null or non-object module data", () => {
      expect(validateTenseModuleData(null).valid).toBe(false);
      expect(validateTenseModuleData("invalid").valid).toBe(false);
    });
  });
});
