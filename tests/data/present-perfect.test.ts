import { describe, it, expect } from 'vitest';
import presentPerfect from '../../src/data/tenses/present-perfect.json';

describe('present-perfect data', () => {
  it('should have metadata', () => {
    expect(presentPerfect.metadata).toBeDefined();
    expect(presentPerfect.metadata.id).toBe('present-perfect');
    expect(presentPerfect.metadata.slug).toBe('present-perfect');
    expect(presentPerfect.metadata.name).toBe('Present Perfect');
    expect(presentPerfect.metadata.status).toBe('active');
  });

  it('should have quickRules', () => {
    expect(presentPerfect.quickRules).toBeDefined();
    expect(Array.isArray(presentPerfect.quickRules)).toBe(true);
    expect(presentPerfect.quickRules.length).toBeGreaterThan(0);
  });

  it('should have exactly 80 challenges combined (20 per category)', () => {
    expect(presentPerfect.challenges).toBeDefined();
    
    const conjugationCount = presentPerfect.challenges.conjugation?.length || 0;
    const errorHuntingCount = presentPerfect.challenges.errorHunting?.length || 0;
    const sentenceBuildingCount = presentPerfect.challenges.sentenceBuilding?.length || 0;
    const devOpsChallengeCount = presentPerfect.challenges.devOpsChallenge?.length || 0;
    
    expect(conjugationCount).toBe(20);
    expect(errorHuntingCount).toBe(20);
    expect(sentenceBuildingCount).toBe(20);
    expect(devOpsChallengeCount).toBe(20);
    
    const totalChallenges = conjugationCount + errorHuntingCount + sentenceBuildingCount + devOpsChallengeCount;
    expect(totalChallenges).toBe(80);
  });
});
