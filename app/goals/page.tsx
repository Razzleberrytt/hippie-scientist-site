import Link from 'next/link'
import { goalConfigs } from '@/data/goals'
import { seoEntryPages } from '../seo-entry-pages'

export default function GoalsIndex() {
  const featuredGuides = seoEntryPages.slice(0, 12)

  return (
    <main className="space-y-8 px-1 sm:px-0">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Decision hub</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Goals</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
          Start with a goal. Then move into ranked guides, stacks, compounds, comparisons, and safety notes.
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Start here</p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">Supplement guides</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {featuredGuides.map((page, index) => (
            <Link
              key={page.route}
              href={`/${page.route}`}
              className={index === 0
                ? 'group rounded-2xl border border-emerald-300 bg-white p-5 shadow-md shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:shadow-lg md:col-span-2 lg:col-span-1'
                : 'group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md'
              }
            >
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                {index === 0 ? 'Featured guide' : 'Guide'}
              </p>
              <h3 className="mt-2 text-xl font-black leading-snug text-slate-950 group-hover:text-emerald-800">{page.h1}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{page.intro}</p>
              <span className="mt-4 inline-flex text-sm font-black text-emerald-700 transition group-hover:translate-x-1">View guide →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Browse by outcome</p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">Goal paths</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {goalConfigs.map((goal) => (
            <Link
              key={goal.slug}
              href={`/goals/${goal.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <h3 className="text-xl font-black text-slate-950 group-hover:text-emerald-800">{goal.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{goal.summary}</p>
              <span className="mt-4 inline-flex text-sm font-black text-emerald-700 transition group-hover:translate-x-1">
                Explore goal →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
