import fs from "fs";
import path from "path";
import process from "process";
import xlsx from "xlsx";

const WORKBOOK_PATH = path.join(process.cwd(), "data-sources", "herb_monograph_master.xlsx");
const OUTPUT_DIR = path.join(process.cwd(), "public", "data");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "a-tier-index.json");

function fail(message) {
  console.error(`A-tier index generation failed: ${message}`);
  process.exit(1);
}

function normalizeKey(key) {
  return String(key || "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

function getValue(row, wantedKey) {
  const normalizedWanted = normalizeKey(wantedKey);
  const actualKey = Object.keys(row).find((key) => normalizeKey(key) === normalizedWanted);
  return actualKey ? row[actualKey] : "";
}

function asText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function inferDomain(finalUseNotes = "", name = "", slug = "") {
  const text = `${finalUseNotes} ${name} ${slug}`.toLowerCase();

  if (text.includes("acetaminophen") || text.includes("toxicity") || text.includes("overdose")) return "toxicology";
  if (text.includes("heart failure")) return "cardiovascular";
  if (text.includes("triglyceride") || text.includes("ldl") || text.includes("cholesterol") || text.includes("blood pressure")) return "cardiovascular";
  if (text.includes("neuropathy") || text.includes("neuropathic")) return "neurological";
  if (text.includes("performance") || text.includes("ergogenic") || text.includes("strength") || text.includes("exercise")) return "performance";
  if (text.includes("topical pain") || text.includes("pain")) return "pain";

  return "";
}

function splitSources(raw) {
  return asText(raw)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

if (!fs.existsSync(WORKBOOK_PATH)) {
  fail(`Workbook not found at ${WORKBOOK_PATH}`);
}

const workbook = xlsx.readFile(WORKBOOK_PATH);
const sheet = workbook.Sheets["Compound Master V3"];

if (!sheet) {
  fail('Sheet "Compound Master V3" not found');
}

const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

const items = rows
  .filter((row) => asText(getValue(row, "confidenceTier_v2")).toUpperCase() === "A")
  .map((row) => {
    const slug = asText(getValue(row, "slug"));
    const name = asText(getValue(row, "name"));
    const compoundClass = asText(getValue(row, "compoundClass"));
    const evidenceLevel = asText(getValue(row, "evidenceLevel"));
    const evidenceType = asText(getValue(row, "evidenceType"));
    const confidenceScore = asNumber(getValue(row, "confidenceScore"));
    const sources = splitSources(getValue(row, "sources"));
    const finalUseNotes = asText(getValue(row, "finalUseNotes"));
    const domain = inferDomain(finalUseNotes, name, slug);

    if (!slug) fail(`A-tier row missing slug: ${name || JSON.stringify(row)}`);
    if (!name) fail(`A-tier row missing name for slug: ${slug}`);
    if (!finalUseNotes) fail(`A-tier row missing finalUseNotes: ${slug}`);
    if (!domain) fail(`Could not infer domain for A-tier row: ${slug}`);
    if (confidenceScore === null) fail(`A-tier row missing confidenceScore: ${slug}`);
    if (confidenceScore < 85) fail(`A-tier row confidenceScore below 85: ${slug} (${confidenceScore})`);

    return {
      slug,
      name,
      compoundClass,
      domain,
      evidenceLevel,
      evidenceType,
      confidenceScore,
      sources,
      finalUseNotes,
    };
  })
  .sort((a, b) => b.confidenceScore - a.confidenceScore || a.name.localeCompare(b.name));

const output = {
  generatedAt: new Date().toISOString(),
  count: items.length,
  items,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`Generated ${OUTPUT_PATH} with ${items.length} A-tier compounds.`);
