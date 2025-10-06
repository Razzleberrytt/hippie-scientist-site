import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const SRC = "src/data/herbs/deep_audited_subset_updated_v1.28.csv";
const OUT = "src/data/herbs/herbs.normalized.json";

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const NULLY = new Set([
  "",
  "na",
  "n/a",
  "none",
  "null",
  "undefined",
  "unknown",
  "unk",
  "?",
  "-",
]);

function norm(v) {
  if (v == null) return "";
  const s = String(v).trim();
  return NULLY.has(s.toLowerCase()) ? "" : s;
}

function splitList(v) {
  if (v == null) return [];
  return String(v)
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pick(row, aliases) {
  const lower = Object.fromEntries(
    Object.keys(row).map((k) => [k.toLowerCase(), k])
  );
  for (const key of aliases) {
    const hit = lower[key.toLowerCase()];
    if (hit) return norm(row[hit]);
  }
  return "";
}

const csv = fs.readFileSync(SRC, "utf-8");
const parsed = Papa.parse(csv, {
  header: true,
  skipEmptyLines: "greedy",
  dynamicTyping: false,
});

if (parsed.errors?.length) {
  console.error("CSV parse errors (first 3):", parsed.errors.slice(0, 3));
}

const rows = (parsed.data || []).filter((r) => Object.keys(r).length);
const out = rows
  .map((r) => {
    const common = pick(r, ["common", "commonname", "name"]);
    const scientific = pick(r, [
      "scientific",
      "scientificname",
      "latin",
      "latinname",
      "binomial",
    ]);
    const slug = slugify(common || scientific);

    const category = pick(r, [
      "category",
      "categoryprimary",
      "primarycategory",
      "group",
    ]);
    const subcategory = pick(r, ["subcategory", "secondarycategory"]);
    const intensity = pick(r, ["intensity", "potency", "strength"]);
    const region = pick(r, ["region", "origin", "geography", "distribution"]);
    const legalstatus = pick(r, ["legalstatus", "legal_status", "status"]);
    const schedule = pick(r, ["schedule", "controlled_schedule"]);
    const description = pick(r, ["description", "summary", "overview"]);
    const effects = pick(r, ["effects", "effect"]);
    const mechanism = pick(r, [
      "mechanismofaction",
      "mechanism",
      "moa",
      "mechanism_of_action",
      "action",
    ]);

    const compounds = splitList(
      pick(r, ["compound", "compounds", "keycompounds", "actives", "constituents"])
    );
    const preparations = splitList(
      pick(r, [
        "preparations",
        "preparation",
        "method",
        "forms",
        "formulations",
      ])
    );
    const dosage = pick(r, [
      "dosage",
      "dose",
      "dosing",
      "dosage_and_administration",
      "administration",
    ]);
    const therapeutic = pick(r, [
      "therapeutic",
      "uses",
      "applications",
      "benefits",
      "traditional_uses",
    ]);
    const interactions = splitList(
      pick(r, ["interactions", "drug_interactions", "mixing"])
    );
    const contraind = splitList(
      pick(r, ["contraindications", "contradictions", "cautions"])
    );
    const sideeffects = splitList(
      pick(r, [
        "sideeffects",
        "side_effects",
        "adverse_effects",
        "unwanted_effects",
      ])
    );
    const safety = pick(r, [
      "safety",
      "warnings",
      "precautions",
      "risk_profile",
    ]);
    const toxicity = pick(r, ["toxicity", "tox_profile"]);
    const toxicityLD50 = pick(r, ["toxicity_ld50", "toxicityld50", "ld50"]);

    const tags = splitList(pick(r, ["tags", "labels", "keywords"]));
    const regiontags = splitList(pick(r, ["region_tags", "regions"]));
    const legalnotes = pick(r, ["legalnotes", "legal_notes"]);
    const image = pick(r, ["image", "imageurl", "img", "photo"]);
    const sourcesStr = pick(r, ["sources", "refs", "references"]);
    const sources = splitList(sourcesStr);

    const catFromTags =
      tags.find((t) =>
        /stimulant|sedative|nootropic|adaptogen|entheogen|tonic|anxiolytic|analgesic/i.test(
          t
        )
      ) || "";
    const finalCategory = category || catFromTags;

    return {
      id: pick(r, ["id", "uuid"]) || slug,
      slug,
      common,
      scientific,
      category: finalCategory,
      subcategory,
      intensity,
      region,
      legalstatus,
      schedule,
      description,
      effects,
      mechanism,
      compounds,
      preparations,
      dosage,
      therapeutic,
      interactions,
      contraindications: contraind,
      sideeffects,
      safety,
      toxicity,
      toxicity_ld50: toxicityLD50,
      tags,
      regiontags,
      legalnotes,
      image,
      sources,
    };
  })
  .filter((x) => x.slug);

function canonSci(s){ return String(s||"").toLowerCase().replace(/\s+/g," ").trim(); }
function mergeArrays(a,b){
  const set = new Set([...(a||[]), ...(b||[])] .map(v=>String(v).trim()).filter(Boolean));
  return Array.from(set);
}
function prefer(a,b){
  const A = (a??"").trim(), B=(b??"").trim();
  if (A && !B) return A;
  if (!A && B) return B;
  return A.length >= B.length ? A : B;
}
const byKey = new Map();
for (const r of out){
  const key = canonSci(r.scientific) || r.slug;
  if (!byKey.has(key)){ byKey.set(key, r); continue; }
  const prev = byKey.get(key);
  byKey.set(key, {
    ...prev,
    id: prev.id || r.id,
    slug: prev.slug, // keep first slug stable
    common: prefer(prev.common, r.common),
    scientific: prefer(prev.scientific, r.scientific),
    category: prefer(prev.category, r.category),
    subcategory: prefer(prev.subcategory, r.subcategory),
    intensity: prefer(prev.intensity, r.intensity),
    region: prefer(prev.region, r.region),
    legalstatus: prefer(prev.legalstatus, r.legalstatus),
    schedule: prefer(prev.schedule, r.schedule),
    description: prefer(prev.description, r.description),
    effects: prefer(prev.effects, r.effects),
    mechanism: prefer(prev.mechanism, r.mechanism),
    dosage: prefer(prev.dosage, r.dosage),
    therapeutic: prefer(prev.therapeutic, r.therapeutic),
    safety: prefer(prev.safety, r.safety),
    toxicity: prefer(prev.toxicity, r.toxicity),
    toxicity_ld50: prefer(prev.toxicity_ld50, r.toxicity_ld50),
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
  });
}
const merged = Array.from(byKey.values());

// optional: sort merged by common name for stable output
merged.sort((a,b)=>String(a.common||a.scientific).localeCompare(String(b.common||b.scientific)));

console.log(`[dedupe] in: ${out.length} → out: ${merged.length}`);

const coverage = (key) =>
  merged.filter((r) => {
    const v = r[key];
    return Array.isArray(v)
      ? v.filter(Boolean).length > 0
      : !!String(v ?? "").trim();
  }).length;

console.log("[coverage] common:", coverage("common"), "scientific:", coverage("scientific"));
console.log(
  "[coverage] mechanism:",
  coverage("mechanism"),
  "compounds:",
  coverage("compounds"),
  "interactions:",
  coverage("interactions")
);
console.log(
  "[coverage] effects:",
  coverage("effects"),
  "description:",
  coverage("description"),
  "tags:",
  coverage("tags"),
  "compounds:",
  coverage("compounds"),
  "contra:",
  coverage("contraindications")
);

if (merged.length >= 200 && coverage("effects") < 50 && coverage("description") < 50) {
  throw new Error("Sanity check: too many empty key fields — mapping likely broke.");
}

if (merged.length < 200) {
  const firstRow = rows[0] || {};
  console.error("Column keys (sample row):", Object.keys(firstRow));
  throw new Error(
    `Converter sanity check failed: only ${merged.length} rows emitted. Check column names/CSV formatting.`
  );
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(merged, null, 2), "utf-8");
console.log(`Wrote ${OUT} (${merged.length} rows)`);
