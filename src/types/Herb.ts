export interface Herb {
  id: string;
  name: string;
  scientificName?: string;
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
  safetyRating: number | 'low' | 'medium' | 'high' | 'unknown';
  legalStatus: string;
  region: string;
  onset?: string;
  intensity?: string;
  preparation?: string;
  tags: string[];
}
