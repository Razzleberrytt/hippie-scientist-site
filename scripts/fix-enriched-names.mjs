import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const herbsPath = path.resolve(__dirname, '../src/data/herbs_enriched.json');

const toTitleCase = (value) =>
  value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const sourceCounts = {
  commonnames: 0,
  scientificname: 0,
  id: 0,
};

const raw = await fs.readFile(herbsPath, 'utf8');
const records = JSON.parse(raw);

for (const record of records) {
  if (isNonEmptyString(record.commonnames)) {
    const firstCommonName = record.commonnames
      .split(',')
      .map((entry) => entry.trim())
      .find((entry) => entry.length > 0);

    if (firstCommonName) {
      record.name = toTitleCase(firstCommonName);
      sourceCounts.commonnames += 1;
      continue;
    }
  }

  if (isNonEmptyString(record.scientificname)) {
    record.name = record.scientificname.trim();
    sourceCounts.scientificname += 1;
    continue;
  }

  const idName = isNonEmptyString(record.id) ? toTitleCase(record.id.replace(/-/g, ' ')) : '';
  record.name = idName;
  sourceCounts.id += 1;
}

await fs.writeFile(herbsPath, `${JSON.stringify(records, null, 2)}\n`);

console.log(`Total records: ${records.length}`);
console.log(`name from commonnames: ${sourceCounts.commonnames}`);
console.log(`name from scientificname: ${sourceCounts.scientificname}`);
console.log(`name from id: ${sourceCounts.id}`);
