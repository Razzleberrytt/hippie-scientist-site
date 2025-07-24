const fs = require('fs');

/**
 * Fail-fast herb validation script.
 * Prints all errors and exits with non-zero status when data issues are found.
 */

const herbs = JSON.parse(fs.readFileSync('src/data/herbs/herbs.json', 'utf8'));

const requiredFields = [
  'name',
  'slug',
  'tags',
  'effects',
  'affiliateLink',
  'activeConstituents',
  'mechanismOfAction',
  'legalStatus',
];

let hadError = false;

function checkHerb(h) {
  const missing = [];
  for (const key of requiredFields) {
    const val = h[key];
    if (val == null || (Array.isArray(val) ? val.length === 0 : val === '')) {
      missing.push(key);
    }
  }

  const typeErrors = [];
  if (typeof h.name !== 'string') typeErrors.push('name must be string');
  if (typeof h.slug !== 'string') typeErrors.push('slug must be string');
  if (!Array.isArray(h.tags)) typeErrors.push('tags must be array');
  if (!Array.isArray(h.effects)) typeErrors.push('effects must be array');
  if (h.activeConstituents && !Array.isArray(h.activeConstituents)) {
    typeErrors.push('activeConstituents must be array');
  }

  if (missing.length || typeErrors.length) {
    hadError = true;
    console.error(`\n❌ Invalid entry for ${h.name || h.slug || 'unknown'}:`);
    if (missing.length) console.error('  Missing:', missing.join(', '));
    if (typeErrors.length) console.error('  Type errors:', typeErrors.join(', '));
  }
}

herbs.forEach(checkHerb);

if (hadError) {
  console.error(`\nValidation failed: ${herbs.length} entries checked.`);
  process.exit(1);
} else {
  console.log(`All ${herbs.length} herb entries validated successfully.`);
}
