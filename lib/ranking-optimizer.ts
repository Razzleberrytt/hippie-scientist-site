import { clickSignals } from '@/data/click-signals'

export function applyClickBoost(compounds: any[], pageSlug: string) {
  return compounds
    .map(c => {
      const signal = clickSignals.find(s => s.compound_slug === c.slug && s.page_slug === pageSlug)
      const boost = signal ? Math.min(signal.clicks * 0.5, 50) : 0
      return { ...c, _clickBoost: boost }
    })
    .sort((a, b) => (b._score || 0) + b._clickBoost - ((a._score || 0) + a._clickBoost))
}
