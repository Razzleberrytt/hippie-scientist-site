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

// --- Intensity normalization helpers ---
const INTENSITY_ENUM = ["mild", "moderate", "strong", "variable", "unknown"];

function pickIntensityRaw(h) {
  const direct =
    h.intensity_level ||
    h.intensity ||
    h.effects_intensity ||
    h.overview_intensity;
  if (direct) return direct;

  const text = [
    h.intensity_text,
    h.intensity_summary,
    h.effects,
    h.description,
  ]
    .filter(Boolean)
    .join(" ");

  return text || "";
}

function parseIntensity(raw) {
  if (!raw) return "unknown";
  const s = String(raw).toLowerCase();

  if (INTENSITY_ENUM.includes(s)) return s;

  if (/(\bstrong|\bpotent|\bintense|\bpowerful)/.test(s)) return "strong";
  if (/(\bmoderate|\bmedium)/.test(s)) return "moderate";
  if (/(\bmild|\bgentle|\blight)/.test(s)) return "mild";
  if (/(\bvar(y|iable)|\bmixed|\bdepends|\bcontextual)/.test(s)) return "variable";

  const m = s.match(/intensity[^a-z]*(mild|moderate|strong)/);
  if (m && m[1]) return m[1];

  return "unknown";
}

function intensityPretty(level) {
  switch (level) {
    case "mild":
      return "Mild";
    case "moderate":
      return "Moderate";
    case "strong":
      return "Strong";
    case "variable":
      return "Variable";
    default:
      return "Unknown";
  }
}

// phrases we never want to ship
const STRIP_PATTERNS = [
  /\bcontextual inference\b[:]?/gi,
  /\bno direct (intensity|region|legal) data\b[.:]?/gi,
  /\bpossible\b/gi,
  /\bunclear\b/gi,
  /\b(,|\.)\s*(,|\.)+/g
];

function normalizeSpaces(s){ return s.replace(/\s{2,}/g," ").trim(); }

function cleanPunctuation(s){
  return s
    .replace(/\s+[,.]/g, m => m.trim())
    .replace(/\s*([;:])\s*/g, "$1 ")
    .replace(/[;:]\./g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/,\s*,+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripBoilerplate(s){
  let x = String(s||"");
  x = x.replace(/\b(nan|none|null|undefined|n\/a|unknown)\b/gi, "");
  for (const pat of STRIP_PATTERNS) x = x.replace(pat, "");
  return cleanPunctuation(normalizeSpaces(x));
}

// near-duplicate removal by token overlap
function dedupeNear(text){
  const clauses = String(text||"")
    .split(/(?<=[.!?;])\s+/)
    .map(t => stripBoilerplate(t).replace(/[;]+$/,"."))
    .map(t => t && (t[0].toUpperCase()+t.slice(1)))
    .filter(Boolean);

  const out = [];
  const seen = [];

  const sim = (a,b)=>{
    const A = new Set(a.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(Boolean));
    const B = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(Boolean));
    const inter = [...A].filter(x=>B.has(x)).length;
    const union = new Set([...A,...B]).size || 1;
    return inter/union;
  };

  for (const c of clauses){
    const cleaned = cleanPunctuation(c);
    const normalized = cleaned.replace(/[.!?…]+$/,"" ).trim();
    if (!normalized) continue;

    let dupIndex = -1;
    for (let i = 0; i < seen.length; i++){
      if (sim(normalized, seen[i].normalized) >= 0.8) { dupIndex = i; break; }
    }

    const clause = /[.!?…]$/.test(cleaned) ? cleaned : `${cleaned}.`;

    if (dupIndex >= 0){
      if (normalized.length > seen[dupIndex].normalized.length) {
        seen[dupIndex] = { normalized, clause };
        out[dupIndex] = clause;
      }
      continue;
    }

    seen.push({ normalized, clause });
    out.push(clause);
  }

  return out;
}

const STOP_WORDS = /\b(?:nan|none|null|undefined|n\/a|unknown)\b/gi;

function cleanTextBlock(input, {maxSentences=3, maxChars=420, ensurePeriod=true} = {}) {
  if (!input) return "";
  const clauses = dedupeNear(input);
  if (!clauses.length) return "";

  let text = clauses.slice(0, maxSentences).join(" ");
  if (text.length > maxChars) {
    text = text.slice(0, maxChars).replace(/\s+\S*$/, "");
  }
  text = stripBoilerplate(text);
  if (!text) return "";
  if (ensurePeriod && !/[.!?…]$/.test(text)) text = `${text}.`;
  return text;
}

function isStopWord(value) {
  if (!value) return false;
  STOP_WORDS.lastIndex = 0;
  return STOP_WORDS.test(String(value).toLowerCase());
}

function purifyArray(a) {
  return Array.from(
    new Set(
      (a || [])
        .map((x) => stripBoilerplate(String(x ?? "")))
        .map((x) => x.replace(/[.,;:]+$/,"" ).trim())
        .filter((x) => x && !isStopWord(x))
    )
  );
}
const toArr = (v) => {
  if (Array.isArray(v)) return v.map(x=>stripBoilerplate(String(x))).map(x=>x.trim()).filter(Boolean);
  const s = String(v ?? "").trim();
  if (!s) return [];
  return s.split(/[,;|]/).map(x=>stripBoilerplate(x)).map(x=>x.trim()).filter(Boolean);
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
    og: slug ? `/og/herb/${slug}.png` : undefined,

    category: tidy(pick(r, A.category)),
    subcategory: tidy(pick(r, A.subcategory)),
    intensity: cleanTextBlock(tidy(pick(r, A.intensity)), {maxSentences: 1, maxChars: 80, ensurePeriod: false}),
    region: cleanTextBlock(tidy(pick(r, A.region)), {maxSentences: 1, maxChars: 160, ensurePeriod: false}),
    regiontags: pickList(r, A.regiontags),

    description: cleanTextBlock(tidy(pick(r, A.description)), {maxSentences: 2, maxChars: 320}),
    effects: cleanTextBlock(tidy(pick(r, A.effects)), {maxSentences: 2, maxChars: 280}),
    mechanism: cleanTextBlock(tidy(pick(r, A.mechanism)), {maxSentences: 2, maxChars: 240}),
    pharmacology: cleanTextBlock(tidy(pick(r, A.pharmacology)), {maxSentences: 2, maxChars: 240}),

    preparations: pickList(r, A.preparations),
    dosage: cleanTextBlock(tidy(pick(r, A.dosage)), {maxSentences: 1, maxChars: 160}),
    duration: cleanTextBlock(tidy(pick(r, A.duration)), {maxSentences: 1, maxChars: 160}),
    onset: cleanTextBlock(tidy(pick(r, A.onset)), {maxSentences: 1, maxChars: 160}),
    therapeutic: cleanTextBlock(tidy(pick(r, A.therapeutic)), {maxSentences: 2, maxChars: 220}),

    compounds: pickList(r, A.compounds),
    interactions: pickList(r, A.interactions),
    contraindications: pickList(r, A.contraindications),
    sideeffects: pickList(r, A.sideeffects),
    safety: cleanTextBlock(tidy(pick(r, A.safety)), {maxSentences: 2, maxChars: 240}),

    toxicity: cleanTextBlock(tidy(pick(r, A.toxicity)), {maxSentences: 2, maxChars: 200}),
    toxicity_ld50: cleanTextBlock(tidy(pick(r, A.toxicity_ld50)), {maxSentences: 1, maxChars: 160}),

    legalstatus: cleanTextBlock(tidy(pick(r, A.legalstatus)), {maxSentences: 1, maxChars: 140}),
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

for (const row of merged) {
  for (const k of ["effects","description","legalstatus","safety","mechanism","pharmacology"]) {
    if (row[k]) {
      row[k] = cleanTextBlock(row[k], {
        maxSentences: k === "description" ? 2 : (k === "legalstatus" ? 1 : 2),
        maxChars: k === "description" ? 320 : (k === "legalstatus" ? 140 : 280)
      });
    }
  }
  for (const k of Object.keys(row)) {
    if (typeof row[k] === "string") {
      row[k] = stripBoilerplate(row[k]);
    }
  }
}

for (const row of merged) {
  for (const k of ["compounds","preparations","interactions","contraindications","sideeffects","tags","regiontags","sources"]) {
    row[k] = purifyArray(row[k]);
  }
}

for (const row of merged) {
  if (row.slug) {
    row.og = `/og/herb/${row.slug}.png`;
  }
}

for (const row of merged) {
  const raw = pickIntensityRaw(row);
  const level = parseIntensity(raw);

  const benefitsSource = (row.benefits ?? row.intensity ?? '').toString();
  const benefitsClean = stripBoilerplate(benefitsSource);
  if (benefitsClean) {
    row.benefits = cleanPunctuation(normalizeSpaces(benefitsClean));
  } else {
    delete row.benefits;
  }

  row.intensityLevel = level;
  row.intensityLabel = intensityPretty(level);
  row.intensity = row.intensityLabel;
  delete row.intensity_level;
  delete row.intensity_label;
}

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
