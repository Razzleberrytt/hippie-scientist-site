import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');
const sheet = workbook.Sheets['Compound Master V3'];
const data = xlsx.utils.sheet_to_json(sheet);

const fields = ['site_export_status_v2', 'seo_publish_status', 'runtime_export_ready', 'runtime_limited_ready', 'readiness_tier', 'implementation_status'];

fields.forEach(f => {
  const vals = {};
  data.forEach(row => {
    const v = row[f];
    vals[v] = (vals[v] || 0) + 1;
  });
  console.log(`\nValues for "${f}":`, vals);
});
