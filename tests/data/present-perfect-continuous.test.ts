import { describe, it, expect } from 'vitest';
import presentPerfectContinuous from '../../src/data/tenses/present-perfect-continuous.json';

describe('present-perfect-continuous data', () => {
  it('should have metadata', () => {
    expect(presentPerfectContinuous.metadata).toBeDefined();
    expect(presentPerfectContinuous.metadata.id).toBe('present-perfect-continuous');
    expect(presentPerfectContinuous.metadata.slug).toBe('present-perfect-continuous');
    expect(presentPerfectContinuous.metadata.name).toBe('Present Perfect Continuous');
    expect(presentPerfectContinuous.metadata.status).toBe('active');
  });

  it('should have quickRules', () => {
    expect(presentPerfectContinuous.quickRules).toBeDefined();
    expect(Array.isArray(presentPerfectContinuous.quickRules)).toBe(true);
    expect(presentPerfectContinuous.quickRules.length).toBeGreaterThan(0);
  });

  it('should have exactly 80 challenges combined (20 per category)', () => {
    expect(presentPerfectContinuous.challenges).toBeDefined();
    
    const conjugationCount = presentPerfectContinuous.challenges.conjugation?.length || 0;
    const errorHuntingCount = presentPerfectContinuous.challenges.errorHunting?.length || 0;
    const sentenceBuildingCount = presentPerfectContinuous.challenges.sentenceBuilding?.length || 0;
    const devOpsChallengeCount = presentPerfectContinuous.challenges.devOpsChallenge?.length || 0;
    
    expect(conjugationCount).toBe(20);
    expect(errorHuntingCount).toBe(20);
    expect(sentenceBuildingCount).toBe(20);
    expect(devOpsChallengeCount).toBe(20);
    
    const totalChallenges = conjugationCount + errorHuntingCount + sentenceBuildingCount + devOpsChallengeCount;
    expect(totalChallenges).toBe(80);
  });
});
