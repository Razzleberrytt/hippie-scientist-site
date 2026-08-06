const clean = (value: string) => value.trim().toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ')

const EFFECT_RULES: Array<[string, RegExp]> = [
  ['Calming', /calm|relax|anxiol|stress|tranquil/],
  ['Sedating / sleep', /sedat|sleep|hypnotic|somnol|insomnia/],
  ['Stimulating / energy', /stimul|energy|alert|wake|fatigue|ergogenic/],
  ['Mood', /mood|antidepress|euphor|well-being|seroton/],
  ['Cognition / focus', /cognit|focus|attention|memory|nootropic|cholin/],
  ['Pain / discomfort', /analges|pain|antinocicept|discomfort/],
  ['Inflammation', /inflamm/],
  ['Dream / perception', /dream|lucid|hallucin|percept|psychoactive|dissoci/],
  ['Digestive', /digest|gastro|nausea|appetite|bowel|constipat/],
  ['Cardiovascular', /cardio|blood pressure|vaso|heart|circulat/],
  ['Metabolic', /metabol|glucose|insulin|lipid|cholesterol|weight/],
  ['Immune', /immune|immunomod|antiviral|antimicrobial/],
  ['Hormonal / reproductive', /hormon|libido|sexual|fertil|testoster|estrogen|thyroid/],
]

const CLASS_RULES: Array<[string, RegExp]> = [
  ['Methylxanthines', /methylxanthine|caffeine|theobromine|theophylline/],
  ['Alkaloids', /alkaloid|amine|indole|isoquinoline|aporphine|tropane|xanthine/],
  ['Flavonoids', /flavonoid|flavone|flavan|catechin/],
  ['Terpenes / terpenoids', /terpene|terpenoid|sesquiterp|diterp|triterp/],
  ['Glycosides', /glycoside|saponin/],
  ['Phenolics', /phenol|polyphenol|phenolic acid/],
  ['Lactones', /lactone|kavalactone/],
  ['Cannabinoids', /cannabinoid/],
  ['Withanolides', /withanolide/],
]

const SAFETY_RULES: Array<[string, RegExp]> = [
  ['Sedation', /sedat|drows|cns depress|sleepiness/],
  ['Stimulation', /stimul|insomnia|agitat|jitter|anxiety/],
  ['Serotonergic', /seroton|ssri|snri|maoi|monoamine oxidase/],
  ['Cardiovascular', /blood pressure|hypertension|hypotension|heart|arrhythm|qt|tachy|brady/],
  ['Bleeding', /bleed|anticoagul|antiplatelet/],
  ['Liver', /liver|hepato/],
  ['Kidney', /kidney|renal/],
  ['Seizure', /seizure|convuls/],
  ['Dependence / withdrawal', /depend|withdraw|addict|habit-forming|abuse/],
  ['Pregnancy / breastfeeding', /pregnan|breastfeed|lactation/],
  ['Drug metabolism', /cyp|drug metabolism|enzyme inhibit|enzyme induc/],
  ['Toxicity concern', /toxic|poison|narrow therapeutic|fatal/],
]

const firstMatch = (value: string, rules: Array<[string, RegExp]>) => {
  const normalized = clean(value)
  return rules.find(([, pattern]) => pattern.test(normalized))?.[0]
}

export const normalizeEffect = (value: string) => firstMatch(value, EFFECT_RULES) ?? value.trim()
export const normalizeCompoundClass = (value: string) => firstMatch(value, CLASS_RULES) ?? value.trim()
export const normalizeSafetySignal = (value: string) => firstMatch(value, SAFETY_RULES) ?? value.trim()

export const normalizeEvidence = (value: string) => {
  const normalized = clean(value)
  if (/^a\b|high|strong|robust|well established|multiple.*trial/.test(normalized)) return 'Strong'
  if (/^b\b|moderate|promising|some human|clinical evidence/.test(normalized)) return 'Moderate'
  if (/^c\b|preliminary|limited|early|pilot|small trial/.test(normalized)) return 'Preliminary'
  if (/^d\b|traditional|preclinical|animal|in vitro|mechanistic/.test(normalized)) return 'Traditional / preclinical'
  return 'Unclassified'
}

export const normalizeIntensity = (value: string) => {
  const normalized = clean(value)
  if (/strong|high|pronounced|intense|potent/.test(normalized)) return 'Pronounced'
  if (/moderate|medium|noticeable/.test(normalized)) return 'Moderate'
  if (/mild|low|subtle|gentle/.test(normalized)) return 'Subtle'
  if (/variable|dose-dependent|biphasic/.test(normalized)) return 'Variable'
  return 'Unknown'
}

export const uniqueNormalized = (values: string[], normalizer: (value: string) => string) =>
  Array.from(new Set(values.map(normalizer).filter(Boolean)))
