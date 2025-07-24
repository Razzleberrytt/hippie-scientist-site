export const newHerbs = [
  {
    name: "Tamarindus indica",
    slug: "tamarindus-indica",
    commonNames: ["Tamarind"],
    region: "Africa, South Asia",
    effects: ["laxative", "digestive aid", "cooling"],
    activeCompounds: ["Tartaric acid", "Lupeol"],
    mechanismOfAction: "Promotes gastrointestinal motility and antioxidant action",
    traditionalUse: "Used in traditional medicine and cuisine for digestive support.",
    tags: ["digestive", "folk", "cooling"]
  },
  {
    name: "Alchornea castaneifolia",
    slug: "alchornea-castaneifolia",
    commonNames: ["Iporuru"],
    region: "Amazon Rainforest",
    effects: ["anti-inflammatory", "muscle relaxant", "analgesic"],
    activeCompounds: ["Alchorneine"],
    mechanismOfAction: "Anti-inflammatory and muscle relaxant through unknown pathways",
    traditionalUse: "Used in traditional Amazonian medicine for arthritis and pain.",
    tags: ["folk", "relaxant", "analgesic"]
  },
  {
    name: "Myristica fragrans",
    slug: "myristica-fragrans",
    commonNames: ["Nutmeg"],
    region: "Indonesia, Caribbean, India",
    effects: ["hallucinogenic (high doses)", "euphoria", "sedation"],
    activeCompounds: ["Myristicin", "Elemicin"],
    mechanismOfAction: "MAOI-like activity and anticholinergic properties at high doses",
    traditionalUse: "Used in spice blends, aphrodisiacs, and as a psychoactive in folk rituals.",
    tags: ["hallucinogen", "euphoric", "folk"]
  }
];

export const newCompounds = [
  {
    name: "Tartaric acid",
    type: "Organic acid",
    effects: ["digestive", "antioxidant"],
    foundIn: ["Tamarindus indica"]
  },
  {
    name: "Lupeol",
    type: "Triterpenoid",
    effects: ["anti-inflammatory", "antioxidant"],
    foundIn: ["Tamarindus indica"]
  },
  {
    name: "Alchorneine",
    type: "Alkaloid",
    effects: ["analgesic", "muscle relaxant"],
    foundIn: ["Alchornea castaneifolia"]
  },
  {
    name: "Myristicin",
    type: "Phenylpropene",
    effects: ["hallucinogenic", "sedative"],
    foundIn: ["Myristica fragrans"]
  },
  {
    name: "Elemicin",
    type: "Phenylpropene",
    effects: ["euphoric", "psychoactive", "deliriant"],
    foundIn: ["Myristica fragrans"]
  }
];