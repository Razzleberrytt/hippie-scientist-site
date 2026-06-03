import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const categories = [
  {
    href: '/psychoactive/calming',
    title: 'Calming Psychoactives',
    description:
      'GABAergic and calming psychoactive systems including kava, blue lotus, valerian, and related mechanisms.',
  },
  {
    href: '/psychoactive/dream-herbs',
    title: 'Dream Herbs',
    description:
      'Oneirogenic herbs and REM-associated psychoactive systems connected to dream vividness and sleep architecture.',
  },
  {
    href: '/psychoactive/calming',
    title: 'Mood Elevation Systems',
    description:
      'Serotonergic and dopaminergic psychoactive systems related to mood modulation and emotional regulation.',
  },
  {
    href: '/psychoactive/dissociative-mechanisms',
    title: 'Dissociative Mechanisms',
    description:
      'Educational exploration of glutamatergic and NMDA-oriented psychoactive mechanisms.',
  },
]

const education = [
  {
    href: '/education/what-are-psychoactive-herbs',
    label: 'What Are Psychoactive Herbs?',
  },
  {
    href: '/education/gaba-vs-serotonin',
    label: 'GABA vs Serotonin',
  },
  {
    href: '/education/how-psychoactive-plants-affect-the-brain',
    label: 'How Psychoactive Plants Affect the Brain',
  },
  {
    href: '/education/what-is-neuropharmacology',
    label: 'What Is Neuropharmacology?',
  },
]

export default function PsychoactiveHubPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Psychoactive Research Hub"
        description="Evidence-informed psychoactive ethnobotany, neuropharmacology, harm reduction, and semantic educational discovery."
        url="https://www.thehippiescientist.net/psychoactive"
        type="CollectionPage"
        breadcrumbs={[
          {
            name: 'Home',
            url: 'https://www.thehippiescientist.net',
          },
          {
            name: 'Psychoactive Research',
            url: 'https://www.thehippiescientist.net/psychoactive',
          },
        ]}
      />

      <AuthorityBreadcrumbs
        items={[
          {
            label: 'Home',
            href: '/',
          },
          {
            label: 'Psychoactive Research',
          },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Evidence-Aware Psychoactive Research</p>

          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Psychoactive Research Hub
          </h1>
        </div>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of psychoactive herbs, ethnobotany, neuropharmacology, mechanism systems, and harm reduction through an evidence-informed semantic discovery architecture.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          This section is designed for educational and research purposes. The focus is scientific context, mechanism understanding, safety awareness, and semantic relationship discovery — not recreational hype or unsafe optimization.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="card-premium p-6 transition hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Psychoactive Ecosystem</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {category.title}
              </h2>

              <p className="text-sm leading-7 text-[#46574d]">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <section className="surface-depth card-spacing">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernodes</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Psychoactive Education Systems
          </h2>

          <p className="max-w-3xl text-sm leading-7 text-[#46574d]">
            Educational explainers focused on mechanisms, pathways, neuropharmacology, ethnobotany, and harm reduction.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {education.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="chip-readable hover:bg-white transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
