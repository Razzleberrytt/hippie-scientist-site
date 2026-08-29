export type LeadMagnetSlug =
  | 'supplement-evidence-starter-kit'
  | 'sleep-supplement-evidence-guide'
  | 'anxiety-stress-evidence-cheat-sheet'
  | 'focus-supplement-evidence-cheat-sheet'
  | 'supplement-label-reading-guide'
  | 'supplement-interaction-checklist'
  | 'questions-before-buying-supplements'

export interface LeadMagnetSection {
  title: string
  items: string[]
}

export interface LeadMagnet {
  slug: LeadMagnetSlug
  title: string
  shortTitle: string
  eyebrow: string
  description: string
  bullets: string[]
  sections: LeadMagnetSection[]
  downloadHref?: string
  downloadLabel?: string
}

export const LEAD_MAGNETS: Record<LeadMagnetSlug, LeadMagnet> = {
  'supplement-evidence-starter-kit': {
    slug: 'supplement-evidence-starter-kit',
    title: 'Supplement Evidence Starter Kit',
    shortTitle: 'Evidence Starter Kit',
    eyebrow: 'Free evidence toolkit',
    description: 'A fast system for checking whether a supplement claim is backed by relevant human evidence, whether the dose and form match the research, and what uncertainty is still hiding underneath the headline.',
    bullets: ['A five-minute evidence filter', 'Study-type and dose/form checkpoints', 'A safety and product-quality handoff'],
    sections: [
      { title: 'The five-minute evidence filter', items: ['Name the exact outcome instead of asking whether a supplement “works.”', 'Look for human evidence that directly studies that outcome.', 'Check whether the study form, extract, dose, duration, and population resemble the real question.', 'Separate a mechanism from a demonstrated outcome.', 'Keep limitations beside the conclusion instead of burying them.'] },
      { title: 'Evidence strength checkpoints', items: ['Meta-analyses and systematic reviews can synthesize a body of research, but their quality depends on the included studies.', 'Randomized controlled trials can provide stronger causal evidence than observational studies for many efficacy questions.', 'Animal and in-vitro findings are useful for mechanism discovery but should not be presented as proven human benefits.', 'One positive trial is not the same as replicated evidence.'] },
      { title: 'Before a buying decision', items: ['Confirm the current product matches the studied form when that matters.', 'Check dose transparency, third-party testing, and COA availability.', 'Review safety and medication interactions separately from efficacy.'] },
    ],
  },
  'sleep-supplement-evidence-guide': {
    slug: 'sleep-supplement-evidence-guide',
    title: 'Sleep Supplement Evidence Guide',
    shortTitle: 'Sleep Evidence Guide',
    eyebrow: 'Sleep research cheat sheet',
    description: 'A compact guide for separating sleep onset, sleep maintenance, relaxation, next-day effects, and evidence quality before comparing supplements.',
    bullets: ['Separate sleep outcomes before comparing ingredients', 'Track dose, timing, duration, and next-day effects', 'Avoid treating sedation as proof of better sleep'],
    sections: [
      { title: 'Define the sleep outcome', items: ['Sleep onset: how long it takes to fall asleep.', 'Sleep maintenance: awakenings and time awake during the night.', 'Total sleep time and sleep efficiency are different outcomes.', 'Subjective sleep quality may improve even when objective sleep measures change little.', 'Next-day alertness and adverse effects belong in the same decision.'] },
      { title: 'Evidence questions', items: ['Was the study randomized and controlled?', 'Was insomnia actually present in the study population?', 'How long was the trial?', 'Was the dose and form similar to what is sold?', 'Were benefits consistent across trials or concentrated in one study?'] },
      { title: 'Safety handoff', items: ['Check additive sedation when combining several calming products.', 'Medication interactions and alcohol/CNS depressants require separate review.', 'Do not interpret “natural” as evidence of low risk.'] },
    ],
  },
  'anxiety-stress-evidence-cheat-sheet': {
    slug: 'anxiety-stress-evidence-cheat-sheet',
    title: 'Anxiety & Stress Evidence Cheat Sheet',
    shortTitle: 'Stress Evidence Cheat Sheet',
    eyebrow: 'Stress research cheat sheet',
    description: 'A practical way to distinguish stress outcomes, anxiety symptom scales, acute calming, chronic trials, and the limits of adaptogen-style claims.',
    bullets: ['Separate stress from anxiety outcomes', 'Check scale, duration, population, and extract', 'Keep serotonergic and sedative cautions visible'],
    sections: [
      { title: 'Do not collapse every outcome into “calm”', items: ['Perceived stress scores are not identical to anxiety-disorder outcomes.', 'Acute calming and multi-week stress adaptation answer different questions.', 'Mood, sleep, and fatigue improvements can influence stress scores without proving a direct anxiolytic effect.'] },
      { title: 'What to extract from a trial', items: ['Population and baseline symptom severity', 'Validated scale used', 'Extract/form and dose', 'Duration and dropout rate', 'Magnitude and consistency of the effect', 'Adverse events and medication exclusions'] },
      { title: 'Safety handoff', items: ['Check serotonergic overlap where relevant.', 'Check additive sedation rather than assuming two calming agents are automatically complementary.', 'Use medication-specific review for prescriptions rather than a generic supplement list.'] },
    ],
  },
  'focus-supplement-evidence-cheat-sheet': {
    slug: 'focus-supplement-evidence-cheat-sheet',
    title: 'Focus Supplement Evidence Cheat Sheet',
    shortTitle: 'Focus Evidence Cheat Sheet',
    eyebrow: 'Focus research cheat sheet',
    description: 'A quick framework for separating attention, memory, reaction time, fatigue, wakefulness, and subjective focus so nootropic claims are compared on the outcome actually studied.',
    bullets: ['Separate attention from memory and wakefulness', 'Distinguish stimulant effects from cognition evidence', 'Check baseline caffeine use, sleep, dose, and testing'],
    sections: [
      { title: 'Name the cognitive endpoint', items: ['Sustained attention', 'Working memory', 'Recall / learning', 'Reaction time', 'Executive function', 'Subjective focus or mental fatigue'] },
      { title: 'Context that can change the result', items: ['Sleep deprivation versus well-rested participants', 'Baseline caffeine or stimulant exposure', 'Single-dose versus chronic use', 'Healthy participants versus diagnosed populations', 'Practice effects and multiple cognitive tests'] },
      { title: 'Avoid the mechanism trap', items: ['A neurotransmitter or pathway effect is not a demonstrated improvement in attention.', 'Feeling stimulated is not the same as improved cognitive performance.', 'A statistically significant test result should still be judged by magnitude, replication, and relevance.'] },
    ],
  },
  'supplement-label-reading-guide': {
    slug: 'supplement-label-reading-guide',
    title: 'Supplement Label-Reading Guide',
    shortTitle: 'Label-Reading Guide',
    eyebrow: 'Product-quality field guide',
    description: 'A label-by-label checklist for dose transparency, standardized extracts, active-marker percentages, elemental mineral amounts, proprietary blends, and testing claims.',
    bullets: ['Decode serving size and active dose', 'Spot form/extract mismatches', 'Know what “lab tested” does and does not prove'],
    sections: [
      { title: 'Start with the active amount', items: ['Read serving size before reading the front-label claim.', 'Find the amount of each active ingredient per serving.', 'For minerals, distinguish compound weight from elemental mineral amount when relevant.', 'A proprietary blend can prevent a meaningful studied-dose comparison.'] },
      { title: 'Form and standardization', items: ['Identify the salt, extract, strain, or preparation when the evidence is form-specific.', 'Marker percentages describe composition; a higher percentage is not automatically better.', 'Do not assume evidence from one branded extract transfers to every generic product.'] },
      { title: 'Testing language', items: ['“Third-party tested” is more useful when the lab, scope, or batch result is verifiable.', 'A COA should be current and tied to the product or batch when possible.', 'Relevant contaminant testing depends on the ingredient and manufacturing process.'] },
    ],
  },
  'supplement-interaction-checklist': {
    slug: 'supplement-interaction-checklist',
    title: 'Supplement Interaction Checklist',
    shortTitle: 'Interaction Checklist',
    eyebrow: 'Safety research checklist',
    description: 'A non-diagnostic checklist for researching ingredient-to-ingredient and supplement-to-medication interaction signals without turning missing data into “safe.”',
    bullets: ['Documented vs theoretical interaction checkpoints', 'PK vs PD mechanism prompts', 'A rule for incomplete safety data'],
    sections: [
      { title: 'Classify the interaction question', items: ['Documented clinical interaction', 'Structured safety warning or class effect', 'Theoretical additive risk from mechanism', 'Unknown because relevant data is missing'] },
      { title: 'Ask how the interaction could happen', items: ['Pharmacokinetic: absorption, metabolism, transport, or clearance changes exposure.', 'Pharmacodynamic: two agents push the same physiological effect, such as sedation or bleeding.', 'Mixed interactions can involve both pathways.'] },
      { title: 'Screen common overlap categories', items: ['Sedation / CNS depression', 'Stimulation / cardiovascular load', 'Serotonergic effects', 'Bleeding / platelet effects', 'Blood-pressure effects', 'Drug-metabolism induction or inhibition', 'Liver cautions', 'Pregnancy / breastfeeding evidence gaps'] },
    ],
  },
  'questions-before-buying-supplements': {
    slug: 'questions-before-buying-supplements',
    title: 'Questions to Ask Before Buying Supplements',
    shortTitle: 'Buying Questions PDF',
    eyebrow: 'Printable buying checklist',
    description: 'A printable decision worksheet covering evidence fit, studied form, label transparency, product verification, safety boundaries, and reasons to skip a product.',
    bullets: ['Six pre-purchase question groups', 'Two-product comparison worksheet', 'Evidence, safety, and quality kept separate'],
    sections: [
      { title: 'Before spending money', items: ['Does the ingredient have direct human evidence for the outcome I care about?', 'Does the product match the form and dose studied?', 'Is the label transparent enough to compare with the research?', 'Is testing and formulation information verifiable?', 'What safety or medication-interaction questions still need review?', 'What evidence or quality failure would make me skip it?'] },
      { title: 'Use the worksheet side by side', items: ['Compare form, active amount, standardization, testing, COA status, formulation verification, safety cautions, and evidence context.', 'Treat a blank field as a data gap, not a positive score.', 'Never let a retailer link or commission raise either an evidence grade or a product-quality score.'] },
    ],
    downloadHref: '/lead-magnets/questions-to-ask-before-buying-supplements.pdf',
    downloadLabel: 'Download the printable PDF',
  },
}

const sleepTerms = ['sleep', 'melatonin', 'valerian', 'chamomile']
const stressTerms = ['anxiety', 'stress', 'ashwagandha', 'rhodiola', 'saffron']
const focusTerms = ['focus', 'cognition', 'adhd', 'nootropic', 'l-theanine', 'caffeine', 'bacopa', 'lion-s-mane', 'lions-mane', 'citicoline', 'alpha-gpc']

function containsAny(path: string, terms: string[]) {
  return terms.some((term) => path.includes(term))
}

export function getLeadMagnet(slug: string) {
  return LEAD_MAGNETS[slug as LeadMagnetSlug]
}

export function getContextualLeadMagnet(pathname: string): LeadMagnet {
  const path = pathname.toLowerCase()
  if (path.includes('/safety-checker') || path.includes('interaction')) return LEAD_MAGNETS['supplement-interaction-checklist']
  if (path.includes('/learn/product-quality') || path.includes('/buy-guide') || path.includes('/guides/best') || path.includes('/compare/')) return LEAD_MAGNETS['questions-before-buying-supplements']
  if (containsAny(path, sleepTerms)) return LEAD_MAGNETS['sleep-supplement-evidence-guide']
  if (containsAny(path, stressTerms)) return LEAD_MAGNETS['anxiety-stress-evidence-cheat-sheet']
  if (containsAny(path, focusTerms)) return LEAD_MAGNETS['focus-supplement-evidence-cheat-sheet']
  if (path.startsWith('/herbs/') || path.startsWith('/compounds/')) return LEAD_MAGNETS['supplement-label-reading-guide']
  return LEAD_MAGNETS['supplement-evidence-starter-kit']
}

export function shouldShowContextualLeadMagnet(pathname: string) {
  const path = pathname.toLowerCase()
  if (path === '/') return false
  if (path.startsWith('/lead-magnets/')) return false
  if (path.startsWith('/api/')) return false
  if (path.includes('/privacy') || path.includes('/terms') || path.includes('/corrections')) return false
  return true
}
