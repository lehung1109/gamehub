const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'tenses', 'present-perfect-continuous.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const devOps = [];

// Get 7 from conjugation
const conj = data.challenges.conjugation.slice(0, 7).map(c => ({
  ...c,
  id: c.id.replace('ppc-conj-', 'ppc-do-conj-'),
  challengeType: "conjugation"
}));

// Get 7 from errorHunting
const err = data.challenges.errorHunting.slice(0, 7).map(e => ({
  ...e,
  id: e.id.replace('ppc-err-', 'ppc-do-err-'),
  challengeType: "errorHunting"
}));

// Get 6 from sentenceBuilding
const sb = data.challenges.sentenceBuilding.slice(0, 6).map(s => ({
  ...s,
  id: s.id.replace('ppc-sb-', 'ppc-do-sb-'),
  challengeType: "sentenceBuilding"
}));

devOps.push(...conj, ...err, ...sb);
data.challenges.devOpsChallenge = devOps;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Added 20 PPC DevOps challenges.');
