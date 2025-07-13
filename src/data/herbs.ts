export interface Herb {
  id: string;
  description: string;
  safetyRating: "low" | "medium" | "high" | "unknown";
  name: string;
  scientificName?: string;
  category: string;
  effects: string[];
  preparation: string;
  intensity: string;
  onset: string;
  legalStatus: string;
  region: string;
  tags: string[];
  mechanismOfAction: string;
  pharmacokinetics: string;
  therapeuticUses: string;
  sideEffects: string;
  contraindications: string;
  drugInteractions: string;
  toxicity: string;
  toxicityLD50: string;
}

export const herbsData: Herb[] = [
  {
    id: "entada-rheedii",
    name: "Entada rheedii",
    scientificName: "",
    description: "Dream herb from African and Asian traditions.",
    safetyRating: "low",
    category: "Oneirogen",
    effects: ["Dream enhancement", "trance"],
    preparation: "Seed powder or chew",
    intensity: "Moderate",
    onset: "30-60 min",
    legalStatus: "Legal / Unregulated",
    region: "🌍 Africa / Asia",
    tags: ["💊 Oral", "🧠 Dream", "✅ Safe"],
    mechanismOfAction: "Unknown; likely GABA modulation.",
    pharmacokinetics: "Onset 30–60 min, effects ~6 hrs.",
    therapeuticUses: "Lucid dreaming, sleep enhancement.",
    sideEffects: "Mild sedation.",
    contraindications: "Pregnancy, CNS disorders.",
    drugInteractions: "CNS depressants.",
    toxicity: "Low",
    toxicityLD50: "Unknown"
  }
];
