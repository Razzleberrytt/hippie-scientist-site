import ExcelJS from 'exceljs';
import path from 'node:path';

async function main() {
  const wbPath = path.resolve('data-sources/herb_monograph_master.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(wbPath);
  const sheet = workbook.getWorksheet('Herb Monographs');
  
  sheet.eachRow((row, rowNumber) => {
    const name = String(row.getCell(2).value || '');
    if (name.toLowerCase().includes('ashwagandha')) {
      console.log(`Row ${rowNumber}:`);
      row.eachCell((cell, colNumber) => {
        console.log(`  Col ${colNumber} (${sheet.getRow(1).getCell(colNumber).value}): ${cell.value}`);
      });
    }
  });
}

main().catch(console.error);
