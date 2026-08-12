import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { goals, type Goal } from '@/data/goals'
import { getGoalContentExtension } from '@/data/goal-content'
import { getGoalStartHereLinks } from '@/lib/goal-start-here-links'
import GoalStartHereLinks from '@/components/goals/GoalStartHereLinks'
import GoalTopAffiliatePicks from '@/components/monetization/GoalTopAffiliatePicks'
import GoalContentDepth from '@/src/components/goals/GoalContentDepth'
import GoalHubSections from '@/src/components/goals/GoalHubSections'
import { getGoalHubLinks } from '@/src/lib/goal-hub-links'
import { getPublicGoal, getPublicGoalContentExtension } from '@/src/lib/goal-public-copy'
import SchemaOrg from '@/components/SchemaOrg'
import Disclaimer from '@/src/components/Disclaimer'
import { breadcrumbJsonLd, faqPageJsonLd, SITE_URL } from '@/src/lib/seo'

type PageProps = {
  params: Promise<{ slug: string }>
}

function getGoal(slug: string): Goal | undefined {
  return goals.find((goal) => goal.slug === slug)
}

export function generateStaticParams() {
  return goals.map((goal) => ({ slug: goal.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const goal = getGoal(slug)
  if (!goal) return { title: 'Goal Not Found', robots: { index: false, follow: true } }

  const canonical = `${SITE_URL}/goals/${goal.slug}/`
  const title = `${goal.title}: Compare Options by Fit, Onset & Evidence`
  const description = goal.description

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: goal.title,
      description,
      url: canonical,
      type: 'article',
      images: ['/og-default.jpg'],
    },
  }
}

export default async function GoalPage({ params }: PageProps) {
  const { slug } = await params
  const rawGoal = getGoal(slug)
  if (!rawGoal) notFound()
  const goal = getPublicGoal(rawGoal)

  const goalPath = `/goals/${goal.slug}/`
  const rawExtension = getGoalContentExtension(goal.slug)
  const extension = rawExtension
    ? getPublicGoalContentExtension(goal.slug, rawExtension)
    : null
  const startHereLinks = getGoalStartHereLinks(goal.slug)
  const { stack, compares, seoEntry } = getGoalHubLinks(goal.slug)

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Goals', url: `${SITE_URL}/goals/` },
    { name: goal.title, url: `${SITE_URL}${goalPath}` },
  ])
  const faq = extension?.faqItems.length
    ? faqPageJsonLd({
        pagePath: goalPath,
        questions: extension.faqItems.map((item) => ({
          question: item.question,
          answer: item.answer,
        })),
      })
    : null

  const relatedGoals = goal.relatedGoals
    .map((relatedSlug) => getGoal(relatedSlug))
    .filter((related): related is Goal => Boolean(related))

  return (
    <div className="container-page space-y-10 py-10">
      <SchemaOrg schema={breadcrumbs} />
      {faq ? <SchemaOrg schema={faq} /> : null}

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/goals/" className="hover:underline">
              Goals
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-ink">{goal.title}</li>
        </ol>
      </nav>

      <header className="max-w-3xl space-y-4">
        <p className="eyebrow-label">{goal.eyebrow}</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{goal.title}</h1>
        <p className="text-lg leading-8 text-muted">{goal.description}</p>
      </header>

      {goal.quickPicks.length > 0 ? (
        <section className="card-premium p-5 sm:p-8">
          <p className="eyebrow-label">Quick picks</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Match your situation</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {goal.quickPicks.map((pick) => (
              <li
                key={`${pick.slug}-${pick.need}`}
                className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {pick.need}
                </p>
                <p className="mt-2 text-base font-semibold text-brand-800 dark:text-brand-100">
                  {pick.option}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card-premium p-5 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Options compared</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Sorted by how people usually approach this goal. &ldquo;Why people stop&rdquo; is included
          because the reason a supplement gets abandoned is usually more useful than its best-case
          claim.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-brand-900/10">
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">
                  Option
                </th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">
                  Best for
                </th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">
                  Onset
                </th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">
                  Evidence
                </th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">
                  Risk
                </th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">
                  Why people stop
                </th>
              </tr>
            </thead>
            <tbody>
              {goal.options.map((option) => (
                <tr
                  key={option.slug}
                  className="border-b border-brand-900/5 align-top last:border-0"
                >
                  <td className="py-3 pr-4 font-semibold text-ink">{option.name}</td>
                  <td className="py-3 pr-4 text-muted">{option.bestFor}</td>
                  <td className="py-3 pr-4 text-muted">{option.speed}</td>
                  <td className="py-3 pr-4 text-muted">{option.evidence}</td>
                  <td className="py-3 pr-4 text-muted">{option.risk}</td>
                  <td className="py-3 text-muted">{option.whyPeopleStop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-6 space-y-3">
          {goal.options.map((option) => (
            <li
              key={`${option.slug}-detail`}
              className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5"
            >
              <p className="font-semibold text-ink">{option.name}</p>
              <p className="mt-2 leading-6 text-muted">
                <span className="font-semibold text-ink">Avoid if:</span> {option.avoidIf}
              </p>
              <p className="mt-1 leading-6 text-muted">
                <span className="font-semibold text-ink">Form:</span> {option.form}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <GoalStartHereLinks links={startHereLinks} />

      {extension ? <GoalContentDepth content={extension} /> : null}

      <GoalHubSections
        goalSlug={goal.slug}
        stack={stack}
        compares={compares}
        seoEntry={seoEntry}
      />

      <GoalTopAffiliatePicks goalSlug={goal.slug} limit={3} />

      {relatedGoals.length > 0 ? (
        <section className="card-premium p-5 sm:p-8">
          <h2 className="text-xl font-semibold text-ink">Related goals</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {relatedGoals.map((related) => (
              <li key={related.slug}>
                <Link
                  href={`/goals/${related.slug}/`}
                  className="inline-flex rounded-full border border-brand-900/15 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-brand-700/30 dark:border-white/10 dark:bg-white/5"
                >
                  {related.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Disclaimer />
    </div>
  )
}
