export type RevenueDashboardMetric = {
  label: string
  value: string
  description: string
}

export type RevenueDashboardRow = {
  compound: string
  slug: string
  productClicks: number
  topIntent: string
  nextAction: string
}

export const revenueDashboardMetrics: RevenueDashboardMetric[] = [
  {
    label: 'Tracked event',
    value: 'affiliate_click',
    description: 'Event emitted when a user clicks a product button.',
  },
  {
    label: 'Tracked destinations',
    value: 'Amazon',
    description: 'Current affiliate destination used by product cards.',
  },
  {
    label: 'Optimization target',
    value: 'Clicks by compound',
    description: 'Use click concentration to decide which pages to expand first.',
  },
]

export const revenueDashboardStarterRows: RevenueDashboardRow[] = [
  {
    compound: 'Creatine',
    slug: 'creatine',
    productClicks: 0,
    topIntent: 'Best overall / sport-tested / value',
    nextAction: 'Watch whether sport-tested or value clicks win, then expand that product angle.',
  },
  {
    compound: 'Magnesium',
    slug: 'magnesium',
    productClicks: 0,
    topIntent: 'Glycinate / value glycinate / mainstream',
    nextAction: 'If magnesium gets clicks, split into magnesium glycinate, citrate, and threonate pages.',
  },
  {
    compound: 'Melatonin',
    slug: 'melatonin',
    productClicks: 0,
    topIntent: 'Low dose / mainstream / fast dissolve',
    nextAction: 'If low-dose clicks win, emphasize conservative sleep-onset positioning.',
  },
  {
    compound: 'L-Theanine',
    slug: 'l-theanine',
    productClicks: 0,
    topIntent: 'Overall / value / caffeine-stack option',
    nextAction: 'If caffeine-stack clicks win, build coffee + theanine comparison content.',
  },
]
