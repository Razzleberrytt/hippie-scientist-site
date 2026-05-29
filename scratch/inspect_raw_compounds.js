import fs from 'fs';

const compounds = JSON.parse(fs.readFileSync('public/data/compounds.json', 'utf8'));

const caffeine = compounds.find(x => x.slug === 'caffeine');

if (caffeine) {
  console.log("Caffeine fields in compounds.json:");
  console.log(JSON.stringify(caffeine, null, 2));
} else {
  console.log("Caffeine not found in compounds.json");
  if (compounds.length > 0) {
    console.log("First compound:", JSON.stringify(compounds[0], null, 2));
  }
}
