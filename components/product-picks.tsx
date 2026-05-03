import { AFFILIATE_TAGS } from '@/config/affiliate'
import type { CompoundProductPicks } from '@/config/real-product-picks'

type Props = {
  picks: CompoundProductPicks
}

const makeProductUrl = (query: string) => {
  const encoded = encodeURIComponent(query)
  return `https://www.amazon.com/s?k=${encoded}&tag=${AFFILIATE_TAGS.amazon}`
}

export default function ProductPicks({ picks }: Props) {
  const featured = picks.picks[0]
  const remaining = picks.picks.slice(1)

  return (
    <section className="mt-10 rounded-[2rem] border border-emerald-900/10 bg-white/80 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700/70">Product picks</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Best product formats to compare</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{picks.intro}</p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-800 ring-1 ring-amber-900/10">
          Affiliate supported
        </span>
      </div>

      {featured ? (
        <article className="mt-6 rounded-[1.5rem] border border-emerald-900/10 bg-emerald-50/70 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800/70">Top pick</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">{featured.productName}</h3>
              <p className="mt-1 text-sm font-bold text-slate-600">{featured.brand} · {featured.form}</p>
            </div>
            <a
              href={makeProductUrl(featured.searchQuery)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-600"
            >
              Compare prices →
            </a>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Best for</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{featured.bestFor}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Quality signal</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{featured.qualityNote}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Dose note</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{featured.doseNote || 'Check the active amount per serving on the exact product label.'}</p>
            </div>
          </div>

          {featured.caution ? (
            <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900 ring-1 ring-amber-900/10">
              Safety check: {featured.caution}
            </p>
          ) : null}
        </article>
      ) : null}

      {remaining.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {remaining.map((pick) => (
            <article key={`${pick.label}-${pick.productName}`} className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700/70">{pick.label}</p>
              <h3 className="mt-2 text-xl font-black text-slate-950">{pick.productName}</h3>
              <p className="mt-1 text-sm font-bold text-slate-600">{pick.brand} · {pick.form}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{pick.bestFor}</p>
              <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">{pick.qualityNote}</p>
              {pick.caution ? (
                <p className="mt-3 text-sm font-semibold leading-6 text-amber-800">Safety check: {pick.caution}</p>
              ) : null}
              <a
                href={makeProductUrl(pick.searchQuery)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-4 inline-flex rounded-full border border-emerald-900/10 px-4 py-2 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
              >
                Compare options →
              </a>
            </article>
          ))}
        </div>
      ) : null}

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Product picks are educational shopping aids, not medical advice. Check the current product label, ingredients, dose, allergens, and third-party testing before buying. Affiliate links may earn a commission at no extra cost to you.
      </p>
    </section>
  )
}
