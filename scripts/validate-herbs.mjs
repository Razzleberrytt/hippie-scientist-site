import fs from "node:fs";

const FILE = "src/data/herbs/herbs.normalized.json";

if (!fs.existsSync(FILE)) {
  console.error(`✖ Missing data file: ${FILE}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(FILE, "utf-8"));

if (!Array.isArray(raw)) {
  console.error(`✖ Expected an array in ${FILE}, received ${typeof raw}`);
  process.exit(1);
}

const LIST_FIELDS = [
  "preparations",
  "compounds",
  "sideeffects",
  "contraindications",
  "tags",
  "sources",
];

const STRING_FIELDS = [
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
  "legalnotes",
];

const errors = [];
const warnings = [];
const slugs = new Set();

const hasString = (value) => typeof value === "string" && value.trim().length > 0;

raw.forEach((row, index) => {
  if (typeof row !== "object" || row === null) {
    errors.push(`Row ${index + 1}: Expected object, received ${typeof row}`);
    return;
  }

  const slug = row.slug;
  if (!hasString(slug)) {
    errors.push(`Row ${index + 1}: Missing slug`);
  } else if (slugs.has(slug.trim())) {
    errors.push(`Row ${index + 1}: Duplicate slug '${slug}'`);
  } else {
    slugs.add(slug.trim());
  }

  if (!hasString(row.common) && !hasString(row.scientific)) {
    warnings.push(`Row ${index + 1}: Missing both common and scientific names`);
  }

  for (const field of STRING_FIELDS) {
    const value = row[field];
    if (value == null) continue;
    if (typeof value !== "string") {
      errors.push(`Row ${index + 1}: Field '${field}' should be a string`);
    }
  }

  for (const field of LIST_FIELDS) {
    const value = row[field];
    if (value == null) continue;
    if (!Array.isArray(value)) {
      errors.push(`Row ${index + 1}: Field '${field}' should be an array`);
      continue;
    }
    for (const [i, entry] of value.entries()) {
      if (entry == null) continue;
      if (typeof entry !== "string") {
        errors.push(
          `Row ${index + 1}: Field '${field}' entry #${i + 1} should be a string`
        );
      }
    }
  }
});

if (errors.length) {
  console.error(`\n✖ Validation failed with ${errors.length} issue(s):`);
  for (const msg of errors.slice(0, 50)) {
    console.error(` - ${msg}`);
  }
  if (errors.length > 50) {
    console.error(` ...and ${errors.length - 50} more.`);
  }
  process.exit(1);
}

console.log(`Herb dataset valid. Checked ${raw.length} row(s).`);
if (warnings.length) {
  console.warn(`\n⚠ Warnings (${warnings.length}):`);
  for (const msg of warnings.slice(0, 20)) {
    console.warn(` - ${msg}`);
  }
  if (warnings.length > 20) {
    console.warn(` ...and ${warnings.length - 20} more.`);
  }
}
