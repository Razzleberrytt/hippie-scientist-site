import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    href: '/compounds/l-theanine',
    title: 'L-Theanine',
  },
  {
    href: '/herbs/melissa-officinalis',
    title: 'Lemon Balm',
  },
  {
    href: '/protocols/non-stimulant-focus',
    title: 'Non-Stimulant Focus',
  },
  {
    href: '/pathways/gaba',
    title: 'GABA Pathway',
  },
]

export default function NonSedatingCalmPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Best Compounds for Non-Sedating Calm"
        description="Educational exploration of non-sedating calming systems, stress-response support, calm focus, and evidence-aware neuropharmacology."
        url="https://thehippiescientist.net/best-for/non-sedating-calm"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Best For', href: '/best-for' },
          { label: 'Non-Sedating Calm' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Best-For System</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Best Compounds for Non-Sedating Calm
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of calming systems associated with relaxation, emotional regulation, stress-response support, and calm focus without strong sedative positioning.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {systems.map((system) => (
          <Link
            key={system.href}
            href={system.href}
            className="card-premium p-6 transition hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Related Educational System</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {system.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
