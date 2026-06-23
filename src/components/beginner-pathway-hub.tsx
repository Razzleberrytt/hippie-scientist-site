import Link from 'next/link'
import { getBeginnerPathways } from '../lib/beginner-pathways'

export default function BeginnerPathwayHub() {
  const pathways = getBeginnerPathways()

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="eyebrow-label">Beginner Onboarding</p>
        <h2 className="max-w-4xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Guided starting pathways for evidence-informed exploration
        </h2>
        <p className="detail-reading max-w-3xl text-[#46574d]">
          Start with a practical goal instead of jumping randomly between profiles. These onboarding pathways help organize exploration by fit, stimulation level, recovery orientation, and expected timeline.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {pathways.map((pathway) => (
          <Link
            key={pathway.slug}
            href={`/start/${pathway.slug}`}
            className="rounded-3xl border border-brand-900/10 bg-white/80 p-6 shadow-sm transition motion-safe:hover:-translate-y-0.5 hover:border-brand-700/20 hover:bg-white hover:shadow-md"
          >
            <div className="space-y-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-900/55">
                  Beginner Pathway
                </p>

                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                  {pathway.title}
                </h3>
              </div>

              <p className="text-sm leading-7 text-[#46574d]">
                {pathway.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {pathway.signals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-brand-900/10 bg-paper-50/80 px-3 py-1 text-xs font-semibold tracking-wide text-[#46574d]"
                  >
                    {signal}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-900/55">
                  Starter profiles
                </p>

                <div className="flex flex-wrap gap-2">
                  {pathway.starterProfiles.map((profile) => (
                    <span
                      key={profile}
                      className="rounded-full border border-brand-900/10 bg-white px-3 py-1 text-sm font-semibold text-ink"
                    >
                      {profile.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
