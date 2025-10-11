import fs from "fs";

const SRC = "src/data/herbs/herbs.normalized.json";
const herbs = JSON.parse(fs.readFileSync(SRC, "utf-8"));

const INTENSITY_ENUM = ["mild", "moderate", "strong", "variable", "unknown"];

function pickIntensityRaw(h) {
  const direct =
    h.intensity_level ||
    h.intensity ||
    h.effects_intensity ||
    h.overview_intensity;
  if (direct) return direct;

  const text = [
    h.intensity_text,
    h.intensity_summary,
    h.effects,
    h.description,
  ]
    .filter(Boolean)
    .join(" ");

  return text || "";
}

function parseIntensity(raw) {
  if (!raw) return "unknown";
  const s = String(raw).toLowerCase();

  if (INTENSITY_ENUM.includes(s)) return s;

  if (/(\bstrong|\bpotent|\bintense|\bpowerful)/.test(s)) return "strong";
  if (/(\bmoderate|\bmedium)/.test(s)) return "moderate";
  if (/(\bmild|\bgentle|\blight)/.test(s)) return "mild";
  if (/(\bvar(y|iable)|\bmixed|\bdepends|\bcontextual)/.test(s)) return "variable";

  const m = s.match(/intensity[^a-z]*(mild|moderate|strong)/);
  if (m && m[1]) return m[1];

  return "unknown";
}

function intensityPretty(level) {
  switch (level) {
    case "mild":
      return "Mild";
    case "moderate":
      return "Moderate";
    case "strong":
      return "Strong";
    case "variable":
      return "Variable";
    default:
      return "Unknown";
  }
}

for (const h of herbs) {
  const raw = pickIntensityRaw(h);
  const level = parseIntensity(raw);
  h.intensityLevel = level;
  h.intensityLabel = intensityPretty(level);
  delete h.intensity_level;
  delete h.intensity_label;
}

fs.writeFileSync(SRC, JSON.stringify(herbs, null, 2));
console.log("Normalized intensity for", herbs.length, "herbs");
