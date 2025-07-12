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
  toxicity: string;
  toxicityLD50: string;
  safetyRating: 'low' | 'medium' | 'high';
  legalStatus: 'legal' | 'regulated' | 'illegal';
  tags: string[];
  image?: string;
}

export const herbsData: Herb[] = [
  {
    id: "567d2df4-c3b3-47b5-b420-9849074cbd47",
    name: "Acorus calamus",
    scientificName: "Acorus calamus",
    category: "Unknown",
    effects: ["calming", "nootropic"],
    description: "Used traditionally for its calming and cognitive-enhancing properties.",
    mechanismOfAction: "Contains asarones which interact with GABA and acetylcholine receptors.",
    pharmacokinetics: "Absorbed via oral route, metabolized in the liver.",
    therapeuticUses: "anxiety, mental clarity, digestion",
    sideEffects: "nausea, potential carcinogenicity in high doses",
    contraindications: "pregnancy, seizure disorders",
    drugInteractions: "CNS depressants",
    toxicity: "High doses of \u03b2-asarone have shown carcinogenic effects in animal models.",
    toxicityLD50: "Unknown",
    safetyRating: "medium",
    legalStatus: "regulated",
    tags: ["calming", "nootropic"],
    image: "https://example.com/images/acorus_calamus.jpg",
  },
  {
    id: "671d0e86-3f75-4296-a160-86f5da286f30",
    name: "Blue Lotus",
    scientificName: "Blue Lotus",
    category: "Unknown",
    effects: ["euphoric", "sedative"],
    description: "Traditionally smoked or steeped in tea for mild euphoria and relaxation.",
    mechanismOfAction: "Active compounds aporphine and nuciferine act as dopamine receptor agonists.",
    pharmacokinetics: "Rapid onset when smoked; oral ingestion shows slower absorption.",
    therapeuticUses: "sleep aid, anxiety, aphrodisiac",
    sideEffects: "drowsiness, dry mouth",
    contraindications: "do not use with MAOIs, pregnancy",
    drugInteractions: "alcohol, sedatives",
    toxicity: "Low toxicity; caution with concentrated extracts.",
    toxicityLD50: "Unknown",
    safetyRating: "medium",
    legalStatus: "regulated",
    tags: ["euphoric", "sedative"],
    image: "https://example.com/images/blue_lotus.jpg",
  },
];
