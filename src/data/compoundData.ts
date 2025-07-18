export interface CompoundInfo {
  name: string
  type: string
  mechanism: string
  sourceHerbs?: string[]
  affiliateLink?: string
  notes?: string
}

export const baseCompounds: CompoundInfo[] = [
  { name: 'DMT', type: 'tryptamine', mechanism: '5-HT2A agonist', affiliateLink: undefined },
  {
    name: 'mescaline',
    type: 'phenethylamine',
    mechanism: '5-HT2A agonist',
    affiliateLink: undefined,
  },
  { name: 'caffeine', type: 'xanthine', mechanism: 'Adenosine receptor antagonist' },
  { name: 'mitragynine', type: 'indole alkaloid', mechanism: 'Partial μ-opioid agonist' },
  { name: 'cocaine', type: 'alkaloid', mechanism: 'Blocks monoamine reuptake' },
  { name: 'scopolamine', type: 'alkaloid', mechanism: 'Muscarinic acetylcholine antagonist' },
  { name: 'digitoxin', type: 'glycoside', mechanism: 'Inhibits Na+/K+-ATPase' },
  {
    name: 'chamazulene',
    type: 'terpene',
    mechanism: 'Anti-inflammatory',
    sourceHerbs: ['achillea-millefolium'],
  },
  {
    name: 'thujone',
    type: 'monoterpene',
    mechanism: 'GABA_A antagonist',
    sourceHerbs: ['achillea-millefolium', 'salvia-apiana'],
  },
  {
    name: 'vertine',
    type: 'alkaloid',
    mechanism: 'Unclear CNS action',
    sourceHerbs: ['heimia-myrtifolia'],
  },
  {
    name: '7-hydroxymitragynine',
    type: 'indole alkaloid',
    mechanism: 'Potent μ-opioid agonist',
    sourceHerbs: ['kratom-hybrids'],
  },
  {
    name: 'cineole',
    type: 'terpene',
    mechanism: 'Aromatic stimulant',
    sourceHerbs: ['salvia-apiana'],
  },
  {
    name: 'tenuigenin',
    type: 'glycoside',
    mechanism: 'Neurotrophic modulation',
    sourceHerbs: ['polygala-tenuifolia'],
  },
  {
    name: 'nicotine',
    type: 'alkaloid',
    mechanism: 'Nicotinic acetylcholine agonist',
    sourceHerbs: ['nicotiana-tabacum'],
  },
  {
    name: 'ephedrine',
    type: 'alkaloid',
    mechanism: 'Adrenergic agonist',
    sourceHerbs: ['sida-acuta'],
  },
  {
    name: 'marmelosin',
    type: 'coumarin',
    mechanism: 'Mild sedative',
    sourceHerbs: ['aegle-marmelos'],
  },
  {
    name: 'anthocyanins',
    type: 'flavonoid',
    mechanism: 'Antioxidant & hypotensive',
    sourceHerbs: ['hibiscus-sabdariffa'],
  },
  {
    name: 'verbenalin',
    type: 'glycoside',
    mechanism: 'GABAergic modulation',
    sourceHerbs: ['verbena-officinalis'],
  },
  {
    name: 'pinocamphone',
    type: 'monoterpene',
    mechanism: 'Convulsant in high doses',
    sourceHerbs: ['hyssopus-officinalis'],
  },
  {
    name: 'marrubiin',
    type: 'diterpenoid',
    mechanism: 'Expectorant effects',
    sourceHerbs: ['marrubium-vulgare'],
  },
  {
    name: 'thymol',
    type: 'phenolic',
    mechanism: 'Antimicrobial',
    sourceHerbs: ['thymus-vulgaris'],
  },
  {
    name: 'linalool',
    type: 'terpene',
    mechanism: 'Sedative via GABA',
    sourceHerbs: ['lavandula-angustifolia'],
  },
  {
    name: 'echinacoside',
    type: 'phenolic',
    mechanism: 'Immunomodulator',
    sourceHerbs: ['echinacea-purpurea'],
  },
  {
    name: 'valeranon',
    type: 'sesquiterpene',
    mechanism: 'Sedative',
    sourceHerbs: ['valeriana-jatamansi'],
  },
  {
    name: 'catuabine',
    type: 'alkaloid',
    mechanism: 'Dopamine modulation',
    sourceHerbs: ['erythroxylum-catuaba'],
  },
  {
    name: 'apomorphine',
    type: 'alkaloid',
    mechanism: 'Dopamine agonist',
    sourceHerbs: ['nymphaea-rubra'],
  },
  {
    name: 'gymnemic acids',
    type: 'triterpenoid',
    mechanism: 'Block sweet receptors',
    sourceHerbs: ['gymnema-sylvestre'],
  },
  {
    name: 'THC',
    type: 'cannabinoid',
    mechanism: 'CB1 receptor agonist',
    sourceHerbs: ['cannabis-sativa'],
    notes: 'Main psychoactive constituent of cannabis',
  },
  {
    name: 'psilocybin',
    type: 'tryptamine',
    mechanism: 'Converted to psilocin; 5-HT2A agonist',
    sourceHerbs: ['psilocybe-cubensis'],
    notes: 'Produces intense psychedelic experiences',
  },
  {
    name: 'salvinorin A',
    type: 'diterpenoid',
    mechanism: 'Kappa-opioid receptor agonist',
    sourceHerbs: ['salvia-divinorum'],
    notes: 'Potent short-acting hallucinogen',
  },
  {
    name: 'LSD',
    type: 'ergoline',
    mechanism: 'Potent 5-HT2A agonist',
    sourceHerbs: ['claviceps-purpurea'],
    notes: 'Semi-synthetic psychedelic derived from ergot alkaloids',
  },
  {
    name: 'MDMA',
    type: 'phenethylamine',
    mechanism: 'Serotonin releasing agent',
    sourceHerbs: ['sassafras-albidum'],
    notes: 'Empathogenic stimulant originally synthesized from safrole oil',
  },
  {
    name: 'ibogaine',
    type: 'indole alkaloid',
    mechanism: 'Complex serotonin and NMDA modulation',
    sourceHerbs: ['tabernanthe-iboga'],
    notes: 'Psychedelic used in addiction treatment rituals',
  },
  {
    name: 'harmine',
    type: 'beta-carboline',
    mechanism: 'Reversible MAO-A inhibitor',
    sourceHerbs: ['banisteriopsis-caapi', 'pegnum-harmala'],
    notes: 'Key alkaloid in many Ayahuasca brews',
  },
  {
    name: 'ibotenic acid',
    type: 'isoxazole',
    mechanism: 'Glutamate receptor agonist',
    sourceHerbs: ['amanita-muscaria'],
    notes: 'Decarboxylates to muscimol when dried',
  },
  {
    name: 'mesembrine',
    type: 'alkaloid',
    mechanism: 'Serotonin reuptake inhibitor',
    sourceHerbs: ['sceletium-tortuosum'],
    notes: 'Primary mood-elevating compound in kanna',
  },
]

export default baseCompounds
