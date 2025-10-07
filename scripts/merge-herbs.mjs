import fs from "node:fs";
import path from "node:path";

const TARGET = "src/data/herbs/herbs.normalized.json";
const SRC = process.argv[2] || "herbs_patched.json"; // default to download name

if (!fs.existsSync(SRC)) {
  console.error(`❌ Source file not found: ${SRC}`);
  process.exit(2);
}

const cur = JSON.parse(fs.readFileSync(TARGET, "utf-8"));
const pat = JSON.parse(fs.readFileSync(SRC, "utf-8"));

// Basic schema sanity: require objects with slug/common/scientific
function ok(r){
  const s = (v)=>String(v??"").trim();
  return r && typeof r==="object" && s(r.slug) && s(r.common) && s(r.scientific);
}

// Index helpers
const key = (r)=> String(r.slug || r.scientific || r.common).toLowerCase().trim();
const mapBy = (arr)=> {
  const m = new Map();
  for (const r of arr) if (ok(r)) m.set(key(r), r);
  return m;
};

const curMap = mapBy(cur);
const patMap = mapBy(pat);

// Merge strategy: patched rows override current by slug/scientific/common.
// Keep arrays unique; prefer longer non-empty strings.
const uniq = (a)=> Array.from(new Set(a.filter(Boolean).map(x=>String(x).trim())));
const prefer = (a,b)=> {
  const A = String(a??"").trim(); const B = String(b??"").trim();
  if (A && !B) return A; if (!A && B) return B;
  return (B.length > A.length) ? B : A; // favor patched if longer
};
const isArr = (v)=> Array.isArray(v);

const outMap = new Map(curMap);
let updated = 0, inserted = 0;

for (const [k, rPat] of patMap.entries()){
  const rCur = outMap.get(k);
  if (!rCur) { outMap.set(k, rPat); inserted++; continue; }

  const merged = { ...rCur };
  for (const field of Object.keys({ ...rCur, ...rPat })) {
    const a = rCur[field], b = rPat[field];
    if (isArr(a) || isArr(b)) {
      merged[field] = uniq([...(a||[]), ...(b||[])]);
    } else {
      merged[field] = prefer(a, b);
    }
  }
  // Keep original slug stable if both present but differ
  if (rCur.slug && rPat.slug && rCur.slug !== rPat.slug) merged.slug = rCur.slug;

  // If patched has clearly better scientific/common, keep the longer
  merged.scientific = prefer(rCur.scientific, rPat.scientific);
  merged.common = prefer(rCur.common, rPat.common);

  if (JSON.stringify(merged) !== JSON.stringify(rCur)) updated++;
  outMap.set(k, merged);
}

const mergedArr = Array.from(outMap.values())
  .filter(ok)
  .sort((a,b)=>String(a.common||a.scientific).localeCompare(String(b.common||b.scientific)));

fs.mkdirSync(path.dirname(TARGET), { recursive: true });
fs.writeFileSync(TARGET, JSON.stringify(mergedArr, null, 2), "utf-8");

console.log(`✅ Merge complete: ${mergedArr.length} rows (updated ${updated}, inserted ${inserted})`);
console.log(`→ Wrote ${TARGET}`);
