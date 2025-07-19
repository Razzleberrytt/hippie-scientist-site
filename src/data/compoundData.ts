export interface CompoundInfo {
  name: string
  type: string
  mechanism: string
  aliases?: string[]
  sourceHerbs?: string[]
  affiliateLink?: string
  tags?: string[]
}

export const baseCompounds: CompoundInfo[] = [
  {
    name: 'DMT',
    type: 'tryptamine',
    mechanism: '5-HT2A agonist',
    aliases: ['N,N-Dimethyltryptamine'],
    tags: ['psychedelic'],
  },
  {
    name: 'mescaline',
    type: 'phenethylamine',
    mechanism: '5-HT2A agonist',
    aliases: ['3,4,5-trimethoxyphenethylamine'],
    tags: ['psychedelic'],
  },
  {
    name: 'caffeine',
    type: 'xanthine',
    mechanism: 'Adenosine receptor antagonist',
    tags: ['stimulant'],
  },
  {
    name: 'mitragynine',
    type: 'indole alkaloid',
    mechanism: 'Partial μ-opioid agonist',
    tags: ['opioid', 'stimulant'],
  },
  {
    name: 'cocaine',
    type: 'alkaloid',
    mechanism: 'Blocks monoamine reuptake',
    tags: ['stimulant'],
  },
  {
    name: 'scopolamine',
    type: 'alkaloid',
    mechanism: 'Muscarinic acetylcholine antagonist',
    tags: ['deliriant'],
  },
  { name: 'digitoxin', type: 'glycoside', mechanism: 'Inhibits Na+/K+-ATPase', tags: ['cardiac'] },
  {
    name: 'chamazulene',
    type: 'terpene',
    mechanism: 'Anti-inflammatory',
    sourceHerbs: ['achillea-millefolium'],
    tags: ['anti-inflammatory'],
  },
  {
    name: 'thujone',
    type: 'monoterpene',
    mechanism: 'GABA_A antagonist',
    sourceHerbs: ['achillea-millefolium', 'salvia-apiana'],
    tags: ['gaba'],
  },
  {
    name: 'vertine',
    type: 'alkaloid',
    mechanism: 'Unclear CNS action',
    sourceHerbs: ['heimia-myrtifolia'],
    tags: ['sedative'],
  },
  {
    name: '7-hydroxymitragynine',
    type: 'indole alkaloid',
    mechanism: 'Potent μ-opioid agonist',
    sourceHerbs: ['kratom-hybrids'],
    tags: ['opioid'],
  },
  {
    name: 'cineole',
    type: 'terpene',
    mechanism: 'Aromatic stimulant',
    sourceHerbs: ['salvia-apiana'],
    tags: ['stimulant'],
  },
  {
    name: 'tenuigenin',
    type: 'glycoside',
    mechanism: 'Neurotrophic modulation',
    sourceHerbs: ['polygala-tenuifolia'],
    tags: ['nootropic'],
  },
  {
    name: 'nicotine',
    type: 'alkaloid',
    mechanism: 'Nicotinic acetylcholine agonist',
    sourceHerbs: ['nicotiana-tabacum'],
    tags: ['stimulant'],
  },
  {
    name: 'ephedrine',
    type: 'alkaloid',
    mechanism: 'Adrenergic agonist',
    sourceHerbs: ['sida-acuta'],
    tags: ['stimulant'],
  },
  {
    name: 'marmelosin',
    type: 'coumarin',
    mechanism: 'Mild sedative',
    sourceHerbs: ['aegle-marmelos'],
    tags: ['sedative'],
  },
  {
    name: 'anthocyanins',
    type: 'flavonoid',
    mechanism: 'Antioxidant & hypotensive',
    sourceHerbs: ['hibiscus-sabdariffa'],
    tags: ['antioxidant'],
  },
  {
    name: 'verbenalin',
    type: 'glycoside',
    mechanism: 'GABAergic modulation',
    sourceHerbs: ['verbena-officinalis'],
    tags: ['sedative'],
  },
  {
    name: 'pinocamphone',
    type: 'monoterpene',
    mechanism: 'Convulsant in high doses',
    sourceHerbs: ['hyssopus-officinalis'],
    tags: ['convulsant'],
  },
  {
    name: 'marrubiin',
    type: 'diterpenoid',
    mechanism: 'Expectorant effects',
    sourceHerbs: ['marrubium-vulgare'],
    tags: ['expectorant'],
  },
  {
    name: 'thymol',
    type: 'phenolic',
    mechanism: 'Antimicrobial',
    sourceHerbs: ['thymus-vulgaris'],
    tags: ['antimicrobial'],
  },
  {
    name: 'linalool',
    type: 'terpene',
    mechanism: 'Sedative via GABA',
    sourceHerbs: ['lavandula-angustifolia'],
    tags: ['sedative'],
  },
  {
    name: 'echinacoside',
    type: 'phenolic',
    mechanism: 'Immunomodulator',
    sourceHerbs: ['echinacea-purpurea'],
    tags: ['immunomodulator'],
  },
  {
    name: 'valeranon',
    type: 'sesquiterpene',
    mechanism: 'Sedative',
    sourceHerbs: ['valeriana-jatamansi'],
    tags: ['sedative'],
  },
  {
    name: 'catuabine',
    type: 'alkaloid',
    mechanism: 'Dopamine modulation',
    sourceHerbs: ['erythroxylum-catuaba'],
    tags: ['aphrodisiac'],
  },
  {
    name: 'apomorphine',
    type: 'alkaloid',
    mechanism: 'Dopamine agonist',
    sourceHerbs: ['nymphaea-rubra'],
    tags: ['dopamine'],
  },
  {
    name: 'gymnemic acids',
    type: 'triterpenoid',
    mechanism: 'Block sweet receptors',
    sourceHerbs: ['gymnema-sylvestre'],
    tags: ['sweet-blocker'],
  },
]

export default baseCompounds
