export const newHerbs = [
  {
    name: "Zanthoxylum clava-herculis",
    slug: "zanthoxylum-clava-herculis",
    commonNames: ["Toothache Tree", "Southern Prickly Ash"],
    region: "Southeastern United States",
    effects: ["tingling", "local anesthetic", "stimulant"],
    activeCompounds: ["Pellitorine", "Sanshools"],
    mechanismOfAction: "TRPA1 and TRPV1 ion channel modulation",
    traditionalUse: "Used by Native Americans to numb toothaches and energize.",
    tags: ["stimulant", "tingling", "folk"]
  },
  {
    name: "Nicotiana rustica",
    slug: "nicotiana-rustica",
    commonNames: ["Aztec Tobacco", "Mapacho"],
    region: "South America, Central America",
    effects: ["stimulant", "grounding", "psychoactive"],
    activeCompounds: ["Nicotine", "Harmala alkaloids"],
    mechanismOfAction: "Nicotinic acetylcholine receptor agonism + MAOI activity",
    traditionalUse: "Used in shamanic rituals for grounding and spirit communication.",
    tags: ["psychoactive", "traditional-use", "tobacco"]
  },
  {
    name: "Ruta graveolens",
    slug: "ruta-graveolens",
    commonNames: ["Rue", "Herb of Grace"],
    region: "Mediterranean, Middle East",
    effects: ["emmenagogue", "psychoactive (high dose)", "sedative"],
    activeCompounds: ["Rutin", "Graveoline"],
    mechanismOfAction: "Monoamine oxidase inhibition; uterine stimulation",
    traditionalUse: "Used historically in folk magic and herbalism.",
    tags: ["folk", "sedative", "dangerous"]
  }
];

export const newCompounds = [
  {
    name: "Pellitorine",
    type: "Alkylamide",
    effects: ["tingling", "local anesthetic"],
    foundIn: ["Zanthoxylum clava-herculis"]
  },
  {
    name: "Sanshools",
    type: "Alkylamide",
    effects: ["tingling", "sensory enhancement"],
    foundIn: ["Zanthoxylum clava-herculis"]
  },
  {
    name: "Nicotine",
    type: "Alkaloid",
    effects: ["stimulant", "psychoactive", "addictive"],
    foundIn: ["Nicotiana rustica"]
  },
  {
    name: "Harmala alkaloids",
    type: "Beta-carboline alkaloids",
    effects: ["MAOI", "visionary", "dream enhancing"],
    foundIn: ["Nicotiana rustica"]
  },
  {
    name: "Graveoline",
    type: "Quinoline alkaloid",
    effects: ["uterine stimulant", "neuroactive"],
    foundIn: ["Ruta graveolens"]
  }
];