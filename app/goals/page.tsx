import Link from 'next/link'
import { goalConfigs } from '@/data/goals'
import { seoEntryPages } from '../seo-entry-pages'

export default function GoalsIndex() {
  const featuredGuides = seoEntryPages.slice(0, 12)

  return (
    <main className="space-y-10 px-1 py-2 sm:px-0">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="max-w-3xl space-y-5">
          <div className="eyebrow inline-flex rounded-full border border-brand-700/10 bg-brand-700/10 px-4 py-2 text-brand-700">
            Decision hub
          </div>

          <div>
            <h1 className="heading-premium text-ink">
              Goals
            </h1>

            <p className="text-reading mt-4 text-lg text-muted-soft">
              Start with a goal. Then move into structured guides, compounds, stacks, comparisons, and evidence-aware safety context.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <div className="eyebrow text-brand-700">
            Start here
          </div>

          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
            Supplement guides
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredGuides.map((page, index) => (
            <Link
              key={page.route}
              href={`/${page.route}`}
              className={index === 0
                ? 'group rounded-card border border-brand-700/20 bg-white/85 p-6 shadow-glow transition duration-300 hover:-translate-y-1 hover:bg-white'
                : 'group rounded-card border border-brand-900/10 bg-white/80 p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-700/20 hover:bg-white hover:shadow-glow'
              }
            >
              <div className="space-y-4">
                <div className="eyebrow text-brand-700">
                  {index === 0 ? 'Featured guide' : 'Guide'}
                </div>

                <div>
                  <h3 className="text-display text-3xl transition group-hover:text-brand-800">
                    {page.h1}
                  </h3>

                  <p className="text-reading mt-4 line-clamp-4 text-sm text-muted-soft">
                    {page.intro}
                  </p>
                </div>

                <div className="inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-1">
                  View guide →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <div className="eyebrow text-brand-700">
            Browse by outcome
          </div>

          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
            Goal paths
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {goalConfigs.map((goal) => (
            <Link
              key={goal.slug}
              href={`/goals/${goal.slug}`}
              className="group rounded-card border border-brand-900/10 bg-white/80 p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-700/20 hover:bg-white hover:shadow-glow"
            >
              <div className="space-y-4">
                <h3 className="text-display text-3xl transition group-hover:text-brand-800">
                  {goal.title}
                </h3>

                <p className="text-reading line-clamp-4 text-sm text-muted-soft">
                  {goal.summary}
                </p>

                <div className="inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-1">
                  Explore goal →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
