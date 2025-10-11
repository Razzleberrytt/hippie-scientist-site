import fs from "fs";

const SRC = "src/data/herbs/herbs.normalized.json";
const herbs = JSON.parse(fs.readFileSync(SRC, "utf-8"));

function chooseLevel(h) {
  const f = (h.intensity || h.intensity_level || "").toString().toLowerCase();
  if (["mild", "moderate", "strong", "toxic"].includes(f)) return f;

  const text = [
    h.intensity_text,
    h.intensity_summary,
    h.description,
    h.effects,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(^|\b)(highly\s+toxic|extremely\s+toxic|cardiac glycoside|aconit|poison|hepatotoxic)(\b|$)/.test(text)) return "toxic";
  if (/(^|\b)(very\s+strong|potent|powerful|dmt|ayahuasca|deliriant|anticholinergic)(\b|$)/.test(text)) return "strong";
  if (/(^|\b)(moderate|notable|psychedelic|sedative)(\b|$)/.test(text)) return "moderate";
  if (/(^|\b)(mild|gentle|calming|soothing)(\b|$)/.test(text)) return "mild";

  return null;
}

for (const h of herbs) {
  const lvl = chooseLevel(h);
  h.intensity_level = lvl;
  h.intensity_label = lvl ? lvl[0].toUpperCase() + lvl.slice(1) : null;
}

fs.writeFileSync(SRC, JSON.stringify(herbs, null, 2));
console.log("Normalized intensity for", herbs.length, "herbs");
