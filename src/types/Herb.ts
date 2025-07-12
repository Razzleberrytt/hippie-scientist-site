export interface Herb {
  id: string;
  name: string;
  scientificName?: string;
  description: string;
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
  safetyRating: 'low' | 'medium' | 'high' | 'unknown';
  image?: string;
}
