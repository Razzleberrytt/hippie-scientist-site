import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const SRC_CANDIDATES = [
  "src/data/herbs/herb_index_master_v1.28.csv",
  "src/data/herbs/deep_audited_subset_updated_v1.28.csv",
];
const SRC = SRC_CANDIDATES.find((file) => fs.existsSync(file));
if (!SRC) {
  throw new Error(`No herb CSV found (looked for: ${SRC_CANDIDATES.join(", ")})`);
}
const OUT = "src/data/herbs/herbs.normalized.json";

async function main() {
  const NULLY = new Set(["", "na", "n/a", "none", "null", "undefined", "unknown", "unk", "?", "-"]);
  const cleanString = (value) => {
    const s = String(value ?? "").trim();
    return s && !NULLY.has(s.toLowerCase()) ? s : "";
  };
  const cleanList = (value) =>
    list(value)
      .map((v) => cleanString(v))
      .filter(Boolean);
  const list = (v) => Array.isArray(v) ? v : String(v || "").split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  const pick = (r, keys) => {
    const map = Object.fromEntries(Object.keys(r).map((k) => [k.toLowerCase(), k]));
    for (const key of keys) {
      const hit = map[key.toLowerCase()];
      if (hit && r[hit]) return String(r[hit]).trim();
    }
    return "";
  };
  const getField = (r, aliases) => pick(r, aliases);
  const getList = (r, aliases) => list(pick(r, aliases));
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
      const herb = {
        id: pick(r, ["id"]),
        slug: slugify(pick(r, ["common", "scientific"])),
        common: pick(r, ["common"]),
        scientific: pick(r, ["scientific"]),
        category: pick(r, ["category"]),
        description: pick(r, ["description"]),
        effects: pick(r, ["effects"]),
        intensity: pick(r, ["intensity"]),
        region: pick(r, ["region"]),
        duration: pick(r, ["duration"]),
        onset: pick(r, ["onset"]),
        legalstatus: pick(r, ["legalstatus", "is_controlled_substance"]),
        mechanism: pick(r, ["mechanism", "mechanismofaction"]),
        pharmacology: pick(r, ["pharmacology", "pharmacokinetics"]),
        preparations: getList(r, ["preparation", "preparations"]),
        compounds: getList(r, ["compound", "compounds"]),
        toxicity_ld50: pick(r, ["toxicityld50", "toxicity_ld50", "toxicityId5"]),
        safety: pick(r, ["safety"]),
        sideeffects: getList(r, ["sideeffects"]),
        contraindications: getList(r, ["contraindications"]),
        therapeutic: pick(r, ["therapeutic"]),
        tags: getList(r, ["tags"]),
        sources: getList(r, ["sources"]),
      };

      const obj = { ...herb };

      const stringKeys = [
        "id",
        "slug",
        "common",
        "scientific",
        "category",
        "description",
        "effects",
        "intensity",
        "region",
        "duration",
        "onset",
        "legalstatus",
        "mechanism",
        "pharmacology",
        "toxicity_ld50",
        "safety",
        "therapeutic",
      ];
      const listKeys = [
        "preparations",
        "compounds",
        "sideeffects",
        "contraindications",
        "tags",
        "sources",
      ];
      for (const key of stringKeys) obj[key] = cleanString(obj[key]);
      for (const key of listKeys) obj[key] = cleanList(obj[key]);

      const fillIfEmpty = (key, value) => {
        const val = cleanString(value);
        if (!obj[key] && val) obj[key] = val;
      };
      const fillListIfEmpty = (key, value) => {
        const val = cleanList(value);
        if ((!obj[key] || obj[key].length === 0) && val.length) obj[key] = val;
      };

      fillIfEmpty("id", getField(r, ["uuid", "slug", "name"]));
      fillIfEmpty("common", getField(r, ["name", "commonname", "common_name"]));
      fillIfEmpty("scientific", getField(r, ["scientificname", "latin", "latinname", "binomial"]));
      fillIfEmpty("category", getField(r, ["primarycategory", "categoryprimary", "group"]));
      fillIfEmpty("description", getField(r, ["summary", "overview", "desc"]));
      fillIfEmpty("effects", getField(r, ["effect", "effectsdescription"]));
      fillIfEmpty("intensity", getField(r, ["potency", "strength"]));
      fillIfEmpty("region", getField(r, ["origin", "geography", "distribution"]));
      fillIfEmpty("duration", getField(r, ["durationofeffects", "length"]));
      fillIfEmpty("onset", getField(r, ["onsettime", "start"]));
      fillIfEmpty("legalstatus", getField(r, ["legal_status", "status"]));
      fillIfEmpty("mechanism", getField(r, ["mechanism_of_action", "moa", "action"]));
      fillIfEmpty("pharmacology", getField(r, ["pharmacodynamics"]));
      fillIfEmpty("toxicity_ld50", getField(r, ["ld50"]));
      fillIfEmpty("safety", getField(r, ["warnings", "precautions", "risk_profile"]));
      fillIfEmpty("therapeutic", getField(r, ["uses", "applications", "benefits", "traditional_uses"]));
      fillListIfEmpty("preparations", getList(r, ["preparations", "method", "forms", "formulations"]));
      fillListIfEmpty("compounds", getList(r, ["compounds", "keycompounds", "actives", "constituents"]));
      fillListIfEmpty("sideeffects", getList(r, ["side_effects", "adverse_effects", "unwanted_effects"]));
      fillListIfEmpty("contraindications", getList(r, ["contradictions", "cautions"]));
      fillListIfEmpty("tags", getList(r, ["labels", "keywords"]));
      fillListIfEmpty("sources", getList(r, ["refs", "references"]));

      const slugSource = obj.slug || slugify(getField(r, ["slug", "common", "scientific", "name", "scientificname"]));
      const derivedSlug = slugSource || slugify(obj.common || obj.scientific || obj.id);
      obj.slug = cleanString(derivedSlug);
      if (!obj.slug) obj.slug = slugify(obj.common || obj.scientific || obj.id);

      obj.id = cleanString(obj.id) || obj.slug;

      obj.subcategory = cleanString(getField(r, ["subcategory", "secondarycategory"]));
      obj.regiontags = cleanList(getList(r, ["regiontags", "region_tags", "regions"]));
      obj.schedule = cleanString(getField(r, ["schedule", "controlled_schedule"]));
      obj.legalnotes = cleanString(getField(r, ["legalnotes", "legal_notes"]));
      obj.dosage = cleanString(getField(r, ["dosage", "dose", "dosing", "dosage_and_administration", "administration"]));
      obj.interactions = cleanList(
        getList(r, ["interactions", "drug_interactions", "mixing"])
      );
      obj.toxicity = cleanString(getField(r, ["toxicity", "tox_profile"]));
      obj.image = cleanString(getField(r, ["image", "imageurl", "img", "photo"]));

      // derive category from tags if empty
      if (!obj.category) {
        const t = obj.tags.find((t) =>
          /stimulant|sedative|nootropic|adaptogen|entheogen|tonic|anxiolytic|analgesic/i.test(t)
        );
        if (t) obj.category = t;
      }

      return obj;
    })
    .filter((x) => x && x.slug);

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
