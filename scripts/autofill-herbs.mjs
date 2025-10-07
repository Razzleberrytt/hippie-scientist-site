import fs from "node:fs";

const FILE = "src/data/herbs/herbs.normalized.json";
const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));

const K = {
  EFFECTS: "effects",
  DESC: "description",
  LEGAL: "legalstatus",
  NOTES: "legalnotes"
};

const now = new Date().toISOString().slice(0,10);

function has(v){
  if (Array.isArray(v)) return v.filter(Boolean).length > 0;
  return !!String(v ?? "").trim();
}

function title(s){
  const x = String(s||"").trim();
  return x ? x[0].toUpperCase()+x.slice(1) : "";
}

function inferEffects(row){
  // Try to craft a basic effects line from tags/compounds/category
  const bits = new Set();
  (row.tags||[]).forEach(t=>{
    const s = String(t).toLowerCase();
    if (/dream|lucid/i.test(s)) bits.add("dream support");
    if (/stimul/i.test(s)) bits.add("stimulation");
    if (/relax|sedat/i.test(s)) bits.add("relaxation");
    if (/nootrop|focus|clarity/i.test(s)) bits.add("cognitive support");
    if (/anxiolytic|calm/i.test(s)) bits.add("calming");
    if (/visionary|psychedelic|entheogen/i.test(s)) bits.add("visionary effects");
    if (/analgesic|pain/i.test(s)) bits.add("analgesia");
    if (/anti-?inflamm/i.test(s)) bits.add("anti-inflammatory support");
  });
  if ((row.category||"").match(/stimul/i)) bits.add("stimulation");
  if ((row.category||"").match(/sedat|relax/i)) bits.add("relaxation");
  if (!bits.size && (row.compounds||[]).some(c=>/dmt|mescaline|psilocybin|thujone|muscarine|salvinorin/i.test(c)))
    bits.add("psychoactive effects");

  if (!bits.size) return "Data pending review.";
  return Array.from(bits).join(", ").replace(/(^.|[.!?]\s*.)/g, s=>s.toUpperCase());
}

function inferDesc(row){
  // Compose a short neutral description from region/category
  const name = title(row.common || row.scientific || row.slug);
  const region = (row.region||"").toLowerCase();
  const cat = (row.category||"").toLowerCase();
  const parts = [];
  parts.push(`${name} is a herb recorded in the database.`);
  if (cat) parts.push(`Category: ${title(cat)}.`);
  if (region) parts.push(`Native/used in: ${region}.`);
  return parts.join(" ");
}

function inferLegal(row){
  // Infer from tags/notes if possible, else neutral default
  const tags = (row.tags||[]).join(" ").toLowerCase();
  if (/restricted|controlled|schedule|illegal/i.test(tags)) return "Restricted/controlled in some regions";
  if (/legal|unregulated/i.test(tags)) return "Legal / Unregulated in many regions";
  return "Varies by jurisdiction";
}

let patched = 0;

for (const r of data){
  let changed = false;

  if (!has(r[K.EFFECTS])) {
    r[K.EFFECTS] = inferEffects(r);
    changed = true;
  }
  if (!has(r[K.DESC])) {
    r[K.DESC] = inferDesc(r);
    changed = true;
  }
  if (!has(r[K.LEGAL])) {
    r[K.LEGAL] = inferLegal(r);
    changed = true;
  }

  if (changed) {
    const note = `Auto-filled on ${now} (effects/description/legalstatus) — pending editorial review.`;
    r[K.NOTES] = (r[K.NOTES] ? `${r[K.NOTES]} ` : "") + note;
    patched++;
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
console.log(`Autofill complete. Patched rows: ${patched} / ${data.length}`);
