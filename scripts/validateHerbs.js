const fs = require('fs');
const herbs = JSON.parse(fs.readFileSync('Full200.json', 'utf8'));

const required = ['affiliateLink', 'activeConstituents', 'mechanismOfAction', 'legalStatus'];
let missing = [];
herbs.forEach(h => {
  const missingKeys = required.filter(key => {
    const val = h[key];
    return val == null || (Array.isArray(val) ? val.length === 0 : val === '');
  });
  if (missingKeys.length) {
    console.log(`${h.name}: missing ${missingKeys.join(', ')}`);
    missing.push({ name: h.name, missing: missingKeys });
  }
});

if (!missing.length) {
  console.log('All entries complete');
}
