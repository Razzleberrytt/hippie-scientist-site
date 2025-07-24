export const newHerbs = [
  {
    name: "Heimia salicifolia",
    slug: "heimia-salicifolia",
    commonNames: ["Sinicuichi", "Sun Opener"],
    region: "Mexico, Central America",
    effects: ["auditory distortion", "relaxation", "dreaminess"],
    activeCompounds: ["Cryogenine", "Lyfoline"],
    mechanismOfAction: "Potential GABAergic and cholinergic modulation",
    traditionalUse: "Used by Aztecs and indigenous Mexicans for spiritual insight.",
    tags: ["dream", "auditory", "folk"]
  },
  {
    name: "Nelumbo nucifera",
    slug: "nelumbo-nucifera",
    commonNames: ["Sacred Lotus"],
    region: "Asia, Egypt",
    effects: ["sedative", "aphrodisiac", "euphoric"],
    activeCompounds: ["Nuciferine", "Neferine"],
    mechanismOfAction: "Dopamine receptor modulation, mild serotonin effects",
    traditionalUse: "Used in Ayurveda and Buddhist practices for calm and devotion.",
    tags: ["aphrodisiac", "sedative", "spiritual"]
  },
  {
    name: "Combretum quadrangulare",
    slug: "combretum-quadrangulare",
    commonNames: ["Sakae Naa"],
    region: "Southeast Asia",
    effects: ["stimulant", "energizing", "focus-enhancing"],
    activeCompounds: ["Combretol", "Combretin"],
    mechanismOfAction: "Unknown, likely central nervous system stimulant",
    traditionalUse: "Used as a kratom alternative in Southeast Asian cultures.",
    tags: ["stimulant", "folk", "focus"]
  }
];

export const newCompounds = [
  {
    name: "Cryogenine",
    type: "Alkaloid",
    effects: ["auditory shifts", "relaxation"],
    foundIn: ["Heimia salicifolia"]
  },
  {
    name: "Lyfoline",
    type: "Alkaloid",
    effects: ["mild sedative"],
    foundIn: ["Heimia salicifolia"]
  },
  {
    name: "Neferine",
    type: "Aporphine alkaloid",
    effects: ["sedative", "calming", "aphrodisiac"],
    foundIn: ["Nelumbo nucifera"]
  },
  {
    name: "Combretol",
    type: "Flavonoid",
    effects: ["energizing", "stimulant"],
    foundIn: ["Combretum quadrangulare"]
  },
  {
    name: "Combretin",
    type: "Lignan compound",
    effects: ["focus", "cognitive enhancement"],
    foundIn: ["Combretum quadrangulare"]
  }
];