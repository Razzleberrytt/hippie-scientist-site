import herbsDataRaw from './herbs.json';
import type { Herb } from '../types/Herb';

export const herbsData: Herb[] = herbsDataRaw.map((h): Herb => ({
  id: h.id ?? h.name.toLowerCase().replace(/\s+/g, '-'),
  name: h.name,
  scientificName: h.scientificName,
  category: h.category,
  effects: h.effects,
  description: h.description ?? 'No description provided.',
  mechanismOfAction: h.mechanismOfAction,
  pharmacokinetics: h.pharmacokinetics,
  therapeuticUses: h.therapeuticUses,
  sideEffects: h.sideEffects,
  contraindications: h.contraindications,
  drugInteractions: h.drugInteractions,
  toxicityLD50: h.toxicityLD50,
  safetyRating: typeof h.safetyRating === 'number' ? h.safetyRating : 1,
  legalStatus: h.legalStatus,
  region: h.region,
  onset: h.onset,
  intensity: h.intensity,
  preparation: h.preparation,
  tags: h.tags,
}));
