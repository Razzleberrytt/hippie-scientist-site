import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');

const sheetsToCheck = ['Herb Master'];
for (const name of sheetsToCheck) {
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  const oatsRows = data.filter(row => row.slug === 'oatstraw' || row.slug === 'milk-oats' || row.name === 'Oatstraw' || row.name === 'Milk Oats');
  
  if (oatsRows.length > 0) {
    console.log(`\n=== Sheet: ${name} (Oats) ===`);
    oatsRows.forEach(row => {
      console.log("Keys containing review or contraindication:");
      for (const [k, v] of Object.entries(row)) {
        if (String(v).includes('review') || String(k).includes('contra')) {
          console.log(`  ${k}: ${v}`);
        }
      }
    });
  }
}
