import XLSX from 'xlsx';
import path from 'path';

const workbookPath = path.resolve('data-sources/herb_monograph_master.xlsx');
const workbook = XLSX.readFile(workbookPath);
const sheetName = 'Compound Master V3';
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

if (rows.length > 0) {
  const keys = Object.keys(rows[0]);
  console.log('Searching for keys:');
  const searchTerms = ['reverse', 'ready', 'lookup', 'herb', 'count', 'elig', 'pub', 'status'];
  keys.forEach(k => {
    const lk = k.toLowerCase();
    if (searchTerms.some(term => lk.includes(term))) {
      console.log(`- ${k}`);
    }
  });
}
