import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    href: '/protocols/non-stimulant-focus',
    title: 'Non-Stimulant Focus',
  },
  {
    href: '/pathways/dopamine',
    title: 'Dopamine Pathway',
  },
  {
    href: '/compounds/l-theanine',
    title: 'L-Theanine',
  },
  {
    href: '/education/what-is-neuropharmacology',
    title: 'Neuropharmacology',
  },
]

export default function NootropicEducationPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="What Is a Nootropic?"
        description="Educational introduction to nootropics, cognition-oriented compounds, focus systems, neuropharmacology, and evidence-aware cognitive support."
        url="https://thehippiescientist.net/education/what-is-a-nootropic"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'What Is a Nootropic?' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Supernode</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          What Is a Nootropic?
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Nootropics are compounds, herbs, or substances associated with cognition-oriented systems including focus, memory, alertness, motivation, and mental performance.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational nootropic exploration involves neuropharmacology, dopaminergic signaling, stress-aware cognition systems, and evidence-oriented interpretation.
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
