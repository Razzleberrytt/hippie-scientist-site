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

const coverage = (k) =>
  out.filter((r) => (Array.isArray(r[k]) ? r[k].length : !!r[k])).length;
console.log("[coverage] common:", coverage("common"), "scientific:", coverage("scientific"));
console.log(
  "[coverage] mechanism:",
  coverage("mechanism"),
  "compounds:",
  coverage("compounds"),
  "interactions:",
  coverage("interactions")
);

if (out.length < 200) {
  const firstRow = rows[0] || {};
  console.error("Column keys (sample row):", Object.keys(firstRow));
  throw new Error(
    `Converter sanity check failed: only ${out.length} rows emitted. Check column names/CSV formatting.`
  );
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf-8");
console.log(`Wrote ${OUT} (${out.length} rows)`);
