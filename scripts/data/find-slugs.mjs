import fs from 'node:fs';

const herbs = JSON.parse(fs.readFileSync('public/data/herbs.json', 'utf8'));
const compounds = JSON.parse(fs.readFileSync('public/data/compounds.json', 'utf8'));

const targets = ['ashwagandha', 'lion', 'magnesium', 'creatine', 'turmeric', 'curcumin', 'melatonin'];

console.log('Herbs matches:');
for (const h of herbs) {
  if (targets.some(t => h.slug.toLowerCase().includes(t) || h.name.toLowerCase().includes(t))) {
    console.log(`- Slug: "${h.slug}", Name: "${h.name}"`);
  }
}

console.log('\nCompounds matches:');
for (const c of compounds) {
  if (targets.some(t => c.slug.toLowerCase().includes(t) || c.name.toLowerCase().includes(t))) {
    console.log(`- Slug: "${c.slug}", Name: "${c.name}"`);
  }
}
