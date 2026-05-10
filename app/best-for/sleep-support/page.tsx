import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    href: '/protocols/deep-sleep-support',
    title: 'Deep Sleep Support',
    description: 'Recovery-oriented sleep continuity protocol focused on calming neuropharmacology and nervous-system restoration.',
  },
  {
    href: '/pathways/gaba',
    title: 'GABA Pathway',
    description: 'Calming inhibitory signaling systems associated with sleep support and nervous-system downregulation.',
  },
  {
    href: '/compare/l-theanine-vs-magnesium',
    title: 'L-Theanine vs Magnesium',
    description: 'Educational comparison exploring calming systems, sleep continuity, and relaxation-oriented neuropharmacology.',
  },
  {
    href: '/pathways/cholinergic-system',
    title: 'Cholinergic System',
    description: 'Dream-related and REM-associated neurochemical systems connected to sleep architecture.',
  },
]

export default function SleepSupportPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Best Systems for Sleep Support"
        description="Educational exploration of sleep-supportive neuropharmacology, calming systems, REM architecture, and recovery-oriented nervous-system support."
        url="https://thehippiescientist.net/best-for/sleep-support"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Best For', href: '/best-for' },
          { label: 'Sleep Support' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Best-For System</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Best Systems for Sleep Support
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Educational exploration of sleep-supportive systems associated with nervous-system regulation, calming neurochemistry, REM continuity, emotional regulation, and recovery-oriented neuropharmacology.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Sleep support is highly individualized and may intersect with stress-response systems, circadian continuity, nervous-system arousal, emotional regulation, and recovery biology.
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
