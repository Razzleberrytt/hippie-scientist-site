export interface CompoundEntry {
  name: string
  type: string
  description: string
  foundIn: string[]
  psychoactivity: string
  mechanismOfAction: string
}

export const compounds: CompoundEntry[] = [
  {
    "name": "5-MeO-DMT",
    "type": "tryptamine",
    "description": "A potent serotonergic compound with fast-acting dissociative and mystical effects.",
    "foundIn": [
      "Virola theiodora"
    ],
    "psychoactivity": "strong",
    "mechanismOfAction": "5-HT1A and 5-HT2A receptor agonist"
  },
  {
    "name": "Agnuside",
    "type": "iridoid glycoside",
    "description": "A dopaminergic compound in Chasteberry thought to influence hormonal balance and mood.",
    "foundIn": [
      "Vitex agnus-castus"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Dopaminergic + hormonal modulation"
  },
  {
    "name": "Alchorneine",
    "type": "Alkaloid",
    "effects": [
      "analgesic",
      "muscle relaxant"
    ],
    "foundIn": [
      "Alchornea castaneifolia"
    ]
  },
  {
    "name": "Alpha-asarone",
    "type": "phenylpropanoid",
    "description": "A psychoactive compound from Acorus species known for stimulant and cognition-enhancing effects.",
    "foundIn": [
      "Acorus americanus"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Cholinergic + dopaminergic modulation"
  },
  {
    "name": "Amorphigenin",
    "type": "rotenoid compound",
    "description": "A compound in Amorpha fruticosa with unclear psychoactivity, possibly relaxing or trance-inducing.",
    "foundIn": [
      "Amorpha fruticosa"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Possibly GABAergic"
  },
  {
    "name": "Anethole",
    "type": "phenylpropene",
    "description": "A mildly psychoactive aromatic compound found in herbs like Mexican tarragon and anise.",
    "foundIn": [
      "Tagetes lucida"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Cholinergic modulation"
  },
  {
    "name": "Anthocyanins",
    "type": "flavonoid",
    "description": "Antioxidant pigments responsible for roselle's red color.",
    "foundIn": [
      "Roselle"
    ],
    "psychoactivity": "none",
    "mechanismOfAction": "Antioxidant and vascular modulation"
  },
  {
    "name": "Aporphine",
    "type": "aporphine alkaloid",
    "description": "A dopamine agonist with sedative and euphoric effects found in Blue Lotus.",
    "foundIn": [
      "Nymphaea caerulea"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Dopamine receptor agonist"
  },
  {
    "name": "Asarone",
    "type": "phenylpropanoid",
    "description": "A bioactive component of Acorus species, structurally similar to psychoactive compounds and mildly sedative.",
    "foundIn": [
      "Acorus gramineus"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic modulation"
  },
  {
    "name": "Ascaridole",
    "type": "terpene",
    "description": "A monoterpene peroxide in Epazote, responsible for stimulant and toxic properties at high doses.",
    "foundIn": [
      "Dysphania ambrosioides"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "CNS stimulation (dose-dependent)"
  },
  {
    "name": "Atropine",
    "type": "Tropane alkaloid",
    "effects": [
      "deliriant",
      "pupil dilation",
      "anticholinergic"
    ],
    "foundIn": [
      "Datura metel"
    ]
  },
  {
    "name": "Bacosides A and B",
    "type": "triterpenoid saponins",
    "description": "Primary active nootropic agents in Bacopa, supporting memory, learning, and neuroplasticity.",
    "foundIn": [
      "Bacopa monnieri"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Cholinergic + neuroprotective"
  },
  {
    "name": "Baicalin",
    "type": "flavone glycoside",
    "description": "A GABAergic flavonoid in Skullcap responsible for its calming and anxiolytic properties.",
    "foundIn": [
      "Scutellaria lateriflora"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABA-A receptor modulation"
  },
  {
    "name": "Benzyl isothiocyanate",
    "type": "Isothiocyanate compound",
    "effects": [
      "expectorant",
      "stimulating",
      "antibacterial"
    ],
    "foundIn": [
      "Tropaeolum majus"
    ]
  },
  {
    "name": "Beta-Asarone",
    "type": "phenylpropanoid",
    "description": "A compound found in Acorus calamus with controversial stimulant and sedative properties depending on dose.",
    "foundIn": [
      "Acorus calamus"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Cholinergic and GABAergic modulation"
  },
  {
    "name": "Boldine",
    "type": "alkaloid",
    "description": "An antioxidant alkaloid in Boldo with sedative and hepatoprotective properties.",
    "foundIn": [
      "Peumus boldus"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Cholinergic + serotonergic"
  },
  {
    "name": "Bufotenine",
    "type": "tryptamine",
    "description": "Powerful visionary alkaloid found in several snuff seeds.",
    "foundIn": [
      "Anadenanthera colubrina",
      "Anadenanthera peregrina"
    ],
    "psychoactivity": "strong",
    "mechanismOfAction": "5-HT2A and 5-HT1A receptor agonist"
  },
  {
    "name": "Caffeine",
    "type": "xanthine",
    "description": "Central nervous system stimulant found in tea and coffee.",
    "foundIn": [
      "Camellia sinensis"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Adenosine receptor antagonist"
  },
  {
    "name": "Camphor",
    "type": "terpenoid",
    "description": "An aromatic terpenoid with mild stimulant and decongestant effects, present in Mugwort and other herbs.",
    "foundIn": [
      "Artemisia vulgaris"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "TRP channel modulation"
  },
  {
    "name": "Casimiroin",
    "type": "Coumarin",
    "effects": [
      "sedative",
      "mood stabilizing"
    ],
    "foundIn": [
      "Casimiroa edulis"
    ]
  },
  {
    "name": "Catechins",
    "type": "Flavonoids",
    "effects": [
      "antioxidant",
      "calming"
    ],
    "foundIn": [
      "Byrsonima crassifolia"
    ]
  },
  {
    "name": "Catuabine",
    "type": "alkaloid",
    "description": "Putative aphrodisiac alkaloid from catuaba bark.",
    "foundIn": [
      "Catuaba"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Dopaminergic modulation"
  },
  {
    "name": "CBD",
    "type": "cannabinoid",
    "description": "Non-intoxicating cannabinoid with broad therapeutic potential.",
    "foundIn": [
      "Cannabis sativa"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Modulates endocannabinoid receptors and serotonin 5-HT1A"
  },
  {
    "name": "Celastrine",
    "type": "alkaloid",
    "description": "A nootropic compound found in Celastrus paniculatus (Intellect tree), used to improve memory and clarity.",
    "foundIn": [
      "Celastrus paniculatus"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Cholinergic enhancement"
  },
  {
    "name": "Chlorogenic acid",
    "type": "Polyphenol",
    "effects": [
      "stimulant",
      "neuroprotective"
    ],
    "foundIn": [
      "Ilex paraguariensis"
    ]
  },
  {
    "name": "Chrysin",
    "type": "flavonoid",
    "description": "A bioflavonoid with anxiolytic and MAO-inhibiting properties found in Passionflower.",
    "foundIn": [
      "Passiflora incarnata"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABA-A agonist + MAOI"
  },
  {
    "name": "Cineole",
    "type": "Monoterpene",
    "effects": [
      "clarity",
      "stimulating",
      "antibacterial"
    ],
    "foundIn": [
      "Salvia apiana"
    ]
  },
  {
    "name": "Cissamine",
    "type": "Alkaloid",
    "effects": [
      "antispasmodic",
      "analgesic"
    ],
    "foundIn": [
      "Cissampelos pareira"
    ]
  },
  {
    "name": "Citral",
    "type": "monoterpene aldehyde",
    "description": "A lemon-scented terpene with calming and mood-brightening effects.",
    "foundIn": [
      "Melissa officinalis"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABA-T inhibition + serotonergic"
  },
  {
    "name": "Combretin",
    "type": "Lignan compound",
    "effects": [
      "focus",
      "cognitive enhancement"
    ],
    "foundIn": [
      "Combretum quadrangulare"
    ]
  },
  {
    "name": "Combretol",
    "type": "Flavonoid",
    "effects": [
      "energizing",
      "stimulant"
    ],
    "foundIn": [
      "Combretum quadrangulare"
    ]
  },
  {
    "name": "Coumarin",
    "type": "benzopyrone",
    "description": "A fragrant compound with sedative and anticoagulant properties found in Justicia pectoralis.",
    "foundIn": [
      "Justicia pectoralis"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic modulation"
  },
  {
    "name": "Cryogenine",
    "type": "alkaloid",
    "description": "A sedating alkaloid found in Heimia salicifolia, known for its auditory distortion and calm-inducing properties.",
    "foundIn": [
      "Heimia salicifolia"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic modulation"
  },
  {
    "name": "Cytisine",
    "type": "alkaloid",
    "description": "A toxic yet psychoactive compound that acts on nicotinic receptors; found in Mescal bean.",
    "foundIn": [
      "Sophora secundiflora"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Nicotinic receptor agonist"
  },
  {
    "name": "Damianin",
    "type": "terpenoid",
    "description": "A compound from Damiana associated with mood-enhancing and aphrodisiac properties.",
    "foundIn": [
      "Turnera diffusa var. aphrodisiaca"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Dopaminergic stimulation + GABA synergy"
  },
  {
    "name": "Desfontainin",
    "type": "Alkaloid",
    "effects": [
      "deliriant",
      "sedative"
    ],
    "foundIn": [
      "Desfontainia spinosa"
    ]
  },
  {
    "name": "Desmodin",
    "type": "alkaloid",
    "description": "An alkaloid compound with neuroprotective and adaptogenic properties found in Desmodium.",
    "foundIn": [
      "Desmodium gangeticum"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Neuroprotective + serotonergic modulation"
  },
  {
    "name": "DMT",
    "type": "tryptamine",
    "description": "Powerful short-acting psychedelic present in many plants.",
    "foundIn": [
      "Acacia maidenii",
      "Anadenanthera peregrina"
    ],
    "psychoactivity": "strong",
    "mechanismOfAction": "Serotonin 5-HT2A receptor agonist"
  },
  {
    "name": "Elaeagnin",
    "type": "Alkaloid",
    "effects": [
      "sedative",
      "anxiolytic"
    ],
    "foundIn": [
      "Elaeagnus angustifolia"
    ]
  },
  {
    "name": "Elemicin",
    "type": "phenylpropene",
    "description": "Another psychoactive compound in Nutmeg, structurally related to mescaline.",
    "foundIn": [
      "Myristica fragrans"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Anticholinergic + serotonergic"
  },
  {
    "name": "Eleutherosides",
    "type": "glycosides",
    "description": "A group of adaptogenic compounds found in Siberian Ginseng with neuroprotective properties.",
    "foundIn": [
      "Eleutherococcus senticosus"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Adaptogenic + neuroregulatory"
  },
  {
    "name": "Elsholtzia ketone",
    "type": "Ketone compound",
    "effects": [
      "digestive aid",
      "uplifting"
    ],
    "foundIn": [
      "Elsholtzia ciliata"
    ]
  },
  {
    "name": "Ergoline alkaloids (trace)",
    "type": "ergoline",
    "description": "Ergoline derivatives possibly present in Bindweed, structurally related to LSD precursors.",
    "foundIn": [
      "Convolvulus arvensis"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "5-HT2A receptor activity"
  },
  {
    "name": "Ergotamine",
    "type": "ergoline",
    "description": "Potent vasoconstrictor alkaloid from ergot fungus.",
    "foundIn": [
      "Claviceps purpurea"
    ],
    "psychoactivity": "strong",
    "mechanismOfAction": "Partial agonist at serotonin and adrenergic receptors"
  },
  {
    "name": "Essential oils",
    "type": "volatile blend",
    "description": "A mixture of bioactive volatile compounds used in rituals and aromatherapy with psychoactive potential.",
    "foundIn": [
      "Helichrysum odoratissimum"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Aromatherapy + serotonergic modulation"
  },
  {
    "name": "Estragole",
    "type": "phenylpropene",
    "description": "A sweet-smelling compound with mild psychoactive effects, found in Tagetes lucida.",
    "foundIn": [
      "Tagetes lucida"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Serotonergic + cholinergic activity"
  },
  {
    "name": "Eugenol",
    "type": "phenylpropene",
    "description": "A fragrant oil with calming and mildly euphoric properties found in allspice and clove.",
    "foundIn": [
      "Pimenta dioica"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic + serotonergic modulation"
  },
  {
    "name": "Farnesol",
    "type": "Sesquiterpenoid",
    "effects": [
      "calming",
      "aromatic"
    ],
    "foundIn": [
      "Tilia europaea"
    ]
  },
  {
    "name": "Flavonoids",
    "type": "polyphenol",
    "description": "A broad group of antioxidant compounds with mood-modulating and sedative effects.",
    "foundIn": [
      "Turnera diffusa var. aphrodisiaca",
      "Helichrysum odoratissimum"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Neuroprotective + receptor modulation"
  },
  {
    "name": "Fragarine",
    "type": "Alkaloid",
    "effects": [
      "uterine tonic",
      "muscle relaxant"
    ],
    "foundIn": [
      "Rubus idaeus"
    ]
  },
  {
    "name": "Furanocoumarins",
    "type": "Coumarin derivative",
    "effects": [
      "calming",
      "UV reactive"
    ],
    "foundIn": [
      "Ficus religiosa"
    ]
  },
  {
    "name": "Galbulimimine",
    "type": "Alkaloid",
    "effects": [
      "dreamy",
      "deliriant"
    ],
    "foundIn": [
      "Galbulimima belgraveana"
    ]
  },
  {
    "name": "Germacranolides",
    "type": "sesquiterpene lactone",
    "description": "Bitter-tasting compounds in Calea ternifolia associated with oneirogenic effects.",
    "foundIn": [
      "Calea ternifolia"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Unknown, possibly cholinergic"
  },
  {
    "name": "Graveoline",
    "type": "alkaloid",
    "description": "An alkaloid from Rue associated with sedative and possible antispasmodic effects.",
    "foundIn": [
      "Ruta graveolens"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Unclear, likely GABAergic"
  },
  {
    "name": "Gymnemic Acids",
    "type": "triterpenoid",
    "description": "Sweetness-suppressing compounds used for blood sugar control.",
    "foundIn": [
      "Gymnema sylvestre"
    ],
    "psychoactivity": "none",
    "mechanismOfAction": "Block sweet receptors and reduce glucose absorption"
  },
  {
    "name": "Harmala alkaloids",
    "type": "Beta-carboline alkaloids",
    "effects": [
      "MAOI",
      "visionary",
      "dream enhancing"
    ],
    "foundIn": [
      "Nicotiana rustica"
    ]
  },
  {
    "name": "Harmine",
    "type": "alkaloid",
    "description": "Beta-carboline MAOI that potentiates tryptamines.",
    "foundIn": [
      "Banisteriopsis caapi",
      "Syrian Rue"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Reversible MAO-A inhibitor"
  },
  {
    "name": "Harmine (trace)",
    "type": "beta-carboline",
    "description": "A reversible MAOI found in low levels in Passionflower, structurally related to compounds in Ayahuasca.",
    "foundIn": [
      "Passiflora incarnata"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "MAO-A inhibition"
  },
  {
    "name": "Himbacine",
    "type": "Alkaloid",
    "effects": [
      "hallucinogenic",
      "anticholinergic"
    ],
    "foundIn": [
      "Galbulimima belgraveana"
    ]
  },
  {
    "name": "Huperzine A",
    "type": "alkaloid",
    "description": "A potent acetylcholinesterase inhibitor that enhances memory and dream lucidity.",
    "foundIn": [
      "Huperzia serrata"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Acetylcholinesterase inhibition"
  },
  {
    "name": "Ibogaine",
    "type": "alkaloid",
    "description": "Psychedelic indole alkaloid used in addiction treatment rituals.",
    "foundIn": [
      "Iboga"
    ],
    "psychoactivity": "strong",
    "mechanismOfAction": "Serotonin and NMDA modulation"
  },
  {
    "name": "Ibotenic Acid",
    "type": "isoxazole",
    "description": "Neuroactive amino acid that converts to muscimol when heated.",
    "foundIn": [
      "Amanita muscaria"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Glutamate receptor agonist"
  },
  {
    "name": "Iridoids",
    "type": "glycoside",
    "description": "Bioactive compounds with anti-inflammatory and nervine properties, often used in traditional herbalism.",
    "foundIn": [
      "Mitchella repens"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Calming central nervous system modulation"
  },
  {
    "name": "Isopetasin",
    "type": "Sesquiterpene",
    "effects": [
      "antispasmodic",
      "analgesic"
    ],
    "foundIn": [
      "Petasites hybridus"
    ]
  },
  {
    "name": "Kaempferol",
    "type": "Flavonoid",
    "effects": [
      "anti-inflammatory",
      "neuroprotective"
    ],
    "foundIn": [
      "Tilia europaea"
    ]
  },
  {
    "name": "Lactucin",
    "type": "sesquiterpene lactone",
    "description": "Mildly psychoactive compound in Wild Lettuce contributing to its calming effects.",
    "foundIn": [
      "Lactuca virosa"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Opioid receptor modulation"
  },
  {
    "name": "Lactucopicrin",
    "type": "sesquiterpene lactone",
    "description": "A bitter compound in Wild Lettuce associated with sedative and analgesic effects.",
    "foundIn": [
      "Lactuca virosa"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Opioid receptor modulation"
  },
  {
    "name": "Leonurine",
    "type": "alkaloid",
    "description": "An alkaloid found in Leonurus sibiricus with relaxing and dopaminergic effects.",
    "foundIn": [
      "Leonurus sibiricus"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Dopamine receptor modulation"
  },
  {
    "name": "Linalyl acetate",
    "type": "ester",
    "description": "A fragrant ester found in clary sage, with mood-lifting and calming effects.",
    "foundIn": [
      "Salvia sclarea"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic + aromatherapeutic"
  },
  {
    "name": "LSA (Lysergic Acid Amide)",
    "type": "Ergoline alkaloid",
    "effects": [
      "psychedelic",
      "visual enhancement",
      "dreamlike"
    ],
    "foundIn": [
      "Argyreia nervosa"
    ]
  },
  {
    "name": "Lupeol",
    "type": "Triterpenoid",
    "effects": [
      "anti-inflammatory",
      "antioxidant"
    ],
    "foundIn": [
      "Tamarindus indica"
    ]
  },
  {
    "name": "Lyfoline",
    "type": "Alkaloid",
    "effects": [
      "mild sedative"
    ],
    "foundIn": [
      "Heimia salicifolia"
    ]
  },
  {
    "name": "Marmelosin",
    "type": "coumarin",
    "description": "Coumarin derivative contributing to Aegle marmelos activity.",
    "foundIn": [
      "Aegle marmelos"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Unclear; mild sedative and digestive aid"
  },
  {
    "name": "Marrubiin",
    "type": "diterpenoid",
    "description": "Bitter expectorant compound from horehound.",
    "foundIn": [
      "White Horehound"
    ],
    "psychoactivity": "none",
    "mechanismOfAction": "Stimulates bronchial secretions"
  },
  {
    "name": "Mescaline",
    "type": "alkaloid",
    "description": "A psychedelic phenethylamine found in certain cactus species.",
    "foundIn": [
      "Peyote",
      "Echinopsis pachanoi"
    ],
    "psychoactivity": "strong",
    "mechanismOfAction": "5-HT2A receptor agonist"
  },
  {
    "name": "Mesembrenone",
    "type": "alkaloid",
    "description": "A mood-lifting alkaloid in Kanna, shown to inhibit PDE4 and increase dopaminergic tone.",
    "foundIn": [
      "Sceletium tortuosum"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "PDE4 inhibition"
  },
  {
    "name": "Mesembrine",
    "type": "alkaloid",
    "description": "Serotonin reuptake inhibitor found in kanna.",
    "foundIn": [
      "Kanna"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Serotonin transporter inhibition"
  },
  {
    "name": "Methyl salicylate",
    "type": "ester",
    "description": "An aromatic compound with anti-inflammatory and uplifting properties found in birch and violet.",
    "foundIn": [
      "Betula lenta",
      "Viola odorata"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Anti-inflammatory + serotonergic"
  },
  {
    "name": "Muscimol",
    "type": "isoxazole",
    "description": "Sedative-hypnotic compound in Amanita muscaria.",
    "foundIn": [
      "Amanita muscaria"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "GABA_A receptor agonist"
  },
  {
    "name": "Myristicin",
    "type": "phenylpropene",
    "description": "A deliriant and hallucinogenic compound in Nutmeg, psychoactive at high doses.",
    "foundIn": [
      "Myristica fragrans"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "MAOI + anticholinergic"
  },
  {
    "name": "Neferine",
    "type": "Aporphine alkaloid",
    "effects": [
      "sedative",
      "calming",
      "aphrodisiac"
    ],
    "foundIn": [
      "Nelumbo nucifera"
    ]
  },
  {
    "name": "Nepetalactone",
    "type": "iridoid monoterpene",
    "description": "Primary compound in Catnip with calming, euphoric, and slightly hallucinogenic effects in animals and mild effects in humans.",
    "foundIn": [
      "Nepeta cataria"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic + olfactory"
  },
  {
    "name": "Nicotine",
    "type": "Alkaloid",
    "effects": [
      "stimulant",
      "psychoactive",
      "addictive"
    ],
    "foundIn": [
      "Nicotiana rustica"
    ]
  },
  {
    "name": "Nuciferine",
    "type": "Aporphine alkaloid",
    "effects": [
      "sedative",
      "antipsychotic",
      "dopamine antagonist"
    ],
    "foundIn": [
      "Nymphaea caerulea"
    ]
  },
  {
    "name": "p-Cymene",
    "type": "terpene",
    "description": "A naturally occurring aromatic terpene with stimulant and antioxidant properties.",
    "foundIn": [
      "Dysphania ambrosioides"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Neurostimulant and antioxidant effects"
  },
  {
    "name": "Paniculatin",
    "type": "alkaloid",
    "description": "One of the active components of Celastrus paniculatus, believed to promote alert calmness and mental energy.",
    "foundIn": [
      "Celastrus paniculatus"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Cholinergic activity"
  },
  {
    "name": "Pareirine",
    "type": "Isoquinoline alkaloid",
    "effects": [
      "sedative",
      "muscle relaxant"
    ],
    "foundIn": [
      "Cissampelos pareira"
    ]
  },
  {
    "name": "Patchoulol",
    "type": "sesquiterpene alcohol",
    "description": "A main compound in Patchouli oil with grounding, relaxing properties in aromatherapy.",
    "foundIn": [
      "Pogostemon cablin"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Aromatherapeutic + serotonergic"
  },
  {
    "name": "Pellitorine",
    "type": "Alkylamide",
    "effects": [
      "tingling",
      "local anesthetic"
    ],
    "foundIn": [
      "Zanthoxylum clava-herculis"
    ]
  },
  {
    "name": "Perillaldehyde",
    "type": "terpenoid",
    "description": "An aromatic compound found in Perilla leaf with uplifting and calming properties.",
    "foundIn": [
      "Perilla frutescens"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Cholinergic activation"
  },
  {
    "name": "Petasin",
    "type": "sesquiterpene",
    "description": "A compound in Butterbur used to relieve headaches and anxiety through smooth muscle relaxation.",
    "foundIn": [
      "Petasites hybridus"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Smooth muscle relaxant + serotonergic"
  },
  {
    "name": "Quercetin",
    "type": "flavonoid",
    "description": "An antioxidant flavonoid with calming and neuroprotective properties.",
    "foundIn": [
      "Tilia tomentosa"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Anti-inflammatory + GABAergic support"
  },
  {
    "name": "Rosmarinic acid",
    "type": "polyphenol",
    "description": "An anxiolytic compound in lemon balm with antioxidant and calming effects.",
    "foundIn": [
      "Melissa officinalis"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic + anti-inflammatory"
  },
  {
    "name": "Rosmarinic Acid",
    "type": "phenolic acid",
    "description": "An antioxidant and mood-stabilizing compound found in Perilla and other herbs.",
    "foundIn": [
      "Perilla frutescens"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Cholinergic + anti-inflammatory"
  },
  {
    "name": "Rutarin",
    "type": "alkaloid",
    "description": "A bitter alkaloid in Ruta graveolens, traditionally used for sedative and mystical purposes.",
    "foundIn": [
      "Ruta graveolens"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABA-A modulation"
  },
  {
    "name": "Safrole",
    "type": "phenylpropene",
    "description": "Aromatic precursor to several psychoactive syntheses.",
    "foundIn": [
      "Mexican Pepperleaf"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Weak interaction with dopamine and serotonin systems"
  },
  {
    "name": "Sanshools",
    "type": "Alkylamide",
    "effects": [
      "tingling",
      "sensory enhancement"
    ],
    "foundIn": [
      "Zanthoxylum clava-herculis"
    ]
  },
  {
    "name": "Saponins",
    "type": "glycoside",
    "description": "A class of plant glycosides with soothing and adaptogenic properties, found in Mitchella repens.",
    "foundIn": [
      "Mitchella repens"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Smooth muscle modulation"
  },
  {
    "name": "Sclareol",
    "type": "diterpene alcohol",
    "description": "A compound from clary sage with mild euphoria, possible hormonal modulation, and relaxing effects.",
    "foundIn": [
      "Salvia sclarea"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Estrogenic + GABAergic activity"
  },
  {
    "name": "Scopolamine",
    "type": "Tropane alkaloid",
    "effects": [
      "hallucinations",
      "amnesia",
      "delirium"
    ],
    "foundIn": [
      "Datura metel"
    ]
  },
  {
    "name": "Scutellarin",
    "type": "Flavonoid",
    "effects": [
      "sedative",
      "vasodilatory"
    ],
    "foundIn": [
      "Scutellaria lateriflora"
    ]
  },
  {
    "name": "Stachydrine",
    "type": "Betaine compound",
    "effects": [
      "uterotonic",
      "cardiotonic"
    ],
    "foundIn": [
      "Leonurus cardiaca"
    ]
  },
  {
    "name": "Tartaric acid",
    "type": "Organic acid",
    "effects": [
      "digestive",
      "antioxidant"
    ],
    "foundIn": [
      "Tamarindus indica"
    ]
  },
  {
    "name": "Tetrahydropalmatine (THP)",
    "type": "Isoquinoline alkaloid",
    "effects": [
      "sedative",
      "dopamine antagonist",
      "pain relief"
    ],
    "foundIn": [
      "Corydalis yanhusuo"
    ]
  },
  {
    "name": "THC",
    "type": "cannabinoid",
    "description": "Primary intoxicating compound in Cannabis.",
    "foundIn": [
      "Cannabis sativa"
    ],
    "psychoactivity": "strong",
    "mechanismOfAction": "CB1 receptor agonist"
  },
  {
    "name": "Thujone",
    "type": "terpene",
    "description": "GABA-blocking monoterpene notable in wormwood and yarrow.",
    "foundIn": [
      "Yarrow"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABA_A receptor antagonist"
  },
  {
    "name": "Thymol",
    "type": "monoterpene phenol",
    "description": "An aromatic compound from thyme with stimulating and antimicrobial effects.",
    "foundIn": [
      "Thymus vulgaris"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "AChE inhibition"
  },
  {
    "name": "Tiliroside",
    "type": "flavonoid glycoside",
    "description": "A calming compound in Linden with antioxidant and mild GABAergic activity.",
    "foundIn": [
      "Tilia europaea"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic + antioxidant"
  },
  {
    "name": "Triterpenoid saponins",
    "type": "saponin",
    "description": "Bioactive glycosides found in dream herbs like Silene capensis, often linked to vivid dreaming.",
    "foundIn": [
      "Silene capensis"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Unknown"
  },
  {
    "name": "Triterpenoids",
    "type": "triterpene",
    "description": "Compounds with anti-inflammatory and tonic properties found in Desmodium species.",
    "foundIn": [
      "Desmodium gangeticum"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Anti-inflammatory, adaptogenic"
  },
  {
    "name": "Tussilagone",
    "type": "sesquiterpene",
    "description": "A compound in Coltsfoot with antitussive and calming properties.",
    "foundIn": [
      "Tussilago farfara"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Smooth muscle relaxation"
  },
  {
    "name": "Tynanthin",
    "type": "Phenolic compound",
    "effects": [
      "aphrodisiac",
      "digestive"
    ],
    "foundIn": [
      "Tynanthus panurensis"
    ]
  },
  {
    "name": "Umelliferone",
    "type": "coumarin derivative",
    "description": "A bioactive coumarin compound found in Justicia pectoralis, with possible serotonergic action.",
    "foundIn": [
      "Justicia pectoralis"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Serotonergic modulation"
  },
  {
    "name": "Valeranon",
    "type": "sesquiterpene",
    "description": "Calming terpene occurring in valerian species.",
    "foundIn": [
      "Indian Valerian"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "May modulate GABA receptors"
  },
  {
    "name": "Vasicine",
    "type": "quinazoline alkaloid",
    "description": "A bronchodilator and mild sedative found in Justicia adhatoda.",
    "foundIn": [
      "Justicia adhatoda"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Bronchodilation + GABAergic"
  },
  {
    "name": "Verbascoside",
    "type": "phenylpropanoid glycoside",
    "description": "A calming antioxidant compound with potential mood-brightening effects found in Lemon Verbena.",
    "foundIn": [
      "Aloysia citrodora"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic + serotonergic"
  },
  {
    "name": "Verbenalin",
    "type": "glycoside",
    "description": "Sedative iridoid glycoside from Verbena officinalis.",
    "foundIn": [
      "Vervain"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic modulation"
  },
  {
    "name": "Violine",
    "type": "alkaloid",
    "description": "A compound in Sweet Violet with sedative and mildly hypnotic effects.",
    "foundIn": [
      "Viola odorata"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "GABAergic"
  },
  {
    "name": "Voacangine",
    "type": "Indole alkaloid",
    "effects": [
      "visionary",
      "psychoactive"
    ],
    "foundIn": [
      "Tabernaemontana undulata"
    ]
  },
  {
    "name": "Volatile oils",
    "type": "essential oil blend",
    "description": "Aromatic oils in Tilia and other herbs that promote calm through olfactory and chemical pathways.",
    "foundIn": [
      "Tilia tomentosa"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Aromatherapy + mild sedation"
  },
  {
    "name": "Volatile oils (Anthopogon)",
    "type": "Essential oils",
    "effects": [
      "aromatherapeutic",
      "clarity",
      "uplifting"
    ],
    "foundIn": [
      "Rhododendron anthopogon"
    ]
  },
  {
    "name": "Zanthoxylin",
    "type": "alkylamide",
    "description": "A numbing and tingling agent in the Toothache Tree with mild sensory effects.",
    "foundIn": [
      "Zanthoxylum clava-herculis"
    ],
    "psychoactivity": "mild",
    "mechanismOfAction": "Local anesthetic"
  },
  {
    "name": "Zapotin",
    "type": "flavonoid",
    "description": "A sedating flavonoid compound from Casimiroa edulis used in traditional medicine for insomnia.",
    "foundIn": [
      "Casimiroa edulis"
    ],
    "psychoactivity": "moderate",
    "mechanismOfAction": "Possibly GABAergic"
  }
]

export default compounds
