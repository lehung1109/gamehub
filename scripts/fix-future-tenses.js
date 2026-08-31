const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../src/data/tenses');
const files = [
  'future-continuous.json', 
  'future-perfect-continuous.json',
  'future-perfect.json',
  'future-simple.json'
];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fixed = 0;

  ['sentenceBuilding', 'devOpsChallenge'].forEach(type => {
    data.challenges[type].forEach(item => {
      if (!item.scrambledTokens || !item.correctTokenOrder) return;
      if (item.challengeType && item.challengeType !== 'sentenceBuilding') return;
      
      const tokenIds = item.scrambledTokens.map(t => t.id);
      
      // We also need to handle tokens that were not found correctly due to punctuation 
      // but in the error log they perfectly matched the text of the token.
      
      const newOrder = item.correctTokenOrder.map(val => {
        if (tokenIds.includes(val)) return val;
        
        // Try exact match
        let matched = item.scrambledTokens.find(t => t.text === val);
        if (matched) return matched.id;
        
        // Try trimmed match
        matched = item.scrambledTokens.find(t => t.text.trim() === val.trim());
        if (matched) return matched.id;
        
        console.log(`[${file}] Warning: could not map token "${val}" in item ${item.id}`);
        return val;
      });
      
      // Update the array
      item.correctTokenOrder = newOrder;
      fixed++;
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Fixed ${file}`);
});
