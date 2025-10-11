export function normalize(s?: string | null) {
  return (s ?? "").trim();
}

export function titleCase(s?: string | null) {
  const t = normalize(s);
  if (!t) return "";
  return t
    .toLowerCase()
    .split(/\s+/)
    .map(w => w[0] ? w[0].toUpperCase() + w.slice(1) : w)
    .join(" ");
}

export function pickNames(h: any) {
  const common = normalize(h.common || h.commonName || h.name);
  const sci = normalize(h.scientific || h.scientificName || h.binomial);
  const same = common && sci && common.toLowerCase() === sci.toLowerCase();
  return {
    common: common && !same ? titleCase(common) : titleCase(sci || common),
    sci: sci && !same ? sci : ""
  };
}

export function cleanIntensity(raw?: string | null) {
  const s = normalize(raw)
    .replace(/^intensity[:\s]*/i, "")
    .replace(/\.+$/, "");
  if (!s) return "";
  // squash accidental repeated phrases/commas
  return s
    .split(/[;,]/)
    .map(x => x.trim())
    .filter(Boolean)
    .slice(0, 1)            // keep the most useful first clause
    .join(", ");
}
