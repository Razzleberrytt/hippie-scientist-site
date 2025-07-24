// BATCH 2
export const newHerbs = [
  {
    name: "Desfontainia spinosa",
    slug: "desfontainia-spinosa",
    commonNames: ["Chilean holly", "Taique"],
    region: "South America (Chile, Colombia)",
    effects: ["hallucinogenic", "sedative", "deliriant"],
    activeCompounds: ["Desfontainin"],
    mechanismOfAction: "Unclear; believed to affect muscarinic acetylcholine receptors.",
    traditionalUse: "Used by Mapuche shamans in ritual ceremonies.",
    tags: ["hallucinogen", "traditional-use", "rare"]
  },
  {
    name: "Argyreia nervosa",
    slug: "argyreia-nervosa",
    commonNames: ["Hawaiian baby woodrose"],
    region: "South Asia, Polynesia, Hawaii",
    effects: ["psychedelic", "euphoria", "visual distortion"],
    activeCompounds: ["LSA (lysergic acid amide)"],
    mechanismOfAction: "Serotonergic activity (5-HT2A agonist)",
    traditionalUse: "Used in Ayurvedic and Polynesian traditions for mind-opening.",
    tags: ["psychedelic", "visionary", "ergoline"]
  },
  {
    name: "Petasites hybridus",
    slug: "petasites-hybridus",
    commonNames: ["Butterbur"],
    region: "Europe, Western Asia",
    effects: ["sedative", "analgesic", "antispasmodic"],
    activeCompounds: ["Petasin", "Isopetasin"],
    mechanismOfAction: "Calcium channel modulation; anti-inflammatory.",
    traditionalUse: "Used historically to treat pain, migraines, and spasms.",
    tags: ["analgesic", "sedative", "folk"]
  },

// BATCH 3
  {
    name: "Nymphaea caerulea",
    slug: "nymphaea-caerulea",
    commonNames: ["Blue Lotus"],
    region: "Ancient Egypt, East Africa",
    effects: ["euphoria", "sedation", "aphrodisiac"],
    activeCompounds: ["Aporphine", "Nuciferine"],
    mechanismOfAction: "Dopaminergic and serotonergic modulation",
    traditionalUse: "Used ceremonially in Ancient Egypt for euphoria and vision enhancement.",
    tags: ["aphrodisiac", "sedative", "euphoric", "traditional-use"]
  },
  {
    name: "Calea zacatechichi",
    slug: "calea-zacatechichi",
    commonNames: ["Dream Herb", "Mexican Calea"],
    region: "Mexico, Central America",
    effects: ["lucid dreaming", "relaxation", "dream recall"],
    activeCompounds: ["Germacranolides"],
    mechanismOfAction: "Unclear; possibly cholinergic or GABAergic",
    traditionalUse: "Used by Chontal shamans to induce vivid dreams and visions.",
    tags: ["dream", "visionary", "traditional-use"]
  },
  {
    name: "Tropaeolum majus",
    slug: "tropaeolum-majus",
    commonNames: ["Nasturtium"],
    region: "South America (Peru, Andes)",
    effects: ["mild stimulant", "respiratory enhancer"],
    activeCompounds: ["Benzyl isothiocyanate"],
    mechanismOfAction: "Antimicrobial and expectorant, may enhance breathing clarity.",
    traditionalUse: "Used in Andean herbalism to clear lungs and improve alertness.",
    tags: ["stimulant", "respiratory", "folk"]
  },

// BATCH 4
  {
    name: "Turnera diffusa",
    slug: "turnera-diffusa",
    commonNames: ["Damiana"],
    region: "Mexico, Central America",
    effects: ["aphrodisiac", "euphoria", "mild stimulant"],
    activeCompounds: ["Damianin"],
    mechanismOfAction: "Likely GABAergic and dopaminergic modulation",
    traditionalUse: "Used as an aphrodisiac and mood enhancer in Mexican herbalism.",
    tags: ["aphrodisiac", "folk", "mood"]
  },
  {
    name: "Salvia apiana",
    slug: "salvia-apiana",
    commonNames: ["White Sage"],
    region: "Southwestern U.S., Northern Mexico",
    effects: ["cleansing", "mental clarity", "mild uplifting"],
    activeCompounds: ["Cineole", "Rosmarinic acid"],
    mechanismOfAction: "Antioxidant and acetylcholinesterase inhibition",
    traditionalUse: "Used in smudging rituals for purification and clarity.",
    tags: ["clarity", "traditional-use", "purifier"]
  },
  {
    name: "Verbena officinalis",
    slug: "verbena-officinalis",
    commonNames: ["Vervain"],
    region: "Europe, North Africa, Asia",
    effects: ["mild sedative", "anxiolytic", "dream potentiator"],
    activeCompounds: ["Verbenalin"],
    mechanismOfAction: "GABAergic modulation and calcium channel effects",
    traditionalUse: "Used in European folk medicine for anxiety and dreaming.",
    tags: ["sedative", "folk", "dream"]
  }
];

export const newCompounds = [
  // Batch 2
  { name: "Desfontainin", type: "Alkaloid", effects: ["deliriant", "sedative"], foundIn: ["Desfontainia spinosa"] },
  { name: "LSA (Lysergic Acid Amide)", type: "Ergoline alkaloid", effects: ["psychedelic", "visual enhancement", "dreamlike"], foundIn: ["Argyreia nervosa"] },
  { name: "Petasin", type: "Sesquiterpene", effects: ["anti-inflammatory", "sedative"], foundIn: ["Petasites hybridus"] },
  { name: "Isopetasin", type: "Sesquiterpene", effects: ["antispasmodic", "analgesic"], foundIn: ["Petasites hybridus"] },
  // Batch 3
  { name: "Aporphine", type: "Alkaloid", effects: ["dopaminergic", "mild euphoria"], foundIn: ["Nymphaea caerulea"] },
  { name: "Nuciferine", type: "Aporphine alkaloid", effects: ["sedative", "antipsychotic", "dopamine antagonist"], foundIn: ["Nymphaea caerulea"] },
  { name: "Germacranolides", type: "Sesquiterpene lactones", effects: ["dream enhancement", "mild sedation"], foundIn: ["Calea zacatechichi"] },
  { name: "Benzyl isothiocyanate", type: "Isothiocyanate compound", effects: ["expectorant", "stimulating", "antibacterial"], foundIn: ["Tropaeolum majus"] },
  // Batch 4
  { name: "Damianin", type: "Terpenoid", effects: ["aphrodisiac", "calming", "mild stimulant"], foundIn: ["Turnera diffusa"] },
  { name: "Cineole", type: "Monoterpene", effects: ["clarity", "stimulating", "antibacterial"], foundIn: ["Salvia apiana"] },
  { name: "Rosmarinic acid", type: "Phenolic compound", effects: ["antioxidant", "cognitive support"], foundIn: ["Salvia apiana"] },
  { name: "Verbenalin", type: "Iridoid glycoside", effects: ["sedative", "relaxing", "dream-inducing"], foundIn: ["Verbena officinalis"] }
];