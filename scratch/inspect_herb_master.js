import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
const sheet = workbook.Sheets['Herb Master'];
const data = xlsx.utils.sheet_to_json(sheet);

console.log("Herb Master total rows:", data.length);
if (data.length > 0) {
  console.log("Keys:", Object.keys(data[0]));
}

// Find any row that matches chaga or oats in Herb Master
const chaga = data.filter(row => {
  const values = Object.values(row).map(String).join(' ').toLowerCase();
  return values.includes('chaga') || values.includes('oat');
});

console.log(`Found matching rows: ${chaga.length}`);
chaga.forEach(row => {
  console.log(row.slug, row.name);
});
