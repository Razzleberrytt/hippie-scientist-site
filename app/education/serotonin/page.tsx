import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

export const metadata: Metadata = {
  title: 'Serotonin Pathway Education',
  description:
    'Learn about serotonergic signaling, mood regulation, emotional processing, and herbs and compounds associated with the serotonin pathway.',
}

const profiles = [
  {
    href: '/herbs/kanna',
    title: 'Kanna',
    description: 'Serotonergic ethnobotanical associated with mood regulation and emotional-processing systems.',
  },
  {
    href: '/herbs/saffron',
    title: 'Saffron',
    description: 'Mood-supportive botanical associated with emotional regulation and stress-response systems.',
  },
  {
    href: '/herbs/rhodiola',
    title: 'Rhodiola',
    description: 'Adaptogenic herb associated with stress modulation, fatigue regulation, and mood support.',
  },
  {
    href: '/compounds/5-htp',
    title: '5-HTP',
    description: 'Serotonin precursor compound associated with mood and sleep-related pathways.',
  },
]

export default function SerotoninPathwayPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Serotonin Pathway"
        description="Educational overview of serotonergic signaling, mood regulation, psychoactive neuropharmacology, and related herbs and compounds."
        url="https://thehippiescientist.net/education/serotonin"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Serotonin' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Pathway Supernode</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Serotonin Pathway
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of serotonergic signaling systems involved in mood regulation, emotional processing, cognition, stress response, and psychoactive neuropharmacology.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {profiles.map((profile) => (
          <Link
            key={profile.href}
            href={profile.href}
            className="card-premium p-6 transition hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Related Profile</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {profile.title}
              </h2>

              <p className="text-sm leading-7 text-[#46574d]">
                {profile.description}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
