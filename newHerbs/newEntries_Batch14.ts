export const newHerbs = [
  {
    name: "Viola odorata",
    slug: "viola-odorata",
    commonNames: ["Sweet Violet"],
    region: "Europe, Asia",
    effects: ["mild sedative", "cough suppressant", "calming"],
    activeCompounds: ["Violine", "Methyl salicylate"],
    mechanismOfAction: "GABAergic activity and analgesic effects",
    traditionalUse: "Used for sleep, coughs, and gentle mood support.",
    tags: ["sedative", "folk", "soothing"]
  },
  {
    name: "Pimenta dioica",
    slug: "pimenta-dioica",
    commonNames: ["Allspice"],
    region: "Caribbean, Central America",
    effects: ["warming", "digestive", "mood-enhancing"],
    activeCompounds: ["Eugenol", "Quercetin"],
    mechanismOfAction: "TRPV1 stimulation, antioxidant action",
    traditionalUse: "Used as a digestive tonic and flavoring spice with subtle psychoactivity.",
    tags: ["warming", "digestive", "folk"]
  },
  {
    name: "Casimiroa edulis",
    slug: "casimiroa-edulis",
    commonNames: ["White Sapote"],
    region: "Central America, Mexico",
    effects: ["sedative", "anxiolytic", "euphoric"],
    activeCompounds: ["Casimiroin", "Zapotin"],
    mechanismOfAction: "Benzodiazepine-like CNS depressant activity",
    traditionalUse: "Used to treat anxiety, insomnia, and as a mild euphoric.",
    tags: ["sedative", "folk", "euphoric"]
  }
];

export const newCompounds = [
  {
    name: "Violine",
    type: "Alkaloid glycoside",
    effects: ["calming", "respiratory relaxant"],
    foundIn: ["Viola odorata"]
  },
  {
    name: "Methyl salicylate",
    type: "Ester",
    effects: ["analgesic", "cooling"],
    foundIn: ["Viola odorata"]
  },
  {
    name: "Casimiroin",
    type: "Coumarin",
    effects: ["sedative", "mood stabilizing"],
    foundIn: ["Casimiroa edulis"]
  },
  {
    name: "Zapotin",
    type: "Flavonoid",
    effects: ["euphoric", "anxiolytic"],
    foundIn: ["Casimiroa edulis"]
  }
];