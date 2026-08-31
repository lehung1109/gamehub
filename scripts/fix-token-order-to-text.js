const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../src/data/tenses');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'index.json');

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;

  ['sentenceBuilding', 'devOpsChallenge'].forEach(type => {
    if (!data.challenges[type]) return;
    data.challenges[type].forEach(item => {
      if (item.challengeType && item.challengeType !== 'sentenceBuilding') return;
      if (!item.scrambledTokens || !item.correctTokenOrder) return;
      
      const newOrder = item.correctTokenOrder.map(val => {
        // If val is an ID (e.g., 't1', 'tok-0'), replace with its text
        const matchedById = item.scrambledTokens.find(t => t.id === val);
        if (matchedById) {
          changed = true;
          return matchedById.text;
        }
        
        // If val is already the text, leave it alone
        const matchedByText = item.scrambledTokens.find(t => t.text === val);
        if (matchedByText) {
          return val;
        }
        
        console.log(`[${file}] Warning: could not map token "${val}" in ${item.id}`);
        return val;
      });
      
      item.correctTokenOrder = newOrder;
      
      // Also, enforce exactly 80 challenges for tests that check challenge counts
      // Actually, wait, present-continuous.test.ts has `toBe(10)`, we'll fix the test separately.
    });
  });

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated correctTokenOrder to text in ${file}`);
  }
});
