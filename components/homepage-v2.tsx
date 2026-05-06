'use client'

import Link from 'next/link'

export default function HomepageV2() {
  return (
    <main className="min-h-screen text-ink section-spacing">

      <section className="hero-shell overflow-hidden rounded-[2.25rem] border border-white/45 px-6 py-18 shadow-soft sm:px-10 lg:px-16 lg:py-28">
        <div className="max-w-5xl section-spacing">
          <div className="eyebrow-label inline-flex rounded-full border border-brand-700/10 bg-white/55 px-4 py-2 backdrop-blur-md">
            Evidence-first supplement intelligence
          </div>

          <div className="space-y-7">
            <h1 className="heading-premium max-w-5xl text-balance">
              Calm, evidence-aware guidance for herbs, compounds, and better decisions.
            </h1>

            <p className="text-reading max-w-2xl text-lg leading-relaxed text-muted-soft sm:text-xl">
              Explore natural compounds through transparent evidence tiers, safety context, mechanisms, and practical decision support — without hype, noise, or affiliate-first recommendations.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Link href="/explore" className="button-primary">
              Explore Goals
            </Link>

            <Link href="/compounds" className="button-secondary">
              Browse Compounds
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
            className="card-premium card-spacing group"
          >
            <div className="space-y-5">
              <div className="eyebrow-label">
                Explore
              </div>

              <div className="space-y-3">
                <h2 className="font-sans text-2xl font-semibold tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-800">
                  {item.title}
                </h2>

                <p className="text-sm leading-7 text-muted-soft">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <div className="surface-depth card-spacing">
          <div className="section-spacing">
            <div className="eyebrow-label inline-flex rounded-full border border-emerald-700/10 bg-emerald-700/10 px-3 py-1 text-emerald-800">
              Human evidence prioritized
            </div>

            <div className="space-y-5">
              <h2 className="max-w-3xl text-balance">
                Decision support without wellness-blog hype.
              </h2>

              <p className="text-reading max-w-2xl text-muted-soft">
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
                  className="surface-subtle p-5"
                >
                  <div className="text-sm font-semibold tracking-tight text-ink">
                    {title}
                  </div>

                  <div className="mt-3 text-sm leading-7 text-muted-soft">
                    {body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="safety-block">
          <div className="section-spacing">
            <div className="eyebrow-label text-amber-700">
              Safety-first philosophy
            </div>

            <div className="space-y-4">
              <h3 className="max-w-sm text-balance">
                Evidence honesty builds long-term trust.
              </h3>

              <p className="text-sm leading-7 text-amber-950/85">
                Human evidence is prioritized. Mechanistic and traditional evidence are clearly labeled. Safety uncertainty is surfaced instead of hidden.
              </p>
            </div>

            <Link href="/evidence-standards" className="button-secondary w-full justify-center">
              View Evidence Standards
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
