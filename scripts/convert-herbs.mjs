import fs from "node:fs";
import path from "node:path";

const SRC = "src/data/herbs/deep_audited_subset_updated_v1.28.csv";
const OUT = "src/data/herbs/herbs.normalized.json";

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitList(v) {
  if (!v) return [];
  return String(v)
    .split(/[,;|]/)
    .map(s => s.trim())
    .filter(Boolean);
}

const csv = fs.readFileSync(SRC, "utf-8").replace(/\r\n/g, "\n");
const [header, ...rows] = csv.split("\n").filter(Boolean);
const cols = header.split(",");

const out = rows.map(line => {
  const cells = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (c === ',' && !inQ) {
      cells.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  cells.push(cur);
  const o = {};
  cols.forEach((k, i) => (o[k] = cells[i] ?? ""));

  const common = o.common || o.scientific || "";
  const scientific = o.scientific || "";
  const slug = slugify(common || scientific);
  const categoryRaw = o.category || "";
  const category = categoryRaw.toLowerCase();
  const intensityRaw = o.intensity || "";
  const intensity = intensityRaw.toLowerCase();
  const region = o.region || "";
  const legalstatus = o.legalstatus || "";
  const compounds = splitList(o.compound || "");
  const tags = splitList(o.tags || "");
  const interactions = splitList(o.interactions || "");
  const contraindications = splitList(o.contraindications || "");
  const sources = splitList(o.sources || "");

  // canonicalize toxicity fields
  const toxicity_ld50 = o.toxicity_ld50 || o.toxicityld50 || "";

  const joinedInteractions = interactions.join("; ");
  const joinedContraindications = contraindications.join("; ");

  return {
    id: o.id || slug,
    slug,
    common,
    scientific,
    category,
    category_label: categoryRaw,
    intensity,
    intensity_label: intensityRaw,
    region,
    legalstatus,
    description: o.description || "",
    effects: o.effects || "",
    mechanism: o.mechanismofaction || "",
    compounds,
    interactions,
    contraindications,
    dosage: o.dosage || "",
    therapeutic: o.therapeutic || "",
    safety: o.safety || "",
    sideeffects: o.sideeffects || "",
    toxicity: o.toxicity || "",
    toxicity_ld50,
    is_controlled_substance:
      (o.is_controlled_substance || "").toString().toLowerCase() === "true",
    tags,
    sources,
    image: "",
    // legacy compatibility fields for the existing UI
    name: common || scientific || slug,
    nameNorm: common || scientific || slug,
    commonnames: common,
    scientificname: scientific,
    mechanismofaction: o.mechanismofaction || "",
    mechanismOfAction: o.mechanismofaction || "",
    legalStatus: legalstatus,
    therapeuticUses: o.therapeutic || "",
    sideEffects: o.sideeffects || "",
    drugInteractions: joinedInteractions,
    toxicityld50: toxicity_ld50,
    toxicityLD50: toxicity_ld50,
    compoundsDetailed: compounds,
    activeconstituents: compounds,
    activeConstituents: compounds.map(name => ({ name })),
    contraindicationsText: joinedContraindications,
    interactionsText: joinedInteractions,
    tagsRaw: tags.join("; ")
  };
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf-8");
console.log(`Wrote ${OUT} (${out.length} rows)`);
