import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
const sheet = workbook.Sheets['Compound Master V3'];
const data = xlsx.utils.sheet_to_json(sheet);

const counts = {};
data.forEach(row => {
  Object.entries(row).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      counts[k] = (counts[k] || 0) + 1;
    }
  });
});

console.log("Populated columns and their non-empty row counts:");
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, count]) => {
  console.log(`- ${k}: ${count} / ${data.length}`);
});
