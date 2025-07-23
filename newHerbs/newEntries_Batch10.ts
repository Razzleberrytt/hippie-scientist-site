export const newHerbs = [
  {
    name: "Cissampelos pareira",
    slug: "cissampelos-pareira",
    commonNames: ["Velvetleaf", "Abuta"],
    region: "South America, India",
    effects: ["sedative", "muscle relaxant", "antispasmodic"],
    activeCompounds: ["Pareirine", "Cissamine"],
    mechanismOfAction: "Alkaloids interacting with muscarinic and serotonin receptors",
    traditionalUse: "Used in Amazonian and Ayurvedic traditions for pain and calming.",
    tags: ["sedative", "folk", "relaxant"]
  },
  {
    name: "Artemisia absinthium",
    slug: "artemisia-absinthium",
    commonNames: ["Wormwood"],
    region: "Europe, Asia, North Africa",
    effects: ["stimulating", "psychoactive", "digestive"],
    activeCompounds: ["Thujone"],
    mechanismOfAction: "GABA receptor antagonism; CNS stimulant at higher doses",
    traditionalUse: "Used in absinthe and traditional medicine for digestion and stimulation.",
    tags: ["stimulant", "psychoactive", "folk"]
  },
  {
    name: "Tynanthus panurensis",
    slug: "tynanthus-panurensis",
    commonNames: ["Clavo Huasca"],
    region: "Amazon Rainforest",
    effects: ["aphrodisiac", "warming", "digestive aid"],
    activeCompounds: ["Eugenol", "Tynanthin"],
    mechanismOfAction: "TRPV1 activation, increases circulation and warmth",
    traditionalUse: "Used in Amazonian herbalism for sexual energy and digestion.",
    tags: ["aphrodisiac", "folk", "warming"]
  }
];

export const newCompounds = [
  {
    name: "Pareirine",
    type: "Isoquinoline alkaloid",
    effects: ["sedative", "muscle relaxant"],
    foundIn: ["Cissampelos pareira"]
  },
  {
    name: "Cissamine",
    type: "Alkaloid",
    effects: ["antispasmodic", "analgesic"],
    foundIn: ["Cissampelos pareira"]
  },
  {
    name: "Thujone",
    type: "Monoterpene ketone",
    effects: ["stimulant", "convulsant (high doses)"],
    foundIn: ["Artemisia absinthium"]
  },
  {
    name: "Eugenol",
    type: "Phenylpropene",
    effects: ["warming", "analgesic", "aphrodisiac"],
    foundIn: ["Tynanthus panurensis"]
  },
  {
    name: "Tynanthin",
    type: "Phenolic compound",
    effects: ["aphrodisiac", "digestive"],
    foundIn: ["Tynanthus panurensis"]
  }
];