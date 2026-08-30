import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('tenses data schema validation', () => {
  const tensesDir = path.join(process.cwd(), 'src/data/tenses');
  
  it('should have a valid index.json', () => {
    const indexPath = path.join(tensesDir, 'index.json');
    expect(fs.existsSync(indexPath)).toBe(true);
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    expect(Array.isArray(indexData)).toBe(true);
    
    // Check specific new past tenses are present in index
    const expectedTenses = ['past-simple', 'past-continuous', 'past-perfect', 'past-perfect-continuous'];
    expectedTenses.forEach(tenseId => {
      const tense = indexData.find((t: { id: string }) => t.id === tenseId);
      expect(tense).toBeDefined();
    });
  });

  const validateTenseFile = (tenseId: string) => {
    it(`should have valid schema for ${tenseId}.json`, () => {
      const filePath = path.join(tensesDir, `${tenseId}.json`);
      
      expect(fs.existsSync(filePath), `File ${tenseId}.json does not exist`).toBe(true);
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      expect(data).toHaveProperty('metadata');
      expect(data).toHaveProperty('quickRules');
      expect(data).toHaveProperty('challenges');
      
      expect(data.metadata.id).toBe(tenseId);
      // Wait, we need to ensure the group is past
      expect(data.metadata.group).toBe('past');
      
      expect(data.challenges).toHaveProperty('conjugation');
      expect(data.challenges).toHaveProperty('errorHunting');
      expect(data.challenges).toHaveProperty('sentenceBuilding');
      expect(data.challenges).toHaveProperty('devOpsChallenge');
      
      expect(Array.isArray(data.challenges.conjugation)).toBe(true);
      expect(data.challenges.conjugation.length).toBe(20);
      
      expect(Array.isArray(data.challenges.errorHunting)).toBe(true);
      expect(data.challenges.errorHunting.length).toBe(20);
      
      expect(Array.isArray(data.challenges.sentenceBuilding)).toBe(true);
      expect(data.challenges.sentenceBuilding.length).toBe(20);
      
      expect(Array.isArray(data.challenges.devOpsChallenge)).toBe(true);
      expect(data.challenges.devOpsChallenge.length).toBe(20);
    });
  };

  validateTenseFile('past-simple');
  validateTenseFile('past-continuous');
  validateTenseFile('past-perfect');
  validateTenseFile('past-perfect-continuous');
});
