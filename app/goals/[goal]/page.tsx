import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGoal, goals } from '@/data/goals'

type GoalRouteParams = { goal: string }

export const dynamicParams = false

export function generateStaticParams(): GoalRouteParams[] {
  return goals.map((goal) => ({ goal: goal.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<GoalRouteParams>
}): Promise<Metadata> {
  const { goal: goalSlug } = await params
  const goal = getGoal(goalSlug)

  if (!goal) {
    return {
      title: 'Goal Guide | The Hippie Scientist',
      description: 'Decision-focused goal guide.',
    }
  }

  return {
    title: `${goal.title} | The Hippie Scientist`,
    description: goal.description,
  }
}

export default async function GoalDecisionPage({
  params,
}: {
  params: Promise<GoalRouteParams>
}) {
  const { goal: goalSlug } = await params
  const goal = getGoal(goalSlug)

  if (!goal) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">{goal.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {goal.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">{goal.description}</p>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Quick Picks</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Need</th>
                <th className="py-2 font-medium">Suggested Option</th>
              </tr>
            </thead>
            <tbody>
              {goal.quickPicks.map((pick) => (
                <tr key={pick.need} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-700">{pick.need}</td>
                  <td className="py-2 text-slate-900">{pick.option}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Comparison Table</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Compound</th>
                <th className="py-2 pr-4 font-medium">Best For</th>
                <th className="py-2 pr-4 font-medium">Speed</th>
                <th className="py-2 pr-4 font-medium">Evidence</th>
                <th className="py-2 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {goal.options.map((option) => (
                <tr key={option.slug} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-4 font-medium text-slate-900">{option.name}</td>
                  <td className="py-2 pr-4 text-slate-700">{option.bestFor}</td>
                  <td className="py-2 pr-4 text-slate-700">{option.speed}</td>
                  <td className="py-2 pr-4 text-slate-700">{option.evidence}</td>
                  <td className="py-2 text-slate-700">{option.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goal.options.map((option) => (
          <article key={`${option.slug}-avoid`} className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
            <h3 className="text-sm font-semibold text-rose-900">Avoid If — {option.name}</h3>
            <p className="mt-2 text-sm leading-6 text-rose-800">{option.avoidIf}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Why People Stop Using It</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {goal.options.map((option) => (
              <li key={`${option.slug}-stop`}>
                <span className="font-medium">{option.name}:</span> {option.whyPeopleStop}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Commonly Chosen Forms</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {goal.options.map((option) => (
              <li key={`${option.slug}-form`}>
                <span className="font-medium">{option.name}:</span> {option.form}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Related Goals</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {goal.relatedGoals.map((relatedSlug) => {
            const related = getGoal(relatedSlug)
            if (!related) {
              return null
            }

            return (
              <Link
                key={related.slug}
                href={`/goals/${related.slug}`}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
              >
                {related.title}
              </Link>
            )
          })}
        </div>
      </section>

      <footer className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
        Educational only. Not medical advice. Evidence varies.
      </footer>
    </main>
  )
}
