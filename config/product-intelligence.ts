export type ProductIntent = {
  label: string
  description: string
  searchModifier: string
  qualitySignal: string
}

export type ProductIntelligence = {
  defaultForm: string
  qualityChecklist: string[]
  avoidSignals: string[]
  intents: ProductIntent[]
}

const DEFAULT_PRODUCT_INTELLIGENCE: ProductIntelligence = {
  defaultForm: 'Look for a clearly labeled supplement form with transparent serving size, active amount, and third-party quality signals when available.',
  qualityChecklist: [
    'Clear active ingredient amount per serving',
    'No proprietary blend hiding the dose',
    'Third-party testing or quality certification when available',
    'Conservative serving instructions and transparent label',
  ],
  avoidSignals: [
    'Megadose claims without source context',
    'Proprietary blends that hide individual ingredient amounts',
    'Disease-treatment claims or miracle language',
    'Unclear extract strength or missing serving information',
  ],
  intents: [
    {
      label: 'Best overall',
      description: 'Start here when you want a balanced choice with clear labeling and quality signals.',
      searchModifier: 'supplement third party tested',
      qualitySignal: 'Clear label + quality testing',
    },
    {
      label: 'Best value',
      description: 'Use this when price matters but you still want transparent dosing and no hidden blend.',
      searchModifier: 'supplement value transparent label',
      qualitySignal: 'Cost-conscious + transparent dose',
    },
    {
      label: 'Best premium',
      description: 'Use this when you want stronger quality signals, standardized extracts, or advanced forms.',
      searchModifier: 'supplement premium standardized extract',
      qualitySignal: 'Premium form + stronger quality signals',
    },
  ],
}

const SPECIFIC_PRODUCT_INTELLIGENCE: Record<string, Partial<ProductIntelligence>> = {
  magnesium: {
    defaultForm: 'Common practical forms include magnesium glycinate for gentler evening use and magnesium citrate when bowel regularity is also relevant.',
    qualityChecklist: [
      'Specific magnesium form listed clearly',
      'Elemental magnesium amount shown per serving',
      'Avoids excessive serving sizes',
      'Third-party testing when available',
    ],
  },
  melatonin: {
    defaultForm: 'For sleep onset, lower-dose melatonin products are often the more conservative starting point than high-dose gummies or blends.',
    qualityChecklist: [
      'Dose is clearly listed in milligrams or micrograms',
      'Lower-dose option available',
      'No hidden sedative blend',
      'Clear timing instructions',
    ],
    avoidSignals: [
      'Very high-dose products marketed as stronger sleep solutions',
      'Undisclosed sleep blends',
      'Products positioned for daily indefinite use without context',
    ],
  },
  'l-theanine': {
    defaultForm: 'Plain L-theanine capsules are usually easier to reason about than multi-ingredient calming blends.',
    qualityChecklist: [
      'Plain L-theanine listed as the active ingredient',
      'Dose shown clearly per serving',
      'Minimal stimulant or sedative add-ons',
      'Third-party testing when available',
    ],
  },
  creatine: {
    defaultForm: 'Creatine monohydrate is the default evidence-aligned form for most users.',
    qualityChecklist: [
      'Creatine monohydrate listed clearly',
      'No unnecessary proprietary blend',
      'Serving size supports common daily use',
      'Third-party testing when available',
    ],
  },
  berberine: {
    defaultForm: 'Look for clearly dosed berberine products and review medication interactions before buying.',
    qualityChecklist: [
      'Berberine amount listed clearly per serving',
      'No hidden metabolic blend',
      'Clear caution language for medication users',
      'Third-party testing when available',
    ],
    avoidSignals: [
      'Aggressive blood-sugar or weight-loss claims',
      'Proprietary metabolic blends',
      'No interaction or medication caution language',
    ],
  },
  ashwagandha: {
    defaultForm: 'Standardized ashwagandha extracts are easier to compare than vague root-powder blends.',
    qualityChecklist: [
      'Extract type or standardization is clearly stated',
      'Dose is clearly listed per serving',
      'No hidden adaptogen blend',
      'Safety cautions for thyroid, pregnancy, and medication context when available',
    ],
  },
}

const normalizeKey = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

export function getProductIntelligence(name: string): ProductIntelligence {
  const key = normalizeKey(name)
  const specific = SPECIFIC_PRODUCT_INTELLIGENCE[key] ?? {}

  return {
    ...DEFAULT_PRODUCT_INTELLIGENCE,
    ...specific,
    qualityChecklist: specific.qualityChecklist ?? DEFAULT_PRODUCT_INTELLIGENCE.qualityChecklist,
    avoidSignals: specific.avoidSignals ?? DEFAULT_PRODUCT_INTELLIGENCE.avoidSignals,
    intents: specific.intents ?? DEFAULT_PRODUCT_INTELLIGENCE.intents,
  }
}
