import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');

const searchSlugs = [
  'ashwagandha', 'rhodiola', 'curcumin', 'lions-mane', 'bacopa-monnieri',
  'valerian', 'kava', 'ginger', 'ginkgo-biloba', 'lemon-balm',
  'l-theanine', 'melatonin', 'caffeine', 'magnesium-threonate', 'magnesium-glycinate',
  'coenzyme-q10', 'coq10', 'creatine', 'sulforaphane', 'alpha-gpc', 'citicoline', 'apigenin'
];

for (const name of ['Herb Master V3', 'Compound Master V3']) {
  const sheet = workbook.Sheets[name];
  if (!sheet) continue;
  const data = xlsx.utils.sheet_to_json(sheet);
  const found = data.filter(row => searchSlugs.includes(row.slug));
  console.log(`\nSheet: ${name}, Found matches: ${found.length}`);
  found.forEach(row => {
    console.log(`  Slug: "${row.slug}", Name: "${row.name}", Affiliate URL: "${row.amazon_affiliate_url || row.affiliate_link || ''}"`);
  });
}
