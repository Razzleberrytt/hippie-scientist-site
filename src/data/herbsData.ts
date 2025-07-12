export interface Herb {
  name: string;
  tags: string[];
  description: string;
  mechanism: string;
  pharmacokinetics: string;
  therapeutic_uses: string[];
  side_effects: string[];
  contraindications: string[];
  interactions: string[];
  toxicity: string;
  image: string;
}

export const herbsData: Herb[] = [
  {
    name: "Acorus calamus",
    tags: [
  "calming",
  "nootropic"
],
    description: "Used traditionally for its calming and cognitive-enhancing properties.",
    mechanism: "Contains asarones which interact with GABA and acetylcholine receptors.",
    pharmacokinetics: "Absorbed via oral route, metabolized in the liver.",
    therapeutic_uses: [
  "anxiety",
  "mental clarity",
  "digestion"
],
    side_effects: [
  "nausea",
  "potential carcinogenicity in high doses"
],
    contraindications: [
  "pregnancy",
  "seizure disorders"
],
    interactions: [
  "CNS depressants"
],
    toxicity: "High doses of β-asarone have shown carcinogenic effects in animal models.",
    image: "https://example.com/images/acorus_calamus.jpg",
  },
  {
    name: "Blue Lotus",
    tags: [
  "euphoric",
  "sedative"
],
    description: "Traditionally smoked or steeped in tea for mild euphoria and relaxation.",
    mechanism: "Active compounds aporphine and nuciferine act as dopamine receptor agonists.",
    pharmacokinetics: "Rapid onset when smoked; oral ingestion shows slower absorption.",
    therapeutic_uses: [
  "sleep aid",
  "anxiety",
  "aphrodisiac"
],
    side_effects: [
  "drowsiness",
  "dry mouth"
],
    contraindications: [
  "do not use with MAOIs",
  "pregnancy"
],
    interactions: [
  "alcohol",
  "sedatives"
],
    toxicity: "Low toxicity; caution with concentrated extracts.",
    image: "https://example.com/images/blue_lotus.jpg",
  },
];
