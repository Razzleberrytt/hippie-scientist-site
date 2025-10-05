export type Herb = {
  commonName: string;
  latinName: string;
  imageUrl?: string;
  mechanism?: string;
  compounds?: string[];
  traditionalUses?: string;
  safety?: string;
  legal?: string;
};
export const SEED_HERBS: Herb[] = [
  {
    commonName: "Kanna",
    latinName: "Sceletium tortuosum",
    mechanism: "SERT modulation / PDE4 inhibition (literature).",
    compounds: ["Mesembrine", "Mesembrenone"],
    traditionalUses: "Traditional South African mood aid.",
    safety: "Educational only; avoid with serotonergic drugs.",
    legal: "Generally available; check local laws."
  },
  {
    commonName: "Blue Lotus",
    latinName: "Nymphaea caerulea",
    mechanism: "Aporphine-like alkaloids; relaxing (anecdotal).",
    compounds: ["Nuciferine", "Aporphine (trace)"],
    traditionalUses: "Historic infusions/teas.",
    safety: "May cause drowsiness; avoid sedatives.",
    legal: "Availability varies by region."
  }
];
