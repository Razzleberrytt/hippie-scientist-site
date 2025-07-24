
// ---- File: newCompounds_Batch3.ts ----
export const newCompounds = [
  {
    name: "Aporphine",
    type: "Alkaloid",
    effects: ["dopaminergic", "mild euphoria"],
    foundIn: ["Nymphaea caerulea"]
  },
  {
    name: "Nuciferine",
    type: "Aporphine alkaloid",
    effects: ["sedative", "antipsychotic", "dopamine antagonist"],
    foundIn: ["Nymphaea caerulea"]
  },
  {
    name: "Germacranolides",
    type: "Sesquiterpene lactones",
    effects: ["dream enhancement", "mild sedation"],
    foundIn: ["Calea zacatechichi"]
  },
  {
    name: "Benzyl isothiocyanate",
    type: "Isothiocyanate compound",
    effects: ["expectorant", "stimulating", "antibacterial"],
    foundIn: ["Tropaeolum majus"]
  }
];


// ---- File: newEntries_Batch8.ts ----
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


// ---- File: newEntries_Batch19.ts ----
export const newHerbs = [
  {
    name: "Hyoscyamus niger",
    slug: "hyoscyamus-niger",
    commonNames: ["Henbane"],
    region: "Europe, Asia, North Africa",
    effects: ["hallucinogenic", "deliriant", "sedative"],
    activeCompounds: ["Hyoscyamine", "Scopolamine"],
    mechanismOfAction: "Muscarinic receptor antagonism (anticholinergic)",
    traditionalUse: "Used in ancient rituals and as a sedative or poison.",
    tags: ["hallucinogen", "deliriant", "toxic"]
  },
  {
    name: "Cymbopogon citratus",
    slug: "cymbopogon-citratus",
    commonNames: ["Lemongrass"],
    region: "Southeast Asia, Africa, South America",
    effects: ["calming", "digestive", "mood-lifting"],
    activeCompounds: ["Citral", "Myrcene"],
    mechanismOfAction: "GABAergic enhancement and smooth muscle relaxation",
    traditionalUse: "Used in teas and herbal medicine for stress and digestion.",
    tags: ["calming", "folk", "digestive"]
  },
  {
    name: "Justicia adhatoda",
    slug: "justicia-adhatoda",
    commonNames: ["Malabar Nut", "Vasaka"],
    region: "South Asia",
    effects: ["bronchodilator", "expectorant", "mild sedative"],
    activeCompounds: ["Vasicine", "Vasicinone"],
    mechanismOfAction: "Alkaloid action on smooth muscle and respiratory pathways",
    traditionalUse: "Used in Ayurveda to treat cough, asthma, and respiratory issues.",
    tags: ["respiratory", "folk", "bronchodilator"]
  }
];

export const newCompounds = [
  {
    name: "Hyoscyamine",
    type: "Tropane alkaloid",
    effects: ["deliriant", "anticholinergic", "sedative"],
    foundIn: ["Hyoscyamus niger"]
  },
  {
    name: "Citral",
    type: "Terpenoid",
    effects: ["calming", "digestive", "mood-lifting"],
    foundIn: ["Cymbopogon citratus"]
  },
  {
    name: "Myrcene",
    type: "Monoterpene",
    effects: ["sedative", "analgesic"],
    foundIn: ["Cymbopogon citratus"]
  },
  {
    name: "Vasicine",
    type: "Quinazoline alkaloid",
    effects: ["bronchodilator", "expectorant"],
    foundIn: ["Justicia adhatoda"]
  },
  {
    name: "Vasicinone",
    type: "Alkaloid",
    effects: ["respiratory support", "anti-inflammatory"],
    foundIn: ["Justicia adhatoda"]
  }
];


// ---- File: newEntries_Batch18.ts ----
export const newHerbs = [
  {
    name: "Alpinia galanga",
    slug: "alpinia-galanga",
    commonNames: ["Greater Galangal"],
    region: "Southeast Asia",
    effects: ["stimulant", "digestive", "uplifting"],
    activeCompounds: ["Galangin", "Alpinin"],
    mechanismOfAction: "TRP channel modulation, digestive stimulant action",
    traditionalUse: "Used in Thai and Ayurvedic medicine for clarity and energy.",
    tags: ["stimulant", "folk", "digestive"]
  },
  {
    name: "Vitex agnus-castus",
    slug: "vitex-agnus-castus",
    commonNames: ["Chaste Tree", "Monk's Pepper"],
    region: "Mediterranean, Western Asia",
    effects: ["hormonal regulation", "calming", "endocrine modulator"],
    activeCompounds: ["Agnuside", "Vitexin"],
    mechanismOfAction: "Dopaminergic and hormonal activity affecting prolactin",
    traditionalUse: "Used to balance hormones and support menstrual health.",
    tags: ["hormonal", "folk", "endocrine"]
  },
  {
    name: "Ilex vomitoria",
    slug: "ilex-vomitoria",
    commonNames: ["Yaupon Holly"],
    region: "Southeastern North America",
    effects: ["stimulant", "mental clarity", "social"],
    activeCompounds: ["Caffeine", "Theobromine"],
    mechanismOfAction: "Adenosine receptor antagonism and CNS stimulation",
    traditionalUse: "Used in purification rituals and as a social drink by Native Americans.",
    tags: ["stimulant", "traditional-use", "clarity"]
  }
];

export const newCompounds = [
  {
    name: "Galangin",
    type: "Flavonol",
    effects: ["antioxidant", "stimulant", "clarity"],
    foundIn: ["Alpinia galanga"]
  },
  {
    name: "Alpinin",
    type: "Diarylheptanoid",
    effects: ["anti-inflammatory", "digestive"],
    foundIn: ["Alpinia galanga"]
  },
  {
    name: "Agnuside",
    type: "Iridoid glycoside",
    effects: ["hormonal regulation", "calming"],
    foundIn: ["Vitex agnus-castus"]
  },
  {
    name: "Vitexin",
    type: "Flavonoid",
    effects: ["anxiolytic", "neuroprotective"],
    foundIn: ["Vitex agnus-castus"]
  }
];


// ---- File: newEntries_Batch9.ts ----
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


// ---- File: newEntries_Batch17.ts ----
export const newHerbs = [
  {
    name: "Triphora trianthophoros",
    slug: "triphora-trianthophoros",
    commonNames: ["Three Birds Orchid"],
    region: "Eastern North America",
    effects: ["dream enhancement", "symbolic clarity"],
    activeCompounds: [],
    mechanismOfAction: "Unknown; symbolic association in folk dreamwork",
    traditionalUse: "Rarely used medicinally, but noted for dream symbolism and folklore.",
    tags: ["dream", "folk", "symbolic"]
  },
  {
    name: "Chiranthodendron pentadactylon",
    slug: "chiranthodendron-pentadactylon",
    commonNames: ["Devil’s Hand Tree"],
    region: "Mexico, Central America",
    effects: ["cardiotonic", "mystical symbolism"],
    activeCompounds: ["Cyanogenic glycosides"],
    mechanismOfAction: "Traditional extracts were believed to affect circulation and spirit",
    traditionalUse: "Used in ritual and traditional healing for heart-related symbolism.",
    tags: ["ritual", "folk", "cardiotonic"]
  },
  {
    name: "Petiveria alliacea",
    slug: "petiveria-alliacea",
    commonNames: ["Anamu", "Guinea Hen Weed"],
    region: "Caribbean, Central and South America",
    effects: ["immune boost", "mild psychoactive", "analgesic"],
    activeCompounds: ["Diallyl disulfide", "Petiveriin"],
    mechanismOfAction: "Sulfide-based immune modulation and antioxidant activity",
    traditionalUse: "Used in folk and Afro-Caribbean traditions for cleansing and focus.",
    tags: ["folk", "immune", "psychoactive"]
  }
];

export const newCompounds = [
  {
    name: "Cyanogenic glycosides",
    type: "Glycoside",
    effects: ["cardiotonic", "toxic at high doses"],
    foundIn: ["Chiranthodendron pentadactylon"]
  },
  {
    name: "Diallyl disulfide",
    type: "Organosulfur compound",
    effects: ["immune support", "detoxifying"],
    foundIn: ["Petiveria alliacea"]
  },
  {
    name: "Petiveriin",
    type: "Sulfur compound",
    effects: ["mildly psychoactive", "immune modulatory"],
    foundIn: ["Petiveria alliacea"]
  }
];


// ---- File: newEntries_Batch13.ts ----
export const newHerbs = [
  {
    name: "Celastrus paniculatus",
    slug: "celastrus-paniculatus",
    commonNames: ["Intellect Tree", "Malkangani"],
    region: "India, Southeast Asia",
    effects: ["nootropic", "memory-enhancing", "mild stimulant"],
    activeCompounds: ["Celastrine", "Paniculatin"],
    mechanismOfAction: "Neuroprotective, cholinergic modulation",
    traditionalUse: "Used in Ayurveda for cognition, focus, and learning.",
    tags: ["nootropic", "folk", "focus"]
  },
  {
    name: "Elaeagnus angustifolia",
    slug: "elaeagnus-angustifolia",
    commonNames: ["Russian Olive"],
    region: "Central Asia, Middle East, Europe",
    effects: ["anxiolytic", "sedative", "pain-relieving"],
    activeCompounds: ["Elaeagnin", "Flavonoids"],
    mechanismOfAction: "GABAergic effects and antioxidant pathways",
    traditionalUse: "Used traditionally to relieve pain, stress, and inflammation.",
    tags: ["sedative", "analgesic", "folk"]
  },
  {
    name: "Galbulimima belgraveana",
    slug: "galbulimima-belgraveana",
    commonNames: ["Galbulimima", "Agara"],
    region: "Papua New Guinea, Northern Australia",
    effects: ["hallucinogenic", "dreamy", "disorienting"],
    activeCompounds: ["Himbacine", "Galbulimimine"],
    mechanismOfAction: "Muscarinic acetylcholine receptor antagonism",
    traditionalUse: "Used with Homalomena in psychoactive brews by Papuan tribes.",
    tags: ["hallucinogen", "rare", "traditional-use"]
  }
];

export const newCompounds = [
  {
    name: "Celastrine",
    type: "Sesquiterpene",
    effects: ["memory-enhancing", "neuroprotective"],
    foundIn: ["Celastrus paniculatus"]
  },
  {
    name: "Paniculatin",
    type: "Sesquiterpene alkaloid",
    effects: ["nootropic", "focus"],
    foundIn: ["Celastrus paniculatus"]
  },
  {
    name: "Elaeagnin",
    type: "Alkaloid",
    effects: ["sedative", "anxiolytic"],
    foundIn: ["Elaeagnus angustifolia"]
  },
  {
    name: "Himbacine",
    type: "Alkaloid",
    effects: ["hallucinogenic", "anticholinergic"],
    foundIn: ["Galbulimima belgraveana"]
  },
  {
    name: "Galbulimimine",
    type: "Alkaloid",
    effects: ["dreamy", "deliriant"],
    foundIn: ["Galbulimima belgraveana"]
  }
];


// ---- File: newEntries_Batch6.ts ----
export const newHerbs = [
  {
    name: "Nepeta cataria",
    slug: "nepeta-cataria",
    commonNames: ["Catnip"],
    region: "Europe, Central Asia",
    effects: ["euphoria", "calming", "mild stimulant (in cats)"],
    activeCompounds: ["Nepetalactone"],
    mechanismOfAction: "Interacts with opioid receptors and possibly TRP channels",
    traditionalUse: "Used in folk medicine for relaxation, colds, and digestive issues.",
    tags: ["calming", "folk", "digestive"]
  },
  {
    name: "Elsholtzia ciliata",
    slug: "elsholtzia-ciliata",
    commonNames: ["Vietnamese Balm"],
    region: "East and Southeast Asia",
    effects: ["uplifting", "digestive aid", "mental clarity"],
    activeCompounds: ["Elsholtzia ketone"],
    mechanismOfAction: "Stimulates gastrointestinal and olfactory receptors",
    traditionalUse: "Used in Vietnamese herbal teas for alertness and wellness.",
    tags: ["stimulant", "folk", "clarity"]
  },
  {
    name: "Virola theiodora",
    slug: "virola-theiodora",
    commonNames: ["Epena", "Virola"],
    region: "Amazon Basin",
    effects: ["psychedelic", "visionary", "dissociative"],
    activeCompounds: ["5-MeO-DMT", "DMT", "Bufotenine"],
    mechanismOfAction: "5-HT2A agonism (classic psychedelic mechanism)",
    traditionalUse: "Used by Amazonian tribes as a snuff for spiritual rituals.",
    tags: ["psychedelic", "visionary", "traditional-use"]
  }
];

export const newCompounds = [
  {
    name: "Nepetalactone",
    type: "Terpenoid",
    effects: ["euphoric", "calming", "insect repellent"],
    foundIn: ["Nepeta cataria"]
  },
  {
    name: "Elsholtzia ketone",
    type: "Ketone compound",
    effects: ["digestive aid", "uplifting"],
    foundIn: ["Elsholtzia ciliata"]
  },
  {
    name: "5-MeO-DMT",
    type: "Tryptamine alkaloid",
    effects: ["ego dissolution", "psychedelic", "visionary"],
    foundIn: ["Virola theiodora"]
  },
  {
    name: "DMT",
    type: "Tryptamine alkaloid",
    effects: ["psychedelic", "visual", "transcendental"],
    foundIn: ["Virola theiodora"]
  },
  {
    name: "Bufotenine",
    type: "Tryptamine alkaloid",
    effects: ["psychedelic", "introspective", "dissociative"],
    foundIn: ["Virola theiodora"]
  }
];


// ---- File: newEntries_Batch12.ts ----
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


// ---- File: newEntries_Batch7.ts ----
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


// ---- File: newEntries_AllBatches.ts ----
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


// ---- File: newEntries_Batch16.ts ----
export const newHerbs = [
  {
    name: "Tilia europaea",
    slug: "tilia-europaea",
    commonNames: ["Linden", "Lime Blossom"],
    region: "Europe, Western Asia",
    effects: ["calming", "mild sedative", "antispasmodic"],
    activeCompounds: ["Farnesol", "Kaempferol"],
    mechanismOfAction: "Mild GABAergic modulation and flavonoid effects",
    traditionalUse: "Used as a calming tea for sleep, anxiety, and tension.",
    tags: ["sedative", "folk", "relaxant"]
  },
  {
    name: "Rubus idaeus",
    slug: "rubus-idaeus",
    commonNames: ["Red Raspberry Leaf"],
    region: "Europe, North America",
    effects: ["uterine tonic", "calming", "digestive support"],
    activeCompounds: ["Fragarine", "Tiliroside"],
    mechanismOfAction: "Smooth muscle modulation and antioxidant action",
    traditionalUse: "Used in midwifery and herbal traditions to support reproductive health.",
    tags: ["folk", "uterine", "tonic"]
  },
  {
    name: "Desmodium adscendens",
    slug: "desmodium-adscendens",
    commonNames: ["Desmodium", "Amor Seco"],
    region: "West Africa, South America",
    effects: ["bronchodilator", "liver support", "anti-allergic"],
    activeCompounds: ["Desmodin", "Astragalin"],
    mechanismOfAction: "Smooth muscle relaxation and anti-inflammatory flavonoid activity",
    traditionalUse: "Used to treat asthma, allergies, and liver issues in folk medicine.",
    tags: ["bronchodilator", "folk", "detox"]
  }
];

export const newCompounds = [
  {
    name: "Farnesol",
    type: "Sesquiterpenoid",
    effects: ["calming", "aromatic"],
    foundIn: ["Tilia europaea"]
  },
  {
    name: "Kaempferol",
    type: "Flavonoid",
    effects: ["anti-inflammatory", "neuroprotective"],
    foundIn: ["Tilia europaea"]
  },
  {
    name: "Fragarine",
    type: "Alkaloid",
    effects: ["uterine tonic", "muscle relaxant"],
    foundIn: ["Rubus idaeus"]
  },
  {
    name: "Tiliroside",
    type: "Flavonoid glycoside",
    effects: ["digestive support", "mild sedative"],
    foundIn: ["Rubus idaeus"]
  },
  {
    name: "Desmodin",
    type: "Alkaloid",
    effects: ["bronchodilation", "anti-allergic"],
    foundIn: ["Desmodium adscendens"]
  }
];


// ---- File: newEntries_Batch11.ts ----
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


// ---- File: newEntries_Batch15.ts ----
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


// ---- File: newEntries_Batch21.ts ----
export const newHerbs = [
  {
    name: "Boophone disticha",
    slug: "boophone-disticha",
    commonNames: ["Bushman's Poison", "Boophone"],
    region: "Southern Africa",
    effects: ["hallucinogenic", "deliriant", "visionary"],
    activeCompounds: ["Buphanine"],
    mechanismOfAction: "Anticholinergic and CNS stimulant effects",
    traditionalUse: "Used in African traditional medicine for vision quests and trance.",
    tags: ["hallucinogen", "traditional-use", "dangerous"]
  },
  {
    name: "Verbena officinalis",
    slug: "verbena-officinalis",
    commonNames: ["Vervain"],
    region: "Europe, Asia",
    effects: ["calming", "nervine", "digestive"],
    activeCompounds: ["Verbenalin", "Hastatoside"],
    mechanismOfAction: "GABAergic modulation and bitter tonic effect",
    traditionalUse: "Used historically for stress relief and ritual purification.",
    tags: ["calming", "folk", "ritual"]
  },
  {
    name: "Mitragyna hirsuta",
    slug: "mitragyna-hirsuta",
    commonNames: ["Kra Thum Khok"],
    region: "Southeast Asia",
    effects: ["stimulant", "mild opioid-like", "relaxant"],
    activeCompounds: ["Mitraphylline", "Hirsutine"],
    mechanismOfAction: "Mild μ-opioid receptor activity and central nervous system modulation",
    traditionalUse: "Used as a kratom alternative for stimulation and mild euphoria.",
    tags: ["stimulant", "relaxant", "folk"]
  }
];

export const newCompounds = [
  {
    name: "Buphanine",
    type: "Alkaloid",
    effects: ["hallucinogenic", "anticholinergic"],
    foundIn: ["Boophone disticha"]
  },
  {
    name: "Verbenalin",
    type: "Iridoid glycoside",
    effects: ["sedative", "nervine"],
    foundIn: ["Verbena officinalis"]
  },
  {
    name: "Mitraphylline",
    type: "Oxindole alkaloid",
    effects: ["immune-regulating", "mild sedative"],
    foundIn: ["Mitragyna hirsuta"]
  },
  {
    name: "Hirsutine",
    type: "Indole alkaloid",
    effects: ["cardioprotective", "relaxant"],
    foundIn: ["Mitragyna hirsuta"]
  }
];


// ---- File: newEntries_Batch14.ts ----
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


// ---- File: newEntries_Batch20.ts ----
export const newHerbs = [
  {
    name: "Melissa officinalis",
    slug: "melissa-officinalis",
    commonNames: ["Lemon Balm"],
    region: "Europe, Mediterranean",
    effects: ["calming", "nootropic", "digestive"],
    activeCompounds: ["Rosmarinic acid", "Citronellal"],
    mechanismOfAction: "GABA transaminase inhibition and cholinergic activity",
    traditionalUse: "Used for anxiety, cognition, and gut discomfort.",
    tags: ["calming", "folk", "nootropic"]
  },
  {
    name: "Turnera diffusa",
    slug: "turnera-diffusa",
    commonNames: ["Damiana"],
    region: "Mexico, Central America",
    effects: ["aphrodisiac", "mood enhancing", "relaxing"],
    activeCompounds: ["Damianin", "Apigenin"],
    mechanismOfAction: "Modulation of GABA receptors and serotonergic effects",
    traditionalUse: "Used for libido, emotional wellbeing, and mild sedation.",
    tags: ["aphrodisiac", "folk", "relaxant"]
  },
  {
    name: "Sida cordifolia",
    slug: "sida-cordifolia",
    commonNames: ["Bala"],
    region: "India, Southeast Asia",
    effects: ["stimulant", "bronchodilator", "energizing"],
    activeCompounds: ["Ephedrine", "Vasicinol"],
    mechanismOfAction: "Adrenergic agonist, bronchodilation and CNS stimulation",
    traditionalUse: "Used in Ayurveda to enhance vitality and treat asthma.",
    tags: ["stimulant", "folk", "bronchodilator"]
  }
];

export const newCompounds = [
  {
    name: "Rosmarinic acid",
    type: "Phenolic acid",
    effects: ["anxiolytic", "nootropic"],
    foundIn: ["Melissa officinalis"]
  },
  {
    name: "Citronellal",
    type: "Monoterpenoid",
    effects: ["sedative", "digestive"],
    foundIn: ["Melissa officinalis"]
  },
  {
    name: "Damianin",
    type: "Terpenoid",
    effects: ["aphrodisiac", "euphoric"],
    foundIn: ["Turnera diffusa"]
  },
  {
    name: "Ephedrine",
    type: "Alkaloid",
    effects: ["stimulant", "bronchodilator"],
    foundIn: ["Sida cordifolia"]
  },
  {
    name: "Vasicinol",
    type: "Alkaloid",
    effects: ["respiratory support", "stimulating"],
    foundIn: ["Sida cordifolia"]
  }
];


// ---- File: newHerbs_Batch3.ts ----
export const newHerbs = [
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
  }
];


// ---- File: newEntries_Batch10.ts ----
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


// ---- File: newEntries_Batch5.ts ----
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


// ---- File: newCompounds_Batch3.ts ----
export const newCompounds = [
  {
    name: "Aporphine",
    type: "Alkaloid",
    effects: ["dopaminergic", "mild euphoria"],
    foundIn: ["Nymphaea caerulea"]
  },
  {
    name: "Nuciferine",
    type: "Aporphine alkaloid",
    effects: ["sedative", "antipsychotic", "dopamine antagonist"],
    foundIn: ["Nymphaea caerulea"]
  },
  {
    name: "Germacranolides",
    type: "Sesquiterpene lactones",
    effects: ["dream enhancement", "mild sedation"],
    foundIn: ["Calea zacatechichi"]
  },
  {
    name: "Benzyl isothiocyanate",
    type: "Isothiocyanate compound",
    effects: ["expectorant", "stimulating", "antibacterial"],
    foundIn: ["Tropaeolum majus"]
  }
];


// ---- File: newEntries_Batch8.ts ----
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


// ---- File: newEntries_Batch19.ts ----
export const newHerbs = [
  {
    name: "Hyoscyamus niger",
    slug: "hyoscyamus-niger",
    commonNames: ["Henbane"],
    region: "Europe, Asia, North Africa",
    effects: ["hallucinogenic", "deliriant", "sedative"],
    activeCompounds: ["Hyoscyamine", "Scopolamine"],
    mechanismOfAction: "Muscarinic receptor antagonism (anticholinergic)",
    traditionalUse: "Used in ancient rituals and as a sedative or poison.",
    tags: ["hallucinogen", "deliriant", "toxic"]
  },
  {
    name: "Cymbopogon citratus",
    slug: "cymbopogon-citratus",
    commonNames: ["Lemongrass"],
    region: "Southeast Asia, Africa, South America",
    effects: ["calming", "digestive", "mood-lifting"],
    activeCompounds: ["Citral", "Myrcene"],
    mechanismOfAction: "GABAergic enhancement and smooth muscle relaxation",
    traditionalUse: "Used in teas and herbal medicine for stress and digestion.",
    tags: ["calming", "folk", "digestive"]
  },
  {
    name: "Justicia adhatoda",
    slug: "justicia-adhatoda",
    commonNames: ["Malabar Nut", "Vasaka"],
    region: "South Asia",
    effects: ["bronchodilator", "expectorant", "mild sedative"],
    activeCompounds: ["Vasicine", "Vasicinone"],
    mechanismOfAction: "Alkaloid action on smooth muscle and respiratory pathways",
    traditionalUse: "Used in Ayurveda to treat cough, asthma, and respiratory issues.",
    tags: ["respiratory", "folk", "bronchodilator"]
  }
];

export const newCompounds = [
  {
    name: "Hyoscyamine",
    type: "Tropane alkaloid",
    effects: ["deliriant", "anticholinergic", "sedative"],
    foundIn: ["Hyoscyamus niger"]
  },
  {
    name: "Citral",
    type: "Terpenoid",
    effects: ["calming", "digestive", "mood-lifting"],
    foundIn: ["Cymbopogon citratus"]
  },
  {
    name: "Myrcene",
    type: "Monoterpene",
    effects: ["sedative", "analgesic"],
    foundIn: ["Cymbopogon citratus"]
  },
  {
    name: "Vasicine",
    type: "Quinazoline alkaloid",
    effects: ["bronchodilator", "expectorant"],
    foundIn: ["Justicia adhatoda"]
  },
  {
    name: "Vasicinone",
    type: "Alkaloid",
    effects: ["respiratory support", "anti-inflammatory"],
    foundIn: ["Justicia adhatoda"]
  }
];


// ---- File: newEntries_Batch18.ts ----
export const newHerbs = [
  {
    name: "Alpinia galanga",
    slug: "alpinia-galanga",
    commonNames: ["Greater Galangal"],
    region: "Southeast Asia",
    effects: ["stimulant", "digestive", "uplifting"],
    activeCompounds: ["Galangin", "Alpinin"],
    mechanismOfAction: "TRP channel modulation, digestive stimulant action",
    traditionalUse: "Used in Thai and Ayurvedic medicine for clarity and energy.",
    tags: ["stimulant", "folk", "digestive"]
  },
  {
    name: "Vitex agnus-castus",
    slug: "vitex-agnus-castus",
    commonNames: ["Chaste Tree", "Monk's Pepper"],
    region: "Mediterranean, Western Asia",
    effects: ["hormonal regulation", "calming", "endocrine modulator"],
    activeCompounds: ["Agnuside", "Vitexin"],
    mechanismOfAction: "Dopaminergic and hormonal activity affecting prolactin",
    traditionalUse: "Used to balance hormones and support menstrual health.",
    tags: ["hormonal", "folk", "endocrine"]
  },
  {
    name: "Ilex vomitoria",
    slug: "ilex-vomitoria",
    commonNames: ["Yaupon Holly"],
    region: "Southeastern North America",
    effects: ["stimulant", "mental clarity", "social"],
    activeCompounds: ["Caffeine", "Theobromine"],
    mechanismOfAction: "Adenosine receptor antagonism and CNS stimulation",
    traditionalUse: "Used in purification rituals and as a social drink by Native Americans.",
    tags: ["stimulant", "traditional-use", "clarity"]
  }
];

export const newCompounds = [
  {
    name: "Galangin",
    type: "Flavonol",
    effects: ["antioxidant", "stimulant", "clarity"],
    foundIn: ["Alpinia galanga"]
  },
  {
    name: "Alpinin",
    type: "Diarylheptanoid",
    effects: ["anti-inflammatory", "digestive"],
    foundIn: ["Alpinia galanga"]
  },
  {
    name: "Agnuside",
    type: "Iridoid glycoside",
    effects: ["hormonal regulation", "calming"],
    foundIn: ["Vitex agnus-castus"]
  },
  {
    name: "Vitexin",
    type: "Flavonoid",
    effects: ["anxiolytic", "neuroprotective"],
    foundIn: ["Vitex agnus-castus"]
  }
];


// ---- File: newEntries_Batch9.ts ----
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


// ---- File: newEntries_Batch17.ts ----
export const newHerbs = [
  {
    name: "Triphora trianthophoros",
    slug: "triphora-trianthophoros",
    commonNames: ["Three Birds Orchid"],
    region: "Eastern North America",
    effects: ["dream enhancement", "symbolic clarity"],
    activeCompounds: [],
    mechanismOfAction: "Unknown; symbolic association in folk dreamwork",
    traditionalUse: "Rarely used medicinally, but noted for dream symbolism and folklore.",
    tags: ["dream", "folk", "symbolic"]
  },
  {
    name: "Chiranthodendron pentadactylon",
    slug: "chiranthodendron-pentadactylon",
    commonNames: ["Devil’s Hand Tree"],
    region: "Mexico, Central America",
    effects: ["cardiotonic", "mystical symbolism"],
    activeCompounds: ["Cyanogenic glycosides"],
    mechanismOfAction: "Traditional extracts were believed to affect circulation and spirit",
    traditionalUse: "Used in ritual and traditional healing for heart-related symbolism.",
    tags: ["ritual", "folk", "cardiotonic"]
  },
  {
    name: "Petiveria alliacea",
    slug: "petiveria-alliacea",
    commonNames: ["Anamu", "Guinea Hen Weed"],
    region: "Caribbean, Central and South America",
    effects: ["immune boost", "mild psychoactive", "analgesic"],
    activeCompounds: ["Diallyl disulfide", "Petiveriin"],
    mechanismOfAction: "Sulfide-based immune modulation and antioxidant activity",
    traditionalUse: "Used in folk and Afro-Caribbean traditions for cleansing and focus.",
    tags: ["folk", "immune", "psychoactive"]
  }
];

export const newCompounds = [
  {
    name: "Cyanogenic glycosides",
    type: "Glycoside",
    effects: ["cardiotonic", "toxic at high doses"],
    foundIn: ["Chiranthodendron pentadactylon"]
  },
  {
    name: "Diallyl disulfide",
    type: "Organosulfur compound",
    effects: ["immune support", "detoxifying"],
    foundIn: ["Petiveria alliacea"]
  },
  {
    name: "Petiveriin",
    type: "Sulfur compound",
    effects: ["mildly psychoactive", "immune modulatory"],
    foundIn: ["Petiveria alliacea"]
  }
];


// ---- File: newEntries_Batch13.ts ----
export const newHerbs = [
  {
    name: "Celastrus paniculatus",
    slug: "celastrus-paniculatus",
    commonNames: ["Intellect Tree", "Malkangani"],
    region: "India, Southeast Asia",
    effects: ["nootropic", "memory-enhancing", "mild stimulant"],
    activeCompounds: ["Celastrine", "Paniculatin"],
    mechanismOfAction: "Neuroprotective, cholinergic modulation",
    traditionalUse: "Used in Ayurveda for cognition, focus, and learning.",
    tags: ["nootropic", "folk", "focus"]
  },
  {
    name: "Elaeagnus angustifolia",
    slug: "elaeagnus-angustifolia",
    commonNames: ["Russian Olive"],
    region: "Central Asia, Middle East, Europe",
    effects: ["anxiolytic", "sedative", "pain-relieving"],
    activeCompounds: ["Elaeagnin", "Flavonoids"],
    mechanismOfAction: "GABAergic effects and antioxidant pathways",
    traditionalUse: "Used traditionally to relieve pain, stress, and inflammation.",
    tags: ["sedative", "analgesic", "folk"]
  },
  {
    name: "Galbulimima belgraveana",
    slug: "galbulimima-belgraveana",
    commonNames: ["Galbulimima", "Agara"],
    region: "Papua New Guinea, Northern Australia",
    effects: ["hallucinogenic", "dreamy", "disorienting"],
    activeCompounds: ["Himbacine", "Galbulimimine"],
    mechanismOfAction: "Muscarinic acetylcholine receptor antagonism",
    traditionalUse: "Used with Homalomena in psychoactive brews by Papuan tribes.",
    tags: ["hallucinogen", "rare", "traditional-use"]
  }
];

export const newCompounds = [
  {
    name: "Celastrine",
    type: "Sesquiterpene",
    effects: ["memory-enhancing", "neuroprotective"],
    foundIn: ["Celastrus paniculatus"]
  },
  {
    name: "Paniculatin",
    type: "Sesquiterpene alkaloid",
    effects: ["nootropic", "focus"],
    foundIn: ["Celastrus paniculatus"]
  },
  {
    name: "Elaeagnin",
    type: "Alkaloid",
    effects: ["sedative", "anxiolytic"],
    foundIn: ["Elaeagnus angustifolia"]
  },
  {
    name: "Himbacine",
    type: "Alkaloid",
    effects: ["hallucinogenic", "anticholinergic"],
    foundIn: ["Galbulimima belgraveana"]
  },
  {
    name: "Galbulimimine",
    type: "Alkaloid",
    effects: ["dreamy", "deliriant"],
    foundIn: ["Galbulimima belgraveana"]
  }
];


// ---- File: newEntries_Batch6.ts ----
export const newHerbs = [
  {
    name: "Nepeta cataria",
    slug: "nepeta-cataria",
    commonNames: ["Catnip"],
    region: "Europe, Central Asia",
    effects: ["euphoria", "calming", "mild stimulant (in cats)"],
    activeCompounds: ["Nepetalactone"],
    mechanismOfAction: "Interacts with opioid receptors and possibly TRP channels",
    traditionalUse: "Used in folk medicine for relaxation, colds, and digestive issues.",
    tags: ["calming", "folk", "digestive"]
  },
  {
    name: "Elsholtzia ciliata",
    slug: "elsholtzia-ciliata",
    commonNames: ["Vietnamese Balm"],
    region: "East and Southeast Asia",
    effects: ["uplifting", "digestive aid", "mental clarity"],
    activeCompounds: ["Elsholtzia ketone"],
    mechanismOfAction: "Stimulates gastrointestinal and olfactory receptors",
    traditionalUse: "Used in Vietnamese herbal teas for alertness and wellness.",
    tags: ["stimulant", "folk", "clarity"]
  },
  {
    name: "Virola theiodora",
    slug: "virola-theiodora",
    commonNames: ["Epena", "Virola"],
    region: "Amazon Basin",
    effects: ["psychedelic", "visionary", "dissociative"],
    activeCompounds: ["5-MeO-DMT", "DMT", "Bufotenine"],
    mechanismOfAction: "5-HT2A agonism (classic psychedelic mechanism)",
    traditionalUse: "Used by Amazonian tribes as a snuff for spiritual rituals.",
    tags: ["psychedelic", "visionary", "traditional-use"]
  }
];

export const newCompounds = [
  {
    name: "Nepetalactone",
    type: "Terpenoid",
    effects: ["euphoric", "calming", "insect repellent"],
    foundIn: ["Nepeta cataria"]
  },
  {
    name: "Elsholtzia ketone",
    type: "Ketone compound",
    effects: ["digestive aid", "uplifting"],
    foundIn: ["Elsholtzia ciliata"]
  },
  {
    name: "5-MeO-DMT",
    type: "Tryptamine alkaloid",
    effects: ["ego dissolution", "psychedelic", "visionary"],
    foundIn: ["Virola theiodora"]
  },
  {
    name: "DMT",
    type: "Tryptamine alkaloid",
    effects: ["psychedelic", "visual", "transcendental"],
    foundIn: ["Virola theiodora"]
  },
  {
    name: "Bufotenine",
    type: "Tryptamine alkaloid",
    effects: ["psychedelic", "introspective", "dissociative"],
    foundIn: ["Virola theiodora"]
  }
];


// ---- File: newEntries_Batch12.ts ----
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


// ---- File: newEntries_Batch7.ts ----
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


// ---- File: newEntries_AllBatches.ts ----
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


// ---- File: newEntries_Batch16.ts ----
export const newHerbs = [
  {
    name: "Tilia europaea",
    slug: "tilia-europaea",
    commonNames: ["Linden", "Lime Blossom"],
    region: "Europe, Western Asia",
    effects: ["calming", "mild sedative", "antispasmodic"],
    activeCompounds: ["Farnesol", "Kaempferol"],
    mechanismOfAction: "Mild GABAergic modulation and flavonoid effects",
    traditionalUse: "Used as a calming tea for sleep, anxiety, and tension.",
    tags: ["sedative", "folk", "relaxant"]
  },
  {
    name: "Rubus idaeus",
    slug: "rubus-idaeus",
    commonNames: ["Red Raspberry Leaf"],
    region: "Europe, North America",
    effects: ["uterine tonic", "calming", "digestive support"],
    activeCompounds: ["Fragarine", "Tiliroside"],
    mechanismOfAction: "Smooth muscle modulation and antioxidant action",
    traditionalUse: "Used in midwifery and herbal traditions to support reproductive health.",
    tags: ["folk", "uterine", "tonic"]
  },
  {
    name: "Desmodium adscendens",
    slug: "desmodium-adscendens",
    commonNames: ["Desmodium", "Amor Seco"],
    region: "West Africa, South America",
    effects: ["bronchodilator", "liver support", "anti-allergic"],
    activeCompounds: ["Desmodin", "Astragalin"],
    mechanismOfAction: "Smooth muscle relaxation and anti-inflammatory flavonoid activity",
    traditionalUse: "Used to treat asthma, allergies, and liver issues in folk medicine.",
    tags: ["bronchodilator", "folk", "detox"]
  }
];

export const newCompounds = [
  {
    name: "Farnesol",
    type: "Sesquiterpenoid",
    effects: ["calming", "aromatic"],
    foundIn: ["Tilia europaea"]
  },
  {
    name: "Kaempferol",
    type: "Flavonoid",
    effects: ["anti-inflammatory", "neuroprotective"],
    foundIn: ["Tilia europaea"]
  },
  {
    name: "Fragarine",
    type: "Alkaloid",
    effects: ["uterine tonic", "muscle relaxant"],
    foundIn: ["Rubus idaeus"]
  },
  {
    name: "Tiliroside",
    type: "Flavonoid glycoside",
    effects: ["digestive support", "mild sedative"],
    foundIn: ["Rubus idaeus"]
  },
  {
    name: "Desmodin",
    type: "Alkaloid",
    effects: ["bronchodilation", "anti-allergic"],
    foundIn: ["Desmodium adscendens"]
  }
];


// ---- File: newEntries_Batch11.ts ----
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


// ---- File: newEntries_Batch15.ts ----
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


// ---- File: newEntries_Batch21.ts ----
export const newHerbs = [
  {
    name: "Boophone disticha",
    slug: "boophone-disticha",
    commonNames: ["Bushman's Poison", "Boophone"],
    region: "Southern Africa",
    effects: ["hallucinogenic", "deliriant", "visionary"],
    activeCompounds: ["Buphanine"],
    mechanismOfAction: "Anticholinergic and CNS stimulant effects",
    traditionalUse: "Used in African traditional medicine for vision quests and trance.",
    tags: ["hallucinogen", "traditional-use", "dangerous"]
  },
  {
    name: "Verbena officinalis",
    slug: "verbena-officinalis",
    commonNames: ["Vervain"],
    region: "Europe, Asia",
    effects: ["calming", "nervine", "digestive"],
    activeCompounds: ["Verbenalin", "Hastatoside"],
    mechanismOfAction: "GABAergic modulation and bitter tonic effect",
    traditionalUse: "Used historically for stress relief and ritual purification.",
    tags: ["calming", "folk", "ritual"]
  },
  {
    name: "Mitragyna hirsuta",
    slug: "mitragyna-hirsuta",
    commonNames: ["Kra Thum Khok"],
    region: "Southeast Asia",
    effects: ["stimulant", "mild opioid-like", "relaxant"],
    activeCompounds: ["Mitraphylline", "Hirsutine"],
    mechanismOfAction: "Mild μ-opioid receptor activity and central nervous system modulation",
    traditionalUse: "Used as a kratom alternative for stimulation and mild euphoria.",
    tags: ["stimulant", "relaxant", "folk"]
  }
];

export const newCompounds = [
  {
    name: "Buphanine",
    type: "Alkaloid",
    effects: ["hallucinogenic", "anticholinergic"],
    foundIn: ["Boophone disticha"]
  },
  {
    name: "Verbenalin",
    type: "Iridoid glycoside",
    effects: ["sedative", "nervine"],
    foundIn: ["Verbena officinalis"]
  },
  {
    name: "Mitraphylline",
    type: "Oxindole alkaloid",
    effects: ["immune-regulating", "mild sedative"],
    foundIn: ["Mitragyna hirsuta"]
  },
  {
    name: "Hirsutine",
    type: "Indole alkaloid",
    effects: ["cardioprotective", "relaxant"],
    foundIn: ["Mitragyna hirsuta"]
  }
];


// ---- File: newEntries_Batch14.ts ----
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


// ---- File: newEntries_Batch20.ts ----
export const newHerbs = [
  {
    name: "Melissa officinalis",
    slug: "melissa-officinalis",
    commonNames: ["Lemon Balm"],
    region: "Europe, Mediterranean",
    effects: ["calming", "nootropic", "digestive"],
    activeCompounds: ["Rosmarinic acid", "Citronellal"],
    mechanismOfAction: "GABA transaminase inhibition and cholinergic activity",
    traditionalUse: "Used for anxiety, cognition, and gut discomfort.",
    tags: ["calming", "folk", "nootropic"]
  },
  {
    name: "Turnera diffusa",
    slug: "turnera-diffusa",
    commonNames: ["Damiana"],
    region: "Mexico, Central America",
    effects: ["aphrodisiac", "mood enhancing", "relaxing"],
    activeCompounds: ["Damianin", "Apigenin"],
    mechanismOfAction: "Modulation of GABA receptors and serotonergic effects",
    traditionalUse: "Used for libido, emotional wellbeing, and mild sedation.",
    tags: ["aphrodisiac", "folk", "relaxant"]
  },
  {
    name: "Sida cordifolia",
    slug: "sida-cordifolia",
    commonNames: ["Bala"],
    region: "India, Southeast Asia",
    effects: ["stimulant", "bronchodilator", "energizing"],
    activeCompounds: ["Ephedrine", "Vasicinol"],
    mechanismOfAction: "Adrenergic agonist, bronchodilation and CNS stimulation",
    traditionalUse: "Used in Ayurveda to enhance vitality and treat asthma.",
    tags: ["stimulant", "folk", "bronchodilator"]
  }
];

export const newCompounds = [
  {
    name: "Rosmarinic acid",
    type: "Phenolic acid",
    effects: ["anxiolytic", "nootropic"],
    foundIn: ["Melissa officinalis"]
  },
  {
    name: "Citronellal",
    type: "Monoterpenoid",
    effects: ["sedative", "digestive"],
    foundIn: ["Melissa officinalis"]
  },
  {
    name: "Damianin",
    type: "Terpenoid",
    effects: ["aphrodisiac", "euphoric"],
    foundIn: ["Turnera diffusa"]
  },
  {
    name: "Ephedrine",
    type: "Alkaloid",
    effects: ["stimulant", "bronchodilator"],
    foundIn: ["Sida cordifolia"]
  },
  {
    name: "Vasicinol",
    type: "Alkaloid",
    effects: ["respiratory support", "stimulating"],
    foundIn: ["Sida cordifolia"]
  }
];


// ---- File: newHerbs_Batch3.ts ----
export const newHerbs = [
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
  }
];


// ---- File: newEntries_Batch10.ts ----
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


// ---- File: newEntries_Batch5.ts ----
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


// ---- File: herbs-batch26.ts ----
// Batch 26: Psychoactive Herbs

import { Herb } from '../types/herb';

export const herbsBatch26: Herb[] = [{'name': 'Pimenta dioica', 'slug': 'pimenta-dioica', 'description': 'Also known as Allspice, this Caribbean plant has mild uplifting and warming effects, sometimes used in ritual incense.', 'region': 'Caribbean, Central America', 'effects': ['stimulant', 'aromatic euphoria', 'warming'], 'compounds': ['Eugenol', 'Quercetin'], 'mechanismOfAction': 'GABAergic + serotonergic', 'tags': ['aromatic', 'ritual', 'mild stimulant']}, {'name': 'Lactuca virosa', 'slug': 'lactuca-virosa', 'description': "Wild Lettuce, a traditional sedative and pain reliever in folk medicine, sometimes called 'lettuce opium'.", 'region': 'Europe', 'effects': ['sedative', 'analgesic', 'dreamy'], 'compounds': ['Lactucopicrin', 'Lactucin'], 'mechanismOfAction': 'Opioid receptor modulation', 'tags': ['sedative', 'folk medicine', 'dream aid']}, {'name': 'Achillea millefolium', 'slug': 'achillea-millefolium', 'description': 'Yarrow, used for divination and as a calming tea. Some varieties contain mild psychoactive compounds.', 'region': 'Europe, North America', 'effects': ['mild euphoria', 'relaxation', 'ritual clarity'], 'compounds': ['Thujone (trace)', 'Flavonoids'], 'mechanismOfAction': 'GABAergic + serotonergic', 'tags': ['folk remedy', 'ritual', 'divination']}, {'name': 'Peumus boldus', 'slug': 'peumus-boldus', 'description': 'Boldo is a South American medicinal herb with liver-supportive and mild hypnotic properties.', 'region': 'Chile', 'effects': ['calming', 'digestive aid', 'dreamy'], 'compounds': ['Boldine', 'Ascaridole'], 'mechanismOfAction': 'Cholinergic + serotonergic', 'tags': ['digestive', 'sleep aid', 'folk medicine']}, {'name': 'Vitex agnus-castus', 'slug': 'vitex-agnus-castus', 'description': 'Chasteberry is traditionally used for hormonal balancing, mood stabilization, and dream clarity.', 'region': 'Mediterranean', 'effects': ['mood stabilization', 'lucidity', 'balance'], 'compounds': ['Agnuside', 'Flavonoids'], 'mechanismOfAction': 'Dopaminergic + hormonal', 'tags': ['hormonal', 'mood', 'dream']}, {'name': 'Myristica fragrans', 'slug': 'myristica-fragrans', 'description': 'Nutmeg, psychoactive in high doses, has deliriant and sedative properties. Historically used in mystic rituals.', 'region': 'Indonesia', 'effects': ['dreaminess', 'euphoria', 'disorientation'], 'compounds': ['Myristicin', 'Elemicin'], 'mechanismOfAction': 'Monoamine oxidase inhibition + anticholinergic', 'tags': ['deliriant', 'visionary', 'ritual']}, {'name': 'Amorpha fruticosa', 'slug': 'amorpha-fruticosa', 'description': 'False Indigo Bush, native to North America, was historically smoked for relaxation and vision-induction.', 'region': 'North America', 'effects': ['relaxation', 'mental softening', 'trance'], 'compounds': ['Amorphigenin'], 'mechanismOfAction': 'Likely GABAergic', 'tags': ['folk', 'smokable', 'visionary']}, {'name': 'Eleutherococcus senticosus', 'slug': 'eleutherococcus-senticosus', 'description': 'Siberian Ginseng is an adaptogen used to enhance endurance, mental resilience, and reduce fatigue.', 'region': 'Siberia, China', 'effects': ['clarity', 'resilience', 'mental energy'], 'compounds': ['Eleutherosides'], 'mechanismOfAction': 'Adaptogenic + neuroprotective', 'tags': ['adaptogen', 'tonic', 'nootropic']}, {'name': 'Verbena officinalis', 'slug': 'verbena-officinalis', 'description': 'Vervain is a calming and spiritually symbolic herb used in ritual baths and teas.', 'region': 'Europe, North Africa', 'effects': ['mild sedation', 'relaxation', 'spiritual clarity'], 'compounds': ['Verbenalin', 'Iridoids'], 'mechanismOfAction': 'GABAergic + serotonergic', 'tags': ['ritual', 'relaxant', 'dream']}, {'name': 'Melissa officinalis', 'slug': 'melissa-officinalis', 'description': 'Lemon Balm is a gentle nervine herb that promotes calmness and sleep with subtle mood elevation.', 'region': 'Europe, Middle East', 'effects': ['calming', 'mood lifting', 'sleep aid'], 'compounds': ['Citral', 'Rosmarinic acid'], 'mechanismOfAction': 'GABA-T inhibition + serotonergic', 'tags': ['calming', 'folk remedy', 'tea']}];



// ---- File: blurbs.ts ----
export const herbBlurbs: Record<string, string> = {
  "Acacia maidenii": "Acacia maidenii is known for its Entheogenic, Dream-like, Expansive effects.",
  "Acorus calamus": "Acorus calamus is known for its Sedative, Dream-enhancing, Stimulant (low dose) effects.",
  "Acorus calamus": "Acorus calamus is known for its Sedative, Dream-enhancing, Stimulant (low dose) effects.",
  "Acorus gramineus": "Acorus gramineus is known for its Mildly calming, Cognitive-enhancing, Dream potentiator effects.",
  "Adhatoda vasica": "Adhatoda vasica is known for its Bronchodilator, Mild stimulant, Expectorant effects.",
  "Aegle marmelos": "Aegle marmelos is known for its Digestive tonic, Anti-inflammatory, Cooling effects.",
  "African Dream Root": "African Dream Root is known for its Vivid dreams, Lucid dreaming, Mild sedative effects.",
  "Albizia julibrissin": "Albizia julibrissin is known for its Mood-lifting, Anti-anxiety, Sedative effects.",
  "Alchornea castaneifolia": "Alchornea castaneifolia is known for its Anti-inflammatory, Analgesic, Ayahuasca synergist effects.",
  "Alpinia galanga": "Alpinia galanga is known for its Stimulant, Cognitive-enhancing, Aphrodisiac effects.",
  "Amanita muscaria": "Amanita muscaria is known for its Sedation, Euphoria, Confusion effects.",
  "Anadenanthera colubrina": "Anadenanthera colubrina is known for its Visual hallucinations, Disorientation, Euphoria effects.",
  "Anadenanthera peregrina": "Anadenanthera peregrina is known for its Intense visuals, Out-of-body experience, Altered time perception effects.",
  "Argyreia nervosa": "Argyreia nervosa is known for its Euphoria, Time distortion, Closed-eye visuals effects.",
  "Argyreia speciosa": "Argyreia speciosa is known for its Aphrodisiac, Mild sedative, Nootropic (traditional) effects.",
  "Artemisia absinthium": "Artemisia absinthium is known for its Euphoria, Mild hallucinations, Stimulation effects.",
  "Arundo donax": "Arundo donax is known for its Unverified hallucinations, Mild sedation, Traditionally visionary (claimed) effects.",
  "Asarum canadense": "Asarum canadense is known for its Warming, Digestive stimulant, Mild sedation effects.",
  "Asclepias syriaca": "Asclepias syriaca is known for its Mild sedation, Cardiac influence, Anti-inflammatory effects.",
  "Avena sativa": "Avena sativa is known for its Mild euphoria, Anxiolytic, Nourishing tonic effects.",
  "Banisteriopsis caapi": "Banisteriopsis caapi is known for its MAOI potentiation, Euphoria, Emotional release effects.",
  "Brunfelsia grandiflora": "Brunfelsia grandiflora is known for its Altered perception, Hallucinations, Sedation effects.",
  "Brugmansia suaveolens": "Brugmansia suaveolens is known for its True hallucinations, Amnesia, Delirium effects.",
  "Caesalpinia sepiaria": "Caesalpinia sepiaria is known for its Stimulation, Increased stamina, Traditional energizing effects.",
  "Calliandra angustifolia": "Calliandra angustifolia is known for its Heart-opening, Dreamlike calm, Energetic cleansing effects.",
  "Camellia sinensis": "Camellia sinensis is known for its Alertness, Calm focus, Mood elevation effects.",
  "Camellia japonica": "Camellia japonica is known for its Skin soothing, Antioxidant, Mild anti-inflammatory effects.",
  "Cananga odorata": "Cananga odorata is known for its Euphoria, Relaxation, Aphrodisiac effects.",
  "Cannabis sativa": "Cannabis sativa is known for its Euphoria, Relaxation, Altered perception effects.",
  "Capsicum annuum": "Capsicum annuum is known for its Stimulation, Endorphin release, Heat sensation effects.",
  "Celastrus paniculatus": "Celastrus paniculatus is known for its Memory enhancement, Mental clarity, Mild stimulation effects.",
  "Calea ternifolia": "Calea ternifolia is known for its Lucid dreaming, Vivid dreams, Mild sedation effects.",
  "Campsiandra angustifolia": "Campsiandra angustifolia is known for its Anti-inflammatory, Aphrodisiac, Tonic effects.",
  "Carica papaya": "Carica papaya is known for its Digestive support, Antiparasitic, Anti-inflammatory effects.",
  "Catha edulis": "Catha edulis is known for its Euphoria, Increased alertness, Sociability effects.",
  "Catuaba": "Catuaba is known for its Stimulation, Enhanced libido, Mild euphoria effects.",
  "Centella asiatica": "Centella asiatica is known for its Memory enhancement, Wound healing, Stress reduction effects.",
  "Cestrum nocturnum": "Cestrum nocturnum is known for its Sedation, Headache (aroma), Potential hallucinations (in folklore) effects.",
  "Cichorium intybus": "Cichorium intybus is known for its Liver support, Mild stimulant (roasted), Prebiotic effects.",
  "Cissampelos pareira": "Cissampelos pareira is known for its Uterine tonic, Muscle relaxant, Antimalarial effects.",
  "Claviceps purpurea": "Claviceps purpurea is known for its Vasoconstriction, Hallucinations, Convulsions effects.",
  "Clitoria ternatea": "Clitoria ternatea is known for its Cognitive enhancement, Anxiolytic, Neuroprotective effects.",
  "Cola acuminata": "Cola acuminata is known for its Stimulation, Increased alertness, Mood elevation effects.",
  "Combretum quadrangulare": "Combretum quadrangulare is known for its Mild stimulation, Mental clarity, Sociability effects.",
  "Shankhpushpi": "Shankhpushpi is known for its Memory enhancement, Stress reduction, Mental clarity effects.",
  "Corydalis yanhusuo": "Corydalis yanhusuo is known for its Pain relief, Sedation, Muscle relaxation effects.",
  "Crataegus monogyna": "Crataegus monogyna is known for its Heart tonic, Circulation support, Anxiolytic effects.",
  "Crocus sativus": "Crocus sativus is known for its Euphoria, Antidepressant, Cognitive support effects.",
  "Turmeric": "Turmeric is known for its Anti-inflammatory, Antioxidant, Liver tonic effects.",
  "Cytisus scoparius": "Cytisus scoparius is known for its Cardiac stimulation, Diuretic, Mood elevation effects.",
  "Datura inoxia": "Datura inoxia is known for its Intense delirium, Anticholinergic trance, Hallucinations effects.",
  "Desmodium gangeticum": "Desmodium gangeticum is known for its Nervine support, Anti-inflammatory, Rejuvenation effects.",
  "Derris elliptica": "Derris elliptica is known for its Paralysis (insects/fish), Mild euphoria (folklore), Toxicity effects.",
  "Dioscorea villosa": "Dioscorea villosa is known for its Hormone balance, Menstrual relief, Anti-inflammatory effects.",
  "Duboisia hopwoodii": "Duboisia hopwoodii is known for its Stimulation, Alertness, Appetite suppression effects.",
  "Echinopsis pachanoi": "Echinopsis pachanoi is known for its Euphoria, Hallucinations, Empathy effects.",
  "Siberian Ginseng": "Siberian Ginseng is known for its Fatigue resistance, Immune modulation, Mental stamina effects.",
  "Ephedra sinica": "Ephedra sinica is known for its Stimulation, Appetite suppression, Bronchodilation effects.",
  "California Poppy": "California Poppy is known for its Mild sedation, Anxiety relief, Sleep enhancement effects.",
  "Erythrina mulungu": "Erythrina mulungu is known for its Anxiety relief, Sedation, Muscle relaxation effects.",
  "Espeletia grandiflora": "Espeletia grandiflora is known for its Cough relief, Lung support, Anti-inflammatory effects.",
  "Tongkat Ali": "Tongkat Ali is known for its Testosterone boost, Energy, Stress resilience effects.",
  "Galphimia glauca": "Galphimia glauca is known for its Anxiety relief, Tranquility, Sleep aid effects.",
  "Gastrodia elata": "Gastrodia elata is known for its Calms the liver, Relieves tremors, Supports cognition effects.",
  "Gelsemium sempervirens": "Gelsemium sempervirens is known for its Muscle relaxation, Nervous system inhibition, Pain relief effects.",
  "Genipa americana": "Genipa americana is known for its Skin staining, Mild antibacterial, Cooling sensation effects.",
  "Ginkgo biloba": "Ginkgo biloba is known for its Cognitive enhancement, Circulation support, Antioxidant effects.",
  "Gliricidia sepium": "Gliricidia sepium is known for its Topical antiparasitic, Wound healing, Insect repellent effects.",
  "Gymnema sylvestre": "Gymnema sylvestre is known for its Suppresses sweet taste, Regulates blood sugar, Supports pancreas effects.",
  "Heimia salicifolia": "Heimia salicifolia is known for its Dream enhancement, Auditory distortion, Relaxation effects.",
  "Lion’s Mane": "Lion’s Mane is known for its Nerve growth, Memory enhancement, Mood support effects.",
  "Roselle": "Roselle is known for its Blood pressure reduction, Cooling, Diuretic effects.",
  "Hyoscyamus niger": "Hyoscyamus niger is known for its Hallucinations, Disorientation, Sedation effects.",
  "Guayusa": "Guayusa is known for its Smooth stimulation, Vivid dreams, Antioxidant effects.",
  "Yerba Mate": "Yerba Mate is known for its Mental alertness, Appetite control, Social energy effects.",
  "Garden Balsam": "Garden Balsam is known for its Wound healing, Antimicrobial, Anti-itch effects.",
  "Morning Glory (Heavenly Blue)": "Morning Glory (Heavenly Blue) is known for its Visual distortions, Dream-like state, Nausea effects.",
  "Justicia pectoralis": "Justicia pectoralis is known for its Mild euphoria, Calm, Slight analgesia effects.",
  "Kanna": "Kanna is known for its Euphoria, Reduced anxiety, Social enhancement effects.",
  "Wild Lettuce": "Wild Lettuce is known for its Pain relief, Mild euphoria, Sedation effects.",
  "Peppermint": "Peppermint is known for its Soothes digestion, Stimulates focus, Relieves cramps effects.",
  "Wild Dagga": "Wild Dagga is known for its Relaxation, Euphoria, Smooth body high effects.",
  "Motherwort": "Motherwort is known for its Calms heart palpitations, Reduces anxiety, Uterine tonic effects.",
  "Lobelia inflata": "Lobelia inflata is known for its Bronchodilation, Muscle relaxation, Emetic (high dose) effects.",
  "Peyote": "Peyote is known for its Visuals, Emotional opening, Ego dissolution effects.",
  "Club Moss": "Club Moss is known for its Cognitive stimulation (mild), Digestive tonic, Symbolic use effects.",
  "Maca": "Maca is known for its Hormone balancing, Energy boost, Libido enhancement effects.",
  "Mandrake": "Mandrake is known for its Hallucinations, Sedation, Amnesia effects.",
  "White Horehound": "White Horehound is known for its Expectorant, Digestion support, Cough relief effects.",
  "Chamomile": "Chamomile is known for its Calming, Sleep aid, Soothes digestion effects.",
  "Lemon Balm": "Lemon Balm is known for its Anti-anxiety, Cognitive clarity, Mood boost effects.",
  "Mimosa pudica": "Mimosa pudica is known for its Intestinal cleanse, Antiparasitic, Calming effects.",
  "Mitragyna hirsuta": "Mitragyna hirsuta is known for its Mild euphoria, Calm stimulation, Analgesia effects.",
  "Kratom": "Kratom is known for its Energy, Euphoria, Pain relief effects.",
  "Mucuna pruriens": "Mucuna pruriens is known for its Mood boost, Motivation, Hormonal support effects.",
  "Nutmeg": "Nutmeg is known for its Euphoria, Sedation, Hallucinations (high dose) effects.",
  "Blue Lotus": "Blue Lotus is known for its Euphoria, Tranquility, Mild visuals effects.",
  "Sacred Lotus": "Sacred Lotus is known for its Relaxation, Tranquility, Aphrodisiac effects.",
  "White Lotus": "White Lotus is known for its Euphoria, Lucid dreaming, Tranquility effects.",
  "American Yellow Lotus": "American Yellow Lotus is known for its Tranquility, Heart-opening, Sensual awareness effects.",
  "Red/Blue Water Lily": "Red/Blue Water Lily is known for its Calm euphoria, Sensual clarity, Dream enhancement effects.",
  "Catnip": "Catnip is known for its Relaxation, Mild euphoria, Digestive aid effects.",
  "Holy Basil": "Holy Basil is known for its Stress reduction, Mental clarity, Immune modulation effects.",
  "Guaraná": "Guaraná is known for its Energy, Focus, Mood boost effects.",
  "Passionflower": "Passionflower is known for its Anxiety relief, Mild sedation, Muscle relaxation effects.",
  "Syrian Rue": "Syrian Rue is known for its MAO inhibition, Dream enhancement, Entheogenic potentiation effects.",
  "Kava": "Kava is known for its Anxiety reduction, Sociability, Muscle relaxation effects.",
  "Mexican Pepperleaf": "Mexican Pepperleaf is known for its Digestive aid, Calming, Flavor enhancer effects.",
  "Kava": "Kava is known for its Anxiety reduction, Sociability, Muscle relaxation effects.",
  "Mexican Pepperleaf": "Mexican Pepperleaf is known for its Digestive aid, Calming, Flavor enhancer effects.",
  "Voacanga africana": "Voacanga africana is known for its Stimulation, Mild psychedelic effects, Dream enhancement effects.",
  "Sinicuichi": "Sinicuichi is known for its Euphoria, Auditory hallucinations, Memory enhancement effects.",
  "Damiana": "Damiana is known for its Mood lift, Libido boost, Calm focus effects.",
  "Wild Dagga": "Wild Dagga is known for its Mild euphoria, Relaxation, Tranquility effects.",
  "Wild Lettuce": "Wild Lettuce is known for its Pain relief, Sedation, Mild euphoria effects.",
  "Motherwort": "Motherwort is known for its Heart regulation, Menstrual balance, Anxiety relief effects.",
  "Indian Tobacco": "Indian Tobacco is known for its Bronchodilation, Spasm relief, Nausea (high doses) effects.",
  "Mimosa hostilis": "Mimosa hostilis is known for its Vivid dreams, Entheogenic visions (with MAOI), Wound healing effects.",
  "Nutmeg": "Nutmeg is known for its Sedation, Euphoria, Hallucinations (high dose) effects.",
  "Blue Lotus": "Blue Lotus is known for its Euphoria, Relaxation, Lucid dreams effects.",
  "Hawaiian Baby Woodrose": "Hawaiian Baby Woodrose is known for its Psychedelic visuals, Introspection, Euphoria effects.",
  "Calamus": "Calamus is known for its Mental clarity, Energy, Dream enhancement effects.",
  "Yopo": "Yopo is known for its Visionary states, Euphoria, Rapid onset effects.",
  "Marshmallow Root": "Marshmallow Root is known for its Soothes throat, Eases cough, Reduces inflammation effects.",
  "Uva Ursi": "Uva Ursi is known for its Urinary tract support, Astringent, Anti-inflammatory effects.",
  "Wormwood": "Wormwood is known for its Digestive stimulation, Lucid dreaming, Bitterness effects.",
  "Wild Ginger": "Wild Ginger is known for its Digestive stimulation, Warming, Antimicrobial effects.",
  "Mugwort": "Mugwort is known for its Lucid dreaming, Menstrual regulation, Mild sedation effects.",
  "Guarana": "Guarana is known for its Stimulation, Increased alertness, Mood boost effects.",
  "Passionflower": "Passionflower is known for its Calm, Anxiety reduction, Sleep support effects.",
  "Syrian Rue": "Syrian Rue is known for its MAOI activity, Psychedelic potentiation, Meditative calm effects.",
  "Chacruna": "Chacruna is known for its Psychedelic visions, Emotional processing, Spiritual insight effects.",
  "Kava": "Kava is known for its Relaxation, Euphoria, Anxiety relief effects.",
  "Iboga": "Iboga is known for its Intense visions, Addiction interruption, Ego dissolution effects.",
  "Damiana": "Damiana is known for its Euphoria, Mild stimulation, Libido enhancement effects.",
  "Valerian": "Valerian is known for its Sleep induction, Calm, Anxiety reduction effects.",
  "Voacanga africana": "Voacanga africana is known for its Mental stimulation, Visual enhancement, Lucid dreaming effects.",
  "Ashwagandha": "Ashwagandha is known for its Stress reduction, Cortisol regulation, Sleep support effects.",
  "Yohimbe": "Yohimbe is known for its Increased libido, Stimulation, Increased blood flow effects.",
  "Toothache Tree": "Toothache Tree is known for its Mouth numbing, Tingling, Pain relief effects.",
  "Root Beer Plant": "Root Beer Plant is known for its Calming, Digestive aid, Appetite stimulation effects.",
  "Rhodiola rosea": "Rhodiola rosea is known for its Fatigue reduction, Stress resilience, Mental clarity effects.",
  "Xhosa Dream Root": "Xhosa Dream Root is known for its Lucid dreaming, Vivid dreams, Subtle euphoria effects.",
  "Pinkroot": "Pinkroot is known for its Parasitic cleanse, Mild sedation, Vision changes (in excess) effects.",
  "Linden": "Linden is known for its Calm, Stress relief, Muscle relaxation effects.",
  "Mexican Tarragon": "Mexican Tarragon is known for its Mild euphoria, Vision enhancement, Lucid dreaming effects.",
  "Coltsfoot": "Coltsfoot is known for its Cough suppression, Lung soothing, Mild sedation effects.",
  "Yellow Alder": "Yellow Alder is known for its Relaxation, Mood uplift, Digestive ease effects.",
  "Vervain": "Vervain is known for its Calm, Mood regulation, Digestive support effects.",
  "Sweet Violet": "Sweet Violet is known for its Soothing, Anti-inflammatory, Sleep support effects.",
  "Corn Silk": "Corn Silk is known for its Urine flow increase, Soothing, Kidney support effects.",
  "Ginger": "Ginger is known for its Digestive support, Anti-nausea, Circulation boost effects.",
  "Indian Valerian": "Indian Valerian is known for its Calm, Sleep support, Anxiety reduction effects.",
  "Stinging Nettle": "Stinging Nettle is known for its Allergy relief, Joint support, Diuretic effects.",
  "Chaste Tree": "Chaste Tree is known for its Hormone regulation, Menstrual cycle balancing, Mood support effects.",
  "Cat’s Claw": "Cat’s Claw is known for its Immune boosting, Joint support, Antioxidant effects.",
  "Tylophora indica": "Tylophora indica is known for its Asthma relief, Anti-allergy, Immunoregulation effects.",
  "Damiana": "Damiana is known for its Mood elevation, Mild euphoria, Libido enhancement effects.",
  "Valerian": "Valerian is known for its Deep relaxation, Sleep induction, Stress relief effects.",
  "Ashwagandha": "Ashwagandha is known for its Stress reduction, Cortisol modulation, Vitality boost effects.",
  "Prickly Ash": "Prickly Ash is known for its Tingling, Local analgesia, Salivation effects.",
  "Grains of Selim": "Grains of Selim is known for its Warming, Decongestant, Digestive aid effects.",
  "Yarrow": "Yarrow is known for its Wound healing, Fever reduction, Digestive support effects.",
  "Yohimbe": "Yohimbe is known for its Sexual stimulation, Increased arousal, Central nervous stimulation effects.",
  "Wild Lettuce": "Wild Lettuce is known for its Pain relief, Sedation, Muscle relaxation effects.",
  "Wormwood": "Wormwood is known for its Dream enhancement, Digestive stimulation, Mild euphoria effects.",
  "Heartsease": "Heartsease is known for its Calming, Anti-inflammatory, Expectorant effects.",
  "Lesser Periwinkle": "Lesser Periwinkle is known for its Cognitive enhancement, Vasodilation, Memory support effects.",
  "Mistletoe": "Mistletoe is known for its Immune regulation, Sedation, Nervous system balance effects.",
  "Voacanga africana": "Voacanga africana is known for its Altered perception, CNS stimulation, Dream enhancement effects.",
  "Sweet Acacia": "Sweet Acacia is known for its Relaxation, Calming, Uplifting mood effects.",
  "Cramp Bark": "Cramp Bark is known for its Muscle relaxation, Menstrual relief, Sedative effects.",
  "Sweet Violet": "Sweet Violet is known for its Cough relief, Mild sedation, Uplifting mood effects.",
  "Chaste Tree Berry": "Chaste Tree Berry is known for its Hormone balance, PMS relief, Luteal phase support effects.",
  "Grape Seed": "Grape Seed is known for its Vascular support, Free radical scavenging, Skin protection effects.",
  "Stinging Nettle": "Stinging Nettle is known for its Joint support, Urinary flow, Histamine modulation effects.",
  "Cat’s Claw": "Cat’s Claw is known for its Immune support, Anti-inflammatory, Digestive aid effects.",
  "Damiana": "Damiana is known for its Mood elevation, Mild euphoria, Aphrodisiac effects.",
  "Linden": "Linden is known for its Calming, Antispasmodic, Cardiovascular support effects.",
  "Gorse": "Gorse is known for its Mood elevation, Hope restoration, Mild nervous system support effects.",
  "Vervain": "Vervain is known for its Stress relief, Menstrual support, Digestive calming effects.",
  "Valerian Root": "Valerian Root is known for its Sleep aid, Anxiety reduction, Muscle relaxation effects.",
  "Mullein": "Mullein is known for its Lung soothing, Cough relief, Anti-inflammatory effects.",
  "Indian Valerian": "Indian Valerian is known for its Sleep aid, Anxiety reduction, Mental calm effects.",
  "Five-Leaved Chaste Tree": "Five-Leaved Chaste Tree is known for its Pain relief, Anti-inflammatory, Respiratory support effects.",
  "Himalayan Valerian": "Himalayan Valerian is known for its Sleep aid, Mental calm, Muscle relaxant effects.",
  "Acacia Nilotica": "Acacia Nilotica is known for its Wound healing, Oral health, Diarrhea relief effects.",
  "Dwarf Nettle": "Dwarf Nettle is known for its Skin soothing, Detox support, Mineral boost effects.",
  "Blue Vervain": "Blue Vervain is known for its Stress relief, Mood regulation, Tension release effects.",
  "Ashwagandha": "Ashwagandha is known for its Stress resilience, Energy balance, Hormonal support effects.",
  "Southern Prickly Ash": "Southern Prickly Ash is known for its Local anesthetic, Circulation stimulant, Nerve tonic effects.",
  "Ginger": "Ginger is known for its Digestive stimulant, Nausea relief, Anti-inflammatory effects.",
  "Jujube": "Jujube is known for its Sleep support, Stress reduction, Digestive regulation effects.",
  "Corn Silk": "Corn Silk is known for its Urinary support, Anti-inflammatory, Kidney soothing effects.",
  "Sichuan Pepper": "Sichuan Pepper is known for its Tingling sensation, Digestive stimulant, Mild analgesia effects.",
  "Wild Jujube Seed": "Wild Jujube Seed is known for its Sleep promotion, Anxiety relief, Dream regulation effects.",
  "Shampoo Ginger": "Shampoo Ginger is known for its Skin and hair care, Topical anti-inflammatory, Digestive aid effects.",
  "Maconha Brava": "Maconha Brava is known for its Mild euphoria, Mental calm, Lucid dreaming effects.",
  "Northern Prickly Ash": "Northern Prickly Ash is known for its Local numbness, Circulation boost, Lymphatic stimulation effects.",
  "Twinleaf Zornia": "Twinleaf Zornia is known for its Relaxation, Mild psychoactive, Cough soothing effects.",
  "Toothache Plant": "Toothache Plant is known for its Numbing, Tingling, Salivation effects.",
  "Bael Fruit": "Bael Fruit is known for its Digestive regulation, Gut lining protection, Mild calm effects.",
  "Yopo": "Yopo is known for its Euphoria, Visionary state, Dissociation effects.",
  "Hawaiian Baby Woodrose": "Hawaiian Baby Woodrose is known for its Psychedelic visions, Sedation, Time distortion effects.",
  "Wormwood": "Wormwood is known for its Digestive stimulation, Lucid dreams, Mental clarity effects.",
  "Marshmallow Root": "Marshmallow Root is known for its Mucosal soothing, Cough relief, Gut lining protection effects.",
  "Wild Ginger": "Wild Ginger is known for its Warming, Carminative, Stimulating effects.",
  "Oatstraw": "Oatstraw is known for its Stress relief, Mood stabilization, Endocrine tonic effects.",
  "Mugwort": "Mugwort is known for its Lucid dreaming, Digestive stimulation, Mild euphoria effects.",
};


// ---- File: herbs-batch27.ts ----
// Batch 27: Psychoactive Herbs

import { Herb } from '../types/herb';

export const herbsBatch27: Herb[] = [{'name': 'Artemisia abrotanum', 'slug': 'artemisia-abrotanum', 'description': 'Southernwood is a fragrant herb used traditionally as a stimulant, memory aid, and dream enhancer.', 'region': 'Mediterranean, Europe', 'effects': ['mental clarity', 'dream enhancement', 'stimulant'], 'compounds': ['Camphor', 'Thujone'], 'mechanismOfAction': 'GABAergic + cholinergic modulation', 'tags': ['aromatic', 'folk remedy', 'uplifting']}, {'name': 'Heimia salicifolia', 'slug': 'heimia-salicifolia', 'description': 'Known as Sun Opener, this herb was used by the Aztecs for visionary and divinatory purposes.', 'region': 'Mexico, Central America', 'effects': ['visionary', 'relaxation', 'lucid dream enhancement'], 'compounds': ['Cryogenine', 'Lyfoline'], 'mechanismOfAction': 'Serotonergic + anticholinergic', 'tags': ['oneirogen', 'visionary', 'shamanic']}, {'name': 'Bacopa monnieri', 'slug': 'bacopa-monnieri', 'description': 'Brahmi is an Ayurvedic nootropic herb that improves memory, learning, and mental clarity.', 'region': 'India, Southeast Asia', 'effects': ['memory enhancement', 'calm focus', 'adaptogen'], 'compounds': ['Bacosides A and B'], 'mechanismOfAction': 'Cholinergic + antioxidant', 'tags': ['nootropic', 'Ayurvedic', 'mental clarity']}, {'name': 'Nymphaea caerulea', 'slug': 'nymphaea-caerulea', 'description': 'The Blue Lotus of the Nile, used historically for sedative, aphrodisiac, and euphoric effects.', 'region': 'Egypt, Africa', 'effects': ['euphoria', 'relaxation', 'mild sedation'], 'compounds': ['Aporphine', 'Nuciferine'], 'mechanismOfAction': 'Dopaminergic + serotonergic', 'tags': ['aphrodisiac', 'sedative', 'ritual']}, {'name': 'Huperzia serrata', 'slug': 'huperzia-serrata', 'description': 'A moss rich in Huperzine A, used for memory enhancement and neuroprotection.', 'region': 'China, Southeast Asia', 'effects': ['focus', 'memory boost', 'lucid dreaming'], 'compounds': ['Huperzine A'], 'mechanismOfAction': 'Acetylcholinesterase inhibition', 'tags': ['nootropic', 'lucidity', 'memory']}, {'name': 'Justicia adhatoda', 'slug': 'justicia-adhatoda', 'description': 'Also called Malabar Nut, this herb has traditional uses as a respiratory aid and mild sedative.', 'region': 'India, Sri Lanka', 'effects': ['calming', 'respiratory clearing', 'mild sedation'], 'compounds': ['Vasicine', 'Vasicinone'], 'mechanismOfAction': 'Bronchodilation + GABAergic', 'tags': ['sedative', 'respiratory', 'Ayurvedic']}, {'name': 'Tilia europaea', 'slug': 'tilia-europaea', 'description': 'Common Linden, used in European herbalism for calming, dream-enhancing, and tension relief.', 'region': 'Europe', 'effects': ['calming', 'mild euphoria', 'dream enhancement'], 'compounds': ['Volatile oils', 'Tiliroside'], 'mechanismOfAction': 'GABAergic + serotonergic', 'tags': ['folk medicine', 'calming', 'dream']}, {'name': 'Pogostemon cablin', 'slug': 'pogostemon-cablin', 'description': 'Patchouli, while mainly aromatic, has mild psychoactive effects in traditional incense rituals.', 'region': 'Asia', 'effects': ['sensory enhancement', 'calm focus', 'uplifted mood'], 'compounds': ['Patchoulol', 'Alpha-bulnesene'], 'mechanismOfAction': 'Aromatherapeutic + serotonergic', 'tags': ['aromatic', 'ritual', 'uplifting']}, {'name': 'Anadenanthera colubrina', 'slug': 'anadenanthera-colubrina', 'description': 'Source of vilca snuff; contains powerful tryptamines used in South American shamanism.', 'region': 'South America', 'effects': ['visionary', 'intense dissociation', 'time distortion'], 'compounds': ['Bufotenine', 'DMT'], 'mechanismOfAction': '5-HT2A agonism', 'tags': ['shamanic', 'tryptamine', 'snuff']}, {'name': 'Aloysia citrodora', 'slug': 'aloysia-citrodora', 'description': 'Lemon Verbena, a gentle herbal tea with calming and mood-lifting effects.', 'region': 'South America', 'effects': ['calm', 'relaxation', 'light euphoria'], 'compounds': ['Citral', 'Verbascoside'], 'mechanismOfAction': 'GABAergic + serotonergic', 'tags': ['tea', 'folk remedy', 'calming']}];



// ---- File: herbs-batch23.ts ----
// Batch 23: New Psychoactive Herbs

import { Herb } from '../types/herb';

export const herbsBatch23: Herb[] = [{'name': 'Heimia salicifolia', 'slug': 'heimia-salicifolia', 'description': 'Also known as Sinicuichi, this Central American herb is used traditionally to induce auditory distortions and mild euphoria.', 'region': 'Central America', 'effects': ['auditory distortion', 'euphoria', 'dreamlike'], 'compounds': ['Cryogenine'], 'mechanismOfAction': 'GABAergic modulation', 'tags': ['ethnobotanical', 'dream', 'mildly psychoactive']}, {'name': 'Acorus calamus', 'slug': 'acorus-calamus', 'description': 'Sweet Flag has a complex pharmacology: stimulant in low doses, sedative in high. Historically used in Ayurvedic and Native American medicine.', 'region': 'Eurasia / North America', 'effects': ['sedative', 'stimulant', 'anxiolytic'], 'compounds': ['Beta-Asarone'], 'mechanismOfAction': 'GABAergic and cholinergic modulation', 'tags': ['calming', 'traditional', 'aromatic']}, {'name': 'Leonurus sibiricus', 'slug': 'leonurus-sibiricus', 'description': 'Known as Siberian Motherwort, this herb is a relaxing nervine used in Asian medicine with mild psychoactive and aphrodisiac effects.', 'region': 'Siberia, China', 'effects': ['relaxation', 'mood lift', 'aphrodisiac'], 'compounds': ['Leonurine'], 'mechanismOfAction': 'Dopaminergic modulation', 'tags': ['aphrodisiac', 'nervine', 'calming']}, {'name': 'Dysphania ambrosioides', 'slug': 'dysphania-ambrosioides', 'description': 'Also known as Epazote, used in Mesoamerican rituals. Contains CNS-stimulating compounds but is toxic at high doses.', 'region': 'Mexico', 'effects': ['dreamlike', 'stimulant'], 'compounds': ['Ascaridole', 'p-Cymene'], 'mechanismOfAction': 'CNS excitation at high doses', 'tags': ['ritual', 'visionary', 'potentially toxic']}, {'name': 'Casimiroa edulis', 'slug': 'casimiroa-edulis', 'description': 'The fruit of the White Sapote tree is used as a sedative in traditional Mexican herbal medicine.', 'region': 'Central America', 'effects': ['sedative', 'sleep aid'], 'compounds': ['Zapotin'], 'mechanismOfAction': 'Possible GABAergic activity', 'tags': ['sedative', 'fruit', 'folk medicine']}, {'name': 'Mitchella repens', 'slug': 'mitchella-repens', 'description': 'Known as Partridgeberry, used as a uterine tonic and mild relaxing agent in North American herbalism.', 'region': 'North America', 'effects': ['relaxation', 'nervine'], 'compounds': ['Saponins', 'Iridoids'], 'mechanismOfAction': 'Smooth muscle relaxant', 'tags': ['calming', 'uterine', 'folk remedy']}, {'name': 'Perilla frutescens', 'slug': 'perilla-frutescens', 'description': 'Used in East Asian cuisine and medicine, this leaf contains mild mood-elevating and cognitive enhancing properties.', 'region': 'East Asia', 'effects': ['uplifting', 'calm clarity'], 'compounds': ['Perillaldehyde', 'Rosmarinic Acid'], 'mechanismOfAction': 'Cholinergic + antioxidant effects', 'tags': ['mild nootropic', 'culinary', 'relaxing']}, {'name': 'Turnera diffusa var. aphrodisiaca', 'slug': 'turnera-diffusa-aphrodisiaca', 'description': 'A variant of Damiana known for its aphrodisiac and mood-brightening properties. Traditionally used as a tonic.', 'region': 'Mexico', 'effects': ['aphrodisiac', 'mood enhancer'], 'compounds': ['Damianin', 'Flavonoids'], 'mechanismOfAction': 'Dopaminergic and GABAergic synergy', 'tags': ['aphrodisiac', 'tonic', 'euphoric']}, {'name': 'Thymus vulgaris', 'slug': 'thymus-vulgaris', 'description': 'Common thyme is a culinary herb with mild neurostimulant properties, thanks to its essential oils like thymol.', 'region': 'Europe', 'effects': ['clarity', 'alertness'], 'compounds': ['Thymol'], 'mechanismOfAction': 'AChE inhibition, antioxidant', 'tags': ['culinary', 'clarity', 'aromatic']}, {'name': 'Helichrysum odoratissimum', 'slug': 'helichrysum-odoratissimum', 'description': 'Known as Imphepho in South African ritual use, this herb induces visions and is burned to invoke ancestors.', 'region': 'Southern Africa', 'effects': ['visionary', 'trance', 'spiritual'], 'compounds': ['Essential oils', 'Flavonoids'], 'mechanismOfAction': 'Possibly serotonergic/GABAergic', 'tags': ['dream herb', 'ritual', 'African traditional medicine']}];



// ---- File: compounds-batch3.ts ----
// Batch 3: Psychoactive Compounds from Herb Batch 24

import { Compound } from '../types/compound';

export const compoundsBatch3: Compound[] = [{'name': 'Thujone', 'type': 'monoterpene ketone', 'description': 'A GABA receptor antagonist found in Mugwort and Wormwood, known for its psychoactive and convulsant potential.', 'foundIn': ['Artemisia vulgaris'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'GABA-A receptor antagonism'}, {'name': 'Camphor', 'type': 'terpenoid', 'description': 'An aromatic terpenoid with mild stimulant and decongestant effects, present in Mugwort and other herbs.', 'foundIn': ['Artemisia vulgaris'], 'psychoactivity': 'mild', 'mechanismOfAction': 'TRP channel modulation'}, {'name': 'Asarone', 'type': 'phenylpropanoid', 'description': 'A bioactive component of Acorus species, structurally similar to psychoactive compounds and mildly sedative.', 'foundIn': ['Acorus gramineus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic modulation'}, {'name': 'Mesembrine', 'type': 'alkaloid', 'description': 'The primary alkaloid in Sceletium tortuosum (Kanna), acting as a serotonin reuptake inhibitor and mood enhancer.', 'foundIn': ['Sceletium tortuosum'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'SERT inhibition'}, {'name': 'Mesembrenone', 'type': 'alkaloid', 'description': 'A mood-lifting alkaloid in Kanna, shown to inhibit PDE4 and increase dopaminergic tone.', 'foundIn': ['Sceletium tortuosum'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'PDE4 inhibition'}, {'name': 'Germacranolides', 'type': 'sesquiterpene lactone', 'description': 'Bitter-tasting compounds in Calea ternifolia associated with oneirogenic effects.', 'foundIn': ['Calea ternifolia'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Unknown, possibly cholinergic'}, {'name': 'Triterpenoid saponins', 'type': 'saponin', 'description': 'Bioactive glycosides found in dream herbs like Silene capensis, often linked to vivid dreaming.', 'foundIn': ['Silene capensis'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Unknown'}, {'name': 'Quercetin', 'type': 'flavonoid', 'description': 'An antioxidant flavonoid with calming and neuroprotective properties.', 'foundIn': ['Tilia tomentosa'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Anti-inflammatory + GABAergic support'}, {'name': 'Volatile oils', 'type': 'essential oil blend', 'description': 'Aromatic oils in Tilia and other herbs that promote calm through olfactory and chemical pathways.', 'foundIn': ['Tilia tomentosa'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Aromatherapy + mild sedation'}, {'name': 'Estragole', 'type': 'phenylpropene', 'description': 'A sweet-smelling compound with mild psychoactive effects, found in Tagetes lucida.', 'foundIn': ['Tagetes lucida'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Serotonergic + cholinergic activity'}, {'name': 'Anethole', 'type': 'phenylpropene', 'description': 'A mildly psychoactive aromatic compound found in herbs like Mexican tarragon and anise.', 'foundIn': ['Tagetes lucida'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Cholinergic modulation'}, {'name': 'Coumarin', 'type': 'benzopyrone', 'description': 'A fragrant compound with sedative and anticoagulant properties found in Justicia pectoralis.', 'foundIn': ['Justicia pectoralis'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic modulation'}, {'name': 'Umelliferone', 'type': 'coumarin derivative', 'description': 'A bioactive coumarin compound found in Justicia pectoralis, with possible serotonergic action.', 'foundIn': ['Justicia pectoralis'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Serotonergic modulation'}, {'name': 'Saponins', 'type': 'glycoside', 'description': 'Natural glycosides with foaming properties and mild relaxing effects, found in various dream herbs.', 'foundIn': ['Entada rheedii'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Unknown'}, {'name': 'Celastrine', 'type': 'alkaloid', 'description': 'A nootropic compound found in Celastrus paniculatus (Intellect tree), used to improve memory and clarity.', 'foundIn': ['Celastrus paniculatus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Cholinergic enhancement'}, {'name': 'Paniculatin', 'type': 'alkaloid', 'description': 'One of the active components of Celastrus paniculatus, believed to promote alert calmness and mental energy.', 'foundIn': ['Celastrus paniculatus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Cholinergic activity'}];



// ---- File: herbs-batch28.ts ----
// Batch 28: Psychoactive Herbs

import { Herb } from '../types/herb';

export const herbsBatch28: Herb[] = [{'name': 'Artemisia ludoviciana', 'slug': 'artemisia-ludoviciana', 'description': 'Also known as white sagebrush, used by Native American tribes for cleansing, dreams, and mild sedation.', 'region': 'North America', 'effects': ['mild sedation', 'visionary', 'cleansing'], 'compounds': ['Thujone', 'Camphor'], 'mechanismOfAction': 'GABAergic + anticholinergic', 'tags': ['ritual', 'dream', 'folk medicine']}, {'name': 'Turnera diffusa', 'slug': 'turnera-diffusa', 'description': 'Damiana is an aphrodisiac and mood enhancer used in Mexican herbal traditions and modern blends.', 'region': 'Mexico, Central America', 'effects': ['euphoria', 'stimulation', 'aphrodisiac'], 'compounds': ['Damianin', 'Flavonoids'], 'mechanismOfAction': 'Dopaminergic + GABAergic', 'tags': ['aphrodisiac', 'tea', 'tonic']}, {'name': 'Viola odorata', 'slug': 'viola-odorata', 'description': 'Sweet Violet, mildly sedative and anxiolytic, traditionally used for grief, tension, and calm dreams.', 'region': 'Europe, Asia', 'effects': ['relaxation', 'emotional clarity', 'sleep aid'], 'compounds': ['Violine', 'Methyl salicylate'], 'mechanismOfAction': 'GABAergic + anti-inflammatory', 'tags': ['folk remedy', 'sedative', 'emotional']}, {'name': 'Petasites hybridus', 'slug': 'petasites-hybridus', 'description': 'Butterbur, once used for headaches and anxiety. Contains pyrrolizidine alkaloids — caution advised.', 'region': 'Europe', 'effects': ['anti-anxiety', 'vasodilation', 'headache relief'], 'compounds': ['Petasin', 'Isopetasin'], 'mechanismOfAction': 'Smooth muscle relaxant + serotonergic', 'tags': ['nervine', 'headache', 'caution']}, {'name': 'Zanthoxylum clava-herculis', 'slug': 'zanthoxylum-clava-herculis', 'description': 'The Toothache Tree, used for numbing, mild stimulation, and ritual practices in the American South.', 'region': 'Southeastern USA', 'effects': ['numbing', 'alertness', 'tingling'], 'compounds': ['Zanthoxylin', 'Lignans'], 'mechanismOfAction': 'Local anesthetic + sensory modulation', 'tags': ['ritual', 'numbing', 'tingle']}, {'name': 'Arundo donax', 'slug': 'arundo-donax', 'description': 'A tall reed containing trace tryptamines; rarely used, but investigated for its chemical potential.', 'region': 'Mediterranean, Asia', 'effects': ['visionary (potential)', 'altered state (speculative)'], 'compounds': ['DMT (trace)', 'Bufotenine (trace)'], 'mechanismOfAction': '5-HT2A agonist (hypothetical)', 'tags': ['tryptamine', 'experimental', 'rare']}, {'name': 'Betula lenta', 'slug': 'betula-lenta', 'description': 'Sweet Birch, aromatic and uplifting; contains methyl salicylate, offering mild euphoria and clarity.', 'region': 'North America', 'effects': ['uplifting', 'mental clarity', 'aromatic'], 'compounds': ['Methyl salicylate'], 'mechanismOfAction': 'Anti-inflammatory + mild serotonergic', 'tags': ['tea', 'uplifting', 'aromatic']}, {'name': 'Nepeta cataria', 'slug': 'nepeta-cataria', 'description': 'Catnip, while famous for feline effects, produces mild sedation and mood elevation in humans.', 'region': 'Europe, Asia, North America', 'effects': ['mild euphoria', 'relaxation', 'calming'], 'compounds': ['Nepetalactone', 'Iridoids'], 'mechanismOfAction': 'GABAergic + calming', 'tags': ['tea', 'folk remedy', 'calming']}, {'name': 'Scutellaria lateriflora', 'slug': 'scutellaria-lateriflora', 'description': 'American Skullcap is a revered nervine herb promoting relaxation, calm, and sleep.', 'region': 'North America', 'effects': ['sedation', 'calm', 'anxiety relief'], 'compounds': ['Baicalin', 'Scutellarin'], 'mechanismOfAction': 'GABAergic', 'tags': ['nervine', 'folk remedy', 'sleep aid']}, {'name': 'Tussilago farfara', 'slug': 'tussilago-farfara', 'description': 'Coltsfoot, used in traditional teas for respiratory support and light sedation.', 'region': 'Europe, Asia', 'effects': ['soothing', 'light sedation', 'respiratory ease'], 'compounds': ['Mucilage', 'Tussilagone'], 'mechanismOfAction': 'Smooth muscle relaxation + respiratory support', 'tags': ['respiratory', 'sedative', 'folk medicine']}];



// ---- File: compounds-batch7.ts ----
// Batch 7: Psychoactive Compounds from Herb Batch 28

import { Compound } from '../types/compound';

export const compoundsBatch7: Compound[] = [{'name': 'Thujone', 'type': 'monoterpene ketone', 'description': 'A GABA receptor antagonist with stimulating and dream-enhancing effects, found in Artemisia species.', 'foundIn': ['Artemisia ludoviciana'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABA-A receptor antagonist'}, {'name': 'Damianin', 'type': 'terpenoid compound', 'description': 'A compound in Damiana believed to contribute to its aphrodisiac and euphoric effects.', 'foundIn': ['Turnera diffusa'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Unknown; dopaminergic and GABAergic suspected'}, {'name': 'Violine', 'type': 'alkaloid', 'description': 'A compound in Sweet Violet with sedative and mildly hypnotic effects.', 'foundIn': ['Viola odorata'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic'}, {'name': 'Petasin', 'type': 'sesquiterpene', 'description': 'A compound in Butterbur used to relieve headaches and anxiety through smooth muscle relaxation.', 'foundIn': ['Petasites hybridus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Smooth muscle relaxant + serotonergic'}, {'name': 'Zanthoxylin', 'type': 'alkylamide', 'description': 'A numbing and tingling agent in the Toothache Tree with mild sensory effects.', 'foundIn': ['Zanthoxylum clava-herculis'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Local anesthetic'}, {'name': 'Methyl salicylate', 'type': 'ester', 'description': 'An aromatic compound with anti-inflammatory and uplifting properties found in birch and violet.', 'foundIn': ['Betula lenta', 'Viola odorata'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Anti-inflammatory + serotonergic'}, {'name': 'Nepetalactone', 'type': 'iridoid monoterpene', 'description': 'Primary compound in Catnip with calming, euphoric, and slightly hallucinogenic effects in animals and mild effects in humans.', 'foundIn': ['Nepeta cataria'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic + olfactory'}, {'name': 'Baicalin', 'type': 'flavone glycoside', 'description': 'A GABAergic flavonoid in Skullcap responsible for its calming and anxiolytic properties.', 'foundIn': ['Scutellaria lateriflora'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABA-A receptor modulation'}, {'name': 'Tussilagone', 'type': 'sesquiterpene', 'description': 'A compound in Coltsfoot with antitussive and calming properties.', 'foundIn': ['Tussilago farfara'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Smooth muscle relaxation'}, {'name': 'DMT', 'type': 'tryptamine', 'description': 'A powerful hallucinogenic compound found in trace amounts in Arundo donax and various entheogens.', 'foundIn': ['Arundo donax'], 'psychoactivity': 'strong', 'mechanismOfAction': '5-HT2A receptor agonist'}, {'name': 'Bufotenine', 'type': 'tryptamine', 'description': 'A powerful entheogenic compound, trace in Arundo donax, with visual and dissociative effects.', 'foundIn': ['Arundo donax'], 'psychoactivity': 'strong', 'mechanismOfAction': '5-HT2A receptor agonist'}];



// ---- File: compounds-batch6.ts ----
// Batch 6: Psychoactive Compounds from Herb Batch 27

import { Compound } from '../types/compound';

export const compoundsBatch6: Compound[] = [{'name': 'Camphor', 'type': 'terpenoid ketone', 'description': 'A cooling aromatic compound with stimulating and mildly dissociative effects in high doses.', 'foundIn': ['Artemisia abrotanum'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic + sensory modulation'}, {'name': 'Cryogenine', 'type': 'alkaloid', 'description': 'A psychoactive compound in Heimia salicifolia, associated with altered perception and lucid dreaming.', 'foundIn': ['Heimia salicifolia'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'Serotonergic + anticholinergic'}, {'name': 'Bacosides A and B', 'type': 'triterpenoid saponins', 'description': 'Primary active nootropic agents in Bacopa, supporting memory, learning, and neuroplasticity.', 'foundIn': ['Bacopa monnieri'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Cholinergic + neuroprotective'}, {'name': 'Aporphine', 'type': 'aporphine alkaloid', 'description': 'A dopamine agonist with sedative and euphoric effects found in Blue Lotus.', 'foundIn': ['Nymphaea caerulea'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'Dopamine receptor agonist'}, {'name': 'Huperzine A', 'type': 'alkaloid', 'description': 'A potent acetylcholinesterase inhibitor that enhances memory and dream lucidity.', 'foundIn': ['Huperzia serrata'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'Acetylcholinesterase inhibition'}, {'name': 'Vasicine', 'type': 'quinazoline alkaloid', 'description': 'A bronchodilator and mild sedative found in Justicia adhatoda.', 'foundIn': ['Justicia adhatoda'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Bronchodilation + GABAergic'}, {'name': 'Tiliroside', 'type': 'flavonoid glycoside', 'description': 'A calming compound in Linden with antioxidant and mild GABAergic activity.', 'foundIn': ['Tilia europaea'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic + antioxidant'}, {'name': 'Patchoulol', 'type': 'sesquiterpene alcohol', 'description': 'A main compound in Patchouli oil with grounding, relaxing properties in aromatherapy.', 'foundIn': ['Pogostemon cablin'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Aromatherapeutic + serotonergic'}, {'name': 'Bufotenine', 'type': 'tryptamine', 'description': 'A powerful psychedelic compound found in vilca and toad venom, causing intense visual effects.', 'foundIn': ['Anadenanthera colubrina'], 'psychoactivity': 'strong', 'mechanismOfAction': '5-HT2A receptor agonist'}, {'name': 'Verbascoside', 'type': 'phenylpropanoid glycoside', 'description': 'A calming antioxidant compound with potential mood-brightening effects found in Lemon Verbena.', 'foundIn': ['Aloysia citrodora'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic + serotonergic'}];



// ---- File: compounds-batch2.ts ----
// Batch 2: New Psychoactive Compounds

import { Compound } from '../types/compound';

export const compoundsBatch2: Compound[] = [{'name': 'Cryogenine', 'type': 'alkaloid', 'description': 'A sedating alkaloid found in Heimia salicifolia, known for its auditory distortion and calm-inducing properties.', 'foundIn': ['Heimia salicifolia'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic modulation'}, {'name': 'Beta-Asarone', 'type': 'phenylpropanoid', 'description': 'A compound found in Acorus calamus with controversial stimulant and sedative properties depending on dose.', 'foundIn': ['Acorus calamus'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'Cholinergic and GABAergic modulation'}, {'name': 'Leonurine', 'type': 'alkaloid', 'description': 'An alkaloid found in Leonurus sibiricus with relaxing and dopaminergic effects.', 'foundIn': ['Leonurus sibiricus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Dopamine receptor modulation'}, {'name': 'Ascaridole', 'type': 'terpene', 'description': 'A monoterpene peroxide in Epazote, responsible for stimulant and toxic properties at high doses.', 'foundIn': ['Dysphania ambrosioides'], 'psychoactivity': 'mild', 'mechanismOfAction': 'CNS stimulation (dose-dependent)'}, {'name': 'p-Cymene', 'type': 'terpene', 'description': 'A naturally occurring aromatic terpene with stimulant and antioxidant properties.', 'foundIn': ['Dysphania ambrosioides'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Neurostimulant and antioxidant effects'}, {'name': 'Zapotin', 'type': 'flavonoid', 'description': 'A sedating flavonoid compound from Casimiroa edulis used in traditional medicine for insomnia.', 'foundIn': ['Casimiroa edulis'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'Possibly GABAergic'}, {'name': 'Saponins', 'type': 'glycoside', 'description': 'A class of plant glycosides with soothing and adaptogenic properties, found in Mitchella repens.', 'foundIn': ['Mitchella repens'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Smooth muscle modulation'}, {'name': 'Iridoids', 'type': 'glycoside', 'description': 'Bioactive compounds with anti-inflammatory and nervine properties, often used in traditional herbalism.', 'foundIn': ['Mitchella repens'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Calming central nervous system modulation'}, {'name': 'Perillaldehyde', 'type': 'terpenoid', 'description': 'An aromatic compound found in Perilla leaf with uplifting and calming properties.', 'foundIn': ['Perilla frutescens'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Cholinergic activation'}, {'name': 'Rosmarinic Acid', 'type': 'phenolic acid', 'description': 'An antioxidant and mood-stabilizing compound found in Perilla and other herbs.', 'foundIn': ['Perilla frutescens'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Cholinergic + anti-inflammatory'}, {'name': 'Damianin', 'type': 'terpenoid', 'description': 'A compound from Damiana associated with mood-enhancing and aphrodisiac properties.', 'foundIn': ['Turnera diffusa var. aphrodisiaca'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'Dopaminergic stimulation + GABA synergy'}, {'name': 'Flavonoids', 'type': 'polyphenol', 'description': 'A broad group of antioxidant compounds with mood-modulating and sedative effects.', 'foundIn': ['Turnera diffusa var. aphrodisiaca', 'Helichrysum odoratissimum'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Neuroprotective + receptor modulation'}, {'name': 'Thymol', 'type': 'monoterpene phenol', 'description': 'An aromatic compound from thyme with stimulating and antimicrobial effects.', 'foundIn': ['Thymus vulgaris'], 'psychoactivity': 'mild', 'mechanismOfAction': 'AChE inhibition'}, {'name': 'Essential oils', 'type': 'volatile blend', 'description': 'A mixture of bioactive volatile compounds used in rituals and aromatherapy with psychoactive potential.', 'foundIn': ['Helichrysum odoratissimum'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Aromatherapy + serotonergic modulation'}];



// ---- File: compounds-batch5.ts ----
// Batch 5: Psychoactive Compounds from Herb Batch 26

import { Compound } from '../types/compound';

export const compoundsBatch5: Compound[] = [{'name': 'Eugenol', 'type': 'phenylpropene', 'description': 'A fragrant oil with calming and mildly euphoric properties found in allspice and clove.', 'foundIn': ['Pimenta dioica'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic + serotonergic modulation'}, {'name': 'Lactucopicrin', 'type': 'sesquiterpene lactone', 'description': 'A bitter compound in Wild Lettuce associated with sedative and analgesic effects.', 'foundIn': ['Lactuca virosa'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Opioid receptor modulation'}, {'name': 'Lactucin', 'type': 'sesquiterpene lactone', 'description': 'Mildly psychoactive compound in Wild Lettuce contributing to its calming effects.', 'foundIn': ['Lactuca virosa'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Opioid receptor modulation'}, {'name': 'Boldine', 'type': 'alkaloid', 'description': 'An antioxidant alkaloid in Boldo with sedative and hepatoprotective properties.', 'foundIn': ['Peumus boldus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Cholinergic + serotonergic'}, {'name': 'Ascaridole', 'type': 'monoterpenoid peroxide', 'description': 'A volatile compound in Boldo with hypnotic and anti-parasitic properties.', 'foundIn': ['Peumus boldus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Unknown, possible GABAergic'}, {'name': 'Agnuside', 'type': 'iridoid glycoside', 'description': 'A dopaminergic compound in Chasteberry thought to influence hormonal balance and mood.', 'foundIn': ['Vitex agnus-castus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Dopaminergic + hormonal modulation'}, {'name': 'Myristicin', 'type': 'phenylpropene', 'description': 'A deliriant and hallucinogenic compound in Nutmeg, psychoactive at high doses.', 'foundIn': ['Myristica fragrans'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'MAOI + anticholinergic'}, {'name': 'Elemicin', 'type': 'phenylpropene', 'description': 'Another psychoactive compound in Nutmeg, structurally related to mescaline.', 'foundIn': ['Myristica fragrans'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'Anticholinergic + serotonergic'}, {'name': 'Amorphigenin', 'type': 'rotenoid compound', 'description': 'A compound in Amorpha fruticosa with unclear psychoactivity, possibly relaxing or trance-inducing.', 'foundIn': ['Amorpha fruticosa'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Possibly GABAergic'}, {'name': 'Eleutherosides', 'type': 'glycosides', 'description': 'A group of adaptogenic compounds found in Siberian Ginseng with neuroprotective properties.', 'foundIn': ['Eleutherococcus senticosus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Adaptogenic + neuroregulatory'}, {'name': 'Verbenalin', 'type': 'iridoid glycoside', 'description': 'A compound found in vervain, associated with sedative and spiritually clarifying effects.', 'foundIn': ['Verbena officinalis'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic'}, {'name': 'Citral', 'type': 'monoterpene aldehyde', 'description': 'A lemon-scented terpene with calming and mood-brightening effects.', 'foundIn': ['Melissa officinalis'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABA-T inhibition + serotonergic'}, {'name': 'Rosmarinic acid', 'type': 'polyphenol', 'description': 'An anxiolytic compound in lemon balm with antioxidant and calming effects.', 'foundIn': ['Melissa officinalis'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic + anti-inflammatory'}];



// ---- File: compounds-batch4.ts ----
// Batch 4: Psychoactive Compounds from Herb Batch 25

import { Compound } from '../types/compound';

export const compoundsBatch4: Compound[] = [{'name': 'Alpha-asarone', 'type': 'phenylpropanoid', 'description': 'A psychoactive compound from Acorus species known for stimulant and cognition-enhancing effects.', 'foundIn': ['Acorus americanus'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Cholinergic + dopaminergic modulation'}, {'name': 'DMT', 'type': 'tryptamine', 'description': 'A powerful serotonergic psychedelic found in Virola and numerous other plants.', 'foundIn': ['Virola theiodora'], 'psychoactivity': 'strong', 'mechanismOfAction': '5-HT2A receptor agonist'}, {'name': '5-MeO-DMT', 'type': 'tryptamine', 'description': 'A potent serotonergic compound with fast-acting dissociative and mystical effects.', 'foundIn': ['Virola theiodora'], 'psychoactivity': 'strong', 'mechanismOfAction': '5-HT1A and 5-HT2A receptor agonist'}, {'name': 'Rutarin', 'type': 'alkaloid', 'description': 'A bitter alkaloid in Ruta graveolens, traditionally used for sedative and mystical purposes.', 'foundIn': ['Ruta graveolens'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABA-A modulation'}, {'name': 'Graveoline', 'type': 'alkaloid', 'description': 'An alkaloid from Rue associated with sedative and possible antispasmodic effects.', 'foundIn': ['Ruta graveolens'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Unclear, likely GABAergic'}, {'name': 'Chrysin', 'type': 'flavonoid', 'description': 'A bioflavonoid with anxiolytic and MAO-inhibiting properties found in Passionflower.', 'foundIn': ['Passiflora incarnata'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABA-A agonist + MAOI'}, {'name': 'Harmine (trace)', 'type': 'beta-carboline', 'description': 'A reversible MAOI found in low levels in Passionflower, structurally related to compounds in Ayahuasca.', 'foundIn': ['Passiflora incarnata'], 'psychoactivity': 'mild', 'mechanismOfAction': 'MAO-A inhibition'}, {'name': 'Cytisine', 'type': 'alkaloid', 'description': 'A toxic yet psychoactive compound that acts on nicotinic receptors; found in Mescal bean.', 'foundIn': ['Sophora secundiflora'], 'psychoactivity': 'moderate', 'mechanismOfAction': 'Nicotinic receptor agonist'}, {'name': 'Desmodin', 'type': 'alkaloid', 'description': 'An alkaloid compound with neuroprotective and adaptogenic properties found in Desmodium.', 'foundIn': ['Desmodium gangeticum'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Neuroprotective + serotonergic modulation'}, {'name': 'Triterpenoids', 'type': 'triterpene', 'description': 'Compounds with anti-inflammatory and tonic properties found in Desmodium species.', 'foundIn': ['Desmodium gangeticum'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Anti-inflammatory, adaptogenic'}, {'name': 'Ergoline alkaloids (trace)', 'type': 'ergoline', 'description': 'Ergoline derivatives possibly present in Bindweed, structurally related to LSD precursors.', 'foundIn': ['Convolvulus arvensis'], 'psychoactivity': 'mild', 'mechanismOfAction': '5-HT2A receptor activity'}, {'name': 'Linalyl acetate', 'type': 'ester', 'description': 'A fragrant ester found in clary sage, with mood-lifting and calming effects.', 'foundIn': ['Salvia sclarea'], 'psychoactivity': 'mild', 'mechanismOfAction': 'GABAergic + aromatherapeutic'}, {'name': 'Sclareol', 'type': 'diterpene alcohol', 'description': 'A compound from clary sage with mild euphoria, possible hormonal modulation, and relaxing effects.', 'foundIn': ['Salvia sclarea'], 'psychoactivity': 'mild', 'mechanismOfAction': 'Estrogenic + GABAergic activity'}];



// ---- File: herbs-batch24.ts ----
// Batch 24: More Rare Psychoactive Herbs

import { Herb } from '../types/herb';

export const herbsBatch24: Herb[] = [{'name': 'Artemisia vulgaris', 'slug': 'artemisia-vulgaris', 'description': 'Known as Mugwort, traditionally used in European and Asian cultures for vivid dreaming, menstrual relief, and mild psychedelic effects.', 'region': 'Europe, Asia', 'effects': ['vivid dreaming', 'relaxation', 'mild hallucination'], 'compounds': ['Thujone', 'Camphor'], 'mechanismOfAction': 'GABA-A modulation, possible NMDA antagonist', 'tags': ['dream', 'ritual', 'traditional']}, {'name': 'Acorus gramineus', 'slug': 'acorus-gramineus', 'description': 'Japanese Sweet Flag used in Shinto and Buddhist rituals, mildly stimulating and cognition-enhancing.', 'region': 'East Asia', 'effects': ['clarity', 'stimulant', 'focus'], 'compounds': ['Asarone'], 'mechanismOfAction': 'Cholinergic and GABAergic modulation', 'tags': ['traditional', 'mild nootropic', 'aromatic']}, {'name': 'Sceletium tortuosum', 'slug': 'sceletium-tortuosum', 'description': 'Known as Kanna, this South African succulent elevates mood and reduces anxiety. Used as a fermented chew.', 'region': 'South Africa', 'effects': ['euphoria', 'anxiolytic', 'social enhancer'], 'compounds': ['Mesembrine', 'Mesembrenone'], 'mechanismOfAction': 'SERT inhibition, PDE4 inhibition', 'tags': ['mood', 'euphoric', 'entactogen']}, {'name': 'Calea ternifolia', 'slug': 'calea-ternifolia', 'description': 'Mexican Dream Herb used in lucid dreaming rituals by the Chontal people. Bitter but effective in inducing hypnagogic visions.', 'region': 'Mexico', 'effects': ['lucid dreaming', 'hypnagogia', 'mental clarity'], 'compounds': ['Germacranolides'], 'mechanismOfAction': 'Unknown, possible cholinergic', 'tags': ['dream', 'visionary', 'ritual']}, {'name': 'Silene capensis', 'slug': 'silene-capensis', 'description': 'African Dream Root, revered by the Xhosa people for enhancing vivid and prophetic dreams.', 'region': 'Southern Africa', 'effects': ['vivid dreaming', 'trance', 'vision'], 'compounds': ['Triterpenoid saponins'], 'mechanismOfAction': 'Unknown, possibly cholinergic', 'tags': ['dream', 'African traditional', 'visionary']}, {'name': 'Tilia tomentosa', 'slug': 'tilia-tomentosa', 'description': 'Silver Linden, used as a calming tea in Europe. Shows sedative and anti-anxiety effects.', 'region': 'Europe', 'effects': ['calming', 'sleep aid', 'nervine'], 'compounds': ['Quercetin', 'Volatile oils'], 'mechanismOfAction': 'GABAergic, anti-inflammatory', 'tags': ['relaxing', 'tea', 'folk medicine']}, {'name': 'Tagetes lucida', 'slug': 'tagetes-lucida', 'description': 'Mexican Tarragon, used by the Aztecs and modern shamans as a mild psychedelic and incense.', 'region': 'Mexico', 'effects': ['euphoria', 'visionary', 'clarity'], 'compounds': ['Estragole', 'Anethole'], 'mechanismOfAction': 'Serotonergic and cholinergic', 'tags': ['ritual', 'psychoactive incense', 'traditional']}, {'name': 'Justicia pectoralis', 'slug': 'justicia-pectoralis', 'description': 'Known as tilo or chambá, this Amazonian herb is mildly relaxing and sometimes added to snuffs and brews.', 'region': 'Amazon basin', 'effects': ['relaxing', 'mild euphoria'], 'compounds': ['Coumarin', 'Umelliferone'], 'mechanismOfAction': 'GABAergic and serotonergic', 'tags': ['mild sedative', 'additive', 'traditional']}, {'name': 'Entada rheedii', 'slug': 'entada-rheedii', 'description': 'African Dream Bean, used to access ancestor spirits in dreams; seeds are large and traditionally worn as talismans.', 'region': 'Africa', 'effects': ['dream enhancement', 'spiritual connection'], 'compounds': ['Saponins'], 'mechanismOfAction': 'Unknown', 'tags': ['dream', 'ethnobotanical', 'ritual']}, {'name': 'Celastrus paniculatus', 'slug': 'celastrus-paniculatus', 'description': 'Intellect tree from Ayurveda; used to enhance memory and mental clarity, with mild stimulation.', 'region': 'India', 'effects': ['focus', 'mental clarity', 'calm alertness'], 'compounds': ['Celastrine', 'Paniculatin'], 'mechanismOfAction': 'Cholinergic', 'tags': ['nootropic', 'Ayurvedic', 'seed oil']}];



// ---- File: herbs.batch1.enriched.ts ----
import { Herb } from './types';

export const herbs: Herb[] = [
  {
    "id": "acacia-confusa",
    "name": "Acacia confusa",
    "slug": "acacia-confusa",
    "scientificName": "Acacia confusa",
    "category": "Psychedelic",
    "effects": [
      "Psychedelic",
      "Introspective",
      "Sedating"
    ],
    "description": "A root bark source of DMT and other tryptamines traditionally used in Pacific Island cultures.",
    "mechanismOfAction": "Contains N,N-DMT and related tryptamines; acts as a serotonergic psychedelic via 5-HT2A receptor agonism.",
    "pharmacokinetics": "Inactive orally unless taken with an MAOI. Smoked or brewed in analog ayahuasca preparations.",
    "therapeuticUses": "Exploration, visionary states, introspection. Not medically approved.",
    "sideEffects": "Nausea, anxiety, dissociation. Potentiated when used with MAOIs.",
    "contraindications": "Do not combine with SSRIs, MAOIs, or substances affecting serotonin. Not for use with heart or mental health conditions.",
    "drugInteractions": "Strong interaction with MAOIs. Risk of serotonin syndrome with SSRIs or other psychedelics.",
    "toxicity": "Not well studied. Risk primarily from MAOI co-administration.",
    "toxicityLD50": "Unknown",
    "preparation": "Root bark is shredded and either smoked or brewed with MAOIs like Syrian Rue.",
    "onset": "20\u201360 min (with MAOI)",
    "intensity": "Strong",
    "safetyRating": "low",
    "legalStatus": "DMT-containing; illegal in many jurisdictions.",
    "region": "Southeast Asia, Pacific Islands",
    "tags": [
      "\ud83c\udf3f Tryptamine",
      "\u26d4 MAOI-sensitive",
      "\ud83c\udf19 Visionary"
    ],
    "sources": [
      "https://erowid.org/plants/acacia_confusa/",
      "PubChem CID: 6089",
      "J Ethnopharmacol. 2005"
    ],
    "needsReview": false
  },
  {
    "id": "acacia-maidenii",
    "name": "Acacia maidenii",
    "slug": "acacia-maidenii",
    "scientificName": "Acacia maidenii",
    "category": "Psychedelic",
    "effects": [
      "Entheogenic",
      "Dream-like"
    ],
    "description": "An Australian Acacia species containing DMT and other tryptamines in its bark.",
    "mechanismOfAction": "Tryptamine alkaloids (primarily N,N-DMT) act as 5-HT2A receptor agonists producing psychedelic effects.",
    "pharmacokinetics": "Requires MAOI for oral activity; often used in ayahuasca analogues or vaporized.",
    "therapeuticUses": "Exploration, spiritual insight, not recognized for medical use.",
    "sideEffects": "Dizziness, confusion, nausea when combined with MAOIs.",
    "contraindications": "Avoid combining with antidepressants, stimulants, or cardiovascular medications.",
    "drugInteractions": "Dangerous with MAOIs or SSRIs. Risk of hypertensive crisis.",
    "toxicity": "Potentially toxic with improper MAOI use.",
    "toxicityLD50": "Unknown",
    "preparation": "Shredded bark brewed in ayahuasca-style tea or vaporized.",
    "onset": "30\u201360 min (with MAOI)",
    "intensity": "High",
    "safetyRating": "low",
    "legalStatus": "Controlled in many countries due to DMT.",
    "region": "Australia",
    "tags": [
      "\u26d4 Controlled",
      "\ud83c\udf3f Entheogen",
      "\ud83c\udf00 DMT"
    ],
    "sources": [
      "https://erowid.org/plants/acacia_maidenii/",
      "PubMed ID: 21798319"
    ],
    "needsReview": false
  },
  {
    "id": "acorus-calamus",
    "name": "Acorus calamus",
    "slug": "acorus-calamus",
    "scientificName": "Acorus calamus",
    "category": "Deliriant",
    "effects": [
      "Hallucinogenic",
      "Sedative",
      "Stimulant (low dose)"
    ],
    "description": "A marshland rhizome used in Ayurveda and folklore for its aromatic and psychoactive properties.",
    "mechanismOfAction": "Beta-asarone is a major active, possibly GABAergic and anticholinergic at high doses. Deliriant-like in excess.",
    "pharmacokinetics": "Orally active. Effects vary by subspecies (American vs. Asian).",
    "therapeuticUses": "Traditionally used for digestion, memory, and calming the mind.",
    "sideEffects": "Nausea, hallucinations, confusion at high doses.",
    "contraindications": "Pregnancy, epilepsy, liver disease.",
    "drugInteractions": "Unknown; caution with CNS depressants.",
    "toxicity": "Beta-asarone is carcinogenic in rodents. High doses may be neurotoxic.",
    "toxicityLD50": "1,230 mg/kg (rats, oral, beta-asarone)",
    "preparation": "Dried rhizome chewed or infused.",
    "onset": "1 hour",
    "intensity": "Mild\u2013Moderate",
    "safetyRating": "medium",
    "legalStatus": "Restricted or banned in some countries (e.g. USA)",
    "region": "Asia, North America, Europe",
    "tags": [
      "\ud83c\udf3f Root",
      "\ud83e\udde0 Nootropic",
      "\u26a0\ufe0f Deliriant"
    ],
    "sources": [
      "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6383205/",
      "PubChem CID: 73568"
    ],
    "needsReview": false
  }
];



// ---- File: herbs-batch25.ts ----
// Batch 25: Psychoactive Herbs

import { Herb } from '../types/herb';

export const herbsBatch25: Herb[] = [{'name': 'Acorus americanus', 'slug': 'acorus-americanus', 'description': 'American Sweet Flag, native to North America, used by indigenous groups for its psychoactive and stimulant properties.', 'region': 'North America', 'effects': ['alertness', 'mental clarity', 'mild euphoria'], 'compounds': ['Alpha-asarone'], 'mechanismOfAction': 'Cholinergic + dopaminergic modulation', 'tags': ['native medicine', 'calamus species', 'uplifting']}, {'name': 'Virola theiodora', 'slug': 'virola-theiodora', 'description': 'A South American tree whose resin contains potent tryptamines. Used in snuffs by Amazonian tribes.', 'region': 'Amazon Basin', 'effects': ['visionary', 'intense euphoria', 'dissociation'], 'compounds': ['DMT', '5-MeO-DMT'], 'mechanismOfAction': 'Serotonin receptor agonist (5-HT2A)', 'tags': ['snuff', 'shamanic', 'tryptamine']}, {'name': 'Ruta graveolens', 'slug': 'ruta-graveolens', 'description': 'Common Rue, used historically as a sedative, an abortifacient, and for spiritual protection.', 'region': 'Mediterranean', 'effects': ['relaxation', 'hypnotic', 'mystical'], 'compounds': ['Rutarin', 'Graveoline'], 'mechanismOfAction': 'GABA-A modulation, alkaloid effects', 'tags': ['ritual', 'bitter', 'traditional medicine']}, {'name': 'Arundo donax', 'slug': 'arundo-donax', 'description': 'Giant Reed contains trace tryptamines and has been proposed as an Ayahuasca analog component.', 'region': 'Mediterranean, Asia', 'effects': ['light euphoria', 'dreaminess'], 'compounds': ['DMT (trace)', 'Bufotenine (trace)'], 'mechanismOfAction': 'Serotonergic (possible)', 'tags': ['analogue', 'reed grass', 'entheogenic interest']}, {'name': 'Passiflora incarnata', 'slug': 'passiflora-incarnata', 'description': 'Passionflower is a mild sedative and anxiolytic with MAO-inhibiting flavonoids. Common in herbal teas.', 'region': 'North & Central America', 'effects': ['calming', 'dreamy', 'sedative'], 'compounds': ['Chrysin', 'Harmine (trace)'], 'mechanismOfAction': 'GABA-A agonist + mild MAOI', 'tags': ['sleep', 'relaxant', 'folk medicine']}, {'name': 'Sophora secundiflora', 'slug': 'sophora-secundiflora', 'description': 'Mescal bean, used ceremonially by Native American tribes. Highly toxic, formerly used as an ordeal poison.', 'region': 'Southwestern US, Mexico', 'effects': ['delirium', 'visions', 'dizziness'], 'compounds': ['Cytisine'], 'mechanismOfAction': 'Nicotinic receptor agonist', 'tags': ['ceremonial', 'toxic', 'visionary']}, {'name': 'Desmodium gangeticum', 'slug': 'desmodium-gangeticum', 'description': 'An Ayurvedic herb with antistress, adaptogenic, and cognitive benefits. Traditionally used to support vitality.', 'region': 'India, Southeast Asia', 'effects': ['calm clarity', 'adaptogenic', 'restorative'], 'compounds': ['Desmodin', 'Triterpenoids'], 'mechanismOfAction': 'Neuroprotective, serotonergic modulation', 'tags': ['Ayurvedic', 'tonic', 'mild nootropic']}, {'name': 'Acorus calamus var. angustatus', 'slug': 'acorus-calamus-angustatus', 'description': 'A rare calamus variant high in beta-asarone, used in Tibetan medicine and ritual incense.', 'region': 'Himalayas', 'effects': ['trance', 'mental clarity', 'light hallucinations'], 'compounds': ['Beta-asarone'], 'mechanismOfAction': 'GABAergic + cholinergic', 'tags': ['ritual', 'variant', 'aromatic stimulant']}, {'name': 'Convolvulus arvensis', 'slug': 'convolvulus-arvensis', 'description': 'Bindweed, a relative of morning glory, contains ergoline alkaloids and is under investigation for mild entheogenic potential.', 'region': 'Europe, North America', 'effects': ['light euphoria', 'subtle visual shifts'], 'compounds': ['Ergoline alkaloids (trace)'], 'mechanismOfAction': '5-HT2A agonist (potential)', 'tags': ['entheogen', 'ergoline', 'wild plant']}, {'name': 'Salvia sclarea', 'slug': 'salvia-sclarea', 'description': 'Clary Sage, used aromatically and medicinally for mild euphoria, hormonal balancing, and clarity.', 'region': 'Mediterranean', 'effects': ['clarity', 'relief', 'uplifting'], 'compounds': ['Linalyl acetate', 'Sclareol'], 'mechanismOfAction': 'GABA-A modulation, estrogenic activity', 'tags': ['aromatic', 'elevating', 'folk remedy']}];


