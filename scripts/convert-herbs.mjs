import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const CANDIDATE_CSVS = [
  "herbs_final_merged_and_normalized 2.csv",
  "src/data/herbs/herbs_final_merged_and_normalized 2.csv",
  "src/data/herbs/herb_index_normalized_v1.28.csv",
  "src/data/herbs/deep_audited_subset_updated_v1.28.csv"
];

function firstExisting(paths){
  for (const p of paths) { if (fs.existsSync(p)) return p; }
  throw new Error("No input CSV found in expected locations:\n" + paths.join("\n"));
}

const SRC = firstExisting(CANDIDATE_CSVS);
const OUT = "src/data/herbs/herbs.normalized.json";

const NULLY = new Set(["","na","n/a","none","null","undefined","unknown","unk","?","-"]);

const tidy = (s) => {
  const raw = String(s ?? "")
    .replace(/[;]+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};
const clean = (s) => {
  const t = String(s ?? "").trim();
  return NULLY.has(t.toLowerCase()) ? "" : t;
};
const toArr = (v) => {
  if (Array.isArray(v)) return v.map(x=>String(x).trim()).filter(Boolean);
  const s = String(v ?? "").trim();
  if (!s) return [];
  return s.split(/[,;|]/).map(x=>x.trim()).filter(Boolean);
};
const uniq = (a) => Array.from(new Set(a.filter(Boolean)));
const slugify = (s) => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");

// Parse CSV
const csv = fs.readFileSync(SRC, "utf-8");
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: "greedy", dynamicTyping: false });
if (parsed.errors?.length) {
  console.error("CSV parse errors (first 3):", parsed.errors.slice(0,3));
}

// Normalize headers to lowercase/trim for every row
const rows = (parsed.data || [])
  .filter(r => r && Object.keys(r).length)
  .map((r) => {
    const fixed = {};
    for (const [k,v] of Object.entries(r)) {
      const key = String(k||"").toLowerCase().trim();
      fixed[key] = v;
    }
    return fixed;
  });

// BEFORE coverage (from CSV as-is)
const fieldsToCheck = [
  "common","scientific","category","intensity","region",
  "effects","description","legalstatus","compounds","tags",
  "preparations","dosage","duration","onset","safety",
  "mechanism","pharmacology","sources","image",
  "audit_date","audit_version"
];
function hasVal(v){ return Array.isArray(v) ? v.filter(Boolean).length>0 : !!String(v??"").trim(); }
function covOfArray(arr, key){ return arr.reduce((a,r)=> a + (hasVal(r[key]) ? 1 : 0), 0); }
const before = Object.fromEntries(fieldsToCheck.map(k => [k, covOfArray(rows, k)]));

// Alias map (CSV → canonical)
const A = {
  id: ["id"],
  common: ["common","commonname","common_name","name_common","name"],
  scientific: ["scientific","scientificname","latin","latinname","binomial"],

  category: ["category"],
  subcategory: ["subcategory","secondarycategory"],
  intensity: ["intensity","potency","strength"],
  region: ["region","origin","geography","distribution"],
  regiontags: ["regiontags","region_tags","regions"],

  description: ["description","summary","overview","desc"],
  effects: ["effects","effect"],
  mechanism: ["mechanism","mechanismofaction","mechanism_of_action","moa","action"],
  pharmacology: ["pharmacology","pharmacokinetics"],

  preparations: ["preparations","preparation","forms","formulations","methods","method"],
  dosage: ["dosage","dose","dosing","dosage_and_administration","administration"],
  duration: ["duration","length","effect_duration"],
  onset: ["onset","time_to_effect"],
  therapeutic: ["therapeutic","uses","applications","benefits","traditional_uses"],

  compounds: ["compounds","compound","keycompounds","actives","constituents","key_compounds"],
  interactions: ["interactions","drug_interactions","mixing"],
  contraindications: ["contraindications","contradictions","cautions"],
  sideeffects: ["sideeffects","side_effects","adverse_effects","unwanted_effects"],
  safety: ["safety","warnings","precautions","risk_profile"],

  toxicity: ["toxicity","tox_profile"],
  toxicity_ld50: ["toxicity_ld50","toxicityld50","toxicityid5"],

  legalstatus: ["legalstatus","legal_status","status","is_controlled_substance"],
  schedule: ["schedule","controlled_schedule"],
  legalnotes: ["legalnotes","legal_notes"],

  tags: ["tags","labels","keywords"],
  sources: ["sources","refs","references"],
  image: ["image","imageurl","img","photo"],

  audit_date: ["audit_date"],
  audit_version: ["audit_version"]
};

function pick(row, aliases){
  for (const key of aliases) {
    const k = key.toLowerCase();
    if (k in row) {
      const val = clean(row[k]);
      if (val) return val;
    }
  }
  return "";
}
function pickList(row, aliases){
  return uniq(toArr(pick(row, aliases)));
}

// Convert rows → canonical objects
const prelim = rows.map((r) => {
  const common = pick(r, A.common);
  const scientific = pick(r, A.scientific);
  const slug = slugify(common || scientific);

  const obj = {
    id: tidy(pick(r, A.id)) || slug,
    slug,
    common: tidy(common),
    scientific: tidy(scientific),

    category: tidy(pick(r, A.category)),
    subcategory: tidy(pick(r, A.subcategory)),
    intensity: tidy(pick(r, A.intensity)),
    region: tidy(pick(r, A.region)),
    regiontags: pickList(r, A.regiontags),

    description: tidy(pick(r, A.description)),
    effects: tidy(pick(r, A.effects)),
    mechanism: tidy(pick(r, A.mechanism)),
    pharmacology: tidy(pick(r, A.pharmacology)),

    preparations: pickList(r, A.preparations),
    dosage: tidy(pick(r, A.dosage)),
    duration: tidy(pick(r, A.duration)),
    onset: tidy(pick(r, A.onset)),
    therapeutic: tidy(pick(r, A.therapeutic)),

    compounds: pickList(r, A.compounds),
    interactions: pickList(r, A.interactions),
    contraindications: pickList(r, A.contraindications),
    sideeffects: pickList(r, A.sideeffects),
    safety: tidy(pick(r, A.safety)),

    toxicity: tidy(pick(r, A.toxicity)),
    toxicity_ld50: tidy(pick(r, A.toxicity_ld50)),

    legalstatus: tidy(pick(r, A.legalstatus)),
    schedule: tidy(pick(r, A.schedule)),
    legalnotes: tidy(pick(r, A.legalnotes)),

    tags: pickList(r, A.tags),
    sources: pickList(r, A.sources),
    image: tidy(pick(r, A.image)),

    audit_date: tidy(pick(r, A.audit_date)),
    audit_version: tidy(pick(r, A.audit_version))
  };

  // fallback: derive category from tags if missing
  if (!obj.category && obj.tags?.length) {
    const t = obj.tags.find(t => /stimulant|sedative|nootropic|adaptogen|entheogen|tonic|anxiolytic|analgesic/i.test(t));
    if (t) obj.category = tidy(t);
  }

  // scrub literal "legal"
  if (/^legal$/i.test(obj.legalstatus)) obj.legalstatus = "";

  // remove "unknown"/"none" from strings
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === "string") {
      const s = obj[k].trim();
      if (/^(unknown|none|n\/a)$/i.test(s)) obj[k] = "";
    }
  }

  return obj;
}).filter(x => x.slug);

// Dedupe by scientific/common
function canonSci(s){
  return String(s||"").toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g," ").trim();
}
function mergeArrays(a,b){ return uniq([...(a||[]), ...(b||[])]); }
function prefer(a,b){
  const A = String(a||"").trim(), B = String(b||"").trim();
  if (A && !B) return A; if (!A && B) return B;
  return B.length > A.length ? B : A; // prefer richer value
}
const byKey = new Map();
for (const r of prelim){
  const key = canonSci(r.scientific || r.common || r.slug);
  if (!byKey.has(key)) { byKey.set(key, r); continue; }
  const prev = byKey.get(key);
  byKey.set(key, {
    ...prev,
    id: prev.id || r.id,
    slug: prev.slug,
    common: prefer(prev.common, r.common),
    scientific: prefer(prev.scientific, r.scientific),
    category: prefer(prev.category, r.category),
    subcategory: prefer(prev.subcategory, r.subcategory),
    intensity: prefer(prev.intensity, r.intensity),
    region: prefer(prev.region, r.region),
    description: prefer(prev.description, r.description),
    effects: prefer(prev.effects, r.effects),
    mechanism: prefer(prev.mechanism, r.mechanism),
    pharmacology: prefer(prev.pharmacology, r.pharmacology),
    dosage: prefer(prev.dosage, r.dosage),
    duration: prefer(prev.duration, r.duration),
    onset: prefer(prev.onset, r.onset),
    therapeutic: prefer(prev.therapeutic, r.therapeutic),
    safety: prefer(prev.safety, r.safety),
    toxicity: prefer(prev.toxicity, r.toxicity),
    toxicity_ld50: prefer(prev.toxicity_ld50, r.toxicity_ld50),
    legalstatus: prefer(prev.legalstatus, r.legalstatus),
    schedule: prefer(prev.schedule, r.schedule),
    legalnotes: prefer(prev.legalnotes, r.legalnotes),
    image: prefer(prev.image, r.image),
    compounds: mergeArrays(prev.compounds, r.compounds),
    preparations: mergeArrays(prev.preparations, r.preparations),
    interactions: mergeArrays(prev.interactions, r.interactions),
    contraindications: mergeArrays(prev.contraindications, r.contraindications),
    sideeffects: mergeArrays(prev.sideeffects, r.sideeffects),
    tags: mergeArrays(prev.tags, r.tags),
    regiontags: mergeArrays(prev.regiontags, r.regiontags),
    sources: mergeArrays(prev.sources, r.sources),
    audit_date: prefer(prev.audit_date, r.audit_date),
    audit_version: prefer(prev.audit_version, r.audit_version),
  });
}

const merged = Array.from(byKey.values()).sort((a,b)=>String(a.common||a.scientific).localeCompare(String(b.common||b.scientific)));

// AFTER coverage
const after = Object.fromEntries(fieldsToCheck.map(k => [k, covOfArray(merged, k)]));

// Output + logs
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(merged, null, 2), "utf-8");

console.log(`[convert] SRC: ${SRC}`);
console.log(`[convert] wrote: ${OUT} (${merged.length} rows)`);
console.log("Coverage (non-empty counts) — BEFORE → AFTER:");
for (const k of fieldsToCheck) {
  const b = before[k] ?? 0, a = after[k] ?? 0;
  const delta = a - b;
  const d = delta === 0 ? "" : (delta > 0 ? ` (+${delta})` : ` (${delta})`);
  console.log(`  ${k.padEnd(14)} ${String(b).padStart(4)} → ${String(a).padStart(4)}${d}`);
}

if (merged.length < 200) throw new Error("Sanity: too few rows after merge");
