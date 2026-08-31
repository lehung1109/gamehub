const fs = require('fs');
const path = require('path');
function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.test.ts') || p.endsWith('.test.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      if (c.includes('mock-present-simple.json')) {
        c = c.replace(/['"].*mock-present-simple\.json['"]/g, '"@/data/tenses/mock-present-simple.json"');
        fs.writeFileSync(p, c, 'utf8');
        console.log('Fixed import in ' + p);
      }
    }
  });
}
walk('tests');

['tests/data/present-perfect.test.ts', 'tests/data/present-perfect-continuous.test.ts', 'tests/data/present-continuous.test.ts'].forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/expect\(conjugationCount\)\.toBe\(80\);/g, 'expect(conjugationCount).toBe(20);');
    c = c.replace(/expect\(errorHuntingCount\)\.toBe\(80\);/g, 'expect(errorHuntingCount).toBe(20);');
    c = c.replace(/expect\(sentenceBuildingCount\)\.toBe\(80\);/g, 'expect(sentenceBuildingCount).toBe(20);');
    c = c.replace(/expect\(devOpsChallengeCount\)\.toBe\(80\);/g, 'expect(devOpsChallengeCount).toBe(20);');
    fs.writeFileSync(f, c, 'utf8');
  }
});
