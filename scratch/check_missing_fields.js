import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
const sheet = workbook.Sheets['Compound Master V3'];
if (sheet) {
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log("Total rows in Compound Master V3:", data.length);
  if (data.length > 0) {
    let missingBestFor = 0;
    let missingAvoidIf = 0;
    let missingAsin = 0;

    for (const row of data) {
      if (!row.best_for && !row.best_for_v2 && !row.best_for_primary && !row.targets && !row.pathways) {
        missingBestFor++;
      }
      if (!row.avoid_if && !row.who_should_avoid && !row.contraindications && !row.safetyNotes) {
        missingAvoidIf++;
      }
      if (!row.amazon_affiliate_url && !row.affiliate_link) {
        missingAsin++;
      }
    }

    console.log(`Missing best_for/targets: ${missingBestFor} (${(missingBestFor/data.length*100).toFixed(1)}%)`);
    console.log(`Missing avoid_if/safety: ${missingAvoidIf} (${(missingAvoidIf/data.length*100).toFixed(1)}%)`);
    console.log(`Missing affiliate link / ASIN: ${missingAsin} (${(missingAsin/data.length*100).toFixed(1)}%)`);
  }
} else {
  console.log("Compound Master V3 sheet not found");
}
