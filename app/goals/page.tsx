import Link from 'next/link'
import { goalConfigs } from '@/data/goals'
import { seoEntryPages } from '../seo-entry-pages'

export default function GoalsIndex() {
  return (
    <main className="space-y-10">
      <section>
        <h1 className="text-4xl font-black text-white">Goals</h1>
        <p className="text-white/70 mt-2">Start with a goal. Then explore stacks, compounds, and comparisons built around it.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Supplement guides</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seoEntryPages.map((page) => (
            <Link key={page.route} href={`/${page.route}`} className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5 hover:border-emerald-300/50">
              <h3 className="font-bold text-white">{page.h1}</h3>
              <p className="mt-2 text-sm text-white/65">{page.intro}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Open guide →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goalConfigs.map((goal) => (
          <Link
            key={goal.slug}
            href={`/goals/${goal.slug}`}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40"
          >
            <h2 className="font-bold text-white">{goal.title}</h2>
            <p className="mt-2 text-sm text-white/65">{goal.summary}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">
              Explore →
            </span>
          </Link>
        ))}
      </section>
    </main>
  )
}
