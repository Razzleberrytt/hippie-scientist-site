
export type SafetyRating = 'low' | 'medium' | 'high';
export type LegalStatus = 'legal' | 'regulated' | 'illegal';

export interface Herb {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  effects: string[];
  description: string;
  mechanismOfAction: string;
  pharmacokinetics: string;
  therapeuticUses: string;
  sideEffects: string;
  contraindications: string;
  drugInteractions: string;
  toxicityLD50: string;
  safetyRating: SafetyRating;
  legalStatus: LegalStatus;
  tags: string[];
  image?: string;
}

export const herbsData: Herb[] = [
  {
    id: "acorus-calamus",
    name: "Acorus Calamus",
    scientificName: "Acorus calamus",
    category: "Psychoactive",
    effects: ["Mental Clarity", "Mild Stimulation", "Dream Enhancement"],
    description: "Traditional herb known for mental clarity and mild psychoactive effects through β-asarone content.",
    mechanismOfAction: "Contains β-asarone; GABA modulation and mild stimulant effects.",
    pharmacokinetics: "Oral or chewed; onset 30–60 min; duration 2–6 hours.",
    therapeuticUses: "Memory enhancement, digestion aid, mental clarity.",
    sideEffects: "Potential carcinogenicity (high β-asarone).",
    contraindications: "Pregnancy, liver disorders.",
    drugInteractions: "May interact with sedatives and MAOIs.",
    toxicityLD50: "Estimated >1000 mg/kg (oral, rat).",
    safetyRating: "medium",
    legalStatus: "regulated",
    tags: ["Adaptogen", "Root", "Traditional"],
    image: "/images/herbs/acorus-calamus.jpg"
  }
];
