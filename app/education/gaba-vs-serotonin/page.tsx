import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

export default function GabaVsSerotoninPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="GABA vs Serotonin"
        description="Educational comparison of GABAergic and serotonergic systems, calming pathways, mood regulation, and psychoactive neuropharmacology."
        url="https://thehippiescientist.net/education/gaba-vs-serotonin"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'GABA vs Serotonin' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Mechanism Comparison</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          GABA vs Serotonin
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          GABAergic and serotonergic systems influence very different aspects of neurochemistry, mood regulation, stress response, perception, and consciousness.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">GABAergic Systems</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            Associated with inhibitory signaling, nervous-system downregulation, relaxation, calming effects, and sleep-supportive mechanisms.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/education/gaba" className="chip-readable">GABA Pathway</Link>
            <Link href="/about/psychoactives/calming" className="chip-readable">Calming Psychoactives</Link>
          </div>
        </div>

        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Serotonergic Systems</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            Associated with mood regulation, emotional processing, perception, cognition, and certain psychoactive or entheogenic mechanisms.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/education/serotonin" className="chip-readable">Serotonin Pathway</Link>
            <Link href="/about/psychoactives/calming" className="chip-readable">Mood Elevation</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
