export const newHerbs = [
  {
    name: "Nepeta cataria",
    slug: "nepeta-cataria",
    commonNames: ["Catnip"],
    region: "Europe, Central Asia",
    effects: ["euphoria", "calming", "mild stimulant (in cats)"],
    activeCompounds: ["Nepetalactone"],
    mechanismOfAction: "Interacts with opioid receptors and possibly TRP channels",
    traditionalUse: "Used in folk medicine for relaxation, colds, and digestive issues.",
    tags: ["calming", "folk", "digestive"]
  },
  {
    name: "Elsholtzia ciliata",
    slug: "elsholtzia-ciliata",
    commonNames: ["Vietnamese Balm"],
    region: "East and Southeast Asia",
    effects: ["uplifting", "digestive aid", "mental clarity"],
    activeCompounds: ["Elsholtzia ketone"],
    mechanismOfAction: "Stimulates gastrointestinal and olfactory receptors",
    traditionalUse: "Used in Vietnamese herbal teas for alertness and wellness.",
    tags: ["stimulant", "folk", "clarity"]
  },
  {
    name: "Virola theiodora",
    slug: "virola-theiodora",
    commonNames: ["Epena", "Virola"],
    region: "Amazon Basin",
    effects: ["psychedelic", "visionary", "dissociative"],
    activeCompounds: ["5-MeO-DMT", "DMT", "Bufotenine"],
    mechanismOfAction: "5-HT2A agonism (classic psychedelic mechanism)",
    traditionalUse: "Used by Amazonian tribes as a snuff for spiritual rituals.",
    tags: ["psychedelic", "visionary", "traditional-use"]
  }
];

export const newCompounds = [
  {
    name: "Nepetalactone",
    type: "Terpenoid",
    effects: ["euphoric", "calming", "insect repellent"],
    foundIn: ["Nepeta cataria"]
  },
  {
    name: "Elsholtzia ketone",
    type: "Ketone compound",
    effects: ["digestive aid", "uplifting"],
    foundIn: ["Elsholtzia ciliata"]
  },
  {
    name: "5-MeO-DMT",
    type: "Tryptamine alkaloid",
    effects: ["ego dissolution", "psychedelic", "visionary"],
    foundIn: ["Virola theiodora"]
  },
  {
    name: "DMT",
    type: "Tryptamine alkaloid",
    effects: ["psychedelic", "visual", "transcendental"],
    foundIn: ["Virola theiodora"]
  },
  {
    name: "Bufotenine",
    type: "Tryptamine alkaloid",
    effects: ["psychedelic", "introspective", "dissociative"],
    foundIn: ["Virola theiodora"]
  }
];