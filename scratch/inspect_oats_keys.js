import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
const sheet = workbook.Sheets['Herb Monographs'];
const data = xlsx.utils.sheet_to_json(sheet);

const oats = data.filter(row => 
  row.slug === 'oatstraw' || 
  row.slug === 'milk-oats' || 
  row.name === 'Oatstraw' || 
  row.name === 'Milk Oats' ||
  row.canonical_slug === 'oatstraw' ||
  row.canonical_slug === 'milk-oats' ||
  row.canonical_slug_v2 === 'oatstraw' ||
  row.canonical_slug_v2 === 'milk-oats'
);

console.log(`Found oats rows in Herb Monographs: ${oats.length}`);
oats.forEach(row => {
  console.log("slug:", row.slug, "canonical_slug:", row.canonical_slug, "canonical_slug_v2:", row.canonical_slug_v2, "name:", row.name);
  console.log("contraindications:", row.contraindications);
});
