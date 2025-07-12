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
  safetyRating: 'low' | 'medium' | 'high' | 'unknown';
  legalStatus: 'legal' | 'regulated' | 'illegal' | 'unknown';
  tags: string[];
  image?: string;
}
