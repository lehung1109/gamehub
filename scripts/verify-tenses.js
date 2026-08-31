const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../src/data/tenses');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'index.json');

let totalErrors = 0;

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.log(`[${file}] PARSE ERROR: ${e.message}`);
    totalErrors++;
    return;
  }
  
  let fileErrors = 0;
  
  const reportError = (msg) => {
    console.log(`[${file}] ERROR: ${msg}`);
    fileErrors++;
    totalErrors++;
  };

  const checkChallenges = (type, items) => {
    if (!items || items.length !== 20) {
      reportError(`${type} has ${items ? items.length : 0} items instead of 20`);
      return;
    }
    items.forEach((item, index) => {
      // General ID check
      if (!item.id) reportError(`Missing ID in ${type} index ${index}`);
      
      // Conjugation
      if (type === 'conjugation' || item.challengeType === 'conjugation') {
        if (!item.correctAnswer) reportError(`${item.id}: Missing correctAnswer`);
        if (!item.options || !item.options.includes(item.correctAnswer)) {
          reportError(`${item.id}: correctAnswer not in options`);
        }
      }
      
      // Error Hunting
      if (type === 'errorHunting' || item.challengeType === 'errorHunting') {
        if (!item.correctToken) reportError(`${item.id}: Missing correctToken`);
        if (!item.options) {
          reportError(`${item.id}: Missing options`);
        } else {
          const correctOpts = item.options.filter(o => o.isCorrect);
          if (correctOpts.length !== 1) {
            reportError(`${item.id}: Expected exactly 1 correct option, found ${correctOpts.length}`);
          }
        }
      }
      
      // Sentence Building
      if (type === 'sentenceBuilding' || item.challengeType === 'sentenceBuilding') {
        if (!item.scrambledTokens) {
          reportError(`${item.id}: Missing scrambledTokens`);
        } else if (!item.correctTokenOrder) {
          reportError(`${item.id}: Missing correctTokenOrder`);
        } else {
          const tokenIds = item.scrambledTokens.map(t => t.id);
          item.correctTokenOrder.forEach(tId => {
            if (!tokenIds.includes(tId)) {
              reportError(`${item.id}: correctTokenOrder refers to non-existent token ${tId}`);
            }
          });
          if (tokenIds.length !== item.correctTokenOrder.length) {
            reportError(`${item.id}: correctTokenOrder length mismatch`);
          }
        }
      }
    });
  };

  if (data.challenges) {
    checkChallenges('conjugation', data.challenges.conjugation);
    checkChallenges('errorHunting', data.challenges.errorHunting);
    checkChallenges('sentenceBuilding', data.challenges.sentenceBuilding);
    checkChallenges('devOpsChallenge', data.challenges.devOpsChallenge);
  } else {
    reportError('Missing challenges object');
  }

  if (fileErrors > 0) {
    console.log(`[${file}] Found ${fileErrors} errors`);
  }
});

console.log(`Total errors found: ${totalErrors}`);
if (totalErrors > 0) process.exit(1);
