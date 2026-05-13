import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBeginnerPathways } from '@/lib/beginner-pathways'
import DecisionVisualGrid from '@/components/decision-visual-grid'
import WhyThisInsteadPanel from '@/components/why-this-instead-panel'

function getPathway(slug: string) {
  return getBeginnerPathways().find((pathway) => pathway.slug === slug)
}

export async function generateStaticParams() {
  return getBeginnerPathways().map((pathway) => ({
    slug: pathway.slug,
  }))
}

export async function generateMetadata({ params }: any) {
  const pathway = getPathway(params.slug)

  if (!pathway) {
    return {}
  }

  return {
    title: `${pathway.title} | The Hippie Scientist`,
    description: pathway.description,
  }
}

function buildProfileHref(profile: string) {
  const normalized = profile.toLowerCase()

  const compoundProfiles = new Set([
    'creatine',
    'theanine',
    'glycine',
    'taurine',
    'nac',
    'magnesium',
    'magnesium-glycinate',
  ])

  if (compoundProfiles.has(normalized)) {
    return `/compounds/${normalized}`
  }

  return `/herbs/${normalized}`
}

export default function BeginnerPathwayPage({ params }: any) {
  const pathway = getPathway(params.slug)

  if (!pathway) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:space-y-10 sm:py-10">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">
            Beginner Onboarding Pathway
          </p>

          <h1 className="heading-premium text-ink">
            {pathway.title}
          </h1>

          <p className="detail-reading text-base text-[#46574d] sm:text-lg">
            {pathway.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {pathway.signals.map((signal) => (
              <span
                key={signal}
                className="chip-readable"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      </section>

      <DecisionVisualGrid
        record={{
          slug: pathway.slug,
          name: pathway.title,
          description: pathway.description,
          topic_ecosystems: pathway.signals,
        }}
        title={`${pathway.title}: beginner decision map`}
        compact
      />

      <WhyThisInsteadPanel
        record={{ slug: pathway.starterProfiles[0], name: pathway.starterProfiles[0] }}
        alternatives={pathway.starterProfiles.slice(1).map((profile) => ({ slug: profile, name: profile }))}
        title="Why start here instead?"
        limit={2}
      />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Recommended Starting Profiles</p>

          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Start with practical comparisons instead of random stacking
          </h2>

          <p className="detail-reading max-w-3xl text-[#46574d]">
            These profiles were selected because they represent useful beginner entry points with different stimulation levels, recovery orientations, and expectation timelines.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {pathway.starterProfiles.map((profile) => (
            <Link
              key={profile}
              href={buildProfileHref(profile)}
              className="rounded-3xl border border-brand-900/10 bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-700/20 hover:bg-white hover:shadow-md"
            >
              <div className="space-y-3">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-900/55">
                    Starter Profile
                  </p>

                  <h3 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                    {profile.replace(/-/g, ' ')}
                  </h3>
                </div>

                <p className="text-sm leading-7 text-[#46574d]">
                  Explore practical fit, realistic expectations, stimulation level, and adjacent comparison pathways before deciding what deserves deeper research.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-brand-900/10 bg-brand-50/50 p-6 shadow-sm">
        <div className="space-y-4 max-w-3xl">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-900/55">
              Guided Exploration
            </p>

            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
              How to use this pathway intelligently
            </h2>
          </div>

          <ul className="space-y-3 text-sm leading-7 text-[#46574d]">
            <li className="flex gap-3">
              <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700/60" />
              <span>Compare stimulation level before comparing marketing claims.</span>
            </li>

            <li className="flex gap-3">
              <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700/60" />
              <span>Use realistic expectations and cumulative timelines to avoid overreacting to one experience.</span>
            </li>

            <li className="flex gap-3">
              <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700/60" />
              <span>Start with simpler comparison paths before building aggressive stacks.</span>
            </li>

            <li className="flex gap-3">
              <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700/60" />
              <span>Treat pathways as exploration frameworks rather than universal prescriptions.</span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
