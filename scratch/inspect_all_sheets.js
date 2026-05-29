import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
console.log("Workbook sheets:", workbook.SheetNames);
