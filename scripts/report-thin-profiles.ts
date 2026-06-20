import fs from 'node:fs';
import path from 'node:path';
import { passesGeneratedProfileQualityGate, shouldIndexRoute } from '../src/lib/seo';

const herbsPath = path.join(process.cwd(), 'public/data/herbs.json');
const compoundsPath = path.join(process.cwd(), 'public/data/compounds.json');

const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'));
const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'));

console.log('=== SEO Quality Gate Exclusions Report ===\n');

let excludedHerbsCount = 0;
let totalHerbsCount = 0;
const excludedHerbs: string[] = [];

herbs.forEach((herb: any) => {
  totalHerbsCount++;
  // We only check profiles that might otherwise be PUBLISHED
  if (herb.indexability_status !== 'PUBLISH') return;
  
  const pathName = `/herbs/${herb.slug}`;
  const decision = shouldIndexRoute(pathName, herb);
  if (!decision.index) {
    excludedHerbsCount++;
    excludedHerbs.push(`${herb.slug} (Reason: ${decision.reason})`);
  }
});

let excludedCompoundsCount = 0;
let totalCompoundsCount = 0;
const excludedCompounds: string[] = [];

compounds.forEach((compound: any) => {
  totalCompoundsCount++;
  if (compound.indexability_status !== 'PUBLISH') return;

  const pathName = `/compounds/${compound.slug}`;
  const decision = shouldIndexRoute(pathName, compound);
  if (!decision.index) {
    excludedCompoundsCount++;
    excludedCompounds.push(`${compound.slug} (Reason: ${decision.reason})`);
  }
});

console.log(`Herbs Excluded from Indexing: ${excludedHerbsCount} / ${totalHerbsCount}`);
if (excludedHerbs.length > 0) {
  excludedHerbs.forEach(item => console.log(` - ${item}`));
} else {
  console.log(' - None');
}

console.log(`\nCompounds Excluded from Indexing: ${excludedCompoundsCount} / ${totalCompoundsCount}`);
if (excludedCompounds.length > 0) {
  excludedCompounds.forEach(item => console.log(` - ${item}`));
} else {
  console.log(' - None');
}

console.log('\nReport completed.');
