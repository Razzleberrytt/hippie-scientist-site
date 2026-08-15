export type LabelIngredient = {
  name: string
  amount?: number
  unit?: 'mg' | 'mcg' | 'g' | 'IU' | string
  standardizedTo?: string
  extractRatio?: string
  proprietaryBlend?: boolean
  blendName?: string
  form?: string
  dailyValuePercent?: number
}

export type SupplementLabelInput = {
  productName?: string
  servingSize?: string
  servingsPerContainer?: number
  ingredients: LabelIngredient[]
  otherIngredients?: string[]
  certifications?: string[]
  testingClaims?: string[]
  manufacturerClaims?: string[]
}

export type LabelIssueSeverity = 'info' | 'caution' | 'high'

export type LabelIssue = {
  code:
    | 'PROPRIETARY_BLEND'
    | 'MISSING_AMOUNT'
    | 'AMBIGUOUS_FORM'
    | 'AMBIGUOUS_STANDARDIZATION'
    | 'EXTRACT_RATIO_ONLY'
    | 'MEGADOSE_SIGNAL'
    | 'UNVERIFIED_TESTING_CLAIM'
    | 'CLAIM_LANGUAGE'
    | 'DUPLICATE_INGREDIENT'
  severity: LabelIssueSeverity
  ingredient?: string
  message: string
}

export type ProductLabelQuality = {
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  transparencyScore: number
  specificityScore: number
  testingTransparencyScore: number
  issues: LabelIssue[]
  disclaimer: string
}

const STRONG_MARKETING_RE = /\b(?:cure|treat|prevent|guaranteed|clinically proven|doctor recommended|miracle)\b/i
const RECOGNIZED_TESTING_RE = /\b(?:USP|NSF|ConsumerLab|Informed Sport|Informed Choice)\b/i

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function normalizeIngredientName(value: string) {
  return value
    .toLowerCase()
    .replace(/[®™]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function analyzeSupplementLabel(input: SupplementLabelInput): ProductLabelQuality {
  const issues: LabelIssue[] = []
  const seen = new Map<string, number>()

  for (const ingredient of input.ingredients) {
    const normalizedName = normalizeIngredientName(ingredient.name)
    seen.set(normalizedName, (seen.get(normalizedName) ?? 0) + 1)

    if (ingredient.proprietaryBlend) {
      issues.push({
        code: 'PROPRIETARY_BLEND', severity: 'high', ingredient: ingredient.name,
        message: 'A proprietary blend hides the amount of one or more included ingredients.',
      })
    }
    if (ingredient.amount == null) {
      issues.push({
        code: 'MISSING_AMOUNT', severity: ingredient.proprietaryBlend ? 'high' : 'caution', ingredient: ingredient.name,
        message: 'No exact amount is disclosed for this ingredient.',
      })
    }
    if (!ingredient.form) {
      issues.push({
        code: 'AMBIGUOUS_FORM', severity: 'info', ingredient: ingredient.name,
        message: 'The chemical, botanical, or extract form is not clearly specified.',
      })
    }
    if (ingredient.standardizedTo && !/%|mg|mcg|g\b/i.test(ingredient.standardizedTo)) {
      issues.push({
        code: 'AMBIGUOUS_STANDARDIZATION', severity: 'caution', ingredient: ingredient.name,
        message: 'Standardization is mentioned without a clearly interpretable quantity or percentage.',
      })
    }
    if (ingredient.extractRatio && !ingredient.standardizedTo) {
      issues.push({
        code: 'EXTRACT_RATIO_ONLY', severity: 'info', ingredient: ingredient.name,
        message: 'An extract ratio is provided without constituent standardization; ratio alone does not establish potency or efficacy.',
      })
    }
    if (ingredient.amount != null && ingredient.unit === 'mg' && ingredient.amount >= 5000) {
      issues.push({
        code: 'MEGADOSE_SIGNAL', severity: 'caution', ingredient: ingredient.name,
        message: 'The disclosed amount is unusually large and deserves ingredient-specific safety review.',
      })
    }
  }

  for (const [name, count] of seen) {
    if (count > 1) {
      issues.push({
        code: 'DUPLICATE_INGREDIENT', severity: 'caution', ingredient: name,
        message: 'This ingredient appears more than once and may contribute to an unexpectedly high total amount.',
      })
    }
  }

  for (const claim of input.testingClaims ?? []) {
    if (!RECOGNIZED_TESTING_RE.test(claim)) {
      issues.push({
        code: 'UNVERIFIED_TESTING_CLAIM', severity: 'info',
        message: `Testing claim requires verification rather than assumption: ${claim}`,
      })
    }
  }

  for (const claim of input.manufacturerClaims ?? []) {
    if (STRONG_MARKETING_RE.test(claim)) {
      issues.push({
        code: 'CLAIM_LANGUAGE', severity: 'high',
        message: `Strong therapeutic or certainty language should not be treated as evidence: ${claim}`,
      })
    }
  }

  const ingredientCount = Math.max(1, input.ingredients.length)
  const amountCoverage = input.ingredients.filter((ingredient) => ingredient.amount != null).length / ingredientCount
  const formCoverage = input.ingredients.filter((ingredient) => Boolean(ingredient.form)).length / ingredientCount
  const proprietaryCount = input.ingredients.filter((ingredient) => ingredient.proprietaryBlend).length
  const transparencyScore = clampScore(amountCoverage * 75 + (1 - proprietaryCount / ingredientCount) * 25)
  const specificityScore = clampScore(formCoverage * 65 + input.ingredients.filter((ingredient) => ingredient.standardizedTo).length / ingredientCount * 35)

  const testingClaims = input.testingClaims ?? []
  const recognizedTestingCount = testingClaims.filter((claim) => RECOGNIZED_TESTING_RE.test(claim)).length
  const testingTransparencyScore = testingClaims.length === 0
    ? 50
    : clampScore((recognizedTestingCount / testingClaims.length) * 100)

  const highPenalty = issues.filter((issue) => issue.severity === 'high').length * 12
  const cautionPenalty = issues.filter((issue) => issue.severity === 'caution').length * 5
  const score = clampScore(transparencyScore * 0.5 + specificityScore * 0.3 + testingTransparencyScore * 0.2 - highPenalty - cautionPenalty)
  const grade: ProductLabelQuality['grade'] = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'D'

  return {
    score,
    grade,
    transparencyScore,
    specificityScore,
    testingTransparencyScore,
    issues,
    disclaimer: 'Label analysis is informational. It evaluates disclosure quality, not whether a product is safe, effective, or appropriate for an individual.',
  }
}

export function compareLabels(left: SupplementLabelInput, right: SupplementLabelInput) {
  const leftQuality = analyzeSupplementLabel(left)
  const rightQuality = analyzeSupplementLabel(right)
  const winner = leftQuality.score === rightQuality.score
    ? 'tie'
    : leftQuality.score > rightQuality.score ? 'left' : 'right'

  return {
    left: leftQuality,
    right: rightQuality,
    winner,
    explanation: winner === 'tie'
      ? 'The labels have similar disclosure quality scores.'
      : 'The higher score reflects clearer amounts, forms, standardization, and testing disclosure; it is not an efficacy ranking.',
  }
}
