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
      if (!item.fullSentenceEn || !item.scrambledTokens) return;
      
      const targetOrder = item.fullSentenceEn.split(' ');
      
      // Verify that all words in targetOrder exist in scrambledTokens
      const tokenTexts = item.scrambledTokens.map(t => t.text);
      
      let match = true;
      targetOrder.forEach(word => {
        if (!tokenTexts.includes(word)) {
          console.log(`[${file}] Warning: word "${word}" in fullSentenceEn not found in scrambledTokens of ${item.id}`);
          match = false;
        }
      });
      
      if (match) {
        item.correctTokenOrder = targetOrder;
        changed = true;
      }
    });
  });

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated correctTokenOrder in ${file}`);
  }
});
