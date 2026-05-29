import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');

const sheetsToCheck = ['Herb Monographs'];
for (const name of sheetsToCheck) {
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  const milkOatsRow = data.find(row => row.slug === 'milk-oats');
  if (milkOatsRow) {
    console.log("Milk Oats contraindications:", milkOatsRow.contraindications);
  }
}
