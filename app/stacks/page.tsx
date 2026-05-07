import Link from 'next/link'
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
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

function StackIngredient({ item }: { item: { compound?: string; dosage?: string; timing?: string; role?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-slate-950">{formatLabel(item.compound)}</p>
          <p className="mt-1 text-sm text-slate-600">{item.dosage} · {item.timing}</p>
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

  return (
    <main className="space-y-8 px-1 sm:px-0">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Decision guides</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Supplement stacks</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
              Start from a goal, then drill into compounds, timing, safety notes, and product-search paths without scrolling through the whole database.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 text-center">
            <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
              <div className="text-2xl font-black text-slate-950">{stackItems.length}</div>
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Stacks</div>
            </div>
            <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
              <div className="text-2xl font-black text-emerald-700">3</div>
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Steps</div>
            </div>
            <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
              <div className="text-2xl font-black text-amber-700">Safe</div>
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">First</div>
            </div>
          </div>
        </div>
      </section>

      {featured ? (
        <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-md shadow-emerald-950/5 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Featured stack</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{featured.title}</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">{featured.short_description}</p>
              {featured.who_for ? (
                <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-slate-700">
                  <span className="font-black text-emerald-800">Best for:</span> {featured.who_for}
                </p>
              ) : null}
              <Link href={`/stacks/${featured.slug}`} className="mt-5 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-base font-black text-white shadow-sm transition hover:bg-emerald-600">
                Open full stack →
              </Link>
            </div>

            <div className="grid gap-3">
              {(featured.stack ?? []).slice(0, 3).map((item, index) => (
                <StackIngredient key={`${featured.slug}-${item.compound}-${index}`} item={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Browse by goal</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">Stack library</h2>
            <p className="mt-1 text-sm text-slate-600">Each stack shows the actual pattern before the click.</p>
          </div>
          <Link href="/goals" className="text-sm font-black text-emerald-700 hover:text-emerald-900">Explore goal guides →</Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {remaining.map((s) => (
            <Link
              key={s.slug}
              href={`/stacks/${s.slug}`}
              className="group flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-emerald-800">{formatLabel(s.goal)}</span>
                <span className="text-xs font-bold text-slate-500">{(s.stack ?? []).length} compounds</span>
              </div>

              <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 group-hover:text-emerald-800">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{s.short_description}</p>

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
                <span className="mt-4 inline-flex text-sm font-black text-emerald-700 transition group-hover:translate-x-1">See dosage, timing & risks →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
