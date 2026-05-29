import xlsx from 'xlsx';

const workbook = xlsx.readFile('data-sources/herb_monograph_master.xlsx');

const affiliateMap = {
  'ashwagandha': 'https://www.amazon.com/s?k=organic+ashwagandha+supplement+third+party+tested',
  'rhodiola': 'https://www.amazon.com/s?k=organic+rhodiola+rosea+extract+third+party+tested',
  'curcumin': 'https://www.amazon.com/s?k=organic+curcumin+turmeric+extract+with+piperine',
  'lions-mane': 'https://www.amazon.com/s?k=organic+lions-mane+mushroom+extract+powder',
  'bacopa-monnieri': 'https://www.amazon.com/s?k=standardized+bacopa+monnieri+extract+third+party+tested',
  'valerian': 'https://www.amazon.com/s?k=valerian+root+extract+capsules+third+party+tested',
  'kava': 'https://www.amazon.com/s?k=kava+kava+root+extract+supplement',
  'ginger': 'https://www.amazon.com/s?k=organic+ginger+root+supplement+third+party+tested',
  'ginkgo-biloba': 'https://www.amazon.com/s?k=standardized+ginkgo+biloba+extract+third+party+tested',
  'lemon-balm': 'https://www.amazon.com/s?k=organic+lemon-balm+melissa-officinalis+supplement',
  'l-theanine': 'https://www.amazon.com/s?k=l-theanine+supplement+third+party+tested+suntheanine',
  'melatonin': 'https://www.amazon.com/s?k=low+dose+melatonin+supplement+third+party+tested',
  'caffeine': 'https://www.amazon.com/s?k=caffeine+and+l-theanine+capsules',
  'magnesium-threonate': 'https://www.amazon.com/s?k=magnesium-l-threonate+supplement+third+party+tested',
  'magnesium-glycinate': 'https://www.amazon.com/s?k=magnesium-glycinate-supplement+third+party+tested',
  'coenzyme-q10': 'https://www.amazon.com/s?k=coq10+ubiquinol+supplement+third+party+tested',
  'coq10': 'https://www.amazon.com/s?k=coq10+ubiquinol+supplement+third+party+tested',
  'creatine': 'https://www.amazon.com/s?k=creatine+monohydrate+powder+micronized+third+party+tested',
  'sulforaphane': 'https://www.amazon.com/s?k=sulforaphane+broccoli+sprout+extract+third+party+tested',
  'alpha-gpc': 'https://www.amazon.com/s?k=alpha-gpc+supplement+third+party+tested',
  'citicoline': 'https://www.amazon.com/s?k=citicoline+cdp-choline+supplement+third+party+tested',
  'apigenin': 'https://www.amazon.com/s?k=apigenin+supplement+third+party+tested'
};

let enrichedCount = 0;

for (const name of ['Herb Master V3', 'Compound Master V3']) {
  const sheet = workbook.Sheets[name];
  if (!sheet) continue;
  const data = xlsx.utils.sheet_to_json(sheet);
  
  let modified = false;
  for (const row of data) {
    if (affiliateMap[row.slug]) {
      row.amazon_affiliate_url = affiliateMap[row.slug];
      row.affiliate_ready = true;
      enrichedCount++;
      modified = true;
    }
  }
  
  if (modified) {
    const newSheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets[name] = newSheet;
  }
}

if (enrichedCount > 0) {
  xlsx.writeFile(workbook, 'data-sources/herb_monograph_master.xlsx');
  console.log(`Successfully enriched ${enrichedCount} rows with Amazon affiliate URLs!`);
} else {
  console.log("No matching rows enriched.");
}
