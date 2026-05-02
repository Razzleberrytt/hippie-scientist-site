import Link from 'next/link'
import { goalConfigs } from '@/data/goals'

export default function GoalsIndex() {
  return (
    <main className="space-y-10">
      <section>
        <h1 className="text-4xl font-black text-white">Goals</h1>
        <p className="text-white/70 mt-2">Start with a goal. Then explore stacks, compounds, and comparisons built around it.</p>
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
