import type { GuideCard } from '@/components/guides/GuideCardGrid'

export type TopicGuideGroup = {
  id: string
  eyebrow: string
  title: string
  description: string
  guides: GuideCard[]
}

export const TOPIC_GUIDE_GROUPS: TopicGuideGroup[] = [
  {
    id: 'forms-and-formulas',
    eyebrow: 'Forms and formulas',
    title: 'Choose the right version',
    description:
      'Use these when the ingredient is familiar but the form, dose, quality markers, or label is not.',
    guides: [
      { href: '/guides/other/b-complex-guide/', title: 'B-Complex Vitamins', desc: 'Compare the major B vitamins, common forms, and when supplementation is worth discussing.' },
      { href: '/guides/other/curcumin-absorption-guide/', title: 'Curcumin Absorption', desc: 'Compare piperine, phytosome, and other formulation approaches.' },
      { href: '/guides/other/electrolyte-supplements/', title: 'Electrolyte Supplements', desc: 'When electrolyte products may fit—and when water may be enough.' },
      { href: '/guides/other/green-tea-egcg-guide/', title: 'Green Tea Extract and EGCG', desc: 'Review extract dosing, evidence context, and high-dose safety concerns.' },
      { href: '/guides/other/glutathione-nac-guide/', title: 'NAC and Glutathione', desc: 'Understand how these related antioxidant pathways and supplements differ.' },
      { href: '/guides/other/iron-supplement-guide/', title: 'Iron Supplements', desc: 'Compare common forms and why testing matters before supplementing.' },
      { href: '/guides/other/magnesium-types-guide/', title: 'Magnesium Types Compared', desc: 'Match glycinate, citrate, threonate, oxide, and other forms to practical tradeoffs.' },
      { href: '/guides/other/omega-3-quality-guide/', title: 'Omega-3 Quality Guide', desc: 'Read EPA/DHA labels, oil forms, oxidation signals, and quality markers.' },
      { href: '/guides/other/protein-powder-guide/', title: 'Protein Powders Compared', desc: 'Compare whey, casein, plant, and collagen products by use case.' },
      { href: '/guides/other/vitamin-d-k2-guide/', title: 'Vitamin D and K2', desc: 'Review evidence, dosing context, and the rationale behind combining them.' },
      { href: '/guides/other/zinc-supplement-guide/', title: 'Zinc Supplements', desc: 'Compare common forms, dosing context, and long-term safety considerations.' },
    ],
  },
  {
    id: 'everyday-topics',
    eyebrow: 'Everyday topics',
    title: 'Evaluate popular supplement categories',
    description:
      'Evidence-first reviews for categories that attract strong marketing but still require careful product and goal matching.',
    guides: [
      { href: '/guides/other/alkaloids-on-amazon/', title: 'Alkaloids on Amazon', desc: 'Identify alkaloid supplement categories, separate evidence types, and screen labels without product endorsements.' },
      { href: '/guides/other/apple-cider-vinegar/', title: 'Apple Cider Vinegar', desc: 'Separate evidence on blood sugar, weight, and digestion from trend claims.' },
      { href: '/guides/other/bovine-colostrum/', title: 'Bovine Colostrum', desc: 'Review immune, gut, performance, and safety evidence behind the category.' },
      { href: '/guides/other/collagen-supplements/', title: 'Collagen Supplements', desc: 'Compare evidence for skin, joints, bone, and muscle-related goals.' },
      { href: '/guides/other/coq10-guide/', title: 'CoQ10', desc: 'Understand ubiquinone, ubiquinol, and the conditions where CoQ10 is most discussed.' },
      { href: '/guides/other/creatine-brain-health/', title: 'Creatine for Brain Health', desc: 'Look beyond sports use to cognition, fatigue, and sleep-deprivation research.' },
      { href: '/guides/other/functional-mushrooms-guide/', title: 'Functional Mushrooms Compared', desc: 'Compare lion’s mane, reishi, cordyceps, and other mushroom categories.' },
      { href: '/guides/other/greens-powders/', title: 'Greens Powders', desc: 'Assess nutrient-filling evidence and the limits of broad wellness claims.' },
      { href: '/guides/other/lions-mane-guide/', title: 'Lion’s Mane Mushroom', desc: 'Review cognition, mood, mechanism, dosing, and evidence limitations.' },
      { href: '/guides/other/prebiotics/', title: 'Prebiotics', desc: 'Compare supplemental fibers with food sources and goal-specific evidence.' },
      { href: '/guides/other/probiotic-strains-guide/', title: 'Probiotic Strains', desc: 'Choose by strain and use case instead of relying on CFU count alone.' },
    ],
  },
  {
    id: 'goals-and-routines',
    eyebrow: 'Goals and routines',
    title: 'Start with the outcome or decision',
    description:
      'Use these broader guides to compare options, plan a routine, or identify what should be checked first.',
    guides: [
      { href: '/guides/other/adaptogens-compared/', title: 'Adaptogens Compared', desc: 'Compare ashwagandha, rhodiola, holy basil, eleuthero, and schisandra.' },
      { href: '/guides/other/anti-inflammatory-supplements/', title: 'Anti-Inflammatory Supplements', desc: 'Compare curcumin, omega-3, ginger, boswellia, and quercetin evidence.' },
      { href: '/guides/other/berberine-weight-loss/', title: 'Berberine and Weight Loss', desc: 'Review clinical evidence, safety, and the limits of GLP-1 comparisons.' },
      { href: '/guides/other/intermittent-fasting-supplements/', title: 'Supplements and Intermittent Fasting', desc: 'Check which products may support a fast and which change its purpose.' },
      { href: '/guides/other/menopause-supplements/', title: 'Menopause Supplements', desc: 'Compare evidence for common symptom-focused supplement options.' },
      { href: '/guides/other/nmn-supplements/', title: 'NMN Supplements', desc: 'Review human evidence, safety, and the gap between NAD+ and lifespan claims.' },
      { href: '/guides/other/nootropic-stacking-guide/', title: 'Nootropic Stacking', desc: 'Build simpler combinations with mechanism, dosing, and interaction context.' },
      { href: '/guides/other/saffron-supplement/', title: 'Saffron and Mood', desc: 'Review the mood evidence, safety context, and study limitations.' },
      { href: '/guides/other/sleep-supplements-guide/', title: 'Sleep Supplements', desc: 'Compare melatonin, magnesium, L-theanine, glycine, valerian, and more.' },
      { href: '/guides/other/supplement-stacking-safety/', title: 'Supplement Stacking Safety', desc: 'Check serotonergic, sedative, stimulant, and metabolic interaction patterns.' },
      { href: '/guides/other/supplements-for-brain-fog-and-fatigue/', title: 'Brain Fog and Fatigue', desc: 'Start with likely causes and tradeoffs before choosing a supplement lane.' },
      { href: '/guides/other/testosterone-supplements/', title: 'Testosterone Support Supplements', desc: 'Review evidence for common ingredients and the limits of “booster” products.' },
    ],
  },
  {
    id: 'advanced-and-harm-reduction',
    eyebrow: 'Advanced and harm reduction',
    title: 'Research higher-risk and regulated topics',
    description:
      'Educational context for prescription-adjacent compounds, research peptides, withdrawal, and harm reduction—not a purchase or self-treatment list.',
    guides: [
      { href: '/guides/other/bpc-157/', title: 'BPC-157', desc: 'Review preclinical evidence, safety uncertainty, and current legal context.' },
      { href: '/guides/other/cjc-1295/', title: 'CJC-1295', desc: 'Understand the mechanism, research evidence, forms, and legal status.' },
      { href: '/guides/other/ghk-cu/', title: 'GHK-Cu', desc: 'Separate topical cosmetic evidence from injectable and research-only use.' },
      { href: '/guides/other/glp1-supplements/', title: 'Nutrition and Supplements on GLP-1s', desc: 'Review protein, hydration, and nutrient issues discussed with GLP-1 medications.' },
      { href: '/guides/other/healthy-dipping-tobacco-alternatives/', title: 'Dipping Tobacco Alternatives', desc: 'Compare replacement paths through a harm-reduction and cardiovascular lens.' },
      { href: '/guides/other/ipamorelin/', title: 'Ipamorelin', desc: 'Review mechanism, evidence limits, safety, and current legal context.' },
      { href: '/guides/other/kratom-7oh-withdrawal-management/', title: 'Kratom 7-OH Withdrawal', desc: 'Evidence-informed harm reduction, symptom context, and routes to medical support.' },
      { href: '/guides/other/psychedelic-adjacent-herbs/', title: 'Psychedelic-Adjacent Herbs', desc: 'Traditional and ritual botanicals viewed through a harm-reduction framework.' },
      { href: '/guides/other/pt-141/', title: 'PT-141 (Bremelanotide)', desc: 'Distinguish the approved indication from off-label and research-only use.' },
      { href: '/guides/other/semaglutide/', title: 'Semaglutide', desc: 'Evidence, mechanism, side effects, and brand-versus-compounded context.' },
      { href: '/guides/other/tb-500/', title: 'TB-500', desc: 'Review repair research, evidence limits, safety, and legal status.' },
      { href: '/guides/other/tirzepatide/', title: 'Tirzepatide', desc: 'Evidence, dual GIP/GLP-1 mechanism, side effects, and prescribing context.' },
      { href: '/guides/other/melatonin-dosage-guide/', title: 'Melatonin Dosing', desc: 'Understand lower-dose evidence, timing, and common reasons for side effects.' },
    ],
  },
]

export const ALL_TOPIC_GUIDES = TOPIC_GUIDE_GROUPS.flatMap((group) => group.guides)
