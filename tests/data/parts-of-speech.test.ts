import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import type { PartsOfSpeechModuleData } from '@/types/parts-of-speech';

describe('Parts of Speech Curriculum Data & Schema Validation', () => {
  const posDir = path.join(process.cwd(), 'src/data/parts-of-speech');
  const expectedModules = ['noun', 'verb', 'adjective', 'adverb', 'mixed'];

  it('should have a valid index.json with 5 active modules', () => {
    const indexPath = path.join(posDir, 'index.json');
    expect(fs.existsSync(indexPath)).toBe(true);

    const raw = fs.readFileSync(indexPath, 'utf-8');
    const indexData = JSON.parse(raw);

    expect(Array.isArray(indexData)).toBe(true);
    expect(indexData.length).toBe(5);

    const ids = indexData.map((item: { id: string }) => item.id);
    expect(ids).toEqual(expectedModules);

    indexData.forEach((moduleMeta: { id: string; status: string; slug: string }) => {
      expect(moduleMeta.status).toBe('active');
      expect(moduleMeta.slug).toBe(moduleMeta.id);
    });
  });

  expectedModules.forEach((slug) => {
    describe(`Module: ${slug}`, () => {
      const filePath = path.join(posDir, `${slug}.json`);

      it(`file ${slug}.json exists and parses as valid JSON`, () => {
        expect(fs.existsSync(filePath), `File ${slug}.json does not exist`).toBe(true);
        expect(() => JSON.parse(fs.readFileSync(filePath, 'utf-8'))).not.toThrow();
      });

      it(`matches metadata schema and slug`, () => {
        expect(fs.existsSync(filePath), `File ${slug}.json does not exist`).toBe(true);
        const data: PartsOfSpeechModuleData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        expect(data.metadata).toBeDefined();
        expect(data.metadata.id).toBe(slug);
        expect(data.metadata.slug).toBe(slug);
        expect(data.metadata.status).toBe('active');
        expect(typeof data.metadata.name).toBe('string');
        expect(typeof data.metadata.vietnameseName).toBe('string');
        expect(typeof data.metadata.description).toBe('string');
        expect(typeof data.metadata.estimatedMinutes).toBe('number');
        expect(data.metadata.estimatedMinutes).toBeGreaterThan(0);
      });

      it(`has valid quickRules with >= 1 rule card`, () => {
        expect(fs.existsSync(filePath), `File ${slug}.json does not exist`).toBe(true);
        const data: PartsOfSpeechModuleData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        expect(Array.isArray(data.quickRules)).toBe(true);
        expect(data.quickRules.length).toBeGreaterThanOrEqual(1);

        data.quickRules.forEach((rule) => {
          expect(rule.id).toBeTruthy();
          expect(rule.category).toBeTruthy();
          expect(rule.titleVi).toBeTruthy();
          expect(rule.titleEn).toBeTruthy();
          expect(rule.summaryVi).toBeTruthy();
          if (rule.rulesList) {
            expect(Array.isArray(rule.rulesList)).toBe(true);
            rule.rulesList.forEach((rl) => {
              expect(rl.ruleVi).toBeTruthy();
              expect(Array.isArray(rl.examples)).toBe(true);
            });
          }
        });
      });

      it(`has valid challenges.wordFamily with >= 2 items`, () => {
        expect(fs.existsSync(filePath), `File ${slug}.json does not exist`).toBe(true);
        const data: PartsOfSpeechModuleData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        expect(data.challenges).toBeDefined();
        expect(Array.isArray(data.challenges.wordFamily)).toBe(true);
        expect(data.challenges.wordFamily.length).toBeGreaterThanOrEqual(2);

        data.challenges.wordFamily.forEach((item) => {
          expect(item.id).toBeTruthy();
          expect(item.baseWord).toBeTruthy();
          expect(item.targetWord).toBeTruthy();
          expect(Array.isArray(item.options)).toBe(true);
          expect(item.options.length).toBeGreaterThanOrEqual(2);
          expect(item.explanationVi).toBeTruthy();

          // Options must include the suffix or form of the targetWord
          const hasMatchingOption = item.options.some((opt) => {
            const cleanOpt = opt.replace(/^-/, '').toLowerCase();
            return item.targetWord.toLowerCase().endsWith(cleanOpt) || item.targetWord.toLowerCase() === opt.toLowerCase();
          });
          expect(
            hasMatchingOption,
            `In item ${item.id}, options [${item.options.join(', ')}] should contain suffix for ${item.targetWord}`
          ).toBe(true);
        });
      });

      it(`has valid challenges.fillInBlank with >= 2 items`, () => {
        expect(fs.existsSync(filePath), `File ${slug}.json does not exist`).toBe(true);
        const data: PartsOfSpeechModuleData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        expect(Array.isArray(data.challenges.fillInBlank)).toBe(true);
        expect(data.challenges.fillInBlank.length).toBeGreaterThanOrEqual(2);

        const validContextTypes = ['email', 'chat', 'report'];

        data.challenges.fillInBlank.forEach((item) => {
          expect(item.id).toBeTruthy();
          expect(validContextTypes).toContain(item.contextType);
          expect(typeof item.textBefore).toBe('string');
          expect(typeof item.textAfter).toBe('string');
          expect(item.correctAnswer).toBeTruthy();
          expect(Array.isArray(item.options)).toBe(true);
          expect(item.options).toContain(item.correctAnswer);
          expect(item.explanationVi).toBeTruthy();
        });
      });

      it(`has valid challenges.errorHunting with >= 1 item`, () => {
        expect(fs.existsSync(filePath), `File ${slug}.json does not exist`).toBe(true);
        const data: PartsOfSpeechModuleData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        expect(Array.isArray(data.challenges.errorHunting)).toBe(true);
        expect(data.challenges.errorHunting.length).toBeGreaterThanOrEqual(1);

        data.challenges.errorHunting.forEach((item) => {
          expect(item.id).toBeTruthy();
          expect(item.scenarioVi).toBeTruthy();
          expect(Array.isArray(item.tokens)).toBe(true);
          expect(item.tokens.length).toBeGreaterThan(0);
          expect(item.errorTokenIndex).toBeGreaterThanOrEqual(0);
          expect(item.errorTokenIndex).toBeLessThan(item.tokens.length);
          expect(item.correctToken).toBeTruthy();
          expect(Array.isArray(item.options)).toBe(true);

          const optionValues = item.options.map((opt) => opt.value);
          expect(optionValues).toContain(item.correctToken);

          const correctOption = item.options.find((opt) => opt.value === item.correctToken);
          expect(correctOption?.isCorrect).toBe(true);

          expect(item.fullCorrectSentence).toBeTruthy();
          expect(item.vietnameseMeaning).toBeTruthy();
          expect(item.explanation).toBeDefined();
          expect(item.explanation.whyWrongVi).toBeTruthy();
          expect(item.explanation.workplaceImpactVi).toBeTruthy();
        });
      });
    });
  });
});
