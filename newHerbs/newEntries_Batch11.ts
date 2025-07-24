export const newHerbs = [
  {
    name: "Corydalis yanhusuo",
    slug: "corydalis-yanhusuo",
    commonNames: ["Yanhusuo"],
    region: "China, East Asia",
    effects: ["analgesic", "sedative", "antispasmodic"],
    activeCompounds: ["Tetrahydropalmatine (THP)"],
    mechanismOfAction: "Dopamine receptor antagonism and GABA modulation",
    traditionalUse: "Used in Traditional Chinese Medicine for pain and sleep.",
    tags: ["sedative", "analgesic", "tcm"]
  },
  {
    name: "Byrsonima crassifolia",
    slug: "byrsonima-crassifolia",
    commonNames: ["Nance"],
    region: "Central and South America",
    effects: ["mild sedative", "calming", "tonic"],
    activeCompounds: ["Catechins", "Quercetin"],
    mechanismOfAction: "Flavonoid antioxidant and neuroprotective action",
    traditionalUse: "Used in folk medicine to promote calm and wellness.",
    tags: ["sedative", "folk", "antioxidant"]
  },
  {
    name: "Rhododendron anthopogon",
    slug: "rhododendron-anthopogon",
    commonNames: ["Anthopogon", "Tibetan Rhododendron"],
    region: "Himalayas",
    effects: ["uplifting", "clarity", "spiritual aid"],
    activeCompounds: ["Flavonoids", "Volatile oils"],
    mechanismOfAction: "Aromatherapeutic and cognitive modulation via essential oils",
    traditionalUse: "Burned in Tibetan Buddhist rituals and used in Himalayan medicine.",
    tags: ["uplifting", "ritual", "clarity"]
  }
];

export const newCompounds = [
  {
    name: "Tetrahydropalmatine (THP)",
    type: "Isoquinoline alkaloid",
    effects: ["sedative", "dopamine antagonist", "pain relief"],
    foundIn: ["Corydalis yanhusuo"]
  },
  {
    name: "Catechins",
    type: "Flavonoids",
    effects: ["antioxidant", "calming"],
    foundIn: ["Byrsonima crassifolia"]
  },
  {
    name: "Quercetin",
    type: "Flavonol",
    effects: ["neuroprotective", "antioxidant"],
    foundIn: ["Byrsonima crassifolia"]
  },
  {
    name: "Volatile oils (Anthopogon)",
    type: "Essential oils",
    effects: ["aromatherapeutic", "clarity", "uplifting"],
    foundIn: ["Rhododendron anthopogon"]
  }
];