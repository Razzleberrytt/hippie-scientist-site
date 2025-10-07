import fs from "node:fs";

const FILE = "src/data/herbs/herbs.normalized.json";
const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));

const KEY_FIELDS = [
  "common","scientific","category","intensity","region",
  "effects","description","compounds","legalstatus","tags"
];

const OPTIONAL_FIELDS = [
  "mechanism","pharmacology","preparations","dosage","therapeutic",
  "interactions","contraindications","sideeffects","safety",
  "toxicity","toxicity_ld50","schedule","legalnotes","sources","image"
];

function hasVal(v){
  if (Array.isArray(v)) return v.filter(Boolean).length > 0;
  return !!String(v ?? "").trim();
}

const cov = {};
[...KEY_FIELDS, ...OPTIONAL_FIELDS].forEach(k => {
  cov[k] = data.reduce((acc, row) => acc + (hasVal(row[k]) ? 1 : 0), 0);
});

// Print coverage summary
const n = data.length;
console.log(`Herb rows: ${n}`);
console.log("\nCoverage (non-empty counts):");
for (const k of KEY_FIELDS) {
  const pct = (100 * cov[k] / n).toFixed(1);
  console.log(`  ${k.padEnd(18)} ${String(cov[k]).padStart(4)} / ${n}  (${pct}%)`);
}
console.log("\nOptional fields:");
for (const k of OPTIONAL_FIELDS) {
  const pct = (100 * cov[k] / n).toFixed(1);
  console.log(`  ${k.padEnd(18)} ${String(cov[k]).padStart(4)} / ${n}  (${pct}%)`);
}

// Emit CSV of rows with any missing KEY_FIELDS
const headers = ["slug","common","scientific", ...KEY_FIELDS];
const rows = data
  .filter(row => KEY_FIELDS.some(k => !hasVal(row[k])))
  .map(row => {
    const obj = {};
    headers.forEach(h => {
      const v = row[h];
      obj[h] = Array.isArray(v) ? v.join("; ") : (v ?? "");
    });
    return obj;
  });

if (rows.length) {
  // naive CSV writer
  const esc = (s) => `"${String(s).replace(/"/g,'""')}"`;
  const csv = [
    headers.map(esc).join(","),
    ...rows.map(r => headers.map(h => esc(r[h] ?? "")).join(","))
  ].join("\n");
  const OUT = "scripts/audit_missing_key_fields.csv";
  fs.writeFileSync(OUT, csv, "utf-8");
  console.log(`\nMissing-key CSV written: ${OUT}  (rows: ${rows.length})`);
} else {
  console.log("\nAll KEY_FIELDS present for all rows ✅");
}

// Exit non-zero if key coverage is below threshold (to catch regressions)
const THRESHOLDS = { effects: 0.95, description: 0.95, legalstatus: 0.95 };
let bad = false;
for (const [k, t] of Object.entries(THRESHOLDS)) {
  const rate = cov[k] / n;
  if (rate < t) {
    console.error(`\n✖ Coverage for '${k}' below threshold: ${(100*rate).toFixed(1)}% < ${(100*t)}%`);
    bad = true;
  }
}
process.exit(bad ? 2 : 0);
