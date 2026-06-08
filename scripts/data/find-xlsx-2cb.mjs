import ExcelJS from 'exceljs';
import path from 'node:path';

async function main() {
  const wbPath = path.resolve('data-sources/herb_monograph_master.xlsx');
  console.log('Loading workbook from:', wbPath);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(wbPath);
  
  for (const sheet of workbook.worksheets) {
    let found = false;
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        const val = String(cell.value || '');
        if (val.toLowerCase().includes('2c-b')) {
          console.log(`Found in Sheet "${sheet.name}" Row ${rowNumber} Col ${colNumber}: "${val.substring(0, 100)}"`);
          found = true;
        }
      });
    });
  }
}

main().catch(console.error);
