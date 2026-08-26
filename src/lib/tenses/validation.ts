/**
 * Validation & Text Normalization Utilities for Tense Practice
 * Feature: 006-workplace-tense-practice
 */

import {
  ConjugationItem,
  ErrorHunterItem,
  SentenceBuilderItem,
  TenseMetadata,
  TenseModuleData,
} from "@/types/tenses";

/**
 * Normalizes user input by:
 * 1. Replacing smart/curly apostrophes and quotes with standard ASCII equivalents.
 * 2. Replacing en/em dashes with standard hyphens.
 * 3. Trimming and collapsing consecutive whitespace characters.
 * 4. Lowercasing.
 */
export function normalizeAnswer(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, "")                   // Strip zero-width chars
    .replace(/[\u2018\u2019\u201A\u201B\u0060\u00B4]/g, "'") // Smart single quotes/apostrophes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')             // Smart double quotes
    .replace(/[\u2013\u2014]/g, "-")                         // En/em dashes
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * Strips non-essential trailing sentence punctuation (e.g. '.', '!', '?') if present.
 */
function stripTrailingPunctuation(str: string): string {
  return str.replace(/[.,!?;:]+$/, "").trim();
}

/**
 * Evaluates whether a user's answer for a Conjugation challenge item is correct.
 * Handles case-insensitivity, smart apostrophes, and accidental trailing periods.
 */
export function isConjugationAnswerCorrect(
  userAnswer: string,
  item?: ConjugationItem | null
): boolean {
  if (!item || !item.correctAnswer) return false;
  const normalizedUser = normalizeAnswer(userAnswer);
  if (!normalizedUser) return false;

  const normalizedCorrect = normalizeAnswer(item.correctAnswer);
  
  // Exact normalized match
  if (normalizedUser === normalizedCorrect) return true;

  // Punctuation-tolerant match (e.g. mobile auto-inserted period at end)
  const cleanUser = stripTrailingPunctuation(normalizedUser);
  const cleanCorrect = stripTrailingPunctuation(normalizedCorrect);
  if (cleanUser.length > 0 && cleanUser === cleanCorrect) return true;

  // Check acceptable alternatives
  if (item.acceptableAlternatives && item.acceptableAlternatives.length > 0) {
    return item.acceptableAlternatives.some((alt) => {
      const normalizedAlt = normalizeAnswer(alt);
      if (normalizedAlt === normalizedUser) return true;
      const cleanAlt = stripTrailingPunctuation(normalizedAlt);
      return cleanUser.length > 0 && cleanUser === cleanAlt;
    });
  }

  return false;
}

/**
 * Evaluates whether the chosen token and correction for an Error Hunter item is correct.
 */
export function isErrorHunterAnswerCorrect(
  selectedTokenIndex: number,
  selectedOptionValue: string,
  item: ErrorHunterItem
): boolean {
  if (selectedTokenIndex !== item.errorTokenIndex) {
    return false;
  }
  const normalizedUserChoice = normalizeAnswer(selectedOptionValue);
  const normalizedCorrectToken = normalizeAnswer(item.correctToken);
  return normalizedUserChoice === normalizedCorrectToken;
}

/**
 * Evaluates whether the user's arranged token list matches the correct token order.
 */
export function isSentenceOrderCorrect(
  currentTokens: string[],
  correctOrder: string[]
): boolean {
  if (!currentTokens || !correctOrder) return false;
  if (currentTokens.length !== correctOrder.length) return false;

  return currentTokens.every((token, idx) => {
    return normalizeAnswer(token) === normalizeAnswer(correctOrder[idx]);
  });
}

/**
 * Validates a TenseMetadata object against contract rules.
 */
export function validateTenseMetadata(metadata: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!metadata || typeof metadata !== "object") {
    return { valid: false, errors: ["Metadata must be a non-null object"] };
  }

  const m = metadata as Partial<TenseMetadata>;
  if (!m.id || typeof m.id !== "string") errors.push("Metadata id is required");
  if (!m.slug || typeof m.slug !== "string") errors.push("Metadata slug is required");
  if (!m.name || typeof m.name !== "string") errors.push("Metadata name is required");
  if (!m.vietnameseName || typeof m.vietnameseName !== "string") errors.push("Metadata vietnameseName is required");
  if (!m.group || !["present", "past", "future"].includes(m.group)) errors.push(`Invalid group: ${m.group}`);
  if (!m.status || !["active", "coming_soon"].includes(m.status)) errors.push(`Invalid status: ${m.status}`);
  if (!m.level) errors.push("Metadata level is required");
  if (typeof m.estimatedMinutes !== "number" || m.estimatedMinutes <= 0) errors.push("estimatedMinutes must be positive");
  if (typeof m.challengeCount !== "number" || m.challengeCount < 0) errors.push("challengeCount must be non-negative");

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a single Conjugation challenge item.
 */
export function validateConjugationItem(item: ConjugationItem): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!item.id) errors.push("ConjugationItem id is required");
  if (!item.scenarioVi) errors.push(`ConjugationItem ${item.id}: scenarioVi is required`);
  if (!item.baseVerb) errors.push(`ConjugationItem ${item.id}: baseVerb is required`);
  if (!item.correctAnswer) errors.push(`ConjugationItem ${item.id}: correctAnswer is required`);
  if (!Array.isArray(item.options) || item.options.length < 3 || item.options.length > 4) {
    errors.push(`ConjugationItem ${item.id}: options must contain 3-4 choices`);
  } else {
    const hasCorrectInOptions = item.options.some(
      (opt) => normalizeAnswer(opt) === normalizeAnswer(item.correctAnswer)
    );
    if (!hasCorrectInOptions) {
      errors.push(`ConjugationItem ${item.id}: options must contain correctAnswer '${item.correctAnswer}'`);
    }
  }
  if (!item.explanation?.ruleVi || !item.explanation?.detailedAnalysisVi) {
    errors.push(`ConjugationItem ${item.id}: explanation.ruleVi and detailedAnalysisVi are required`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a single ErrorHunter challenge item.
 */
export function validateErrorHunterItem(item: ErrorHunterItem): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!item.id) errors.push("ErrorHunterItem id is required");
  if (!item.scenarioVi) errors.push(`ErrorHunterItem ${item.id}: scenarioVi is required`);
  if (!Array.isArray(item.tokens) || item.tokens.length === 0) {
    errors.push(`ErrorHunterItem ${item.id}: tokens must be a non-empty array`);
  } else if (item.errorTokenIndex < 0 || item.errorTokenIndex >= item.tokens.length) {
    errors.push(`ErrorHunterItem ${item.id}: errorTokenIndex (${item.errorTokenIndex}) out of bounds`);
  }

  if (!item.correctToken) errors.push(`ErrorHunterItem ${item.id}: correctToken is required`);
  if (!Array.isArray(item.options) || item.options.length === 0) {
    errors.push(`ErrorHunterItem ${item.id}: options must be a non-empty array`);
  } else {
    const correctOptions = item.options.filter((o) => o.isCorrect);
    if (correctOptions.length !== 1) {
      errors.push(`ErrorHunterItem ${item.id}: options must contain exactly 1 correct option`);
    } else if (normalizeAnswer(correctOptions[0].value) !== normalizeAnswer(item.correctToken)) {
      errors.push(`ErrorHunterItem ${item.id}: correct option value must match correctToken '${item.correctToken}'`);
    }
  }

  if (!item.fullCorrectSentence) errors.push(`ErrorHunterItem ${item.id}: fullCorrectSentence is required`);
  if (!item.vietnameseMeaning) errors.push(`ErrorHunterItem ${item.id}: vietnameseMeaning is required`);
  if (!item.explanation?.whyWrongVi || !item.explanation?.workplaceImpactVi) {
    errors.push(`ErrorHunterItem ${item.id}: explanation.whyWrongVi and workplaceImpactVi are required`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a single SentenceBuilder challenge item.
 */
export function validateSentenceBuilderItem(item: SentenceBuilderItem): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!item.id) errors.push("SentenceBuilderItem id is required");
  if (!item.scenarioVi) errors.push(`SentenceBuilderItem ${item.id}: scenarioVi is required`);
  if (!item.vietnameseMeaning) errors.push(`SentenceBuilderItem ${item.id}: vietnameseMeaning is required`);
  if (!Array.isArray(item.scrambledTokens) || item.scrambledTokens.length === 0) {
    errors.push(`SentenceBuilderItem ${item.id}: scrambledTokens must be a non-empty array`);
  }
  if (!Array.isArray(item.correctTokenOrder) || item.correctTokenOrder.length === 0) {
    errors.push(`SentenceBuilderItem ${item.id}: correctTokenOrder must be a non-empty array`);
  } else if (item.scrambledTokens && item.scrambledTokens.length !== item.correctTokenOrder.length) {
    errors.push(`SentenceBuilderItem ${item.id}: scrambledTokens count (${item.scrambledTokens.length}) does not match correctTokenOrder count (${item.correctTokenOrder.length})`);
  } else if (item.scrambledTokens) {
    const scrambledTexts = item.scrambledTokens.map((t) => normalizeAnswer(t.text));
    const missingTokens = item.correctTokenOrder.filter(
      (tok) => !scrambledTexts.includes(normalizeAnswer(tok))
    );
    if (missingTokens.length > 0) {
      errors.push(
        `SentenceBuilderItem ${item.id}: correctTokenOrder contains tokens missing from scrambledTokens: ${missingTokens.join(", ")}`
      );
    }
  }

  if (item.correctTokenOrder && item.fullSentenceEn) {
    const joined = item.correctTokenOrder.join(" ");
    if (joined !== item.fullSentenceEn) {
      errors.push(`SentenceBuilderItem ${item.id}: joined tokens '${joined}' does not match fullSentenceEn '${item.fullSentenceEn}'`);
    }
  }

  if (!item.grammarTip?.titleVi || !item.grammarTip?.tipVi) {
    errors.push(`SentenceBuilderItem ${item.id}: grammarTip.titleVi and tipVi are required`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an entire TenseModuleData structure.
 */
export function validateTenseModuleData(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["TenseModuleData must be a non-null object"] };
  }

  const tenseModule = data as Partial<TenseModuleData>;
  const metaValidation = validateTenseMetadata(tenseModule.metadata);
  if (!metaValidation.valid) {
    errors.push(...metaValidation.errors);
  }

  if (!Array.isArray(tenseModule.quickRules) || tenseModule.quickRules.length === 0) {
    errors.push("quickRules must be a non-empty array");
  }

  if (!tenseModule.challenges || typeof tenseModule.challenges !== "object") {
    errors.push("challenges must be an object with conjugation, errorHunting, and sentenceBuilding");
  } else {
    const { conjugation, errorHunting, sentenceBuilding } = tenseModule.challenges;

    if (!Array.isArray(conjugation) || conjugation.length === 0) {
      errors.push("challenges.conjugation must be a non-empty array");
    } else {
      conjugation.forEach((c) => {
        const res = validateConjugationItem(c);
        if (!res.valid) errors.push(...res.errors);
      });
    }

    if (!Array.isArray(errorHunting) || errorHunting.length === 0) {
      errors.push("challenges.errorHunting must be a non-empty array");
    } else {
      errorHunting.forEach((e) => {
        const res = validateErrorHunterItem(e);
        if (!res.valid) errors.push(...res.errors);
      });
    }

    if (!Array.isArray(sentenceBuilding) || sentenceBuilding.length === 0) {
      errors.push("challenges.sentenceBuilding must be a non-empty array");
    } else {
      sentenceBuilding.forEach((s) => {
        const res = validateSentenceBuilderItem(s);
        if (!res.valid) errors.push(...res.errors);
      });
    }

    if (tenseModule.challenges.devOpsChallenge !== undefined) {
      const devOpsChallenge = tenseModule.challenges.devOpsChallenge;
      if (!Array.isArray(devOpsChallenge)) {
        errors.push("challenges.devOpsChallenge must be an array");
      } else {
        devOpsChallenge.forEach((item: import("@/types/tenses").DevOpsItem) => {
          if (item.challengeType === "conjugation") {
            const res = validateConjugationItem(item);
            if (!res.valid) errors.push(...res.errors);
          } else if (item.challengeType === "errorHunting") {
            const res = validateErrorHunterItem(item);
            if (!res.valid) errors.push(...res.errors);
          } else if (item.challengeType === "sentenceBuilding") {
            const res = validateSentenceBuilderItem(item);
            if (!res.valid) errors.push(...res.errors);
          } else {
            errors.push(`Invalid devOpsChallenge challengeType: ${(item as any).challengeType}`);
          }
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
