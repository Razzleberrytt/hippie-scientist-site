import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
const sheetName = 'Herb Monographs';
const sheet = workbook.Sheets[sheetName];
// Preserve cell styling and formulas if any (raw: true, etc. aren't fully needed but utils.sheet_to_json is standard)
const data = xlsx.utils.sheet_to_json(sheet);

let chagaFixed = 0;
let oatsFixed = 0;

for (const row of data) {
  if (row.slug === 'chaga' || row.name === 'Chaga') {
    if (row.summary === 'Oxidative stress.') {
      row.summary = 'A medicinal mushroom widely used in traditional medicine, best known for its rich antioxidant content and potential to support immune function, modulate inflammation, and manage cellular stress.';
      chagaFixed++;
    }
    if (row.description === 'Oxidative stress.') {
      row.description = 'Chaga (Inonotus obliquus) is a parasitic fungus that grows primarily on birch trees in cold climates. Widely celebrated in traditional Siberian and Northern European folklore, it is highly valued for its rich content of bioactive compounds—including beta-glucans, triterpenoids, and polyphenols. While human clinical trials are limited, research highlights its strong antioxidant activity, potential for immune system support, and role in modulating inflammatory pathways.';
      chagaFixed++;
    }
  }
  if (row.slug === 'oatstraw' || row.slug === 'milk-oats') {
    if (row.contraindications && row.contraindications.includes('pregnancy/breastfeeding supplement use needs review')) {
      row.contraindications = row.contraindications.replace(
        'pregnancy/breastfeeding supplement use needs review',
        'pregnancy/breastfeeding caution'
      );
      oatsFixed++;
    }
    if (row.contraindications_interactions && row.contraindications_interactions.includes('pregnancy/breastfeeding supplement use needs review')) {
      row.contraindications_interactions = row.contraindications_interactions.replace(
        'pregnancy/breastfeeding supplement use needs review',
        'pregnancy/breastfeeding caution'
      );
      oatsFixed++;
    }
  }
}

console.log(`Chaga fixes: ${chagaFixed}, Oats fixes: ${oatsFixed}`);

if (chagaFixed > 0 || oatsFixed > 0) {
  // Convert JSON back to sheet
  const newSheet = xlsx.utils.json_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;
  xlsx.writeFile(workbook, 'data-sources/herb_monograph_master.xlsx');
  console.log("Workbook written back successfully!");
} else {
  console.log("No changes needed or matching rows not found.");
}
