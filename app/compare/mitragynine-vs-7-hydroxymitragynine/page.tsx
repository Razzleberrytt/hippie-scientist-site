import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { buildPageMetadata, SITE_URL } from '@/lib/seo'

const TITLE = 'Mitragynine vs 7-Hydroxymitragynine'
const DESCRIPTION =
  'Evidence-based comparison of mitragynine and 7-hydroxymitragynine, focusing on potency, metabolism, respiratory risk, dependence liability, and concentrated-product concerns.'
const PATH = '/compare/mitragynine-vs-7-hydroxymitragynine/'

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Risk, Potency, and Pharmacology`,
  description: DESCRIPTION,
  path: PATH,
})

const comparisonRows = [
  {
    factor: 'Role in kratom',
    mitragynine: 'Primary alkaloid in traditional kratom leaf material.',
    sevenOh: 'Minor natural constituent and active metabolite; often elevated in concentrated products.',
  },
  {
    factor: 'Mu-opioid receptor activity',
    mitragynine: 'Partial agonist with lower intrinsic efficacy than classical full agonists.',
    sevenOh: 'More potent and more efficacious at the mu-opioid receptor in available assays.',
  },
  {
    factor: 'Exposure pathway',
    mitragynine: 'Direct exposure plus CYP3A4-mediated conversion to 7-OH.',
    sevenOh: 'Direct exposure can bypass slower metabolic formation when present in concentrated products.',
  },
  {
    factor: 'Respiratory risk signal',
    mitragynine: 'Less pronounced than full mu-opioid agonists in some models, but not risk-free.',
    sevenOh: 'Higher concern because greater receptor efficacy can shift the profile toward stronger opioid-like effects.',
  },
  {
    factor: 'Dependence and withdrawal',
    mitragynine: 'Documented with repeated kratom exposure; severity varies by dose, duration, and product.',
    sevenOh: 'Expected to carry higher liability when exposure is elevated or direct.',
  },
  {
    factor: 'Human evidence',
    mitragynine: 'Limited human pharmacokinetic and observational data; sparse controlled efficacy data.',
    sevenOh: 'Very limited human data for isolated 7-OH; much evidence is preclinical or regulatory/post-market.',
  },
]

const references = [
  'Huestis MA, et al. (2024). Human mitragynine and 7-hydroxymitragynine pharmacokinetics after oral dried kratom leaf powder.',
  'Kruegel AC, et al. (2019). 7-Hydroxymitragynine as an active metabolite of mitragynine.',
  'Hill R, et al. (2022). Respiratory depressant effects of mitragynine and metabolic conversion context.',
  'FDA public communications on kratom and 7-hydroxymitragynine product risks.',
]

export default function MitragynineVsSevenOhPage() {
  const url = `${SITE_URL}${PATH}`

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url={url}
        type="Article"
        breadcrumbs={[
          { name: 'Home', url: `${SITE_URL}/` },
          { name: 'Compare', url: `${SITE_URL}/compare/` },
          { name: TITLE, url },
        ]}
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: TITLE },
        ]}
      />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Evidence comparison · Kratom alkaloids</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Mitragynine vs 7-hydroxymitragynine: risk, potency, and pharmacology
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          Mitragynine and 7-hydroxymitragynine are related kratom alkaloids, but they are not equivalent.
          The most important difference is exposure to the higher-potency mu-opioid receptor agonist:
          traditional mitragynine-dominant leaf material relies partly on metabolic conversion, while
          concentrated 7-OH products can deliver the higher-risk compound directly.
        </p>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-950">
          <p className="font-bold">Educational safety note</p>
          <p className="mt-2">
            This page does not provide usage guidance. Neither mitragynine nor 7-hydroxymitragynine is
            FDA-approved for medical use. Dependence, withdrawal, respiratory depression in high-risk
            contexts, and serious adverse events have been reported with kratom alkaloids.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Primary leaf alkaloid</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Mitragynine</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            Mitragynine is the dominant alkaloid in traditional kratom leaf. It acts as a partial
            mu-opioid receptor agonist and is metabolized primarily through CYP3A4 into
            7-hydroxymitragynine. Human pharmacokinetic data exist, but controlled outcome data remain
            limited.
          </p>
          <Link href="/articles/mitragynine" className="chip-readable">
            Read the mitragynine monograph
          </Link>
        </article>

        <article className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Higher-potency metabolite</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">7-Hydroxymitragynine</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            7-Hydroxymitragynine occurs at trace levels in natural leaf and is also formed from
            mitragynine. It shows substantially greater mu-opioid receptor potency in available studies.
            Concentrated products are a separate safety and regulatory concern.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/articles/7-hydroxymitragynine" className="chip-readable">
              Read the 7-OH monograph
            </Link>
            <Link href="/compounds/7-hydroxymitragynine" className="chip-readable">
              View 7-OH profile
            </Link>
          </div>
        </article>
      </section>

      <section className="card-premium p-6 space-y-5">
        <p className="eyebrow-label">Direct comparison</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Where the risk profile diverges</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-ink">
              <tr className="border-b border-black/10">
                <th className="py-3 pr-4 font-semibold">Factor</th>
                <th className="py-3 pr-4 font-semibold">Mitragynine</th>
                <th className="py-3 pr-4 font-semibold">7-Hydroxymitragynine</th>
              </tr>
            </thead>
            <tbody className="text-[#46574d]">
              {comparisonRows.map((row) => (
                <tr key={row.factor} className="border-b border-black/10 last:border-0">
                  <td className="py-3 pr-4 font-medium text-ink">{row.factor}</td>
                  <td className="py-3 pr-4">{row.mitragynine}</td>
                  <td className="py-3 pr-4">{row.sevenOh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Mechanistic interpretation</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Metabolic buffering is not the same as safety</h2>
        <p className="text-sm leading-7 text-[#46574d]">
          Human pharmacokinetic data show that mitragynine can be converted into 7-hydroxymitragynine,
          with measurable 7-OH appearing in plasma after oral dried kratom leaf powder. That conversion
          appears rate-limited in available studies. Direct or enriched 7-OH exposure can remove that
          slower formation step, which is why concentrated 7-OH products should not be treated as
          equivalent to traditional leaf material.
        </p>
        <p className="text-sm leading-7 text-[#46574d]">
          A lower respiratory-depression signal for mitragynine in some models does not erase risk.
          Product strength, elevated 7-OH content, sedative co-use, tolerance, individual metabolism,
          liver function, and substance-use history can all materially change the safety picture.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-amber-950">Concentrated forms change the interpretation</h2>
        <p className="text-sm leading-7 text-amber-950">
          The comparison is not simply "compound A versus compound B." It is also leaf matrix versus
          concentrated exposure, metabolic formation versus direct delivery, and lower-potency parent
          compound versus higher-potency active metabolite. FDA communications have increasingly focused
          on concentrated 7-OH products because they can produce a materially different risk profile.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/guides/kratom-7oh-withdrawal-management" className="chip-readable">
            Withdrawal management guide
          </Link>
          <Link href="/safety-checker" className="chip-readable">
            Safety checker
          </Link>
        </div>
      </section>

      <section className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Evidence limits</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">What remains uncertain</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[#46574d]">
          <li>Direct head-to-head human clinical data comparing isolated mitragynine and isolated 7-OH are extremely limited.</li>
          <li>Many human reports involve whole kratom products, not purified alkaloids.</li>
          <li>Commercial product composition can vary widely, making exposure hard to infer from labels alone.</li>
          <li>Long-term dependence, withdrawal severity, and rare-event risks need stronger prospective study.</li>
        </ul>
      </section>

      <section className="card-premium p-6 space-y-4">
        <p className="eyebrow-label">References used for this comparison</p>
        <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
          {references.map((reference) => (
            <li key={reference}>{reference}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
