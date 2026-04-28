import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const workbookPath = path.resolve("data-sources/herb_monograph_master.xlsx");

if (!fs.existsSync(workbookPath)) {
  throw new Error(`Workbook not found: ${workbookPath}`);
}

const backupPath = workbookPath.replace(
  /\.xlsx$/,
  `.backup-before-a-tier-${new Date().toISOString().slice(0, 10)}.xlsx`
);

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(workbookPath, backupPath);
  console.log(`[backup] Created ${backupPath}`);
}

const wb = XLSX.readFile(workbookPath);

function sheetToRows(sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Missing sheet: ${sheetName}`);
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

function writeRows(sheetName, rows) {
  wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows);
  if (!wb.SheetNames.includes(sheetName)) wb.SheetNames.push(sheetName);
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[α]/g, "alpha")
    .replace(/[β]/g, "beta")
    .replace(/[γ]/g, "gamma")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mergeByKey(sheetName, patchRows, keyFields, options = {}) {
  const rows = sheetToRows(sheetName);

  const keyOf = (row) =>
    keyFields.map((field) => normalizeSlug(row[field])).join("::");

  const map = new Map();

  for (const row of rows) {
    const key = keyOf(row);
    if (key.replace(/:/g, "")) map.set(key, row);
  }

  let added = 0;
  let updated = 0;

  for (const patch of patchRows) {
    for (const key of keyFields) {
      if (patch[key]) patch[key] = normalizeSlug(patch[key]);
    }

    const key = keyOf(patch);
    if (!key.replace(/:/g, "")) continue;

    if (map.has(key)) {
      const existing = map.get(key);

      for (const [field, value] of Object.entries(patch)) {
        if (value === "") continue;

        const current = existing[field];

        if (options.updateExisting === true) {
          existing[field] = value;
        } else if (current === undefined || current === "") {
          existing[field] = value;
        }
      }

      updated++;
    } else {
      map.set(key, patch);
      added++;
    }
  }

  const merged = Array.from(map.values());
  writeRows(sheetName, merged);

  console.log(`[${sheetName}] added=${added}, touched=${updated}, total=${merged.length}`);
}

function dedupeByKey(sheetName, keyFields) {
  const rows = sheetToRows(sheetName);

  const seen = new Set();
  const deduped = [];
  let removed = 0;

  for (const row of rows) {
    const key = keyFields.map((field) => normalizeSlug(row[field])).join("::");

    if (!key.replace(/:/g, "")) {
      deduped.push(row);
      continue;
    }

    if (seen.has(key)) {
      removed++;
      continue;
    }

    seen.add(key);
    deduped.push(row);
  }

  writeRows(sheetName, deduped);
  console.log(`[${sheetName}] deduped removed=${removed}`);
}

const compoundPatch = [
  { slug: "caffeine", name: "Caffeine", compoundClass: "xanthine", mechanisms: "adenosine receptor antagonism", evidenceNotes: "A-tier alertness" },
  { slug: "l-theanine", name: "L-Theanine", compoundClass: "amino_acid", mechanisms: "glutamate modulation; alpha wave modulation", evidenceNotes: "A-tier attention with caffeine" },
  { slug: "creatine", name: "Creatine", compoundClass: "amino_acid_derivative", mechanisms: "ATP buffering; energy metabolism", evidenceNotes: "A-tier cognitive fatigue" },
  { slug: "melatonin", name: "Melatonin", compoundClass: "hormone", mechanisms: "MT1/MT2 receptor agonist; circadian regulation", evidenceNotes: "A-tier sleep onset/maintenance" },
  { slug: "glycine", name: "Glycine", compoundClass: "amino_acid", mechanisms: "inhibitory neurotransmitter; thermoregulation", evidenceNotes: "B-tier sleep quality" },
  { slug: "berberine", name: "Berberine", compoundClass: "alkaloid", mechanisms: "AMPK activation; glucose metabolism", evidenceNotes: "A-tier metabolic biomarkers" },
  { slug: "epa", name: "Eicosapentaenoic Acid (EPA)", compoundClass: "fatty_acid", mechanisms: "anti-inflammatory eicosanoids", evidenceNotes: "A-tier triglycerides/depression adjunct" },
  { slug: "dha", name: "Docosahexaenoic Acid (DHA)", compoundClass: "fatty_acid", mechanisms: "membrane fluidity; neuronal structure", evidenceNotes: "B-tier adult cognition; A-tier developmental" },
  { slug: "coenzyme-q10", name: "Coenzyme Q10", compoundClass: "quinone", mechanisms: "mitochondrial electron transport", evidenceNotes: "A-tier heart failure" },
  { slug: "curcuminoids", name: "Curcuminoids", compoundClass: "polyphenol", mechanisms: "NF-kB inhibition; anti-inflammatory", evidenceNotes: "A-tier bioavailable forms only" },
  { slug: "capsaicin", name: "Capsaicin", compoundClass: "alkaloid", mechanisms: "TRPV1 desensitization", evidenceNotes: "A-tier topical neuropathic pain" },
  { slug: "boswellic-acids", name: "Boswellic Acids", compoundClass: "terpenoid", mechanisms: "5-LOX inhibition", evidenceNotes: "A-tier inflammatory pain" },
  { slug: "gingerols", name: "Gingerols", compoundClass: "phenolic_compound", mechanisms: "prostaglandin inhibition", evidenceNotes: "A-tier nausea" },
  { slug: "nac", name: "N-Acetylcysteine", compoundClass: "amino_acid_derivative", mechanisms: "glutathione precursor", evidenceNotes: "A-tier acetaminophen toxicity" },
  { slug: "alpha-lipoic-acid", name: "Alpha-Lipoic Acid", compoundClass: "organosulfur", mechanisms: "mitochondrial antioxidant", evidenceNotes: "A-tier diabetic neuropathy" },
  { slug: "magnesium", name: "Magnesium", compoundClass: "element", mechanisms: "NMDA modulation; vascular tone", evidenceNotes: "A-tier BP; deficiency contexts" },
  { slug: "dietary-nitrates", name: "Dietary Nitrates", compoundClass: "inorganic", mechanisms: "NO pathway", evidenceNotes: "A-tier BP/performance" },
];

const herbPatch = [
  { slug: "bacopa-monnieri", name: "Bacopa monnieri", summary: "Improves memory with chronic use.", mechanism: "Cholinergic modulation; synaptic signaling.", safetyNotes: "GI upset possible." },
  { slug: "rhodiola-shr5", name: "Rhodiola rosea SHR-5", summary: "Reduces fatigue and stress-related cognitive decline.", mechanism: "HPA axis modulation; monoamine effects.", safetyNotes: "Use caution with stimulant sensitivity." },
  { slug: "panax-ginseng", name: "Panax ginseng", summary: "Reduces fatigue and modestly improves cognition.", mechanism: "Ginsenoside activity; nitric oxide modulation.", safetyNotes: "May cause insomnia." },
  { slug: "ginkgo-egb-761", name: "Ginkgo biloba EGb 761", summary: "Improves cognitive symptoms in dementia populations.", mechanism: "Cerebral blood flow and platelet-activating factor modulation.", safetyNotes: "Bleeding risk; caution with anticoagulants." },
  { slug: "melatonin-ir", name: "Melatonin IR", summary: "Reduces sleep onset latency.", mechanism: "Circadian rhythm modulation.", safetyNotes: "May cause drowsiness." },
  { slug: "melatonin-er", name: "Melatonin ER", summary: "Improves sleep maintenance.", mechanism: "Prolonged melatonin signaling.", safetyNotes: "Generally well tolerated." },
  { slug: "berberine", name: "Berberine", summary: "Improves glucose and lipid biomarkers.", mechanism: "AMPK activation.", safetyNotes: "GI upset possible; interaction caution." },
  { slug: "coenzyme-q10", name: "CoQ10", summary: "Improves heart failure outcomes.", mechanism: "Mitochondrial electron transport support.", safetyNotes: "Generally well tolerated; warfarin caution." },
  { slug: "curcumin-phytosome", name: "Curcumin (bioavailable)", summary: "Reduces inflammatory pain in osteoarthritis contexts.", mechanism: "NF-kB and inflammatory pathway modulation.", safetyNotes: "GI upset possible; anticoagulant caution." },
  { slug: "capsaicin-topical", name: "Capsaicin topical", summary: "Reduces neuropathic pain when used topically.", mechanism: "TRPV1 desensitization.", safetyNotes: "Burning or skin irritation possible." },
  { slug: "boswellia-akba", name: "Boswellia serrata AKBA", summary: "Reduces inflammatory joint pain.", mechanism: "5-LOX inhibition.", safetyNotes: "GI upset possible." },
  { slug: "ginger-nausea", name: "Ginger (nausea)", summary: "Reduces nausea.", mechanism: "Prostaglandin and GI motility modulation.", safetyNotes: "Generally well tolerated; anticoagulant caution." },
  { slug: "ginger-pain", name: "Ginger (pain)", summary: "Provides modest pain relief.", mechanism: "Anti-inflammatory activity.", safetyNotes: "Generally well tolerated; anticoagulant caution." },
  { slug: "nac", name: "N-Acetylcysteine", summary: "Antidote for acetaminophen toxicity.", mechanism: "Glutathione restoration.", safetyNotes: "Nausea possible; clinical protocol use for toxicity." },
  { slug: "alpha-lipoic-acid", name: "Alpha-lipoic acid", summary: "Improves diabetic neuropathy symptoms.", mechanism: "Mitochondrial antioxidant activity.", safetyNotes: "Hypoglycemia risk." },
  { slug: "magnesium-bp", name: "Magnesium (BP)", summary: "Modestly reduces blood pressure.", mechanism: "Vascular tone regulation.", safetyNotes: "Diarrhea possible; renal disease caution." },
  { slug: "dietary-nitrates", name: "Beetroot nitrates", summary: "Improves blood pressure and endurance.", mechanism: "Nitric oxide pathway.", safetyNotes: "Hypotension risk." },
];

const mapPatch = [
  { herb_slug: "bacopa-monnieri", compound_slug: "bacosides" },
  { herb_slug: "rhodiola-shr5", compound_slug: "rosavins" },
  { herb_slug: "rhodiola-shr5", compound_slug: "salidroside" },
  { herb_slug: "panax-ginseng", compound_slug: "ginsenosides" },
  { herb_slug: "ginkgo-egb-761", compound_slug: "flavonoids" },
  { herb_slug: "ginkgo-egb-761", compound_slug: "terpenoids" },
  { herb_slug: "melatonin-ir", compound_slug: "melatonin" },
  { herb_slug: "melatonin-er", compound_slug: "melatonin" },
  { herb_slug: "berberine", compound_slug: "berberine" },
  { herb_slug: "coenzyme-q10", compound_slug: "coenzyme-q10" },
  { herb_slug: "curcumin-phytosome", compound_slug: "curcuminoids" },
  { herb_slug: "capsaicin-topical", compound_slug: "capsaicin" },
  { herb_slug: "boswellia-akba", compound_slug: "boswellic-acids" },
  { herb_slug: "ginger-nausea", compound_slug: "gingerols" },
  { herb_slug: "ginger-pain", compound_slug: "gingerols" },
  { herb_slug: "nac", compound_slug: "nac" },
  { herb_slug: "alpha-lipoic-acid", compound_slug: "alpha-lipoic-acid" },
  { herb_slug: "magnesium-bp", compound_slug: "magnesium" },
  { herb_slug: "dietary-nitrates", compound_slug: "dietary-nitrates" },
];

const claimPatch = [
  { entity_slug: "bacopa-monnieri", domain: "memory", claim: "Improves memory acquisition and recall with chronic use.", evidence_grade: "A", dosage: "300 mg standardized extract", notes: "Requires 8–12 weeks." },
  { entity_slug: "rhodiola-shr5", domain: "fatigue cognition", claim: "Reduces fatigue and improves cognitive performance under stress.", evidence_grade: "A", dosage: "200–400 mg SHR-5", notes: "Acute and short-term benefit." },
  { entity_slug: "panax-ginseng", domain: "fatigue", claim: "Reduces fatigue.", evidence_grade: "A", dosage: "1–3 g root extract", notes: "Modest cognition benefit." },
  { entity_slug: "ginkgo-egb-761", domain: "cognition", claim: "Improves dementia-related cognitive symptoms.", evidence_grade: "A", dosage: "120–240 mg EGb 761", notes: "Not positioned for healthy individuals." },
  { entity_slug: "l-theanine-caffeine", domain: "attention", claim: "Improves attention and task switching.", evidence_grade: "A", dosage: "100 mg L-theanine + 50 mg caffeine", notes: "Synergistic effect." },
  { entity_slug: "caffeine", domain: "alertness", claim: "Improves alertness and reaction time.", evidence_grade: "A", dosage: "50–200 mg", notes: "Dose-dependent side effects." },
  { entity_slug: "creatine-cognition", domain: "cognitive fatigue", claim: "Improves cognition under sleep deprivation.", evidence_grade: "A", dosage: "3–5 g", notes: "Stronger in sleep deprivation contexts." },
  { entity_slug: "melatonin-ir", domain: "sleep onset", claim: "Reduces sleep onset latency.", evidence_grade: "A", dosage: "0.5–5 mg", notes: "Timing critical." },
  { entity_slug: "melatonin-er", domain: "sleep maintenance", claim: "Improves sleep duration.", evidence_grade: "A", dosage: "2 mg ER", notes: "Better for maintenance insomnia." },
  { entity_slug: "berberine", domain: "metabolic", claim: "Lowers HbA1c and LDL.", evidence_grade: "A", dosage: "500 mg 2–3x daily", notes: "Comparable to metformin in some studies." },
  { entity_slug: "epa", domain: "triglycerides", claim: "Lowers triglycerides.", evidence_grade: "A", dosage: "1–2 g EPA", notes: "Prescription-level evidence." },
  { entity_slug: "coenzyme-q10", domain: "heart failure", claim: "Improves heart failure outcomes.", evidence_grade: "A", dosage: "100–300 mg", notes: "Reduced hospitalization signal." },
  { entity_slug: "magnesium-bp", domain: "blood pressure", claim: "Modestly lowers blood pressure.", evidence_grade: "A", dosage: "200–400 mg", notes: "Stronger if deficient." },
  { entity_slug: "dietary-nitrates", domain: "blood pressure", claim: "Reduces blood pressure.", evidence_grade: "A", dosage: "300–600 mg nitrate", notes: "Acute and chronic effects." },
  { entity_slug: "curcumin-phytosome", domain: "inflammation", claim: "Reduces osteoarthritis pain.", evidence_grade: "A", dosage: "500–1000 mg bioavailable form", notes: "Standardization critical." },
  { entity_slug: "capsaicin-topical", domain: "neuropathic pain", claim: "Reduces neuropathic pain.", evidence_grade: "A", dosage: "topical only", notes: "High evidence topical use." },
  { entity_slug: "boswellia-akba", domain: "pain", claim: "Reduces joint pain.", evidence_grade: "A", dosage: "100–250 mg AKBA", notes: "Standardized extract required." },
  { entity_slug: "ginger-nausea", domain: "nausea", claim: "Reduces nausea.", evidence_grade: "A", dosage: "1–2 g", notes: "Strongest ginger evidence domain." },
  { entity_slug: "nac", domain: "acetaminophen toxicity", claim: "Prevents liver damage after acetaminophen toxicity when used according to clinical protocols.", evidence_grade: "A", dosage: "clinical protocol", notes: "Clinical anchor; psychiatric adjunct claims should remain separate and lower tier." },
  { entity_slug: "alpha-lipoic-acid", domain: "neuropathy", claim: "Improves diabetic neuropathy symptoms.", evidence_grade: "A", dosage: "600 mg", notes: "Established diabetic neuropathy context." },
];

mergeByKey("Compound Master V3", compoundPatch, ["slug"]);
mergeByKey("Herb Master V3", herbPatch, ["slug"]);
mergeByKey("Herb Compound Map V3", mapPatch, ["herb_slug", "compound_slug"]);
mergeByKey("Claim Rows", claimPatch, ["entity_slug", "domain"], { updateExisting: true });

dedupeByKey("Compound Master V3", ["slug"]);
dedupeByKey("Herb Master V3", ["slug"]);
dedupeByKey("Herb Compound Map V3", ["herb_slug", "compound_slug"]);
dedupeByKey("Claim Rows", ["entity_slug", "domain"]);

XLSX.writeFile(wb, workbookPath);

console.log(`[done] Updated ${workbookPath}`);
console.log(`[next] Run: npm run check`);
