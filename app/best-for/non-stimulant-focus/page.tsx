import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    href: '/protocols/non-stimulant-focus',
    title: 'Non-Stimulant Focus Protocol',
    description: 'Educational protocol focused on calm productivity, cognition continuity, and stress-aware focus systems.',
  },
  {
    href: '/pathways/dopamine',
    title: 'Dopamine Pathway',
    description: 'Motivation and cognition-related signaling systems associated with behavioral drive and attention continuity.',
  },
  {
    href: '/education/how-focus-and-motivation-work',
    title: 'Focus and Motivation',
    description: 'Educational neurochemistry overview of cognition systems, motivation signaling, and calm-focus continuity.',
  },
  {
    href: '/compounds/l-theanine',
    title: 'L-Theanine',
    description: 'Calming amino acid associated with relaxation and calm-focus neuropharmacology.',
  },
]

export default function NonStimulantFocusBestForPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Best Systems for Non-Stimulant Focus"
        description="Educational exploration of calm focus systems, cognition continuity, stress-aware productivity, and non-stimulant neuropharmacology."
        url="https://thehippiescientist.net/best-for/non-stimulant-focus"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Best For', href: '/best-for' },
          { label: 'Non-Stimulant Focus' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Best-For System</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Best Systems for Non-Stimulant Focus
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Educational exploration of calm productivity systems associated with cognition continuity, stress-aware focus, nervous-system balance, and non-stimulant neuropharmacology.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Focus support is highly individualized and may intersect with sleep continuity, stress-response burden, motivation signaling, emotional regulation, and recovery-oriented neurochemistry.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {systems.map((system) => (
          <Link
            key={system.href}
            href={system.href}
            className="card-premium p-6 transition hover:-translate-y-0.5"
          >
            <div className="space-y-4">
              <p className="eyebrow-label">Related Educational System</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {system.title}
              </h2>

              <p className="text-sm leading-7 text-[#46574d]">
                {system.description}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
