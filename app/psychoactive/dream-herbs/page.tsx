import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const herbs = [
  {
    href: '/herbs/valerian',
    title: 'Valerian',
  },
  {
    href: '/herbs/mugwort',
    title: 'Mugwort',
  },
  {
    href: '/herbs/passionflower',
    title: 'Passionflower',
  },
]

export default function DreamHerbsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Dream Herbs"
        description="Educational exploration of oneirogenic herbs, REM-related neuropharmacology, dreaming systems, and psychoactive ethnobotany."
        url="https://www.thehippiescientist.net/psychoactive/dream-herbs"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Psychoactive Research', href: '/psychoactive' },
          { label: 'Dream Herbs' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Oneirogenic Ecosystem</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Dream Herbs
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of oneirogenic herbs, dreaming systems, REM-related pathways, and psychoactive ethnobotanical traditions associated with dream vividness and altered dream states.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {herbs.map((herb) => (
          <Link
            key={herb.href}
            href={herb.href}
            className="card-premium p-6 transition hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Dream Herb</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {herb.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
