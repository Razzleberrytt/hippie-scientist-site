import type { ReactNode } from 'react'
import Link from 'next/link'
import DecisionVisualGrid from './decision-visual-grid'
import WhyThisInsteadPanel from './why-this-instead-panel'
import { formatDisplayLabel } from '@/lib/display-utils'

type EcosystemSupernodeProps = {
  hub: {
    slug: string
    title: string
    description: string
    onboardingPathway: string
    beginnerProfiles: string[]
    comparisonProfiles: string[]
    guidance: string[]
    stimulationProfile?: string
    timelineProfile?: string
  }
  profileHref: (profile: string) => string
}

const MISTAKES = [
  'Overstimulation from stacking too many activating profiles before testing individual fit.',
  'Unrealistic expectations when cumulative profiles are judged like acute stimulants.',
  'Premature overstacking before sleep, workload, tolerance, and baseline recovery are understood.',
]

const STACK_CAUTIONS = [
  'Avoid stimulant overload and redundant activation pathways.',
  'Avoid redundant calming stacks when sedation or next-day grogginess would be a problem.',
  'Keep first experiments simple enough that response signals remain interpretable.',
]

function SectionCard({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-brand-900/10 bg-white/75 p-5 shadow-sm">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-900/55">{eyebrow}</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm leading-7 text-[#46574d]">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function LinkGrid({ profiles, profileHref }: { profiles: string[]; profileHref: (profile: string) => string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {profiles.map((profile) => (
        <Link
          key={profile}
          href={profileHref(profile)}
          className="rounded-2xl border border-brand-900/10 bg-paper-50/80 px-4 py-3 text-sm font-semibold text-[#33443a] transition hover:border-brand-700/25 hover:bg-white hover:text-brand-800"
        >
          {formatDisplayLabel(profile)}
        </Link>
      ))}
    </div>
  )
}

function faqSchema(hub: EcosystemSupernodeProps['hub']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How should beginners start the ${hub.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Start with the beginner pathway, compare nearby profiles, and avoid building complex stacks before individual response is clear.',
        },
      },
      {
        '@type': 'Question',
        name: `What is the most common mistake in the ${hub.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The common mistake is treating different stimulation profiles and timelines as interchangeable, especially when cumulative options are judged like acute effects.',
        },
      },
    ],
  }
}

export default function EcosystemSupernode({ hub, profileHref }: EcosystemSupernodeProps) {
  const alternatives = [...hub.beginnerProfiles, ...hub.comparisonProfiles].map((slug) => ({ slug, name: slug }))
  const record = {
    slug: hub.slug,
    name: hub.title,
    description: hub.description,
    stimulationProfile: hub.stimulationProfile,
    timelineProfile: hub.timelineProfile,
    topic_ecosystems: [hub.slug],
  }

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(hub)) }}
      />

      <DecisionVisualGrid record={record} title={`${hub.title}: decision map`} compact />

      <WhyThisInsteadPanel
        record={alternatives[0] || record}
        alternatives={alternatives.slice(1)}
        title="Adaptive comparison pathways"
        limit={2}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <SectionCard eyebrow="Beginner Starts" title="Guided onboarding">
          <div className="space-y-4">
            <p className="text-sm leading-7 text-[#46574d]">
              Begin with a pathway instead of a stack. Compare one profile at a time, then expand only when the response pattern is interpretable.
            </p>
            <Link href={`/start/${hub.onboardingPathway}`} className="button-secondary inline-flex">
              Open onboarding
            </Link>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Common Mistakes" title="Avoid noisy experiments">
          <BulletList items={MISTAKES} />
        </SectionCard>

        <SectionCard eyebrow="Stack Cautions" title="Keep combinations readable">
          <BulletList items={STACK_CAUTIONS} />
        </SectionCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard eyebrow="Best Fit Groupings" title="Who may compare here first">
          <div className="flex flex-wrap gap-2">
            {['stimulant-sensitive', 'recovery-oriented', 'sleep-adjacent', 'cumulative cognition', 'stress-modulating'].map((item) => (
              <span key={item} className="chip-readable">{item}</span>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Relationship Map" title="Overlap and adjacency">
          <p className="text-sm leading-7 text-[#46574d]">
            This hub connects profiles through pathway overlap, stimulation adjacency, timeline differences, and beginner-to-advanced continuity.
          </p>
        </SectionCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard eyebrow="Comparison Navigation" title="Strong adjacent profiles">
          <LinkGrid profiles={hub.comparisonProfiles} profileHref={profileHref} />
        </SectionCard>

        <SectionCard eyebrow="Alternative Pathways" title="Starter profiles">
          <LinkGrid profiles={hub.beginnerProfiles} profileHref={profileHref} />
        </SectionCard>
      </section>
    </div>
  )
}
