import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const SRC = "src/data/herbs/deep_audited_subset_updated_v1.28.csv";
const OUT = "src/data/herbs/herbs.normalized.json";

async function main() {
  let ALIASES;
  try {
    ({ ALIASES } = await import("../src/data/schema.ts"));
  } catch (err) {
    console.warn("[convert-herbs] Falling back to local aliases map", err?.message);
    ALIASES = {
      common: ["common", "commonname", "name"],
      scientific: ["scientific", "scientificname", "latin", "latinname", "binomial"],
      slug: ["slug"],
      category: ["category", "categoryprimary", "primarycategory", "group"],
      subcategory: ["subcategory", "secondarycategory"],
      intensity: ["intensity", "potency", "strength"],
      region: ["region", "origin", "geography", "distribution"],
      regiontags: ["region_tags", "regions"],
      legalstatus: ["legalstatus", "legal_status", "status"],
      schedule: ["schedule", "controlled_schedule"],
      legalnotes: ["legalnotes", "legal_notes"],
      description: ["description", "summary", "overview", "desc"],
      effects: ["effects", "effect"],
      mechanism: ["mechanismofaction", "mechanism", "moa", "mechanism_of_action", "action"],
      compounds: ["compounds", "compound", "keycompounds", "actives", "constituents"],
      preparations: ["preparations", "preparation", "method", "forms", "formulations"],
      dosage: ["dosage", "dose", "dosing", "dosage_and_administration", "administration"],
      therapeutic: ["therapeutic", "uses", "applications", "benefits", "traditional_uses"],
      interactions: ["interactions", "drug_interactions", "mixing"],
      contraindications: ["contraindications", "contradictions", "cautions"],
      sideeffects: ["sideeffects", "side_effects", "adverse_effects", "unwanted_effects"],
      safety: ["safety", "warnings", "precautions", "risk_profile"],
      toxicity: ["toxicity", "tox_profile"],
      toxicity_ld50: ["toxicity_ld50", "toxicityld50", "ld50"],
      tags: ["tags", "labels", "keywords"],
      sources: ["sources", "refs", "references"],
      image: ["image", "imageurl", "img", "photo"],
    };
  }

  const NULLY = new Set(["", "na", "n/a", "none", "null", "undefined", "unknown", "unk", "?", "-"]);
  const text = (v) => {
    const s = String(v ?? "").trim();
    return NULLY.has(s.toLowerCase()) ? "" : s;
  };
  const list = (v) => {
    if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
    const s = text(v);
    if (!s) return [];
    return s.split(/[,;|]/).map((x) => x.trim()).filter(Boolean);
  };
  const pick = (row, keys) => {
    const map = Object.fromEntries(Object.keys(row).map((k) => [k.toLowerCase(), k]));
    for (const key of keys) {
      const hit = map[key.toLowerCase()];
      if (hit) return text(row[hit]);
    }
    return "";
  };
  const pickList = (row, keys) => list(pick(row, keys));
  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

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
  let out = rows
    .map((r) => {
      const common = pick(r, ALIASES.common);
      const scientific = pick(r, ALIASES.scientific);
      const slug = slugify(common || scientific);

      const obj = {
        id: pick(r, ["id", "uuid"]) || slug,
        slug,
        common,
        scientific,
        category: pick(r, ALIASES.category),
        subcategory: pick(r, ALIASES.subcategory),
        intensity: pick(r, ALIASES.intensity),
        region: pick(r, ALIASES.region),
        regiontags: pickList(r, ALIASES.regiontags),
        legalstatus: pick(r, ALIASES.legalstatus),
        schedule: pick(r, ALIASES.schedule),
        legalnotes: pick(r, ALIASES.legalnotes),
        description: pick(r, ALIASES.description),
        effects: pick(r, ALIASES.effects),
        mechanism: pick(r, ALIASES.mechanism),
        compounds: pickList(r, ALIASES.compounds),
        preparations: pickList(r, ALIASES.preparations),
        dosage: pick(r, ALIASES.dosage),
        therapeutic: pick(r, ALIASES.therapeutic),
        interactions: pickList(r, ALIASES.interactions),
        contraindications: pickList(r, ALIASES.contraindications),
        sideeffects: pickList(r, ALIASES.sideeffects),
        safety: pick(r, ALIASES.safety),
        toxicity: pick(r, ALIASES.toxicity),
        toxicity_ld50: pick(r, ALIASES.toxicity_ld50),
        tags: pickList(r, ALIASES.tags),
        sources: pickList(r, ALIASES.sources),
        image: pick(r, ALIASES.image),
      };

      // derive category from tags if empty
      if (!obj.category) {
        const t = obj.tags.find((t) =>
          /stimulant|sedative|nootropic|adaptogen|entheogen|tonic|anxiolytic|analgesic/i.test(t)
        );
        if (t) obj.category = t;
      }
      return obj;
    })
    .filter((x) => x.slug);

  function canonSci(s) {
    return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }
  function mergeArrays(a, b) {
    const set = new Set([...(a || []), ...(b || [])].map((v) => String(v).trim()).filter(Boolean));
    return Array.from(set);
  }
  function prefer(a, b) {
    const A = (a ?? "").trim();
    const B = (b ?? "").trim();
    if (A && !B) return A;
    if (!A && B) return B;
    return A.length >= B.length ? A : B;
  }
  const byKey = new Map();
  for (const r of out) {
    const key = canonSci(r.scientific) || r.slug;
    if (!byKey.has(key)) {
      byKey.set(key, r);
      continue;
    }
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
      regiontags: mergeArrays(prev.regiontags, r.regiontags),
      legalstatus: prefer(prev.legalstatus, r.legalstatus),
      schedule: prefer(prev.schedule, r.schedule),
      legalnotes: prefer(prev.legalnotes, r.legalnotes),
      description: prefer(prev.description, r.description),
      effects: prefer(prev.effects, r.effects),
      mechanism: prefer(prev.mechanism, r.mechanism),
      compounds: mergeArrays(prev.compounds, r.compounds),
      preparations: mergeArrays(prev.preparations, r.preparations),
      dosage: prefer(prev.dosage, r.dosage),
      therapeutic: prefer(prev.therapeutic, r.therapeutic),
      interactions: mergeArrays(prev.interactions, r.interactions),
      contraindications: mergeArrays(prev.contraindications, r.contraindications),
      sideeffects: mergeArrays(prev.sideeffects, r.sideeffects),
      safety: prefer(prev.safety, r.safety),
      toxicity: prefer(prev.toxicity, r.toxicity),
      toxicity_ld50: prefer(prev.toxicity_ld50, r.toxicity_ld50),
      tags: mergeArrays(prev.tags, r.tags),
      sources: mergeArrays(prev.sources, r.sources),
      image: prefer(prev.image, r.image),
    });
  }
  out = Array.from(byKey.values());

  // optional: sort merged by common name for stable output
  out.sort((a, b) =>
    String(a.common || a.scientific).localeCompare(String(b.common || b.scientific))
  );

  console.log(`[dedupe] in: ${rows.length} → out: ${out.length}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf-8");
  console.log(`Wrote ${OUT} (${out.length} rows)`);

  const coverage = (k) =>
    out.filter((r) => (Array.isArray(r[k]) ? r[k].length : !!String(r[k] || "").trim())).length;
  console.log(
    "[coverage] effects:",
    coverage("effects"),
    "mechanism:",
    coverage("mechanism"),
    "dosage:",
    coverage("dosage"),
    "therapeutic:",
    coverage("therapeutic"),
    "preparations:",
    coverage("preparations"),
    "sideeffects:",
    coverage("sideeffects"),
    "safety:",
    coverage("safety")
  );
  if (out.length < 200) throw new Error("Sanity: too few rows");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
