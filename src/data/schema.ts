export type Canon =
  | "common" | "scientific" | "slug"
  | "category" | "subcategory" | "intensity" | "region" | "regiontags"
  | "legalstatus" | "schedule" | "legalnotes"
  | "description" | "effects" | "mechanism"
  | "compounds" | "preparations" | "dosage" | "therapeutic"
  | "interactions" | "contraindications" | "sideeffects" | "safety"
  | "toxicity" | "toxicity_ld50"
  | "tags" | "sources" | "image";

export const ALIASES: Record<Canon, string[]> = {
  common: ["common","commonname","name"],
  scientific: ["scientific","scientificname","latin","latinname","binomial"],
  slug: ["slug"],
  category: ["category","categoryprimary","primarycategory","group"],
  subcategory: ["subcategory","secondarycategory"],
  intensity: ["intensity","potency","strength"],
  region: ["region","origin","geography","distribution"],
  regiontags: ["region_tags","regions"],
  legalstatus: ["legalstatus","legal_status","status"],
  schedule: ["schedule","controlled_schedule"],
  legalnotes: ["legalnotes","legal_notes"],
  description: ["description","summary","overview","desc"],
  effects: ["effects","effect"],
  mechanism: ["mechanismofaction","mechanism","moa","mechanism_of_action","action"],
  compounds: ["compounds","compound","keycompounds","actives","constituents"],
  preparations: ["preparations","preparation","method","forms","formulations"],
  dosage: ["dosage","dose","dosing","dosage_and_administration","administration"],
  therapeutic: ["therapeutic","uses","applications","benefits","traditional_uses"],
  interactions: ["interactions","drug_interactions","mixing"],
  contraindications: ["contraindications","contradictions","cautions"],
  sideeffects: ["sideeffects","side_effects","adverse_effects","unwanted_effects"],
  safety: ["safety","warnings","precautions","risk_profile"],
  toxicity: ["toxicity","tox_profile"],
  toxicity_ld50: ["toxicity_ld50","toxicityld50","ld50"],
  tags: ["tags","labels","keywords"],
  sources: ["sources","refs","references"],
  image: ["image","imageurl","img","photo"],
};
