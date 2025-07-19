export interface CompoundInfo {
  name: string
  type: string
  mechanism: string
  aliases?: string[]
  sourceHerbs?: string[]
  affiliateLink?: string
}

export const baseCompounds: CompoundInfo[] = [
  { name: 'DMT', type: 'tryptamine', mechanism: '5-HT2A agonist', aliases: ['N,N-Dimethyltryptamine'], affiliateLink: undefined },
  { name: 'mescaline', type: 'phenethylamine', mechanism: '5-HT2A agonist', aliases: ['3,4,5-trimethoxyphenethylamine'], affiliateLink: undefined },
  { name: 'caffeine', type: 'xanthine', mechanism: 'Adenosine receptor antagonist' },
  { name: 'mitragynine', type: 'indole alkaloid', mechanism: 'Partial μ-opioid agonist' },
  { name: 'cocaine', type: 'alkaloid', mechanism: 'Blocks monoamine reuptake' },
  { name: 'scopolamine', type: 'alkaloid', mechanism: 'Muscarinic acetylcholine antagonist' },
  { name: 'digitoxin', type: 'glycoside', mechanism: 'Inhibits Na+/K+-ATPase' },
  { name: 'chamazulene', type: 'terpene', mechanism: 'Anti-inflammatory', sourceHerbs: ['achillea-millefolium'] },
  { name: 'thujone', type: 'monoterpene', mechanism: 'GABA_A antagonist', sourceHerbs: ['achillea-millefolium', 'salvia-apiana'] },
  { name: 'vertine', type: 'alkaloid', mechanism: 'Unclear CNS action', sourceHerbs: ['heimia-myrtifolia'] },
  { name: '7-hydroxymitragynine', type: 'indole alkaloid', mechanism: 'Potent μ-opioid agonist', sourceHerbs: ['kratom-hybrids'] },
  { name: 'cineole', type: 'terpene', mechanism: 'Aromatic stimulant', sourceHerbs: ['salvia-apiana'] },
  { name: 'tenuigenin', type: 'glycoside', mechanism: 'Neurotrophic modulation', sourceHerbs: ['polygala-tenuifolia'] },
  { name: 'nicotine', type: 'alkaloid', mechanism: 'Nicotinic acetylcholine agonist', sourceHerbs: ['nicotiana-tabacum'] },
  { name: 'ephedrine', type: 'alkaloid', mechanism: 'Adrenergic agonist', sourceHerbs: ['sida-acuta'] },
  { name: 'marmelosin', type: 'coumarin', mechanism: 'Mild sedative', sourceHerbs: ['aegle-marmelos'] },
  { name: 'anthocyanins', type: 'flavonoid', mechanism: 'Antioxidant & hypotensive', sourceHerbs: ['hibiscus-sabdariffa'] },
  { name: 'verbenalin', type: 'glycoside', mechanism: 'GABAergic modulation', sourceHerbs: ['verbena-officinalis'] },
  { name: 'pinocamphone', type: 'monoterpene', mechanism: 'Convulsant in high doses', sourceHerbs: ['hyssopus-officinalis'] },
  { name: 'marrubiin', type: 'diterpenoid', mechanism: 'Expectorant effects', sourceHerbs: ['marrubium-vulgare'] },
  { name: 'thymol', type: 'phenolic', mechanism: 'Antimicrobial', sourceHerbs: ['thymus-vulgaris'] },
  { name: 'linalool', type: 'terpene', mechanism: 'Sedative via GABA', sourceHerbs: ['lavandula-angustifolia'] },
  { name: 'echinacoside', type: 'phenolic', mechanism: 'Immunomodulator', sourceHerbs: ['echinacea-purpurea'] },
  { name: 'valeranon', type: 'sesquiterpene', mechanism: 'Sedative', sourceHerbs: ['valeriana-jatamansi'] },
  { name: 'catuabine', type: 'alkaloid', mechanism: 'Dopamine modulation', sourceHerbs: ['erythroxylum-catuaba'] },
  { name: 'apomorphine', type: 'alkaloid', mechanism: 'Dopamine agonist', sourceHerbs: ['nymphaea-rubra'] },
  { name: 'gymnemic acids', type: 'triterpenoid', mechanism: 'Block sweet receptors', sourceHerbs: ['gymnema-sylvestre'] },
]

export default baseCompounds
