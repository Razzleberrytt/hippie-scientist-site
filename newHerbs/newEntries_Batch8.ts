export const newHerbs = [
  {
    name: "Lactuca virosa",
    slug: "lactuca-virosa",
    commonNames: ["Wild Lettuce", "Opium Lettuce"],
    region: "Europe, North America",
    effects: ["sedative", "analgesic", "calming"],
    activeCompounds: ["Lactucin", "Lactucopicrin"],
    mechanismOfAction: "Acts on opioid receptors and central nervous system depressants",
    traditionalUse: "Used in 19th-century medicine for pain and insomnia.",
    tags: ["sedative", "analgesic", "folk"]
  },
  {
    name: "Tabernaemontana undulata",
    slug: "tabernaemontana-undulata",
    commonNames: ["Bechette", "Uchu Sanango"],
    region: "Amazon Rainforest",
    effects: ["visionary", "calming", "nervous system tonic"],
    activeCompounds: ["Voacangine"],
    mechanismOfAction: "Indole alkaloid affecting NMDA and cholinergic receptors",
    traditionalUse: "Used by indigenous healers to improve vision and intuition.",
    tags: ["visionary", "traditional-use", "calming"]
  },
  {
    name: "Datura metel",
    slug: "datura-metel",
    commonNames: ["Devil's Trumpet", "Metel"],
    region: "Asia, Africa",
    effects: ["hallucinogenic", "deliriant", "anticholinergic"],
    activeCompounds: ["Scopolamine", "Atropine"],
    mechanismOfAction: "Antagonist of muscarinic acetylcholine receptors",
    traditionalUse: "Used in rituals but also associated with danger and toxicity.",
    tags: ["hallucinogen", "deliriant", "toxic"]
  }
];

export const newCompounds = [
  {
    name: "Lactucin",
    type: "Sesquiterpene lactone",
    effects: ["sedative", "analgesic"],
    foundIn: ["Lactuca virosa"]
  },
  {
    name: "Lactucopicrin",
    type: "Sesquiterpene lactone",
    effects: ["pain relief", "calming"],
    foundIn: ["Lactuca virosa"]
  },
  {
    name: "Voacangine",
    type: "Indole alkaloid",
    effects: ["visionary", "psychoactive"],
    foundIn: ["Tabernaemontana undulata"]
  },
  {
    name: "Scopolamine",
    type: "Tropane alkaloid",
    effects: ["hallucinations", "amnesia", "delirium"],
    foundIn: ["Datura metel"]
  },
  {
    name: "Atropine",
    type: "Tropane alkaloid",
    effects: ["deliriant", "pupil dilation", "anticholinergic"],
    foundIn: ["Datura metel"]
  }
];