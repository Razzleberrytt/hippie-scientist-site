import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
const herbSheet = workbook.Sheets['Herb Master V3'];
const herbData = xlsx.utils.sheet_to_json(herbSheet);
console.log("Herb Master V3 keys:", Object.keys(herbData[0] || {}));

const compoundSheet = workbook.Sheets['Compound Master V3'];
const compoundData = xlsx.utils.sheet_to_json(compoundSheet);
console.log("Compound Master V3 keys:", Object.keys(compoundData[0] || {}));
