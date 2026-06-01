import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

export default function LTheanineVsMagnesiumPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="L-Theanine vs Magnesium"
        description="Educational comparison of L-theanine and magnesium, calming systems, stress-response support, and sleep-oriented neuropharmacology."
        url="https://thehippiescientist.net/compare/l-theanine-vs-magnesium"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'L-Theanine vs Magnesium' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          L-Theanine vs Magnesium
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational comparison of L-theanine and magnesium through the lens of calming systems, nervous-system regulation, sleep support, and stress-aware neuropharmacology.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Amino Acid System</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            L-Theanine
          </h2>

          <p className="text-sm leading-7 text-[#46574d]">
            Calming amino acid associated with relaxation, stress-response modulation, and calm-focus neuropharmacology.
          </p>

          <Link href="/compounds/l-theanine" className="chip-readable">
            Explore L-Theanine
          </Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Mineral System</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Magnesium
          </h2>

          <p className="text-sm leading-7 text-[#46574d]">
            Essential mineral associated with nervous-system regulation, muscular relaxation, stress systems, and sleep-oriented support.
          </p>

          <Link href="/compounds/magnesium" className="chip-readable">
            Explore Magnesium
          </Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/education/gaba" className="chip-readable">
          GABA Pathway
        </Link>

        <Link href="/guides/deep-sleep-support" className="chip-readable">
          Deep Sleep Support
        </Link>

        <Link href="/guides/stress-regulation" className="chip-readable">
          Stress Regulation
        </Link>
      </div>
    </main>
  )
}
