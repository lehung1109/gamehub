import { describe, it, expect } from 'vitest';
import topics from '@/data/pronunciation/index.json';
import minimalPairs from '@/data/pronunciation/minimal-pairs.json';
import workplaceWords from '@/data/pronunciation/workplace-words.json';
import standupPhrases from '@/data/pronunciation/standup-phrases.json';

describe('Pronunciation Curriculum Datasets', () => {
  it('contains valid topic catalogs', () => {
    expect(topics.length).toBeGreaterThanOrEqual(3);
    topics.forEach((t) => {
      expect(t.id).toBeTruthy();
      expect(t.nameVi).toBeTruthy();
      expect(t.nameEn).toBeTruthy();
    });
  });

  it('validates minimal pairs dataset items', () => {
    expect(minimalPairs.length).toBeGreaterThanOrEqual(10);
    minimalPairs.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.targetText).toBeTruthy();
      expect(item.phonetic).toMatch(/^\/.*\/$/);
      expect(item.vietnameseMeaning).toBeTruthy();
    });
  });

  it('validates workplace words and standup phrases datasets', () => {
    expect(workplaceWords.length).toBeGreaterThanOrEqual(10);
    expect(standupPhrases.length).toBeGreaterThanOrEqual(10);
  });
});
