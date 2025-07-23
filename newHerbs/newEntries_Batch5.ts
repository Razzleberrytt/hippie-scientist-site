export const newHerbs = [
  {
    name: "Silene undulata",
    slug: "silene-undulata",
    commonNames: ["African Dream Root"],
    region: "South Africa",
    effects: ["lucid dreaming", "dream recall", "mild sedation"],
    activeCompounds: ["Triterpenoid saponins"],
    mechanismOfAction: "Unknown; may influence cholinergic systems during sleep cycles.",
    traditionalUse: "Used by Xhosa shamans to induce vivid, meaningful dreams.",
    tags: ["dream", "visionary", "african"]
  },
  {
    name: "Justicia pectoralis",
    slug: "justicia-pectoralis",
    commonNames: ["Tilo", "Freshcut"],
    region: "South and Central America",
    effects: ["calming", "euphoric", "mild sedative"],
    activeCompounds: ["Coumarin", "Umelliferone"],
    mechanismOfAction: "GABAergic activity, mild monoamine modulation",
    traditionalUse: "Used in Amazonian herbal mixtures and healing brews.",
    tags: ["calming", "euphoric", "folk"]
  },
  {
    name: "Scutellaria lateriflora",
    slug: "scutellaria-lateriflora",
    commonNames: ["Blue Skullcap"],
    region: "North America",
    effects: ["anxiolytic", "sedative", "muscle relaxant"],
    activeCompounds: ["Baicalin", "Scutellarin"],
    mechanismOfAction: "GABA receptor modulation, antioxidant activity",
    traditionalUse: "Used by Native American tribes for anxiety and insomnia.",
    tags: ["sedative", "folk", "relaxant"]
  }
];

export const newCompounds = [
  {
    name: "Triterpenoid saponins",
    type: "Saponin glycoside",
    effects: ["dream enhancement", "mild sedative"],
    foundIn: ["Silene undulata"]
  },
  {
    name: "Coumarin",
    type: "Benzopyrone",
    effects: ["calming", "aromatic", "mild anticoagulant"],
    foundIn: ["Justicia pectoralis"]
  },
  {
    name: "Umelliferone",
    type: "Coumarin derivative",
    effects: ["soothing", "anti-inflammatory"],
    foundIn: ["Justicia pectoralis"]
  },
  {
    name: "Baicalin",
    type: "Flavone glycoside",
    effects: ["anxiolytic", "anti-inflammatory"],
    foundIn: ["Scutellaria lateriflora"]
  },
  {
    name: "Scutellarin",
    type: "Flavonoid",
    effects: ["sedative", "vasodilatory"],
    foundIn: ["Scutellaria lateriflora"]
  }
];