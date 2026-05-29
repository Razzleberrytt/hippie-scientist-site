import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');

const sheetsToCheck = ['Herb Master', 'Herb Monographs'];
for (const name of sheetsToCheck) {
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  const chagaRows = data.filter(row => row.slug === 'chaga' || row.name === 'Chaga' || row.name?.startsWith('Chaga'));
  
  if (chagaRows.length > 0) {
    console.log(`\n=== Sheet: ${name} (Chaga) ===`);
    chagaRows.forEach(row => {
      console.log("Keys and Values:");
      for (const [k, v] of Object.entries(row)) {
        if (k.toLowerCase().includes('desc') || k.toLowerCase().includes('summary') || k.toLowerCase().includes('takeaway')) {
          console.log(`  ${k}: ${v}`);
        }
      }
    });
  }
}
