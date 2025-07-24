export const newHerbs = [
  {
    name: "Leonurus cardiaca",
    slug: "leonurus-cardiaca",
    commonNames: ["Motherwort"],
    region: "Europe, Asia",
    effects: ["anxiolytic", "sedative", "cardiotonic"],
    activeCompounds: ["Leonurine", "Stachydrine"],
    mechanismOfAction: "GABAergic modulation and mild uterotonic effects",
    traditionalUse: "Used in traditional herbalism for anxiety and female reproductive support.",
    tags: ["sedative", "folk", "cardio"]
  },
  {
    name: "Ficus religiosa",
    slug: "ficus-religiosa",
    commonNames: ["Sacred Fig", "Bodhi Tree"],
    region: "India, Southeast Asia",
    effects: ["calming", "mood-balancing", "mild sedative"],
    activeCompounds: ["Furanocoumarins", "Tannins"],
    mechanismOfAction: "Neuroprotective antioxidant and serotonin modulation",
    traditionalUse: "Used in Ayurveda and spiritual practice for mindfulness and peace.",
    tags: ["spiritual", "sedative", "folk"]
  },
  {
    name: "Ilex paraguariensis",
    slug: "ilex-paraguariensis",
    commonNames: ["Yerba Mate"],
    region: "South America",
    effects: ["stimulant", "mental clarity", "energizing"],
    activeCompounds: ["Caffeine", "Theobromine", "Chlorogenic acid"],
    mechanismOfAction: "Adenosine receptor antagonism and CNS stimulation",
    traditionalUse: "Consumed as a social and energizing herbal tea throughout South America.",
    tags: ["stimulant", "folk", "nootropic"]
  }
];

export const newCompounds = [
  {
    name: "Leonurine",
    type: "Alkaloid",
    effects: ["sedative", "relaxant", "mood balancing"],
    foundIn: ["Leonurus cardiaca"]
  },
  {
    name: "Stachydrine",
    type: "Betaine compound",
    effects: ["uterotonic", "cardiotonic"],
    foundIn: ["Leonurus cardiaca"]
  },
  {
    name: "Furanocoumarins",
    type: "Coumarin derivative",
    effects: ["calming", "UV reactive"],
    foundIn: ["Ficus religiosa"]
  },
  {
    name: "Chlorogenic acid",
    type: "Polyphenol",
    effects: ["stimulant", "neuroprotective"],
    foundIn: ["Ilex paraguariensis"]
  }
];