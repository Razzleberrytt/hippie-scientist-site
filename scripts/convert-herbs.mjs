import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const SRC = "src/data/herbs/deep_audited_subset_updated_v1.28.csv";
const OUT = "src/data/herbs/herbs.normalized.json";

function slugify(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
function splitList(v){
  if(!v) return [];
  return String(v).split(/[,;|]/).map(s=>s.trim()).filter(Boolean);
}
function pick(obj, keys) {
  for (const k of keys) {
    const hit = Object.keys(obj).find(x => x.toLowerCase() === k.toLowerCase());
    if (hit) return obj[hit];
  }
  return "";
}

const csv = fs.readFileSync(SRC, "utf-8");
const parsed = Papa.parse(csv, {
  header: true,
  skipEmptyLines: "greedy",
  dynamicTyping: false
});

if (parsed.errors?.length) {
  console.error("CSV parse errors:", parsed.errors.slice(0,3));
}

const rows = (parsed.data || []).filter(r => Object.keys(r).length);
const out = rows.map(r => {
  const common = pick(r, ["common","commonname","name"]);
  const scientific = pick(r, ["scientific","scientificname","latin","latinname"]);
  const slug = slugify(common || scientific);

  return {
    id: r.id || slug,
    slug,
    common,
    scientific,
    category: pick(r, ["category"]),
    intensity: pick(r, ["intensity"]),
    region: pick(r, ["region"]),
    legalstatus: pick(r, ["legalstatus","legal_status"]),
    description: pick(r, ["description","summary"]),
    effects: pick(r, ["effects"]),
    mechanism: pick(r, ["mechanismofaction","mechanism"]),
    compounds: splitList(pick(r, ["compound","compounds","keycompounds"])),
    interactions: splitList(pick(r, ["interactions"])),
    contraindications: splitList(pick(r, ["contraindications"])),
    dosage: pick(r, ["dosage"]),
    therapeutic: pick(r, ["therapeutic"]),
    safety: pick(r, ["safety"]),
    sideeffects: pick(r, ["sideeffects","side_effects"]),
    toxicity: pick(r, ["toxicity"]),
    toxicity_ld50: pick(r, ["toxicity_ld50","toxicityld50"]),
    is_controlled_substance: String(pick(r, ["is_controlled_substance"])).toLowerCase() === "true",
    tags: splitList(pick(r, ["tags"])),
    sources: splitList(pick(r, ["sources"])),
    image: pick(r, ["image","imageurl"])
  };
}).filter(x => x.slug); // keep valid rows only

if (out.length < 50) {
  throw new Error(`Converter sanity check failed: only ${out.length} rows emitted. Check column names and CSV format.`);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf-8");
console.log(`Wrote ${OUT} (${out.length} rows)`);
