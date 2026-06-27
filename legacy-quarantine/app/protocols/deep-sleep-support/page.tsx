import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const protocolItems = [
  'Sleep-supportive calming systems',
  'Stress-response downregulation',
  'Evening nervous-system decompression',
  'Behavioral sleep continuity support',
]

export default function DeepSleepSupportPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Deep Sleep Support Protocol"
        description="Educational deep sleep support protocol focused on calming systems, stress regulation, and sleep-supportive neuropharmacology."
        url="https://thehippiescientist.net/guides/deep-sleep-support"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Deep Sleep Support' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Protocol Ecosystem</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Deep Sleep Support
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational protocol exploring calming neuropharmacology, stress reduction systems, inhibitory signaling pathways, and sleep-supportive continuity strategies.
        </p>
      </section>

      <section className="surface-depth card-spacing">
        <div className="space-y-3">
          <p className="eyebrow-label">Protocol Components</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Educational sleep-support systems
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 mt-6">
          {protocolItems.map((item) => (
            <div key={item} className="card-premium p-5">
              <p className="text-sm leading-7 text-[#46574d]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/education/gaba" className="chip-readable">
          GABA Pathway
        </Link>

        <Link href="/psychoactive/calming" className="chip-readable">
          Calming Psychoactives
        </Link>

        <Link href="/education/gaba-vs-serotonin" className="chip-readable">
          GABA vs Serotonin
        </Link>
      </div>
    </div>
  )
}
