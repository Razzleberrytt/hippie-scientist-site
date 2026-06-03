export const isNonEmpty = (v: any) =>
  Array.isArray(v) ? v.filter(Boolean).length > 0 : !!String(v ?? "").trim();

export const toArray = (v: any): string[] => {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  const s = String(v ?? "").trim();
  if (!s) return [];
  return s
    .split(/[,;|]/)
    .map((x) => x.trim())
    .filter((x) => x && !/^unknown$/i.test(x));
};

export const formatList = (v: any, max?: number) => {
  const arr = toArray(v);
  return (max ? arr.slice(0, max) : arr).join(", ");
};

// Clean & normalize text (semicolons, spaces, sentence-case)
export const tidy = (s: any) => {
  const raw = String(s ?? "")
    .replace(/[;]+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw || /^unknown$/i.test(raw)) return "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

export const urlish = (s: string) => /^https?:\/\//i.test(s);

// Robust getters (handle key drift)
const getText = (o: any, names: string[]) => {
  const map: Record<string, string> = {};
  Object.keys(o || {}).forEach((k) => (map[k.toLowerCase()] = k));
  for (const n of names) {
    const hit = map[n.toLowerCase()];
    if (hit) {
      const val = String(o[hit] ?? "").trim();
      if (val) return val;
    }
  }
  return "";
};
const getList = (o: any, names: string[]) => toArray(getText(o, names));

export const pick = {
  effects: (o: any) => getText(o, ["effects", "effect"]),
  description: (o: any) =>
    getText(o, ["description", "summary", "overview", "desc"]),
  region: (o: any) =>
    getText(o, ["region", "regions", "origin", "geography", "distribution"]),
  intensity: (o: any) => getText(o, ["intensity", "potency", "strength"]),
  legalstatus: (o: any) =>
    getText(o, ["legalstatus", "legal_status", "status"]),
  compounds: (o: any) =>
    getList(o, ["compounds", "compound", "keycompounds", "actives", "constituents"]),
  contraind: (o: any) =>
    getList(o, ["contraindications", "contradictions", "cautions"]),
  interactions: (o: any) =>
    getList(o, ["interactions", "interaction", "drug_interactions"]),
  tags: (o: any) => getList(o, ["tags", "labels", "keywords"]),
  sources: (o: any) => getList(o, ["sources", "refs", "references"]),
  mechanism: (o: any) =>
    getText(o, [
      "mechanism",
      "mechanismofaction",
      "moa",
      "mechanism_of_action",
      "action",
    ]),
  preparations: (o: any) =>
    getList(o, ["preparations", "preparation", "forms", "formulations", "method"]),
  dosage: (o: any) =>
    getText(o, [
      "dosage",
      "dose",
      "dosing",
      "dosage_and_administration",
      "administration",
    ]),
  therapeutic: (o: any) =>
    getText(o, [
      "therapeutic",
      "uses",
      "applications",
      "benefits",
      "traditional_uses",
    ]),
  sideeffects: (o: any) =>
    getList(o, ["sideeffects", "side_effects", "adverse_effects", "unwanted_effects"]),
  safety: (o: any) =>
    getText(o, ["safety", "warnings", "precautions", "risk_profile"]),
  toxicity: (o: any) => getText(o, ["toxicity", "tox_profile"]),
  toxicity_ld50: (o: any) =>
    getText(o, ["toxicity_ld50", "toxicityld50", "toxicityId5"]),
  legalnotes: (o: any) => getText(o, ["legalnotes", "legal_notes"]),
  schedule: (o: any) => getText(o, ["schedule", "controlled_schedule"]),
  regiontags: (o: any) => getList(o, ["regiontags", "region_tags", "regions"]),
};
