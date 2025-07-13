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
