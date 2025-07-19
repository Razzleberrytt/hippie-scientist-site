export interface CompoundInfo {
  name: string
  type: string
  mechanism: string
  affiliateLink?: string
}

export const baseCompounds: CompoundInfo[] = [
  { name: 'DMT', type: 'tryptamine', mechanism: '5-HT2A agonist', affiliateLink: undefined },
  { name: 'mescaline', type: 'phenethylamine', mechanism: '5-HT2A agonist', affiliateLink: undefined },
  { name: 'caffeine', type: 'xanthine', mechanism: 'Adenosine receptor antagonist' },
  { name: 'mitragynine', type: 'indole alkaloid', mechanism: 'Partial μ-opioid agonist' },
  { name: 'cocaine', type: 'alkaloid', mechanism: 'Blocks monoamine reuptake' },
  { name: 'scopolamine', type: 'alkaloid', mechanism: 'Muscarinic acetylcholine antagonist' },
  { name: 'digitoxin', type: 'glycoside', mechanism: 'Inhibits Na+/K+-ATPase' },
]

export default baseCompounds
