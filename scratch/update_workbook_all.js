import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
console.log("Workbook sheets:", workbook.SheetNames);

let totalReplacements = 0;

for (const name of workbook.SheetNames) {
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  let sheetModified = false;

  for (const row of data) {
    // 1. Replace Oatstraw & Milk Oats contraindications
    if (row.slug === 'oatstraw' || row.slug === 'milk-oats' || row.name === 'Oatstraw' || row.name === 'Milk Oats') {
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string' && value.includes('pregnancy/breastfeeding supplement use needs review')) {
          row[key] = value.replace(
            'pregnancy/breastfeeding supplement use needs review',
            'pregnancy/breastfeeding caution'
          );
          console.log(`Replacing in sheet "${name}", row ${row.slug || row.name}, key "${key}"`);
          totalReplacements++;
          sheetModified = true;
        }
      }
    }

    // 2. Replace Chaga stub description/summary
    if (row.slug === 'chaga' || row.name === 'Chaga' || row.name === 'Chaga (Inonotus obliquus)') {
      if (row.summary === 'Oxidative stress.') {
        row.summary = 'A medicinal mushroom widely used in traditional medicine, best known for its rich antioxidant content and potential to support immune function, modulate inflammation, and manage cellular stress.';
        console.log(`Replacing Chaga summary in sheet "${name}"`);
        totalReplacements++;
        sheetModified = true;
      }
      if (row.description === 'Oxidative stress.') {
        row.description = 'Chaga (Inonotus obliquus) is a parasitic fungus that grows primarily on birch trees in cold climates. Widely celebrated in traditional Siberian and Northern European folklore, it is highly valued for its rich content of bioactive compounds—including beta-glucans, triterpenoids, and polyphenols. While human clinical trials are limited, research highlights its strong antioxidant activity, potential for immune system support, and role in modulating inflammatory pathways.';
        console.log(`Replacing Chaga description in sheet "${name}"`);
        totalReplacements++;
        sheetModified = true;
      }
    }
  }

  if (sheetModified) {
    const newSheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets[name] = newSheet;
  }
}

if (totalReplacements > 0) {
  xlsx.writeFile(workbook, 'data-sources/herb_monograph_master.xlsx');
  console.log(`Workbook updated successfully. Total replacements: ${totalReplacements}`);
} else {
  console.log("No replacements made.");
}
