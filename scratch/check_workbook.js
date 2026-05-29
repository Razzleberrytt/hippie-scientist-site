import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
console.log("Sheet names:", workbook.SheetNames);

for (const name of workbook.SheetNames) {
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  // Find Chaga
  const chagaRows = data.filter(row => {
    const values = Object.values(row).map(String).join(' ').toLowerCase();
    return values.includes('chaga') || values.includes('inonotus');
  });
  
  if (chagaRows.length > 0) {
    console.log(`\n--- Sheet ${name} has Chaga:`);
    chagaRows.forEach(row => {
      console.log(JSON.stringify(row, null, 2));
    });
  }

  // Find Oatstraw / Milk oats
  const oatsRows = data.filter(row => {
    const values = Object.values(row).map(String).join(' ').toLowerCase();
    return values.includes('oatstraw') || values.includes('milk oats') || values.includes('milky oats');
  });

  if (oatsRows.length > 0) {
    console.log(`\n--- Sheet ${name} has Oat/Oatstraw rows (showing up to 2):`);
    oatsRows.slice(0, 2).forEach(row => {
      console.log(JSON.stringify(row, null, 2));
    });
  }
}
