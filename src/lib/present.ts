export const isNonEmpty = (v: unknown) =>
  Array.isArray(v) ? v.filter(Boolean).length > 0 : !!String(v ?? "").trim();

export const toArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  const s = String(v ?? "").trim();
  if (!s) return [];
  return s
    .split(/[,;|]/)
    .map((x) => x.trim())
    .filter((x) => x && !/^unknown$/i.test(x));
};

export const formatList = (v: unknown, max?: number) => {
  const arr = toArray(v);
  return (max ? arr.slice(0, max) : arr).join(", ");
};

// Clean & normalize text (semicolons, spaces, sentence-case)
export const tidy = (s: unknown) => {
  const raw = String(s ?? "")
    .replace(/[;]+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw || /^unknown$/i.test(raw)) return "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

export const urlish = (s: string) => /^https?:\/\//i.test(s);

// Robust getters (handle key drift)
const getText = (o: Record<string, unknown> | null | undefined, names: string[]) => {
  const map: Record<string, string> = {};
  Object.keys(o || {}).forEach((k) => (map[k.toLowerCase()] = k));
  for (const n of names) {
    const hit = map[n.toLowerCase()];
    if (hit) {
      const val = String(o?.[hit] ?? "").trim();
      if (val) return val;
    }
  }
  return "";
};
const getList = (o: Record<string, unknown> | null | undefined, names: string[]) => toArray(getText(o, names));

export const pick = {
  effects: (o: Record<string, unknown> | null | undefined) => getText(o, ["effects", "effect"]),
  description: (o: Record<string, unknown> | null | undefined) =>
    getText(o, ["description", "summary", "overview", "desc"]),
  region: (o: Record<string, unknown> | null | undefined) =>
    getText(o, ["region", "regions", "origin", "geography", "distribution"]),
  intensity: (o: Record<string, unknown> | null | undefined) => getText(o, ["intensity", "potency", "strength"]),
  legalstatus: (o: Record<string, unknown> | null | undefined) =>
    getText(o, ["legalstatus", "legal_status", "status"]),
  compounds: (o: Record<string, unknown> | null | undefined) =>
    getList(o, ["compounds", "compound", "keycompounds", "actives", "constituents"]),
  contraind: (o: Record<string, unknown> | null | undefined) =>
    getList(o, ["contraindications", "contradictions", "cautions"]),
  interactions: (o: Record<string, unknown> | null | undefined) =>
    getList(o, ["interactions", "interaction", "drug_interactions"]),
  tags: (o: Record<string, unknown> | null | undefined) => getList(o, ["tags", "labels", "keywords"]),
  sources: (o: Record<string, unknown> | null | undefined) => getList(o, ["sources", "refs", "references"]),
  mechanism: (o: Record<string, unknown> | null | undefined) =>
    getText(o, [
      "mechanism",
      "mechanismofaction",
      "moa",
      "mechanism_of_action",
      "action",
    ]),
  preparations: (o: Record<string, unknown> | null | undefined) =>
    getList(o, ["preparations", "preparation", "forms", "formulations", "method"]),
  dosage: (o: Record<string, unknown> | null | undefined) =>
    getText(o, [
      "dosage",
      "dose",
      "dosing",
      "dosage_and_administration",
      "administration",
    ]),
  therapeutic: (o: Record<string, unknown> | null | undefined) =>
    getText(o, [
      "therapeutic",
      "uses",
      "applications",
      "benefits",
      "traditional_uses",
    ]),
  sideeffects: (o: Record<string, unknown> | null | undefined) =>
    getList(o, ["sideeffects", "side_effects", "adverse_effects", "unwanted_effects"]),
  safety: (o: Record<string, unknown> | null | undefined) =>
    getText(o, ["safety", "warnings", "precautions", "risk_profile"]),
  toxicity: (o: Record<string, unknown> | null | undefined) => getText(o, ["toxicity", "tox_profile"]),
  toxicity_ld50: (o: Record<string, unknown> | null | undefined) =>
    getText(o, ["toxicity_ld50", "toxicityld50", "toxicityId5"]),
  legalnotes: (o: Record<string, unknown> | null | undefined) => getText(o, ["legalnotes", "legal_notes"]),
  schedule: (o: Record<string, unknown> | null | undefined) => getText(o, ["schedule", "controlled_schedule"]),
  regiontags: (o: Record<string, unknown> | null | undefined) => getList(o, ["regiontags", "region_tags", "regions"]),
};
