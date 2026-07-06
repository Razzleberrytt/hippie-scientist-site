import ExcelJS from 'exceljs';
import path from 'node:path';

// NOTE (workbook pipeline stabilization): this editor is currently STALE and
// non-functional against the live workbook. Two blockers, both documented in
// docs/workbook-pipeline.md:
//   1. ExcelJS `readFile` throws on this workbook's table definitions, so it
//      cannot be opened for writing at all.
//   2. The live workbook stores entity rows in the `Entity_Master` sheet; the
//      `Herb Master V3` / `Compound Master V3` sheets referenced below no longer
//      exist.
// Do not use this script until the write-path tooling is restored. The guard
// below converts the previous cryptic crash into an actionable message.
async function main() {
  const wbPath = path.resolve('data-sources/herb_monograph_master.xlsx');
  console.log('Loading workbook from:', wbPath);
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(wbPath);
  } catch (error) {
    console.error(
      '\n[edit-workbook] Cannot open the workbook for writing via ExcelJS: ' + error.message +
      '\n[edit-workbook] This editor is STALE and the write path is broken. See docs/workbook-pipeline.md' +
      ' ("Tooling blocker" + "Editing workbook rows safely"). No changes were made.\n',
    );
    process.exit(1);
  }

  if (!workbook.getWorksheet('Herb Master V3') && workbook.getWorksheet('Entity_Master')) {
    console.error(
      '\n[edit-workbook] This script targets the removed "Herb Master V3" / "Compound Master V3" sheets, but the' +
      ' live workbook uses a single "Entity_Master" sheet. It is stale — do not run it. See docs/workbook-pipeline.md.\n',
    );
    process.exit(1);
  }

  // 1. Process Herb Master V3
  {
    const sheet = workbook.getWorksheet('Herb Master V3');
    if (!sheet) throw new Error('Herb Master V3 sheet not found');
    
    const headerRow = sheet.getRow(1);
    const headers = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value;
    });

    const getColIndex = (name) => {
      const idx = headers.indexOf(name);
      if (idx !== -1) return idx;
      // Add new column
      const newIdx = headers.length === 0 ? 1 : headers.length;
      headerRow.getCell(newIdx).value = name;
      headers[newIdx] = name;
      console.log(`Added column "${name}" to Herb Master V3 at index ${newIdx}`);
      return newIdx;
    };

    const featuredCol = getColIndex('featured');
    const controlledCol = getColIndex('controlled_substance');
    const legalCol = getColIndex('legal_status');

    headerRow.commit();

    let updatedCount = 0;
    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const slug = String(row.getCell(1).value || '').trim().toLowerCase();
      if (!slug) continue;

      // Reset values
      row.getCell(featuredCol).value = '';
      row.getCell(controlledCol).value = '';
      row.getCell(legalCol).value = '';

      if (['ashwagandha', 'lions-mane', 'turmeric'].includes(slug)) {
        row.getCell(featuredCol).value = true;
        updatedCount++;
        console.log(`Herb: Set featured=true for ${slug}`);
      }
      
      row.commit();
    }
    console.log(`Herb Master V3 processed. Set ${updatedCount} featured herbs.`);
  }

  // 2. Process Compound Master V3
  {
    const sheet = workbook.getWorksheet('Compound Master V3');
    if (!sheet) throw new Error('Compound Master V3 sheet not found');
    
    const headerRow = sheet.getRow(1);
    const headers = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value;
    });

    const getColIndex = (name) => {
      const idx = headers.indexOf(name);
      if (idx !== -1) return idx;
      const newIdx = headers.length === 0 ? 1 : headers.length;
      headerRow.getCell(newIdx).value = name;
      headers[newIdx] = name;
      console.log(`Added column "${name}" to Compound Master V3 at index ${newIdx}`);
      return newIdx;
    };

    const featuredCol = getColIndex('featured');
    const controlledCol = getColIndex('controlled_substance');
    const legalCol = getColIndex('legal_status');

    headerRow.commit();

    let featuredCount = 0;
    let controlledCount = 0;
    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const slug = String(row.getCell(1).value || '').trim().toLowerCase();
      if (!slug) continue;

      row.getCell(featuredCol).value = '';
      row.getCell(controlledCol).value = '';
      row.getCell(legalCol).value = '';

      if (['magnesium', 'magnesium-glycinate', 'creatine', 'creatine-monohydrate', 'melatonin'].includes(slug)) {
        row.getCell(featuredCol).value = true;
        featuredCount++;
        console.log(`Compound: Set featured=true for ${slug}`);
      }

      if (['5-meo-dmt', '7-hydroxymitragynine', 'kratom', 'mitragynine'].includes(slug)) {
        row.getCell(controlledCol).value = true;
        if (slug === '5-meo-dmt') {
          row.getCell(legalCol).value = 'Schedule I';
        } else {
          row.getCell(legalCol).value = 'DEA Concern / Restricted';
        }
        controlledCount++;
        console.log(`Compound: Set controlled_substance=true for ${slug}`);
      }

      row.commit();
    }
    console.log(`Compound Master V3 processed. Set ${featuredCount} featured compounds, ${controlledCount} controlled compounds.`);
  }

  console.log('Saving workbook...');
  await workbook.xlsx.writeFile(wbPath);
  console.log('Workbook saved successfully.');
}

main().catch(console.error);
