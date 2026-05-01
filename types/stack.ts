export type StackItemRole = 'anchor' | 'amplifier' | 'support' | 'finisher'

export type StackItem = {
  compound: string
  dosage: string
  timing: string
  role: StackItemRole
}

export type Stack = {
  slug: string
  title: string
  goal: string
  short_description?: string
  stack: StackItem[]
  who_for?: string
  avoid_if?: string
  cta?: string
}

export type CompoundSummary = {
  slug?: string
  name?: string
  primary_effect?: string
  primary_effects?: string[]
  mechanism_summary?: string
  safety_notes?: string
}

export type AffiliateProduct = {
  name: string
  brand?: string
  price?: string
  rating?: number
  link: string
}

export type AffiliateEntry = {
  compound: string
  products: AffiliateProduct[]
}
