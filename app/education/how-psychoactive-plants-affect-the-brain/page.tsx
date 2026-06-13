import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    title: 'GABAergic Systems',
    href: '/education/gaba',
  },
  {
    title: 'Serotonergic Systems',
    href: '/education/serotonin',
  },
  {
    title: 'Dopaminergic Systems',
    href: '/education/dopamine',
  },
  {
    title: 'Cholinergic Systems',
    href: '/education/cholinergic-system',
  },
]

export default function PsychoactiveBrainPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="How Psychoactive Plants Affect the Brain"
        description="Educational exploration of psychoactive neuropharmacology, signaling systems, pathways, and ethnobotanical mechanisms."
        url="https://thehippiescientist.net/education/how-psychoactive-plants-affect-the-brain"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Psychoactive Plants Affect the Brain' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Neuropharmacology Education</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          How Psychoactive Plants Affect the Brain
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Psychoactive plants may influence mood, perception, stress response, dreaming, cognition, sleep, and emotional processing through interaction with neurochemical signaling systems.
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
              <p className="eyebrow-label">Pathway System</p>
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
