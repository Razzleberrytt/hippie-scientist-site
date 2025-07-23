import type { Compound } from "../types";

export const newCompounds: Compound[] = [
{
  name: "Cryogenine",
  type: "alkaloid",
  description: "A sedating alkaloid found in Heimia salicifolia, known for its auditory distortion and calm-inducing properties.",
  foundIn: [
    "Heimia salicifolia",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic modulation",
},
{
  name: "Beta-Asarone",
  type: "phenylpropanoid",
  description: "A compound found in Acorus calamus with controversial stimulant and sedative properties depending on dose.",
  foundIn: [
    "Acorus calamus",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "Cholinergic and GABAergic modulation",
},
{
  name: "Leonurine",
  type: "alkaloid",
  description: "An alkaloid found in Leonurus sibiricus with relaxing and dopaminergic effects.",
  foundIn: [
    "Leonurus sibiricus",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Dopamine receptor modulation",
},
{
  name: "Ascaridole",
  type: "terpene",
  description: "A monoterpene peroxide in Epazote, responsible for stimulant and toxic properties at high doses.",
  foundIn: [
    "Dysphania ambrosioides",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "CNS stimulation (dose-dependent)",
},
{
  name: "p-Cymene",
  type: "terpene",
  description: "A naturally occurring aromatic terpene with stimulant and antioxidant properties.",
  foundIn: [
    "Dysphania ambrosioides",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Neurostimulant and antioxidant effects",
},
{
  name: "Zapotin",
  type: "flavonoid",
  description: "A sedating flavonoid compound from Casimiroa edulis used in traditional medicine for insomnia.",
  foundIn: [
    "Casimiroa edulis",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "Possibly GABAergic",
},
{
  name: "Saponins",
  type: "glycoside",
  description: "A class of plant glycosides with soothing and adaptogenic properties, found in Mitchella repens.",
  foundIn: [
    "Mitchella repens",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Smooth muscle modulation",
},
{
  name: "Iridoids",
  type: "glycoside",
  description: "Bioactive compounds with anti-inflammatory and nervine properties, often used in traditional herbalism.",
  foundIn: [
    "Mitchella repens",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Calming central nervous system modulation",
},
{
  name: "Perillaldehyde",
  type: "terpenoid",
  description: "An aromatic compound found in Perilla leaf with uplifting and calming properties.",
  foundIn: [
    "Perilla frutescens",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Cholinergic activation",
},
{
  name: "Rosmarinic Acid",
  type: "phenolic acid",
  description: "An antioxidant and mood-stabilizing compound found in Perilla and other herbs.",
  foundIn: [
    "Perilla frutescens",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Cholinergic + anti-inflammatory",
},
{
  name: "Damianin",
  type: "terpenoid",
  description: "A compound from Damiana associated with mood-enhancing and aphrodisiac properties.",
  foundIn: [
    "Turnera diffusa var. aphrodisiaca",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "Dopaminergic stimulation + GABA synergy",
},
{
  name: "Flavonoids",
  type: "polyphenol",
  description: "A broad group of antioxidant compounds with mood-modulating and sedative effects.",
  foundIn: [
    "Turnera diffusa var. aphrodisiaca",
    "Helichrysum odoratissimum",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Neuroprotective + receptor modulation",
},
{
  name: "Thymol",
  type: "monoterpene phenol",
  description: "An aromatic compound from thyme with stimulating and antimicrobial effects.",
  foundIn: [
    "Thymus vulgaris",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "AChE inhibition",
},
{
  name: "Essential oils",
  type: "volatile blend",
  description: "A mixture of bioactive volatile compounds used in rituals and aromatherapy with psychoactive potential.",
  foundIn: [
    "Helichrysum odoratissimum",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Aromatherapy + serotonergic modulation",
},
{
  name: "Thujone",
  type: "monoterpene ketone",
  description: "A GABA receptor antagonist found in Mugwort and Wormwood, known for its psychoactive and convulsant potential.",
  foundIn: [
    "Artemisia vulgaris",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "GABA-A receptor antagonism",
},
{
  name: "Camphor",
  type: "terpenoid",
  description: "An aromatic terpenoid with mild stimulant and decongestant effects, present in Mugwort and other herbs.",
  foundIn: [
    "Artemisia vulgaris",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "TRP channel modulation",
},
{
  name: "Asarone",
  type: "phenylpropanoid",
  description: "A bioactive component of Acorus species, structurally similar to psychoactive compounds and mildly sedative.",
  foundIn: [
    "Acorus gramineus",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic modulation",
},
{
  name: "Mesembrine",
  type: "alkaloid",
  description: "The primary alkaloid in Sceletium tortuosum (Kanna), acting as a serotonin reuptake inhibitor and mood enhancer.",
  foundIn: [
    "Sceletium tortuosum",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "SERT inhibition",
},
{
  name: "Mesembrenone",
  type: "alkaloid",
  description: "A mood-lifting alkaloid in Kanna, shown to inhibit PDE4 and increase dopaminergic tone.",
  foundIn: [
    "Sceletium tortuosum",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "PDE4 inhibition",
},
{
  name: "Germacranolides",
  type: "sesquiterpene lactone",
  description: "Bitter-tasting compounds in Calea ternifolia associated with oneirogenic effects.",
  foundIn: [
    "Calea ternifolia",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Unknown, possibly cholinergic",
},
{
  name: "Triterpenoid saponins",
  type: "saponin",
  description: "Bioactive glycosides found in dream herbs like Silene capensis, often linked to vivid dreaming.",
  foundIn: [
    "Silene capensis",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Unknown",
},
{
  name: "Quercetin",
  type: "flavonoid",
  description: "An antioxidant flavonoid with calming and neuroprotective properties.",
  foundIn: [
    "Tilia tomentosa",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Anti-inflammatory + GABAergic support",
},
{
  name: "Volatile oils",
  type: "essential oil blend",
  description: "Aromatic oils in Tilia and other herbs that promote calm through olfactory and chemical pathways.",
  foundIn: [
    "Tilia tomentosa",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Aromatherapy + mild sedation",
},
{
  name: "Estragole",
  type: "phenylpropene",
  description: "A sweet-smelling compound with mild psychoactive effects, found in Tagetes lucida.",
  foundIn: [
    "Tagetes lucida",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Serotonergic + cholinergic activity",
},
{
  name: "Anethole",
  type: "phenylpropene",
  description: "A mildly psychoactive aromatic compound found in herbs like Mexican tarragon and anise.",
  foundIn: [
    "Tagetes lucida",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Cholinergic modulation",
},
{
  name: "Coumarin",
  type: "benzopyrone",
  description: "A fragrant compound with sedative and anticoagulant properties found in Justicia pectoralis.",
  foundIn: [
    "Justicia pectoralis",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic modulation",
},
{
  name: "Umelliferone",
  type: "coumarin derivative",
  description: "A bioactive coumarin compound found in Justicia pectoralis, with possible serotonergic action.",
  foundIn: [
    "Justicia pectoralis",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Serotonergic modulation",
},
{
  name: "Celastrine",
  type: "alkaloid",
  description: "A nootropic compound found in Celastrus paniculatus (Intellect tree), used to improve memory and clarity.",
  foundIn: [
    "Celastrus paniculatus",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Cholinergic enhancement",
},
{
  name: "Paniculatin",
  type: "alkaloid",
  description: "One of the active components of Celastrus paniculatus, believed to promote alert calmness and mental energy.",
  foundIn: [
    "Celastrus paniculatus",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Cholinergic activity",
},
{
  name: "Alpha-asarone",
  type: "phenylpropanoid",
  description: "A psychoactive compound from Acorus species known for stimulant and cognition-enhancing effects.",
  foundIn: [
    "Acorus americanus",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Cholinergic + dopaminergic modulation",
},
{
  name: "DMT",
  type: "tryptamine",
  description: "A powerful serotonergic psychedelic found in Virola and numerous other plants.",
  foundIn: [
    "Virola theiodora",
  ],
  psychoactivity: "strong",
  mechanismOfAction: "5-HT2A receptor agonist",
},
{
  name: "5-MeO-DMT",
  type: "tryptamine",
  description: "A potent serotonergic compound with fast-acting dissociative and mystical effects.",
  foundIn: [
    "Virola theiodora",
  ],
  psychoactivity: "strong",
  mechanismOfAction: "5-HT1A and 5-HT2A receptor agonist",
},
{
  name: "Rutarin",
  type: "alkaloid",
  description: "A bitter alkaloid in Ruta graveolens, traditionally used for sedative and mystical purposes.",
  foundIn: [
    "Ruta graveolens",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABA-A modulation",
},
{
  name: "Graveoline",
  type: "alkaloid",
  description: "An alkaloid from Rue associated with sedative and possible antispasmodic effects.",
  foundIn: [
    "Ruta graveolens",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Unclear, likely GABAergic",
},
{
  name: "Chrysin",
  type: "flavonoid",
  description: "A bioflavonoid with anxiolytic and MAO-inhibiting properties found in Passionflower.",
  foundIn: [
    "Passiflora incarnata",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABA-A agonist + MAOI",
},
{
  name: "Harmine (trace)",
  type: "beta-carboline",
  description: "A reversible MAOI found in low levels in Passionflower, structurally related to compounds in Ayahuasca.",
  foundIn: [
    "Passiflora incarnata",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "MAO-A inhibition",
},
{
  name: "Cytisine",
  type: "alkaloid",
  description: "A toxic yet psychoactive compound that acts on nicotinic receptors; found in Mescal bean.",
  foundIn: [
    "Sophora secundiflora",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "Nicotinic receptor agonist",
},
{
  name: "Desmodin",
  type: "alkaloid",
  description: "An alkaloid compound with neuroprotective and adaptogenic properties found in Desmodium.",
  foundIn: [
    "Desmodium gangeticum",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Neuroprotective + serotonergic modulation",
},
{
  name: "Triterpenoids",
  type: "triterpene",
  description: "Compounds with anti-inflammatory and tonic properties found in Desmodium species.",
  foundIn: [
    "Desmodium gangeticum",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Anti-inflammatory, adaptogenic",
},
{
  name: "Ergoline alkaloids (trace)",
  type: "ergoline",
  description: "Ergoline derivatives possibly present in Bindweed, structurally related to LSD precursors.",
  foundIn: [
    "Convolvulus arvensis",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "5-HT2A receptor activity",
},
{
  name: "Linalyl acetate",
  type: "ester",
  description: "A fragrant ester found in clary sage, with mood-lifting and calming effects.",
  foundIn: [
    "Salvia sclarea",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic + aromatherapeutic",
},
{
  name: "Sclareol",
  type: "diterpene alcohol",
  description: "A compound from clary sage with mild euphoria, possible hormonal modulation, and relaxing effects.",
  foundIn: [
    "Salvia sclarea",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Estrogenic + GABAergic activity",
},
{
  name: "Eugenol",
  type: "phenylpropene",
  description: "A fragrant oil with calming and mildly euphoric properties found in allspice and clove.",
  foundIn: [
    "Pimenta dioica",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic + serotonergic modulation",
},
{
  name: "Lactucopicrin",
  type: "sesquiterpene lactone",
  description: "A bitter compound in Wild Lettuce associated with sedative and analgesic effects.",
  foundIn: [
    "Lactuca virosa",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Opioid receptor modulation",
},
{
  name: "Lactucin",
  type: "sesquiterpene lactone",
  description: "Mildly psychoactive compound in Wild Lettuce contributing to its calming effects.",
  foundIn: [
    "Lactuca virosa",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Opioid receptor modulation",
},
{
  name: "Boldine",
  type: "alkaloid",
  description: "An antioxidant alkaloid in Boldo with sedative and hepatoprotective properties.",
  foundIn: [
    "Peumus boldus",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Cholinergic + serotonergic",
},
{
  name: "Agnuside",
  type: "iridoid glycoside",
  description: "A dopaminergic compound in Chasteberry thought to influence hormonal balance and mood.",
  foundIn: [
    "Vitex agnus-castus",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Dopaminergic + hormonal modulation",
},
{
  name: "Myristicin",
  type: "phenylpropene",
  description: "A deliriant and hallucinogenic compound in Nutmeg, psychoactive at high doses.",
  foundIn: [
    "Myristica fragrans",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "MAOI + anticholinergic",
},
{
  name: "Elemicin",
  type: "phenylpropene",
  description: "Another psychoactive compound in Nutmeg, structurally related to mescaline.",
  foundIn: [
    "Myristica fragrans",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "Anticholinergic + serotonergic",
},
{
  name: "Amorphigenin",
  type: "rotenoid compound",
  description: "A compound in Amorpha fruticosa with unclear psychoactivity, possibly relaxing or trance-inducing.",
  foundIn: [
    "Amorpha fruticosa",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Possibly GABAergic",
},
{
  name: "Eleutherosides",
  type: "glycosides",
  description: "A group of adaptogenic compounds found in Siberian Ginseng with neuroprotective properties.",
  foundIn: [
    "Eleutherococcus senticosus",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Adaptogenic + neuroregulatory",
},
{
  name: "Verbenalin",
  type: "iridoid glycoside",
  description: "A compound found in vervain, associated with sedative and spiritually clarifying effects.",
  foundIn: [
    "Verbena officinalis",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic",
},
{
  name: "Citral",
  type: "monoterpene aldehyde",
  description: "A lemon-scented terpene with calming and mood-brightening effects.",
  foundIn: [
    "Melissa officinalis",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABA-T inhibition + serotonergic",
},
{
  name: "Rosmarinic acid",
  type: "polyphenol",
  description: "An anxiolytic compound in lemon balm with antioxidant and calming effects.",
  foundIn: [
    "Melissa officinalis",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic + anti-inflammatory",
},
{
  name: "Bacosides A and B",
  type: "triterpenoid saponins",
  description: "Primary active nootropic agents in Bacopa, supporting memory, learning, and neuroplasticity.",
  foundIn: [
    "Bacopa monnieri",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Cholinergic + neuroprotective",
},
{
  name: "Aporphine",
  type: "aporphine alkaloid",
  description: "A dopamine agonist with sedative and euphoric effects found in Blue Lotus.",
  foundIn: [
    "Nymphaea caerulea",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "Dopamine receptor agonist",
},
{
  name: "Huperzine A",
  type: "alkaloid",
  description: "A potent acetylcholinesterase inhibitor that enhances memory and dream lucidity.",
  foundIn: [
    "Huperzia serrata",
  ],
  psychoactivity: "moderate",
  mechanismOfAction: "Acetylcholinesterase inhibition",
},
{
  name: "Vasicine",
  type: "quinazoline alkaloid",
  description: "A bronchodilator and mild sedative found in Justicia adhatoda.",
  foundIn: [
    "Justicia adhatoda",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Bronchodilation + GABAergic",
},
{
  name: "Tiliroside",
  type: "flavonoid glycoside",
  description: "A calming compound in Linden with antioxidant and mild GABAergic activity.",
  foundIn: [
    "Tilia europaea",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic + antioxidant",
},
{
  name: "Patchoulol",
  type: "sesquiterpene alcohol",
  description: "A main compound in Patchouli oil with grounding, relaxing properties in aromatherapy.",
  foundIn: [
    "Pogostemon cablin",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Aromatherapeutic + serotonergic",
},
{
  name: "Bufotenine",
  type: "tryptamine",
  description: "A powerful psychedelic compound found in vilca and toad venom, causing intense visual effects.",
  foundIn: [
    "Anadenanthera colubrina",
  ],
  psychoactivity: "strong",
  mechanismOfAction: "5-HT2A receptor agonist",
},
{
  name: "Verbascoside",
  type: "phenylpropanoid glycoside",
  description: "A calming antioxidant compound with potential mood-brightening effects found in Lemon Verbena.",
  foundIn: [
    "Aloysia citrodora",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic + serotonergic",
},
{
  name: "Violine",
  type: "alkaloid",
  description: "A compound in Sweet Violet with sedative and mildly hypnotic effects.",
  foundIn: [
    "Viola odorata",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic",
},
{
  name: "Petasin",
  type: "sesquiterpene",
  description: "A compound in Butterbur used to relieve headaches and anxiety through smooth muscle relaxation.",
  foundIn: [
    "Petasites hybridus",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Smooth muscle relaxant + serotonergic",
},
{
  name: "Zanthoxylin",
  type: "alkylamide",
  description: "A numbing and tingling agent in the Toothache Tree with mild sensory effects.",
  foundIn: [
    "Zanthoxylum clava-herculis",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Local anesthetic",
},
{
  name: "Methyl salicylate",
  type: "ester",
  description: "An aromatic compound with anti-inflammatory and uplifting properties found in birch and violet.",
  foundIn: [
    "Betula lenta",
    "Viola odorata",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Anti-inflammatory + serotonergic",
},
{
  name: "Nepetalactone",
  type: "iridoid monoterpene",
  description: "Primary compound in Catnip with calming, euphoric, and slightly hallucinogenic effects in animals and mild effects in humans.",
  foundIn: [
    "Nepeta cataria",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABAergic + olfactory",
},
{
  name: "Baicalin",
  type: "flavone glycoside",
  description: "A GABAergic flavonoid in Skullcap responsible for its calming and anxiolytic properties.",
  foundIn: [
    "Scutellaria lateriflora",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "GABA-A receptor modulation",
},
{
  name: "Tussilagone",
  type: "sesquiterpene",
  description: "A compound in Coltsfoot with antitussive and calming properties.",
  foundIn: [
    "Tussilago farfara",
  ],
  psychoactivity: "mild",
  mechanismOfAction: "Smooth muscle relaxation",
},
];