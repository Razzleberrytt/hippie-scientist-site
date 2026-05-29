import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
console.log("Sheet names:", workbook.SheetNames);

for (const name of workbook.SheetNames) {
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (const [key, value] of Object.entries(row)) {
      if (String(value).includes('pregnancy/breastfeeding supplement use needs review')) {
        console.log(`Found in Sheet "${name}", Row ${i}, Key "${key}": "${value}"`);
      }
    }
  }
}
