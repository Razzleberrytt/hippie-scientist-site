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

// Specific families come before broad classes so named compounds land in the
// most useful atlas bucket. Patterns are intentionally conservative: an
// unrecognized compound remains unclassified rather than being guessed.
const CLASS_RULES: Array<[string, RegExp]> = [
  ['Methylxanthines', /\b(?:methylxanthines?|caffeine|theobromine|theophylline|paraxanthine)\b/],
  ['Withanolides', /\b(?:withanolides?|withaferin(?: a)?|withanosides?)\b/],
  ['Cannabinoids', /\b(?:cannabinoids?|cannabidiol|cannabigerol|cannabinol|tetrahydrocannabinol|thc|cbd|cbg|cbn)\b/],
  ['Lactones', /\b(?:lactones?|kavalactones?|kavain|dihydrokavain|methysticin|dihydromethysticin|yangonin|lactucin|lactucopicrin)\b/],
  ['Flavonoids', /\b(?:flavonoids?|flavones?|flavanones?|flavanols?|catechins?|epicatechin|egcg|apigenin|quercetin|kaempferol|luteolin|rutin|hesperidin|naringenin)\b/],
  ['Terpenes / terpenoids', /\b(?:terpenes?|terpenoids?|sesquiterpenes?|diterpenes?|triterpenes?|linalool|limonene|myrcene|pinene|caryophyllene|humulene|borneol|menthol|camphor|thymol|carvacrol)\b/],
  ['Glycosides', /\b(?:glycosides?|saponins?|ginsenosides?|salicin|glycyrrhizin|glycyrrhizic acid|bacosides?|asiaticoside)\b/],
  ['Phenolics', /\b(?:phenols?|polyphenols?|phenolic acids?|rosmarinic acid|caffeic acid|ferulic acid|gallic acid|ellagic acid|curcumin|eugenol)\b/],
  ['Alkaloids', /\b(?:alkaloids?|isoquinolines?|aporphines?|tropanes?|indole alkaloids?|berberine|palmatine|mitragynine|mesembrine|yohimbine|harmine|harmaline|hordenine|synephrine|nicotine|lobeline|huperzine a|tetrahydropalmatine)\b/],
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
