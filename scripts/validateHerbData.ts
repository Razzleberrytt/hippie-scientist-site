import fs from 'fs';

const raw = fs.readFileSync('data/herbs.json', 'utf-8');
const herbs = JSON.parse(raw);

let errorCount = 0;

for (const herb of herbs) {
  if (!herb.name) {
    console.error('Missing name:', herb);
    errorCount++;
  }
  if (!herb.effects || herb.effects.length === 0) {
    console.error('Missing effects:', herb.name);
    errorCount++;
  }
  // Add other required field checks as needed
}

if (errorCount > 0) {
  console.warn(`Found ${errorCount} validation issue(s).`);
  process.exit(1);
} else {
  console.log('Herb validation passed.');
}
