import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
const sheet = workbook.Sheets['Compound Master V3'];
const data = xlsx.utils.sheet_to_json(sheet);

console.log("Total rows in Compound Master V3:", data.length);

const keys = new Set();
data.forEach(row => {
  Object.keys(row).forEach(k => keys.add(k));
});

console.log("All columns in Compound Master V3 (Set):", Array.from(keys).sort());

// Check if any row has reverseLookupReady or herbCount
let hasReverse = 0;
let hasHerbCount = 0;
let hasMechanism = 0;

data.forEach((row, i) => {
  if (row.reverseLookupReady) hasReverse++;
  if (row.herbCount) hasHerbCount++;
  if (row.mechanism) hasMechanism++;
});

console.log(`Counts of non-empty cells:
- reverseLookupReady: ${hasReverse}
- herbCount: ${hasHerbCount}
- mechanism: ${hasMechanism}
`);

if (data.length > 0) {
  console.log("First row sample:", JSON.stringify(data[0], null, 2));
}
