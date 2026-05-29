import fs from 'fs';

const map = JSON.parse(fs.readFileSync('public/data/workbook-herb-compound-map.json', 'utf8'));
const counts = {};

map.forEach(row => {
  const cid = row.canonicalCompoundId;
  if (cid) {
    counts[cid] = (counts[cid] || 0) + 1;
  }
});

console.log("Compounds with mapped herbs count:", Object.keys(counts).length);
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
console.log("Top 10 compounds by herb count:");
sorted.slice(0, 10).forEach(([cid, count]) => {
  console.log(`- ${cid}: ${count}`);
});
