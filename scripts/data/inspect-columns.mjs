import ExcelJS from 'exceljs';
import path from 'node:path';

async function main() {
  const wbPath = path.resolve('data-sources/herb_monograph_master.xlsx');
  console.log('Loading workbook from:', wbPath);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(wbPath);
  
  const sheetName = 'Herb Master V3';
  const sheet = workbook.getWorksheet(sheetName);
  console.log(`\nSheet: "${sheetName}"`);
  const headerRow = sheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell, colNumber) => {
    headers.push({ colNumber, value: cell.value });
  });
  console.log('Headers count:', headers.length);
  console.log('Headers:', headers.map(h => `${h.colNumber}:${h.value}`).join(', '));
}

main().catch(console.error);
