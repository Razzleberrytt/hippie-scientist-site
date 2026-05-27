import XLSX from 'xlsx';
import path from 'path';

const workbookPath = path.resolve('data-sources/herb_monograph_master.xlsx');
const workbook = XLSX.readFile(workbookPath);
const sheetName = 'Compound Master V3';
const sheet = workbook.Sheets[sheetName];

// Get A1 to Z1 cells
const headers = [];
const range = XLSX.utils.decode_range(sheet['!ref']);
for (let col = range.s.c; col <= range.e.c; col++) {
  const cellRef = XLSX.utils.encode_cell({ r: range.s.r, c: col });
  const cell = sheet[cellRef];
  if (cell && cell.v) {
    headers.push(cell.v);
  }
}

console.log(headers.join('\n'));
