import fs from "node:fs";
import path from "node:path";

const FILE = "src/data/herbs/herbs.normalized.json";
const OUT_DIR = "scripts/out";
fs.mkdirSync(OUT_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));
const N = data.length;

const KEY_FIELDS = [
  "common","scientific","category","intensity","region",
  "effects","description","legalstatus","compounds","tags"
];

const OPTIONAL_FIELDS = [
  "mechanism","pharmacology","preparations","dosage","duration","onset","therapeutic",
  "interactions","contraindications","sideeffects","safety",
  "toxicity","toxicity_ld50","schedule","legalnotes","sources","image","regiontags","subcategory"
];

function hasVal(v){
  if (Array.isArray(v)) return v.filter(Boolean).length > 0;
  return !!String(v ?? "").trim();
}

function pct(n){ return ((n/N)*100).toFixed(1) + "%"; }

const coverage = {};
[...KEY_FIELDS, ...OPTIONAL_FIELDS].forEach(k => {
  coverage[k] = data.reduce((acc,row)=>acc + (hasVal(row[k]) ? 1 : 0), 0);
});

console.log(`\nHerb rows: ${N}\n`);
console.log("Key fields coverage:");
KEY_FIELDS.forEach(k => console.log(`  ${k.padEnd(18)} ${String(coverage[k]).padStart(4)} / ${N}  (${pct(coverage[k])})`));
console.log("\nOptional fields coverage:");
OPTIONAL_FIELDS.forEach(k => console.log(`  ${k.padEnd(18)} ${String(coverage[k]).padStart(4)} / ${N}  (${pct(coverage[k])})`));

// Build missing rows CSV for key fields
const headers = ["slug","common","scientific", ...KEY_FIELDS];
const missing = data
  .filter(row => KEY_FIELDS.some(k => !hasVal(row[k])))
  .map(row => {
    const out = {};
    for (const h of headers) {
      const v = row[h];
      out[h] = Array.isArray(v) ? v.join("; ") : (v ?? "");
    }
    return out;
  });

// write coverage.json
fs.writeFileSync(path.join(OUT_DIR, "coverage.json"), JSON.stringify({ total:N, coverage }, null, 2), "utf-8");

// write coverage.md
const mdLines = [
  `# Herb Data Coverage`,
  ``,
  `Total rows: **${N}**`,
  ``,
  `## Key fields`,
  `| Field | Filled | Coverage |`,
  `|---|---:|---:|`,
  ...KEY_FIELDS.map(k => `| ${k} | ${coverage[k]} / ${N} | ${pct(coverage[k])} |`),
  ``,
  `## Optional fields`,
  `| Field | Filled | Coverage |`,
  `|---|---:|---:|`,
  ...OPTIONAL_FIELDS.map(k => `| ${k} | ${coverage[k]} / ${N} | ${pct(coverage[k])} |`),
  ``,
  missing.length
    ? `**Missing key fields rows:** ${missing.length} (see \`scripts/out/missing_key_fields.csv\`)`
    : `**All key fields present for all rows. ✅**`
];
fs.writeFileSync(path.join(OUT_DIR, "coverage.md"), mdLines.join("\n"), "utf-8");

// write missing_key_fields.csv (if any)
if (missing.length) {
  const esc = (s) => `"${String(s).replace(/"/g,'""')}"`;
  const csv = [
    headers.map(esc).join(","),
    ...missing.map(r => headers.map(h => esc(r[h] ?? "")).join(","))
  ].join("\n");
  fs.writeFileSync(path.join(OUT_DIR, "missing_key_fields.csv"), csv, "utf-8");
}

console.log(`\nReports written to ${OUT_DIR}/`);
if (missing.length) {
  console.log(` - missing_key_fields.csv (rows: ${missing.length})`);
}
console.log(` - coverage.json`);
console.log(` - coverage.md\n`);
