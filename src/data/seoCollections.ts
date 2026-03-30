export type CollectionItemType = 'herb' | 'compound' | 'combo'

export type CollectionCtaTarget = 'interaction-checker' | 'stack-builder'

export type SeoCollectionFilters = {
  effectsAny?: string[]
  interactionTagsAny?: string[]
  mechanismAny?: string[]
  comboGoalsAny?: Array<'relaxation' | 'focus' | 'sleep' | 'mood' | 'energy'>
  comboNameAny?: string[]
  comboDescriptionAny?: string[]
}

export type CollectionEditorial = {
  whoFor: string
  selectionRationale: string
  keyTradeoffs: string[]
  cautions: string[]
  exclusions: string[]
  bestFitItems: string[]
  alternatives: string[]
  ctaLabel: string
}

export type SeoCollection = {
  slug: string
  title: string
  description: string
  intro: string
  itemType: CollectionItemType
  filters: SeoCollectionFilters
  cta?: CollectionCtaTarget
  secondaryCta?: CollectionCtaTarget
  editorial?: CollectionEditorial
  relatedSlugs: string[]
}

export const SEO_COLLECTIONS: SeoCollection[] = [
  {
    slug: 'herbs-for-relaxation',
    title: 'Herbs for Relaxation',
    description:
      'Explore herbs associated with calming effects, relaxation support, and sedative-related interaction signals.',
    intro:
      'These herbs are pulled from entries that include relaxation-oriented effects, sedative language, or calming interaction tags.',
    itemType: 'herb',
    filters: {
      effectsAny: ['relaxation', 'calming', 'calm', 'anxiolytic', 'sedative', 'sedation'],
      interactionTagsAny: ['sedative', 'gabaergic', 'cns-depressant'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    editorial: {
      whoFor:
        'Adults comparing calming herbs for evening stress or wind-down decisions, especially when they need to review sedation overlap.',
      selectionRationale:
        'Only herbs with relaxation/anxiolytic effect language plus sedative, GABAergic, or CNS-depressant interaction signals are included.',
      keyTradeoffs: [
        'Broader calming signal capture improves discovery, but it can pull in herbs that feel too sedating for daytime use.',
        'Prioritizing sedation-aware tags helps safety screening, but it does not estimate comparative efficacy between herbs.',
      ],
      cautions: [
        'Sedative overlap can raise impairment risk when layered with sleep aids, alcohol, or sedating medications.',
      ],
      exclusions: [
        'This is not a diagnosis-specific protocol and does not rank herbs by efficacy for anxiety disorders.',
      ],
      bestFitItems: [
        'Best fit when you need evening calm and can tolerate next-day sedation tradeoffs.',
        'Use relaxation-without-sedation instead when daytime clarity matters more than stronger wind-down effects.',
      ],
      alternatives: ['relaxation-without-sedation', 'herbs-for-sleep', 'gabaergic-herbs'],
      ctaLabel:
        'Start in the interaction checker with 2-3 candidates before deciding on any nightly stack.',
    },
    relatedSlugs: ['compounds-for-relaxation', 'calming-herb-combinations', 'gabaergic-herbs'],
  },
  {
    slug: 'herbs-for-focus',
    title: 'Herbs for Focus',
    description:
      'Browse herbs associated with focus, attention, and cognitive clarity signals from the structured dataset.',
    intro:
      'This page includes herbs with focus-like effects or stimulation-oriented interaction tags that are often explored for daytime mental performance.',
    itemType: 'herb',
    filters: {
      effectsAny: ['focus', 'attention', 'clarity', 'cognitive', 'nootropic'],
      interactionTagsAny: ['stimulant'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    editorial: {
      whoFor:
        'People exploring daytime focus support who want attention-oriented options without ignoring stimulant interactions.',
      selectionRationale:
        'Herbs appear here when records include focus/clarity effects and/or stimulant interaction tags used in the dataset.',
      keyTradeoffs: [
        'Stimulant-tagged coverage broadens useful options for attention goals, but increases risk of jittery or overstimulating picks.',
        'Focus-oriented labels improve targeting, but they do not guarantee benefit across different cognitive workloads.',
      ],
      cautions: [
        'Even non-caffeine stimulatory herbs may conflict with anxiety-prone states, blood pressure concerns, or stimulant medications.',
      ],
      exclusions: [
        'This page does not replace ADHD treatment planning and is not a performance-maximization checklist.',
      ],
      bestFitItems: [
        'Best fit for morning or early-day comparison when you need concentration support with explicit interaction screening.',
        'Use natural-focus-without-caffeine when you want a narrower shortlist with less emphasis on stimulant-heavy options.',
      ],
      alternatives: ['natural-focus-without-caffeine', 'herbs-for-energy', 'compounds-for-focus'],
      ctaLabel:
        'Open the checker to compare your shortlist against current meds before building a workday stack.',
    },
    relatedSlugs: [
      'compounds-for-focus',
      'stimulant-herb-combinations',
      'herbs-for-energy',
      'serotonergic-compounds',
    ],
  },
  {
    slug: 'herbs-for-sleep',
    title: 'Herbs for Sleep',
    description:
      'Discover herbs commonly associated with sleep support, nighttime calming, and sedative overlap signals.',
    intro:
      'Included herbs contain sleep-oriented effect terms or central depressant interaction tags that are relevant when evaluating nighttime stacks.',
    itemType: 'herb',
    filters: {
      effectsAny: ['sleep', 'insomnia', 'rest', 'sedative', 'sedation', 'hypnotic'],
      interactionTagsAny: ['sedative', 'cns-depressant', 'gabaergic'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    editorial: {
      whoFor:
        'Readers narrowing options for sleep onset or nighttime calming while trying to avoid risky sedative combinations.',
      selectionRationale:
        'Included herbs must carry sleep/sedation effects and sedative or CNS-depressant style interaction signals in canonical records.',
      keyTradeoffs: [
        'Strong sleep-signal filters improve nighttime relevance, but may surface entries that are too impairing for next-morning performance.',
        'Sedative interaction emphasis improves safety triage, but does not replace diagnosis-level sleep-disorder evaluation.',
      ],
      cautions: [
        'Combining multiple sedative agents can increase next-day grogginess and coordination risk.',
      ],
      exclusions: [
        'This guide is not a substitute for insomnia evaluation, sleep apnea care, or emergency mental health support.',
      ],
      bestFitItems: [
        'Best fit when sleep onset and nighttime calming are primary goals and bedtime-only usage is feasible.',
        'Switch to herbs-for-relaxation for broader stress support, or deep-sleep-recovery for stronger restorative-night framing.',
      ],
      alternatives: ['herbs-for-relaxation', 'calming-herb-combinations', 'herbs-for-deep-sleep-recovery'],
      ctaLabel:
        'Run your evening plan through the checker first, then keep stack size conservative in the builder.',
    },
    relatedSlugs: ['calming-herb-combinations', 'herbs-for-relaxation', 'gabaergic-herbs'],
  },
  {
    slug: 'herbs-for-energy',
    title: 'Herbs for Energy',
    description:
      'Find herbs associated with stimulation, alertness, and endurance-oriented effect language.',
    intro:
      'This collection surfaces herbs whose entries include stimulation or energy terms, then links directly into tools for interaction checks and stack planning.',
    itemType: 'herb',
    filters: {
      effectsAny: ['energy', 'stimulation', 'alert', 'wakefulness', 'endurance'],
      interactionTagsAny: ['stimulant', 'cardioactive'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    editorial: {
      whoFor:
        'People who want daytime energy support options and need to screen for overstimulation or cardioactive interaction flags.',
      selectionRationale:
        'Entries are selected from energy/alertness effect terms combined with stimulant or cardioactive interaction tags.',
      keyTradeoffs: [
        'Including cardioactive and stimulant tags catches higher-risk options early, but can make the set feel conservative for advanced users.',
        'Energy terms improve breadth, but they do not distinguish between smooth endurance support and rapid stimulation.',
      ],
      cautions: [
        'Energy-targeted stacks can worsen jitteriness, sleep timing, or cardiovascular strain when layered aggressively.',
      ],
      exclusions: [
        'This list does not promise fatigue treatment and should not replace workup for persistent exhaustion causes.',
      ],
      bestFitItems: [
        'Best fit for daytime energy planning when you can monitor sleep timing and stimulation load.',
        'Use energy-without-crash for a steadier profile if rebound fatigue or late-day stimulation is a concern.',
      ],
      alternatives: ['energy-without-crash', 'herbs-for-focus', 'stimulant-herb-combinations'],
      ctaLabel:
        'Use the checker to stress-test your morning candidates before adding them into a recurring stack.',
    },
    relatedSlugs: ['compounds-for-focus', 'stimulant-herb-combinations', 'herbs-for-focus'],
  },
  {
    slug: 'compounds-for-relaxation',
    title: 'Compounds for Relaxation',
    description:
      'Explore compounds associated with relaxation, anxiolytic-style effects, and sedative interaction tags.',
    intro:
      'Compounds are included when their effect, mechanism, or interaction tag data contains relaxation and calming-related markers.',
    itemType: 'compound',
    filters: {
      effectsAny: ['relaxation', 'calming', 'anxiolytic', 'sedation', 'sedative'],
      interactionTagsAny: ['sedative', 'gabaergic', 'cns-depressant'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    editorial: {
      whoFor:
        'Users reviewing isolated compounds for calming goals who need a mechanism-aware starting point before stacking.',
      selectionRationale:
        'Compounds qualify through calming/sedative effect language plus sedative, GABAergic, or CNS-depressant interaction markers.',
      keyTradeoffs: [
        'Compound-level specificity can improve mechanistic comparisons, but dose/formulation variability still changes real-world effect size.',
        'Sedative-pathway coverage improves caution framing, but cannot replace clinician review for prescribed medication substitution.',
      ],
      cautions: [
        'Compound-level products can be potent; dose and formulation differences matter more than name matching.',
      ],
      exclusions: [
        'This page is educational and does not endorse self-directed substitution for prescribed anxiolytics.',
      ],
      bestFitItems: [
        'Best fit when you are comparing single-compound calming options before layering with herbs.',
        'Use herbs-for-relaxation when whole-herb profiles are preferred over isolate-focused decision making.',
      ],
      alternatives: ['serotonergic-compounds', 'herbs-for-relaxation', 'calming-herb-combinations'],
      ctaLabel:
        'Compare candidate compounds in the checker before combining them with sedating herbs or prescriptions.',
    },
    relatedSlugs: ['herbs-for-relaxation', 'gabaergic-herbs', 'calming-herb-combinations'],
  },
  {
    slug: 'compounds-for-focus',
    title: 'Compounds for Focus',
    description:
      'Compare compounds tied to focus, alertness, and cognition-oriented language from canonical compound data.',
    intro:
      'This index is generated from compound mechanisms, effects, and interaction tags that point toward stimulation or attention-related use cases.',
    itemType: 'compound',
    filters: {
      effectsAny: ['focus', 'attention', 'clarity', 'cognition', 'stimulation'],
      interactionTagsAny: ['stimulant'],
      mechanismAny: ['dopamin', 'cholinergic'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    editorial: {
      whoFor:
        'Readers evaluating cognition-oriented compounds who want a shortlist tied to mechanism and interaction metadata.',
      selectionRationale:
        'Included compounds carry focus/stimulation effects and dopaminergic/cholinergic mechanism cues in canonical fields.',
      keyTradeoffs: [
        'Mechanism-aware filters improve explainability, but can exclude compounds with weakly documented or mixed mechanisms.',
        'Focus and stimulation cues increase practical relevance, but can bias toward options with higher adverse-effect potential.',
      ],
      cautions: [
        'Focus compounds can still carry stimulant-like adverse effects and may conflict with psychiatric or cardiovascular meds.',
      ],
      exclusions: [
        'Not a nootropic ranking list and not a replacement for individualized medical advice.',
      ],
      bestFitItems: [
        'Best fit when you need mechanism-linked focus compounds and plan to check med conflicts first.',
        'Use herbs-for-focus or natural-focus-without-caffeine when you prefer herb-first options over isolates.',
      ],
      alternatives: ['herbs-for-focus', 'natural-focus-without-caffeine', 'stimulant-herb-combinations'],
      ctaLabel:
        'Launch the checker with one compound plus your baseline meds before trying multi-compound stacks.',
    },
    relatedSlugs: ['herbs-for-focus', 'stimulant-herb-combinations', 'herbs-for-energy'],
  },
  {
    slug: 'calming-herb-combinations',
    title: 'Calming Herb Combinations',
    description:
      'Prebuilt combinations centered on calming, wind-down, and sleep-adjacent goals from the interaction checker dataset.',
    intro:
      'These combinations are pulled directly from the prebuilt combo list and filtered to calming-oriented goals and language.',
    itemType: 'combo',
    filters: {
      comboGoalsAny: ['relaxation', 'sleep'],
      comboNameAny: ['calm', 'relax', 'wind', 'quiet', 'sleep', 'stress'],
      comboDescriptionAny: ['calm', 'relax', 'sleep', 'stress', 'wind-down'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    editorial: {
      whoFor:
        'People who want prebuilt evening-oriented combos and need a quick safety screen before trying them.',
      selectionRationale:
        'Combos must be tagged for relaxation or sleep and match calming or wind-down language in names/descriptions.',
      keyTradeoffs: [
        'Prebuilt combos speed exploration, but may include ingredients that are unnecessary for your specific sleep or stress target.',
        'Goal-tag filtering improves relevance, but can miss quieter combinations that are useful yet described with neutral language.',
      ],
      cautions: [
        'Prebuilt combos can hide duplicate sedative activity across ingredients, so review full component overlap.',
      ],
      exclusions: [
        'These examples are not personalized recommendations and may not fit shift-work or daytime use.',
      ],
      bestFitItems: [
        'Best fit for users who want a fast evening template, then plan to trim ingredients after a checker run.',
        'Use herbs-for-relaxation or herbs-for-sleep when you want to build from single ingredients first.',
      ],
      alternatives: ['herbs-for-sleep', 'herbs-for-relaxation', 'relaxation-without-sedation'],
      ctaLabel:
        'Run the combo in the checker and inspect each ingredient before importing it into your saved stack.',
    },
    relatedSlugs: ['herbs-for-relaxation', 'herbs-for-sleep', 'compounds-for-relaxation'],
  },
  {
    slug: 'stimulant-herb-combinations',
    title: 'Stimulant Herb Combinations',
    description:
      'Prebuilt combinations focused on alertness, focus, and daytime energy from real combo records.',
    intro:
      'Built from preconfigured combos tagged for focus or energy and further matched on stimulation-oriented language.',
    itemType: 'combo',
    filters: {
      comboGoalsAny: ['focus', 'energy'],
      comboNameAny: ['focus', 'spark', 'performance', 'study', 'stimulant', 'energy'],
      comboDescriptionAny: ['stimulation', 'focus', 'alert', 'energy'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    editorial: {
      whoFor:
        'Users looking for daytime combo templates for focus or energy while keeping interaction checks upfront.',
      selectionRationale:
        'Only prebuilt combos with focus/energy goals plus stimulation-oriented name/description terms are surfaced.',
      keyTradeoffs: [
        'Combo templates reduce setup time, but can bundle multiple stimulatory agents that exceed your tolerance window.',
        'Energy/focus tag constraints improve precision, but they do not account for dosing timing or sleep debt context.',
      ],
      cautions: [
        'Stacked stimulatory ingredients can compound sleep disruption and anxiety risk, especially later in the day.',
      ],
      exclusions: [
        'This is not an athletic-performance protocol and does not account for sport anti-doping rules.',
      ],
      bestFitItems: [
        'Best fit for early-day productivity experiments where you can monitor anxiety and sleep effects.',
        'Use energy-without-crash or natural-focus-without-caffeine when you need a less aggressive stimulant profile.',
      ],
      alternatives: ['herbs-for-focus', 'energy-without-crash', 'natural-focus-without-caffeine'],
      ctaLabel:
        'Open each combo in the checker first, then trim ingredients before saving a repeatable daytime stack.',
    },
    relatedSlugs: ['herbs-for-focus', 'herbs-for-energy', 'compounds-for-focus'],
  },
  {
    slug: 'serotonergic-compounds',
    title: 'Serotonergic Compounds',
    description:
      'Review compounds with serotonergic interaction tags or mechanism language referencing serotonin pathways.',
    intro:
      'Entries are included only when the underlying compound record has direct serotonergic tags or serotonin-related mechanism text.',
    itemType: 'compound',
    filters: {
      interactionTagsAny: ['serotonergic', 'maoi'],
      mechanismAny: ['seroton', '5-ht', 'mao'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['herbs-for-relaxation', 'gabaergic-herbs', 'compounds-for-relaxation'],
  },
  {
    slug: 'gabaergic-herbs',
    title: 'GABAergic Herbs',
    description:
      'See herbs carrying GABAergic or related CNS depressant interaction signals in canonical herb records.',
    intro:
      'This collection narrows to herbs with direct GABAergic-style tags or calming mechanism/effect language for safety-first exploration.',
    itemType: 'herb',
    filters: {
      interactionTagsAny: ['gabaergic', 'cns-depressant', 'sedative'],
      mechanismAny: ['gaba', 'gabaa', 'gaba-a'],
      effectsAny: ['sedative', 'calming', 'sleep', 'anxiolytic'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['herbs-for-relaxation', 'herbs-for-sleep', 'compounds-for-relaxation'],
  },
  {
    slug: 'herbs-for-anxiety-and-overthinking',
    title: 'Herbs for Anxiety and Overthinking',
    description:
      'A calming-first collection of herbs tagged with anxiolytic, stress, and rumination-adjacent language.',
    intro:
      'Generated from canonical herb records using calming effect terms and sedative/GABA-related interaction markers for safety-first stack planning.',
    itemType: 'herb',
    filters: {
      effectsAny: ['anxiety', 'anxiolytic', 'calming', 'stress', 'relaxation'],
      interactionTagsAny: ['gabaergic', 'sedative', 'cns-depressant'],
      mechanismAny: ['gaba', 'cortisol', 'stress'],
    },
    relatedSlugs: [
      'herbs-for-relaxation',
      'herbs-for-social-anxiety',
      'stress-and-cortisol-support',
    ],
  },
  {
    slug: 'herbs-for-deep-sleep-recovery',
    title: 'Herbs for Deep Sleep Recovery',
    description:
      'Sleep-supportive herbs filtered for sedation, nighttime wind-down, and restorative language.',
    intro:
      'These entries surface herbs often used around sleep depth and nighttime recovery based on effects and interaction tags.',
    itemType: 'herb',
    filters: {
      effectsAny: ['sleep', 'insomnia', 'deep sleep', 'restorative', 'sedative'],
      interactionTagsAny: ['sedative', 'gabaergic', 'cns-depressant'],
    },
    editorial: {
      whoFor:
        'People focused on nighttime recovery who want to compare stronger sleep-oriented herbs with explicit sedative framing.',
      selectionRationale:
        'Records are selected for sleep/restorative language and sedative or GABA-related interaction tags in the herb dataset.',
      keyTradeoffs: [
        'Deep-sleep emphasis improves restorative-night targeting, but increases the chance of selecting herbs that are too heavy for occasional use.',
        'Sedative-tag coverage improves risk awareness, but does not indicate suitability for complex sleep disorders.',
      ],
      cautions: [
        'This set intentionally captures stronger nighttime signals, so daytime use may be inappropriate for many users.',
      ],
      exclusions: [
        'Not intended for pediatric use planning, pregnancy-specific decisions, or emergency insomnia crises.',
      ],
      bestFitItems: [
        'Best fit when nighttime recovery is the top goal and you can reserve use for bedtime windows.',
        'Use herbs-for-sleep for broader coverage or relaxation-without-sedation when residual sedation is unacceptable.',
      ],
      alternatives: ['herbs-for-sleep', 'herbs-for-relaxation', 'calming-herb-combinations'],
      ctaLabel:
        'Check any proposed bedtime combination in the interaction tool before adding additional sedative agents.',
    },
    relatedSlugs: ['herbs-for-sleep', 'relaxation-without-sedation', 'herbs-for-burnout-recovery'],
  },
  {
    slug: 'natural-focus-without-caffeine',
    title: 'Natural Focus Without Caffeine',
    description:
      'Focus-oriented herbs emphasizing cognition and attention terms while reducing caffeine dependence patterns.',
    intro:
      'This collection highlights non-caffeine herbs tied to attention, cognition, and calm-focus signals for productive daytime stacks.',
    itemType: 'herb',
    filters: {
      effectsAny: ['focus', 'attention', 'clarity', 'nootropic', 'cognitive'],
      mechanismAny: ['cholinergic', 'dopamin'],
      interactionTagsAny: ['stimulant'],
    },
    relatedSlugs: ['herbs-for-focus', 'cognitive-enhancement-natural', 'energy-without-crash'],
  },
  {
    slug: 'mood-stabilizing-herbs',
    title: 'Mood Stabilizing Herbs',
    description:
      'Mood-support herbs filtered for emotional balance, resilience, and anxiolytic-style pathways.',
    intro:
      'Built from herb effects and mechanisms linked to mood support terms, then routed into stack safety checks.',
    itemType: 'herb',
    filters: {
      effectsAny: ['mood', 'anxiety', 'stress', 'wellbeing', 'calming'],
      mechanismAny: ['seroton', 'dopamin', 'gaba'],
      interactionTagsAny: ['serotonergic', 'gabaergic'],
    },
    relatedSlugs: [
      'herbs-for-anxiety-and-overthinking',
      'stress-and-cortisol-support',
      'herbs-for-social-anxiety',
    ],
  },
  {
    slug: 'herbs-for-burnout-recovery',
    title: 'Herbs for Burnout Recovery',
    description:
      'Recovery-oriented herbs for stress load, fatigue, and adaptive resilience support.',
    intro:
      'Designed for post-stress recovery exploration with adaptogenic and nervous-system related filters.',
    itemType: 'herb',
    filters: {
      effectsAny: ['stress', 'fatigue', 'energy', 'recovery', 'adaptogen'],
      mechanismAny: ['cortisol', 'hpa', 'adapt'],
      interactionTagsAny: ['adaptogen', 'cardioactive'],
    },
    relatedSlugs: [
      'stress-and-cortisol-support',
      'energy-without-crash',
      'herbs-for-deep-sleep-recovery',
    ],
  },
  {
    slug: 'stress-and-cortisol-support',
    title: 'Stress and Cortisol Support',
    description:
      'Herbs matched to stress-response and cortisol-adjacent mechanism language for daily resilience support.',
    intro:
      'Generated from effect and mechanism fields that reference stress regulation, HPA support, and calming pathways.',
    itemType: 'herb',
    filters: {
      effectsAny: ['stress', 'calming', 'anxiety', 'resilience'],
      mechanismAny: ['cortisol', 'hpa', 'stress'],
      interactionTagsAny: ['adaptogen', 'gabaergic'],
    },
    relatedSlugs: [
      'herbs-for-burnout-recovery',
      'mood-stabilizing-herbs',
      'herbs-for-anxiety-and-overthinking',
    ],
  },
  {
    slug: 'herbs-for-social-anxiety',
    title: 'Herbs for Social Anxiety',
    description:
      'A practical set of herbs explored for calm confidence and social stress management.',
    intro:
      'Includes herbs with calming, anxiolytic, and focus-stability language for social scenarios where sedation should be balanced.',
    itemType: 'herb',
    filters: {
      effectsAny: ['social anxiety', 'anxiety', 'calming', 'focus', 'stress'],
      interactionTagsAny: ['gabaergic', 'serotonergic', 'sedative'],
      mechanismAny: ['gaba', 'seroton'],
    },
    relatedSlugs: [
      'herbs-for-anxiety-and-overthinking',
      'relaxation-without-sedation',
      'mood-stabilizing-herbs',
    ],
  },
  {
    slug: 'cognitive-enhancement-natural',
    title: 'Cognitive Enhancement Natural',
    description:
      'Natural cognition-support herbs for memory, attention, and clarity-focused stacks.',
    intro:
      'This page groups herbs with cognitive and nootropic signals and routes directly to interaction checks.',
    itemType: 'herb',
    filters: {
      effectsAny: ['cognitive', 'memory', 'focus', 'clarity', 'nootropic'],
      mechanismAny: ['cholinergic', 'dopamin', 'neuro'],
      interactionTagsAny: ['stimulant'],
    },
    relatedSlugs: ['natural-focus-without-caffeine', 'herbs-for-focus', 'energy-without-crash'],
  },
  {
    slug: 'relaxation-without-sedation',
    title: 'Relaxation Without Sedation',
    description:
      'Calm-support herbs selected to emphasize relaxation and focus balance without heavy sedation language.',
    intro:
      'Curated from herbs containing calming effects while still retaining daytime-usable clarity terms.',
    itemType: 'herb',
    filters: {
      effectsAny: ['calming', 'relaxation', 'stress', 'focus'],
      mechanismAny: ['gaba', 'adapt'],
      interactionTagsAny: ['gabaergic', 'adaptogen'],
    },
    relatedSlugs: [
      'herbs-for-relaxation',
      'herbs-for-social-anxiety',
      'natural-focus-without-caffeine',
    ],
  },
  {
    slug: 'energy-without-crash',
    title: 'Energy Without Crash',
    description:
      'Steadier energy herbs filtered for alertness, endurance, and reduced over-stimulation profiles.',
    intro:
      'Designed for daytime stacks that prioritize sustained output and smoother energy curves.',
    itemType: 'herb',
    filters: {
      effectsAny: ['energy', 'alertness', 'endurance', 'focus'],
      mechanismAny: ['dopamin', 'adapt', 'metabolic'],
      interactionTagsAny: ['stimulant', 'adaptogen'],
    },
    relatedSlugs: [
      'herbs-for-energy',
      'natural-focus-without-caffeine',
      'herbs-for-burnout-recovery',
    ],
  },
]

export const FEATURED_COLLECTION_SLUGS = [
  'herbs-for-relaxation',
  'herbs-for-focus',
  'herbs-for-sleep',
  'compounds-for-relaxation',
  'calming-herb-combinations',
  'stimulant-herb-combinations',
  'serotonergic-compounds',
  'gabaergic-herbs',
]

export function getCollectionBySlug(slug: string) {
  return SEO_COLLECTIONS.find(collection => collection.slug === slug)
}
