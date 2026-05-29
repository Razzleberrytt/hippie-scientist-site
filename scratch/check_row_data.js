import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
console.log("Sheet names:", workbook.SheetNames);

for (const name of workbook.SheetNames) {
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  const chagaRows = data.filter(row => row.slug === 'chaga' || row.name === 'Chaga');
  const oatsRows = data.filter(row => row.slug === 'oatstraw' || row.slug === 'milk-oats' || row.name === 'Oatstraw' || row.name === 'Milk Oats');
  
  if (chagaRows.length > 0) {
    console.log(`\n=== Sheet: ${name} (Chaga) ===`);
    chagaRows.forEach(row => {
      console.log(JSON.stringify(row, null, 2));
    });
  }
  
  if (oatsRows.length > 0) {
    console.log(`\n=== Sheet: ${name} (Oats) ===`);
    oatsRows.forEach(row => {
      console.log(JSON.stringify(row, null, 2));
    });
  }
}
