/* tsx / ts-node ready */
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

type EntityKind = "herb" | "compound";
interface Entity {
  id: string;
  kind: EntityKind;
  commonName?: string;
  latinName: string;
  summary?: string;
  description?: string;
  tags?: string[];
  intensity?: "MILD" | "MODERATE" | "STRONG";
  regions?: string[];
  sources?: { title: string; url: string }[];
  createdAt?: string;
  updatedAt?: string;
}

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public", "data");

const herbPaths = [
  path.join(PUB, "herbs.json"),
  path.join(ROOT, "src/data/herbs.json"),
  path.join(ROOT, "src/data/herbs_consolidated.json"),
  path.join(ROOT, "herbs_consolidated.json"),
  path.join(ROOT, "herbs_enriched.csv"),
  path.join(ROOT, "data/herbs.csv"),
  path.join(PUB, "herbs.csv"),
  path.join(ROOT, "herb_index_master_v1.28.csv"),
  path.join(ROOT, "herbs_final_merged_and_normalized 2.csv")
];

function readJSON<T>(p: string): T[] | null {
  try { return JSON.parse(fs.readFileSync(p, "utf8")) as T[]; } catch { return null; }
}
function readCSV(p: string): any[] | null {
  try { return parse(fs.readFileSync(p, "utf8"), { columns: true, skip_empty_lines: true }); } catch { return null; }
}
function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function clean(s: string) { return s.toLowerCase().trim().replace(/\s+/g, " "); }

function loadHerbs(): any[] {
  for (const p of herbPaths) {
    if (!fs.existsSync(p)) continue;
    const ext = path.extname(p);
    const data = ext === ".json" ? readJSON<any>(p) : readCSV(p);
    if (data && data.length) {
      console.log("Loaded herbs from", p, `(${data.length})`);
      return data;
    }
  }
  console.warn("⚠️  No herb dataset found.");
  return [];
}

const herbs = loadHerbs();
if (!herbs.length) process.exit(0);

// likely column names for compound info
const KEYS = [
  "active_compounds", "compounds", "constituents", "chemicals",
  "actives", "primary_active_compounds", "active_chemicals"
].map(k => k.toLowerCase());

function split(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return String(v).split(/[|;,/]/g).map(x => x.trim()).filter(Boolean);
}

interface Entry { name: string; herbs: Set<string>; }
const compounds = new Map<string, Entry>();

for (const row of herbs) {
  const lower = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
  const hits = KEYS.flatMap(k => split(lower[k]));
  const herbName = String(row.common || row.commonName || row.name || row.scientific || row.latinName || "").trim();
  for (const raw of hits) {
    const name = raw.replace(/\(.*?\)/g, "").trim();
    if (!name || name.length < 2) continue;
    const key = clean(name);
    if (!compounds.has(key)) compounds.set(key, { name, herbs: new Set() });
    if (herbName) compounds.get(key)!.herbs.add(herbName);
  }
}

const outPath = path.join(PUB, "compounds.json");
let existing: Entity[] = [];
try { existing = JSON.parse(fs.readFileSync(outPath, "utf8")); } catch {}

const existingIds = new Set(existing.map(e => e.id));
const today = new Date().toISOString().slice(0, 10);
const newItems: Entity[] = [];

for (const { name, herbs: fromHerbs } of compounds.values()) {
  const id = slug(name);
  if (existingIds.has(id)) continue;
  newItems.push({
    id,
    kind: "compound",
    commonName: name,
    latinName: name,
    summary: fromHerbs.size ? `Reported constituent in: ${Array.from(fromHerbs).slice(0,6).join(", ")}${fromHerbs.size>6?"…":""}` : undefined,
    tags: ["compound"],
    intensity: undefined,
    regions: [],
    sources: [],
    createdAt: today,
    updatedAt: today
  });
}

const all = [...existing, ...newItems].sort((a,b)=>a.id.localeCompare(b.id));
fs.mkdirSync(PUB, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
console.log(`✅ Wrote ${outPath} with ${all.length} total compounds (added ${newItems.length}).`);
