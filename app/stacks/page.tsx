import type { Metadata } from 'next'
import Link from 'next/link'
import LibraryEmptyState from '@/components/decision/LibraryEmptyState'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Evidence-Based Supplement Stacks',
  description:
    'Browse goal-based supplement stacks for sleep, stress, cognition, performance, and fat loss — with dosing, timing, and safety context.',
  path: '/stacks',
})

import stacks from '@/public/data/stacks.json'

type StackItem = {
  slug: string
  title: string
  goal?: string
  short_description?: string
  stack?: Array<{ compound?: string; dosage?: string; timing?: string; role?: string }>
  who_for?: string
  avoid_if?: string
  cta?: string
}

const stackItems = stacks as StackItem[]

const formatLabel = (value?: string) =>
  (value ?? '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const roleBadge = (role?: string) => {
  if (role === 'anchor') return 'bg-emerald-50 text-emerald-800 border-emerald-200'
  if (role === 'amplifier') return 'bg-amber-50 text-amber-800 border-amber-200'
  if (role === 'finisher') return 'bg-indigo-50 text-indigo-800 border-indigo-200'
  return 'bg-stone-50 text-muted border-brand-900/10'
}



function StackIngredient({ item }: { item: { compound?: string; dosage?: string; timing?: string; role?: string } }) {
  return (
    <div className="rounded-xl border border-brand-900/10 bg-stone-50/60 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-ink">{formatLabel(item.compound)}</p>
          <p className="mt-1 text-sm text-muted">{item.dosage} · {item.timing}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] ${roleBadge(item.role)}`}>
          {formatLabel(item.role)}
        </span>
      </div>
    </div>
  )
}

export default function StacksPage() {
  const featured = stackItems[0]
  const remaining = stackItems.slice(1)
  const recoveryLinks = [
    { href: '/goals', label: 'Explore goals' },
    { href: '/compounds', label: 'Browse compounds' },
    { href: '/search', label: 'Search the library' },
  ]

  if (stackItems.length === 0) {
    return (
      <div className="space-y-8 px-1 sm:px-0">
        <LibraryEmptyState
          title="Stack profiles are still being expanded."
          description="The stack library is temporarily light while profiles finish generating. Explore goals, compounds, or search while the next stack guides become available."
          recoveryLinks={recoveryLinks}
          suggestedSearches={['ashwagandha', 'l-theanine', 'sleep stack', 'focus stack']}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 px-1 sm:px-0">
      <section className="hero-shell rounded-3xl border border-brand-900/10 p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="eyebrow-label">Decision guides</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-ink sm:text-6xl">Supplement stacks</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              Start from a goal, then drill into compounds, timing, safety notes, and product-search paths without scrolling through the whole database.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-brand-900/10 bg-stone-50/50 p-2 text-center">
            <div className="rounded-xl bg-white/90 px-3 py-3 shadow-sm">
              <div className="text-2xl font-black text-ink">{stackItems.length}</div>
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">Stacks</div>
            </div>
            <div className="rounded-xl bg-white/90 px-3 py-3 shadow-sm">
              <div className="text-2xl font-black text-emerald-700">3</div>
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">Steps</div>
            </div>
            <div className="rounded-xl bg-white/90 px-3 py-3 shadow-sm">
              <div className="text-2xl font-black text-amber-700">⚠</div>
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">Caution notes</div>
            </div>
          </div>
        </div>
      </section>

      {featured ? (
        <section className="card-premium p-5 shadow-md sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="eyebrow-label">Featured stack</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-5xl">{featured.title}</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{featured.short_description}</p>
              {featured.who_for ? (
                <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-ink">
                  <span className="font-black text-emerald-800">Best for:</span> {featured.who_for}
                </p>
              ) : null}
              <Link href={`/stacks/${featured.slug}`} className="mt-5 inline-flex rounded-xl bg-brand-850 px-5 py-3 text-base font-black text-white shadow-sm transition hover:bg-brand-900 hover:-translate-y-0.5">
                Open full stack →
              </Link>
              {featured.cta ? (
                <Link href={`/stacks/${featured.slug}#products`} className="mt-3 inline-flex rounded-xl border border-brand-850 px-5 py-3 text-base font-black text-brand-850 shadow-sm transition hover:bg-brand-850 hover:text-white hover:-translate-y-0.5">
                  {featured.cta}
                </Link>
              ) : null}
            </div>

            <div className="grid gap-3">
              {(featured.stack ?? []).slice(0, 3).map((item, index) => (
                item.compound ? <StackIngredient key={`${featured.slug}-${item.compound}-${index}`} item={item} /> : null
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow-label">Browse by goal</p>
            <h2 className="mt-1 text-3xl font-black text-ink">Stack library</h2>
            <p className="mt-1 text-sm text-muted">Each stack shows the actual pattern before the click.</p>
          </div>
          <Link href="/goals" className="text-sm font-black text-emerald-700 hover:text-emerald-900">Explore goal guides →</Link>
        </div>

        {remaining.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {remaining.map((s) => (
              <Link
                key={s.slug}
                href={`/stacks/${s.slug}`}
                className="group flex min-h-72 flex-col card-premium p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-emerald-800">{formatLabel(s.goal)}</span>
                  <span className="text-xs font-bold text-muted">{(s.stack ?? []).length} compounds</span>
                </div>

                <h3 className="mt-4 text-2xl font-black tracking-tight text-ink group-hover:text-emerald-800">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.short_description}</p>

                <div className="mt-4 space-y-2">
                  {(s.stack ?? []).slice(0, 3).map((item, index) => (
                    <StackIngredient key={`${s.slug}-${item.compound}-${index}`} item={item} />
                  ))}
                </div>

                <div className="mt-auto pt-4">
                  {s.avoid_if ? (
                    <p className="line-clamp-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                      <span className="font-black">Use caution with:</span> {s.avoid_if}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex text-sm font-black text-emerald-700 transition group-hover:translate-x-1">See dosage, timing &amp; risks →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <LibraryEmptyState
            title="More stack profiles are being prepared."
            description="The featured stack is available now. The broader stack library will fill in as additional profiles finish generating."
            recoveryLinks={recoveryLinks}
            suggestedSearches={['sleep', 'stress', 'focus', 'performance']}
          />
        )}
      </section>
    </div>
  )
}
