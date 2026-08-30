import { describe, it, expect } from 'vitest';
import presentContinuous from '../../src/data/tenses/present-continuous.json';

describe('present-continuous data', () => {
  it('should have metadata', () => {
    expect(presentContinuous.metadata).toBeDefined();
    expect(presentContinuous.metadata.id).toBe('present-continuous');
    expect(presentContinuous.metadata.slug).toBe('present-continuous');
    expect(presentContinuous.metadata.name).toBe('Present Continuous');
    expect(presentContinuous.metadata.status).toBe('active');
  });

  it('should have quickRules', () => {
    expect(presentContinuous.quickRules).toBeDefined();
    expect(Array.isArray(presentContinuous.quickRules)).toBe(true);
    expect(presentContinuous.quickRules.length).toBeGreaterThan(0);
  });

  it('should have exactly 10 challenges combined', () => {
    expect(presentContinuous.challenges).toBeDefined();
    
    const conjugationCount = presentContinuous.challenges.conjugation?.length || 0;
    const errorHuntingCount = presentContinuous.challenges.errorHunting?.length || 0;
    const sentenceBuildingCount = presentContinuous.challenges.sentenceBuilding?.length || 0;
    const devOpsChallengeCount = presentContinuous.challenges.devOpsChallenge?.length || 0;
    
    const totalChallenges = conjugationCount + errorHuntingCount + sentenceBuildingCount + devOpsChallengeCount;
    
    expect(totalChallenges).toBe(10);
  });
});
