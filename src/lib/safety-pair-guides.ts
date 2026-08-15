export type SafetyGuideEvidence = 'documented' | 'structured-signal' | 'theoretical'
export type SafetyGuideMechanism = 'pharmacokinetic' | 'pharmacodynamic' | 'mixed'

export interface SafetyPairGuideSource {
  label: string
  url: string
  primary: boolean
}

export interface SafetyPairGuide {
  slug: string
  title: string
  description: string
  ingredientSlug: string
  ingredientName: string
  counterpartId: string
  counterpartName: string
  evidence: SafetyGuideEvidence
  confidence: 'higher' | 'moderate' | 'low'
  mechanism: SafetyGuideMechanism
  summary: string
  mechanismExplanation: string
  uncertainty: string
  editorialStatus: 'approved' | 'draft'
  sources: SafetyPairGuideSource[]
}

export const SAFETY_PAIR_GUIDES: SafetyPairGuide[] = [
  {
    slug: 'st-johns-wort-hormonal-contraceptives',
    title: "St. John's Wort and Hormonal Contraceptives: Interaction Evidence",
    description: "Evidence-focused review of the documented interaction between St. John's wort and hormonal contraceptives, including CYP3A-related pharmacokinetic evidence.",
    ingredientSlug: 'st-johns-wort',
    ingredientName: "St. John's Wort",
    counterpartId: 'hormonal-contraceptive',
    counterpartName: 'Hormonal contraceptives',
    evidence: 'documented',
    confidence: 'higher',
    mechanism: 'pharmacokinetic',
    summary: "Human interaction studies and authoritative safety guidance report that St. John's wort can alter exposure to hormonal contraceptive components. This is a medication-specific safety issue, not a theoretical supplement-stack overlap.",
    mechanismExplanation: 'The main interaction pathway is induction of drug-metabolizing systems, especially CYP3A-related metabolism, which can reduce exposure to some contraceptive components.',
    uncertainty: 'The magnitude depends on the contraceptive formulation, St. John’s wort extract and hyperforin content, dose, duration, adherence, and individual metabolism. This page does not estimate pregnancy risk for an individual.',
    editorialStatus: 'approved',
    sources: [
      { label: 'NCCIH: St. John’s Wort — Usefulness and Safety', url: 'https://www.nccih.nih.gov/health/st-johns-wort', primary: false },
      { label: 'Pfrunder et al. randomized interaction study — PMID 14616430', url: 'https://pubmed.ncbi.nlm.nih.gov/14616430/', primary: true },
      { label: 'Hall et al. clinical pharmacology interaction study — PMID 14663455', url: 'https://pubmed.ncbi.nlm.nih.gov/14663455/', primary: true },
    ],
  },
  {
    slug: 'st-johns-wort-antidepressants',
    title: "St. John's Wort and Antidepressants: Interaction Evidence",
    description: "Evidence-focused review of St. John's wort with serotonergic antidepressants, separating pharmacodynamic serotonin concerns from drug-metabolism effects.",
    ingredientSlug: 'st-johns-wort',
    ingredientName: "St. John's Wort",
    counterpartId: 'ssri-snri',
    counterpartName: 'SSRI / SNRI antidepressants',
    evidence: 'documented',
    confidence: 'moderate',
    mechanism: 'mixed',
    summary: "Authoritative guidance and published case reports support clinically important interaction concerns when St. John's wort is combined with serotonergic antidepressants. The evidence is not equivalent to a randomized interaction trial for every antidepressant.",
    mechanismExplanation: 'The concern includes pharmacodynamic serotonergic overlap, while St. John’s wort can also alter drug disposition through enzyme and transporter induction. The relevant mechanism depends on the specific medication.',
    uncertainty: 'Risk varies across antidepressants, doses, extracts, co-medications, and individual factors. Case-report evidence cannot quantify incidence, and this page does not determine whether a specific regimen is safe.',
    editorialStatus: 'approved',
    sources: [
      { label: 'NCCIH: Herb-Drug Interactions — St. John’s Wort', url: 'https://www.nccih.nih.gov/health/providers/digest/herb-drug-interactions-science', primary: false },
      { label: 'Lantz et al. case series — PMID 10447148', url: 'https://pubmed.ncbi.nlm.nih.gov/10447148/', primary: true },
      { label: 'Dannawi case report — PMID 12503845', url: 'https://pubmed.ncbi.nlm.nih.gov/12503845/', primary: true },
    ],
  },
]

export const INDEXABLE_SAFETY_PAIR_GUIDES = SAFETY_PAIR_GUIDES.filter((guide) => guide.editorialStatus === 'approved' && guide.evidence !== 'theoretical')

export function getSafetyPairGuide(slug: string) {
  return INDEXABLE_SAFETY_PAIR_GUIDES.find((guide) => guide.slug === slug)
}
