import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const LEAK_REPLACEMENTS = {
  'bupleurum-falcatum': {
    summary: "Bupleurum falcatum is an herb historically used in traditional East Asian medicine, containing active compounds like Saikosaponin A.",
    description: "Bupleurum falcatum (Chinese thoroughwax) is a traditional medicinal herb containing saikosaponins. It is historically studied for its potential anti-inflammatory, neuroprotective, and HPA-axis modulating effects."
  },
  'citrus-sinensis': {
    summary: "Citrus sinensis (Sweet Orange) is a fruit botanical notable for its rich content of flavonoids like hesperidin.",
    description: "Citrus sinensis (Sweet Orange) peel and fruit extracts are rich sources of bioactive flavonoids, particularly hesperidin. It is studied for cardiovascular support, antioxidant defense, and inflammatory response regulation."
  },
  'crocus-sativus': {
    summary: "Crocus sativus (Saffron) is a highly valued spice botanical containing crocin, crocetin, and safranal, with emerging evidence for mood support.",
    description: "Crocus sativus (Saffron) is a spice botanical with rich clinical literature supporting its use for mood improvement, anxiety regulation, and neuroprotection. Bioactive components include crocin and safranal."
  },
  'glycyrrhiza-glabra': {
    summary: "Glycyrrhiza glabra (Licorice) is a traditional root botanical studied for gastrointestinal soothing and cortisol support.",
    description: "Glycyrrhiza glabra (Licorice) root contains glycyrrhizin, which can prolong the half-life of cortisol by inhibiting 11beta-HSD. It is utilized for gastrointestinal lining support and adrenal regulation."
  },
  'lavandula-angustifolia': {
    summary: "Lavandula angustifolia (Lavender) is an aromatic herb widely used for its calming and sleep-promoting properties.",
    description: "Lavandula angustifolia (Lavender) is a popular botanical containing linalool and linalyl acetate. It has human evidence supporting its use for anxiety reduction, nervous system relaxation, and sleep quality enhancement."
  },
  'nigella-sativa': {
    summary: "Nigella sativa (Black Seed) is a traditional seed extract containing thymoquinone, studied for antioxidant and immune support.",
    description: "Nigella sativa (Black Seed) is a traditional medicinal seed rich in thymoquinone. Research indicates support for immune signaling, respiratory health, metabolic homeostasis, and antioxidant pathways."
  },
  'olea-europaea': {
    summary: "Olea europaea (Olive Leaf) contains oleuropein and hydroxytyrosol, with notable cardiovascular and immune support.",
    description: "Olea europaea (Olive Leaf) extracts are rich in oleuropein and hydroxytyrosol. Clinical studies demonstrate benefits for blood pressure regulation, antioxidant defense, and immune function."
  },
  'rheum-palmatum': {
    summary: "Rheum palmatum (Turkish Rhubarb) is a root botanical containing emodin and rhein, used traditionally for digestive health.",
    description: "Rheum palmatum (Turkish Rhubarb) root contains anthraquinones like emodin and rhein. It is studied for bowel motility regulation, gastrointestinal support, and inflammatory pathway modulation."
  },
  'schisandra-chinensis': {
    summary: "Schisandra chinensis is an adaptogenic berry botanical rich in schisandrins, used to support stress resilience and cognitive focus.",
    description: "Schisandra chinensis is an adaptogenic berry widely used in traditional medicine. Its active schisandrins are studied for physical endurance support, cognitive focus, hepatic protection, and HPA-axis regulation."
  },
  'scutellaria-baicalensis': {
    summary: "Scutellaria baicalensis (Baical Skullcap) is a root botanical containing baicalin and baicalein, studied for sleep and relaxation.",
    description: "Scutellaria baicalensis (Baical Skullcap) root contains flavonoids like baicalin, baicalein, and wogonin. It exerts notable GABA-A positive allosteric modulation, supporting sleep and anxiety reduction."
  },
  'syzygium-aromaticum': {
    summary: "Syzygium aromaticum (Clove) is an aromatic spice botanical rich in eugenol, studied for antioxidant and dental health support.",
    description: "Syzygium aromaticum (Clove) bud extracts are rich in eugenol and acetyl eugenol. It exhibits strong local anesthetic, antimicrobial, and antioxidant activities, and is studied for digestive and dental health support."
  },
  'tripterygium-wilfordii': {
    summary: "Tripterygium wilfordii (Thunder God Vine) contains celastrol, studied for auto-immune and inflammatory regulation.",
    description: "Tripterygium wilfordii (Thunder God Vine) contains celastrol. It is a potent anti-inflammatory agent studied under strict medical contexts for autoimmune regulation, though it carries a narrow therapeutic index."
  },
  'rosemary': {
    description: "Rosemary (Rosmarinus officinalis) is a traditional herb containing carnosic acid and rosmarinic acid. It is studied for antioxidant defense, acetylcholine preservation, and memory enhancement."
  },
  'sage': {
    description: "Sage (Salvia officinalis) contains rosmarinic acid and terpenes. Clinical studies suggest support for cognitive processing speed, memory recall, and mood regulation via acetylcholinesterase inhibition."
  },
  'scutellaria-lateriflora': {
    summary: "Scutellaria lateriflora (American Skullcap) is an herb traditionally used for nervous tension, anxiety, and sleep support.",
    description: "Scutellaria lateriflora (American Skullcap) is an herb traditionally used to alleviate nervous tension, anxiety, and insomnia. It acts primarily via GABAergic pathways to promote relaxation."
  }
};

async function main() {
  const wbPath = path.resolve('data-sources/herb_monograph_master.xlsx');
  
  if (!fs.existsSync(wbPath)) {
    console.error(`Error: Workbook not found at ${wbPath}`);
    process.exit(1);
  }

  console.log(`Loading workbook from ${wbPath}...`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(wbPath);

  const sheetName = 'Herb Master V3';
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    console.error(`Error: Sheet "${sheetName}" not found in workbook.`);
    process.exit(1);
  }

  // Find column headers dynamically
  const headerRow = sheet.getRow(1);
  let slugColIdx = -1;
  let summaryColIdx = -1;
  let descColIdx = -1;
  let nameColIdx = -1;

  headerRow.eachCell((cell, colNumber) => {
    const header = String(cell.value || '').trim();
    if (header === 'slug') slugColIdx = colNumber;
    if (header === 'summary') summaryColIdx = colNumber;
    if (header === 'description') descColIdx = colNumber;
    if (header === 'name') nameColIdx = colNumber;
  });

  if (slugColIdx === -1 || summaryColIdx === -1 || descColIdx === -1 || nameColIdx === -1) {
    console.error('Error: Could not locate all required headers ("slug", "summary", "description", "name").');
    process.exit(1);
  }

  console.log(`Headers located: slug(Col ${slugColIdx}), name(Col ${nameColIdx}), summary(Col ${summaryColIdx}), description(Col ${descColIdx})`);

  let leakFixedCount = 0;
  let placeholderFixedCount = 0;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip headers

    const slug = String(row.getCell(slugColIdx).value || '').trim();
    const name = String(row.getCell(nameColIdx).value || '').trim();
    
    if (!slug) return;

    // 1. Clean up known pipeline leaks
    if (LEAK_REPLACEMENTS[slug]) {
      const repl = LEAK_REPLACEMENTS[slug];
      if (repl.summary) {
        row.getCell(summaryColIdx).value = repl.summary;
      }
      if (repl.description) {
        row.getCell(descColIdx).value = repl.description;
      }
      console.log(`Row ${rowNumber}: Cleaned leaked pipeline text for "${slug}"`);
      leakFixedCount++;
    }

    // 2. Clean up duplicate placeholder descriptions ("Conservative evidence framing applied.")
    const descCell = row.getCell(descColIdx);
    const descValue = String(descCell.value || '').trim();
    if (descValue.toLowerCase() === 'conservative evidence framing applied.') {
      // Form a unique, high-quality description
      const cleanName = name.replace(/\([^)]+\)/g, '').trim(); // Remove parentheses for clean styling
      const newDesc = `${cleanName} is tracked for safety, evidence, and practical use contexts under conservative evidence framing.`;
      descCell.value = newDesc;
      console.log(`Row ${rowNumber}: Replaced placeholder description for "${slug}" -> "${newDesc}"`);
      placeholderFixedCount++;
    }
  });

  console.log(`Saving workbook...`);
  await workbook.xlsx.writeFile(wbPath);
  console.log(`Successfully completed workbook cleanup:`);
  console.log(`  - Cleaned pipeline text leaks: ${leakFixedCount}`);
  console.log(`  - Replaced duplicate placeholder descriptions: ${placeholderFixedCount}`);
}

main().catch(err => {
  console.error('Error running workbook cleanup:', err);
  process.exit(1);
});
