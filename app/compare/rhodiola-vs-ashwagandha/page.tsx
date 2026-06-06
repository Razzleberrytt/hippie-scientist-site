import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

export default function RhodiolaVsAshwagandhaPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Rhodiola vs Ashwagandha"
        description="Educational comparison of rhodiola and ashwagandha, adaptogenic systems, stress-response biology, and recovery-oriented neuropharmacology."
        url="https://thehippiescientist.net/compare/rhodiola-vs-ashwagandha"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Rhodiola vs Ashwagandha' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Rhodiola vs Ashwagandha
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational comparison of rhodiola and ashwagandha through the lens of stress-response biology, adaptogenic systems, fatigue regulation, and nervous-system support.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Adaptogenic System</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Rhodiola
          </h2>

          <p className="text-sm leading-7 text-[#46574d]">
            Adaptogenic herb associated with stress modulation, fatigue regulation, resilience systems, and cognitive recovery support.
          </p>

          <Link href="/herbs/rhodiola" className="chip-readable">
            Explore Rhodiola
          </Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Adaptogenic System</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Ashwagandha
          </h2>

          <p className="text-sm leading-7 text-[#46574d]">
            Adaptogenic herb associated with stress-response regulation, calming systems, nervous-system support, and recovery-oriented neuropharmacology.
          </p>

          <Link href="/herbs/ashwagandha" className="chip-readable">
            Explore Ashwagandha
          </Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/education/what-are-adaptogens" className="chip-readable">
          Adaptogens
        </Link>

        <Link href="/guides/stress-regulation" className="chip-readable">
          Stress Regulation
        </Link>

        <Link href="/guides/burnout-recovery" className="chip-readable">
          Burnout Recovery
        </Link>
      </div>
    </div>
  )
}
