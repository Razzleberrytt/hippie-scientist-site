import { buildAmazonSearchUrl } from '@/lib/affiliate'

type ProductRecord = Record<string, any>

type ProductCTAProps = {
  data?: ProductRecord | null
  title?: string
  fallbackQuery?: string
  topPicks?: ProductRecord[]
}

const text = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.value ?? record.text ?? record.label ?? record.name ?? record.title)
  }
  return String(value).replace(/\s+/g, ' ').trim()
}

const list = (value: unknown): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  return text(value)
    .split(/\n|;|\|/)
    .map(item => item.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
}

const getProductLink = (data?: ProductRecord | null, fallbackQuery?: string) => {
  const link = text(data?.preferred_vendor_url) || text(data?.affiliate_url_template) || text(data?.fallback_url)
  if (link) return link
  return fallbackQuery ? buildAmazonSearchUrl(fallbackQuery) : ''
}

const getCtaLabel = (data?: ProductRecord | null) => text(data?.product_cta) || 'Shop Evidence-Based Options'

const getPickLink = (pick: ProductRecord, fallbackQuery?: string) =>
  getProductLink(pick, text(pick.product_query) || text(pick.query) || fallbackQuery)

const getPickTitle = (pick: ProductRecord, index: number) =>
  text(pick.top_pick_label) || text(pick.pick_label) || text(pick.product_title) || text(pick.name) || ['Best evidence-matched option', 'Budget option', 'Premium tested option'][index] || 'Product option'

const getPickBadge = (pick: ProductRecord, index: number) =>
  text(pick.top_pick_label) || ['🥇 Top Pick', '💰 Budget', '🧪 Premium'][index] || 'Option'

export function ProductCTA({ data, title = 'What to look for', fallbackQuery, topPicks = [] }: ProductCTAProps) {
  const criteria = list(data?.buying_criteria || data?.what_to_look_for || data?.selection_criteria)
  const link = getProductLink(data, fallbackQuery)
  const sortedPicks = [...topPicks]
    .filter(Boolean)
    .sort((a, b) => Number(b.ranking_score || 0) - Number(a.ranking_score || 0))
    .slice(0, 3)

  if (!link && criteria.length === 0 && sortedPicks.length === 0) return null

  return (
    <section className="mt-6 rounded-2xl border border-neutral-700 bg-neutral-900/90 p-4 text-white shadow-card">
      {criteria.length ? (
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-300/90">{title}</div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-100">
            {criteria.map(item => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      ) : null}

      {sortedPicks.length ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-300/90">Top Picks</h2>
          <div className="mt-3 grid gap-2">
            {sortedPicks.map((pick, index) => {
              const pickLink = getPickLink(pick, fallbackQuery)
              const content = (
                <>
                  <span className="block text-xs font-bold uppercase tracking-[0.12em] text-emerald-200/90">{getPickBadge(pick, index)}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-white">{getPickTitle(pick, index)}</span>
                  {text(pick.reasoning || pick.notes || pick.best_for) ? <span className="mt-1 block text-xs leading-5 text-neutral-300">{text(pick.reasoning || pick.notes || pick.best_for)}</span> : null}
                </>
              )

              return pickLink ? (
                <a key={`${getPickTitle(pick, index)}-${index}`} href={pickLink} target="_blank" rel="nofollow sponsored noopener noreferrer" className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 hover:border-emerald-300/40 hover:bg-white/[0.08]">
                  {content}
                </a>
              ) : (
                <div key={`${getPickTitle(pick, index)}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3">
                  {content}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {link ? (
        <a href={link} target="_blank" rel="nofollow sponsored noopener noreferrer" className="mt-5 block w-full rounded-xl bg-green-500 px-4 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-green-400">
          {getCtaLabel(data)}
        </a>
      ) : null}

      <div className="mt-2 text-xs leading-5 text-neutral-400">
        As an affiliate, we may earn from qualifying purchases. Educational only; compare labels and talk with a qualified clinician when safety matters.
      </div>
    </section>
  )
}

export default ProductCTA
