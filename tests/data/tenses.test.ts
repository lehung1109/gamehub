import { describe, it, expect } from 'vitest';
import tenses from '../../src/data/tenses/index.json';

describe('tenses data', () => {
  it('should have present-continuous tense with status active', () => {
    const presentContinuous = tenses.find(t => t.id === 'present-continuous');
    expect(presentContinuous).toBeDefined();
    expect(presentContinuous?.status).toBe('active');
  });
});
