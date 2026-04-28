import fs from "fs";
import path from "path";
import process from "process";
import xlsx from "xlsx";

const WORKBOOK_PATH = path.join(process.cwd(), "data-sources", "herb_monograph_master.xlsx");
const OUTPUT_DIR = path.join(process.cwd(), "public", "data");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "a-tier-index.json");
const REPORT_PATH = path.join(OUTPUT_DIR, "a-tier-index-report.json");

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

function inferDomain(finalUseNotes = "", name = "", slug = "", evidenceLevel = "", evidenceType = "") {
  const text = `${finalUseNotes} ${name} ${slug} ${evidenceLevel} ${evidenceType}`.toLowerCase();

  if (text.includes("heart failure")) return "cardiovascular";
  if (text.includes("triglyceride") || text.includes("ldl") || text.includes("cholesterol") || text.includes("blood pressure")) return "cardiovascular";
  if (text.includes("type 2 diabetes") || text.includes("diabetes") || text.includes("glycemic") || text.includes("glucose") || text.includes("hba1c") || text.includes("insulin") || text.includes("berberine")) return "metabolic";
  if (text.includes("inflammatory") || text.includes("inflammation") || text.includes("arthritis") || text.includes("curcumin")) return "inflammation";
  if (text.includes("neuropathy") || text.includes("neuropathic")) return "neurological";
  if (text.includes("performance") || text.includes("ergogenic") || text.includes("strength") || text.includes("exercise") || text.includes("creatine")) return "performance";
  if (text.includes("topical pain") || text.includes("pain") || text.includes("capsaicin")) return "pain";

  return "general";
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
const skipped = [];

const items = rows
  .filter((row) => asText(getValue(row, "confidenceTier_v2")).toUpperCase() === "A")
  .map((row, index) => {
    const slug = asText(getValue(row, "slug"));
    const name = asText(getValue(row, "name"));
    const compoundClass = asText(getValue(row, "compoundClass"));
    const evidenceLevel = asText(getValue(row, "evidenceLevel"));
    const evidenceType = asText(getValue(row, "evidenceType"));
    const confidenceScore = asNumber(getValue(row, "confidenceScore"));
    const sources = splitSources(getValue(row, "sources"));
    const finalUseNotes = asText(getValue(row, "finalUseNotes"));
    const domain = inferDomain(finalUseNotes, name, slug, evidenceLevel, evidenceType);

    const reason = !slug
      ? `missing slug: ${name || "unnamed row"}`
      : !name
        ? `missing name for slug: ${slug}`
        : !finalUseNotes
          ? `missing finalUseNotes: ${slug}`
          : confidenceScore === null
            ? `missing confidenceScore: ${slug}`
            : confidenceScore < 85
              ? `confidenceScore below 85: ${slug} (${confidenceScore})`
              : "";

    if (reason) {
      skipped.push({ excelRow: index + 2, slug, name, reason });
      return null;
    }

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
  .filter(Boolean)
  .sort((a, b) => b.confidenceScore - a.confidenceScore || a.name.localeCompare(b.name));

const output = {
  generatedAt: new Date().toISOString(),
  count: items.length,
  items,
};

const report = {
  generatedAt: output.generatedAt,
  count: items.length,
  skippedCount: skipped.length,
  skipped,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Generated ${OUTPUT_PATH} with ${items.length} A-tier compounds.`);
if (skipped.length > 0) {
  console.warn(`[a-tier] skipped ${skipped.length} incomplete A-tier row(s); see ${path.relative(process.cwd(), REPORT_PATH)}`);
}
