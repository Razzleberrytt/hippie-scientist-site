import { readWorkbook, getSheet, sheetToRows } from '../scripts/data/workbook-parser.mjs';
import { resolveWorkbookPath } from '../scripts/workbook-source.mjs';

const wbPath = resolveWorkbookPath('.');
const wb = readWorkbook(wbPath);

const keywords = ['related', 'compare', 'neighbor', 'ecosystem', 'association', 'herb', 'compound', 'synergy'];

for (const sheetName of ['Herb Master V3', 'Compound Master V3']) {
  const sheet = getSheet(wb, sheetName);
  if (sheet) {
    const rows = sheetToRows(sheet);
    if (rows.length > 0) {
      const keys = Object.keys(rows[0]);
      console.log(`\nSheet: ${sheetName}`);
      const matches = keys.filter(key => keywords.some(kw => key.toLowerCase().includes(kw)));
      console.log('Matches:', matches);
    }
  }
}
