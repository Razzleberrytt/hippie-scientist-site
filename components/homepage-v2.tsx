'use client'

import Link from 'next/link'

export default function HomepageV2() {
  return (
    <main className="min-h-screen text-ink">

      <section className="hero-shell overflow-hidden rounded-[2rem] border border-white/40 px-6 py-16 shadow-soft sm:px-10 lg:px-14 lg:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex rounded-full border border-brand-700/10 bg-brand-700/10 px-4 py-2 text-eyebrow text-brand-800">
            Evidence-first supplement intelligence
          </div>

          <div className="space-y-6">
            <h1 className="max-w-4xl">
              Calm, evidence-aware guidance for herbs, compounds, and better decisions.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              Explore natural compounds through transparent evidence tiers, safety context, mechanisms, and practical decision support — without hype.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/explore" className="button-primary">
              Explore Goals
            </Link>

            <Link href="/compounds" className="button-secondary">
              Browse Compounds
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Sleep Support',
            slug: 'sleep',
            description: 'Evidence-aware compounds for recovery, relaxation, and sleep quality.',
          },
          {
            title: 'Stress & Mood',
            slug: 'anxiety',
            description: 'Calming and adaptogenic compounds with conservative evidence framing.',
          },
          {
            title: 'Focus & Cognition',
            slug: 'focus',
            description: 'Nootropic and cognitive-supportive compounds with mechanism context.',
          },
          {
            title: 'Recovery & Performance',
            slug: 'recovery',
            description: 'Performance and recovery support with practical stack exploration.',
          },
        ].map((item) => (
          <Link
            key={item.slug}
            href={`/explore/${item.slug}`}
            className="card-premium p-6"
          >
            <div className="space-y-4">
              <div className="text-eyebrow text-brand-700">
                Explore
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-ink">
                  {item.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-muted">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <div className="card-premium p-7">
          <div className="space-y-5">
            <div className="inline-flex rounded-full border border-emerald-700/10 bg-emerald-700/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
              Human evidence prioritized
            </div>

            <div>
              <h2>
                Decision support without wellness-blog hype.
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
                The Hippie Scientist blends natural wellness exploration with transparent evidence standards, safety context, and practical usability.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Evidence Tiers', 'A–D evidence system with transparent certainty framing'],
                ['Safety Visibility', 'Warnings and avoid-if context surfaced prominently'],
                ['Semantic Discovery', 'Explore related compounds, stacks, and goals naturally'],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-brand-900/10 bg-white/60 p-5"
                >
                  <div className="text-sm font-semibold text-ink">
                    {title}
                  </div>

                  <div className="mt-2 text-sm leading-7 text-muted">
                    {body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="safety-block">
          <div className="space-y-4">
            <div className="text-eyebrow text-amber-700">
              Safety-first philosophy
            </div>

            <h3>
              Evidence honesty builds long-term trust.
            </h3>

            <p className="text-sm leading-7 text-amber-900/80">
              Human evidence is prioritized. Mechanistic and traditional evidence are clearly labeled. Safety uncertainty is surfaced instead of hidden.
            </p>

            <Link href="/evidence-standards" className="button-secondary w-full justify-center">
              View Evidence Standards
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
