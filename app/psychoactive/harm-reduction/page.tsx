import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const topics = [
  {
    href: '/psychoactive/interactions',
    title: 'Interaction Awareness',
  },
  {
    href: '/psychoactive/serotonergic-stacking-risks',
    title: 'Serotonergic Risks',
  },
  {
    href: '/psychoactive/harm-reduction',
    title: 'GABAergic Safety',
  },
  {
    href: '/education/what-are-psychoactive-herbs',
    title: 'Psychoactive Education',
  },
]

export default function HarmReductionPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Psychoactive Harm Reduction"
        description="Educational psychoactive harm reduction hub focused on interaction awareness, neurochemical safety, and educational guidance."
        url="https://thehippiescientist.net/psychoactive/harm-reduction"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Psychoactive Research', href: '/psychoactive' },
          { label: 'Harm Reduction' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Safety Hub</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Psychoactive Harm Reduction
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational harm-reduction exploration focused on interaction awareness, neurochemical safety, pathway overlap, psychoactive ethnobotany, and conservative evidence-informed interpretation.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Psychoactive substances may affect mood systems, cognition, emotional processing, sedation, cardiovascular signaling, sleep architecture, and medication interactions. Educational safety framing is essential for responsible exploration.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {topics.map((topic) => (
          <Link
            key={topic.href}
            href={topic.href}
            className="card-premium p-6 transition hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Safety System</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {topic.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
