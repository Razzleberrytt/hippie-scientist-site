import Link from 'next/link'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { faqs, forms, studies } from './content'

const pagePath = '/guides/compare/psyllium-husk/'
const title = 'Psyllium Husk vs Powder vs Capsules: An Evidence-First Buying Guide'
const description = 'Compare four psyllium forms by labeled fiber, preparation, additives and safety. Eight PubMed-verified studies explain the benefits, limits and medication cautions.'
export const metadata: Metadata = buildPageMetadata({ title, description, path: pagePath })

export default function PsylliumBuyerComparison() {
  return (
    <article className="container-page py-10 space-y-8 text-ink">
      <AuthorityJsonLd title={title} description={description} url={`https://thehippiescientist.net${pagePath}`} type="MedicalWebPage" includeArticle citationUrls={studies.map(s => `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`)} />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Comparisons', href: '/guides/compare/' }, { label: 'Psyllium forms' }]} />
      <header className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Evidence-first buyer comparison · References checked October 18, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Psyllium husk, powder or capsules: what is worth buying?</h1>
        <p className="text-lg leading-8 text-muted">Psyllium has human evidence for constipation and lowering LDL cholesterol, with limitations that matter. No form or brand has demonstrated superiority in the studies reviewed. Choose by the labeled fiber amount, ingredients, preparation and safety—not marketing promises. <Cite n={1} /> <Cite n={2} /></p>
      </header>
      <AffiliateDisclosure className="max-w-4xl" />
      <nav aria-label="On this page" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold underline">
        <a className="inline-flex min-h-11 items-center" href="#compare">Compare forms</a>
        <a className="inline-flex min-h-11 items-center" href="#safety">Safety first</a>
        <a className="inline-flex min-h-11 items-center" href="#research">What the research says</a>
        <a className="inline-flex min-h-11 items-center" href="#frequently-asked-questions">Questions</a>
      </nav>
      <section className="card-premium max-w-4xl space-y-4 p-6" aria-labelledby="selection">
        <h2 id="selection" className="text-2xl font-semibold">How to choose without buying an evidence claim</h2>
        <p className="leading-7 text-muted">This is a form comparison, not a brand ranking. Constipation response, IBS symptoms and lipid markers are separate outcomes. The studies below do not establish equivalent effects for every formulation, or demonstrate that a higher price means greater benefit. <Cite n={1} /> <Cite n={2} /> <Cite n={5} /></p>
        <p className="leading-7 text-muted">First check safety. Then compare grams of dietary fiber per labeled serving, grams of psyllium, other ingredients and whether you can follow preparation directions. Compare the current price per gram of labeled fiber. Ask for a current, batch-specific identity and contaminant report if testing matters to your choice; a seal or organic label alone is not a clinical trial.</p>
        <p className="leading-7 text-muted">No psyllium ASIN is verified in our current product catalog. All four options therefore use clearly labeled Amazon searches. Search results can include unrelated products; check the actual label and seller. We have not independently tested these products or confirmed price, availability or batch purity.</p>
      </section>
      <section id="safety" className="max-w-4xl scroll-mt-24 rounded-2xl border border-amber-900/20 bg-amber-50 p-6 space-y-4 text-amber-950 dark:border-amber-200/25 dark:bg-amber-300/10 dark:text-amber-100">
        <h2 className="text-2xl font-semibold">Who should avoid psyllium—and when to get help</h2>
        <p className="leading-7"><strong>Do not take psyllium dry. Avoid it with suspected bowel obstruction, swallowing difficulty or a known psyllium allergy.</strong> Obstruction and severe allergic reactions, including fatal anaphylaxis, have been reported. Capsules do not remove swallowing and fluid precautions. <Cite n={7} /> <Cite n={8} /></p>
        <p className="leading-7">Seek clinical advice first with gastrointestinal narrowing, recent gastrointestinal surgery or fluid restrictions. Follow the specific product’s liquid and preparation directions. Severe abdominal pain, vomiting, trouble swallowing or inability to pass stool or gas needs prompt medical assessment; breathing difficulty or throat swelling after exposure needs emergency help. Do not keep taking fiber to push through these symptoms. <Cite n={7} /> <Cite n={8} /></p>
        <p className="leading-7"><strong>Drug interactions:</strong> review all oral medicines with a pharmacist before starting. In a small levothyroxine experiment, simultaneous psyllium changed estimated absorption, but the authors did not establish clinically important malabsorption. This is not proof of compatibility with every medicine. Use medication-specific advice on spacing and monitoring; do not adjust prescriptions yourself. <Cite n={6} /></p>
        <p className="leading-7">Flatulence can increase, and psyllium was not the best-tolerated option in a small comparison with fruit. <Cite n={2} /> <Cite n={4} /> This adult evidence review does not establish suitability for children or pregnancy; get individualized advice. See the <Link className="underline" href="/info/disclaimer/">medical disclaimer</Link> and <Link className="underline" href="/safety-checker/">safety resources</Link>.</p>
      </section>
      <section id="compare" className="scroll-mt-24 space-y-5" aria-labelledby="compare-title">
        <h2 id="compare-title" className="text-2xl font-semibold">Four forms, compared head-to-head</h2>
        <p className="max-w-4xl leading-7 text-muted">Read each row across the same criteria. These are practical fits, not efficacy rankings. The evidence concerns psyllium preparations; no direct four-way retail comparison was identified in this selected study set. <Cite n={1} /> <Cite n={2} /></p>
        <ResponsiveTable label="Psyllium forms comparison table; scroll horizontally on small screens" showTitle={false}>
          <table className="w-full min-w-[1100px] table-fixed text-left text-sm leading-7">
            <caption className="sr-only">Psyllium form, practical fit, label comparison, reasons to skip and evidence boundary</caption>
            <colgroup><col className="w-40" /><col /><col /><col /><col /></colgroup>
            <thead className="bg-brand-50 dark:bg-[var(--surface-subtle)]"><tr>{['Form', 'Practical fit', 'What to compare', 'Skip or pause if', 'Evidence boundary'].map(label => <th key={label} scope="col" className="p-4 align-top">{label}</th>)}</tr></thead>
            <tbody>{forms.map(form => <tr key={form.name} className="border-t border-brand-900/10 dark:border-white/10"><th scope="row" className="p-4 align-top font-semibold">{form.name}</th><td className="p-4 align-top">{form.fit}</td><td className="p-4 align-top">{form.compare}</td><td className="p-4 align-top">{form.skip}</td><td className="p-4 align-top">{form.evidence}</td></tr>)}</tbody>
          </table>
        </ResponsiveTable>
        <div className="grid gap-4 sm:grid-cols-2">{forms.map(form => <div key={form.name} className="card-premium p-5 space-y-3"><h3 className="text-lg font-semibold">{form.name}</h3><p className="text-sm leading-7 text-muted">Compare current labels and sellers. This search is not an endorsement of any result.</p><a className="inline-flex min-h-11 items-center font-semibold underline" href={`https://www.amazon.com/s?k=${encodeURIComponent(form.query)}&tag=${AFFILIATE_TAGS.amazon}`} rel="sponsored nofollow noopener" target="_blank">Search Amazon: {form.name} (affiliate)</a></div>)}</div>
      </section>
      <section id="research" className="max-w-4xl scroll-mt-24 space-y-5">
        <h2 className="text-2xl font-semibold">What the research says</h2>
        <p className="leading-7 text-muted">Eight key studies and reviews, with every PMID checked against PubMed on October 18, 2026. This is a selected evidence review, not an exhaustive systematic search. Study amounts and durations describe research, not a universal regimen. Preparations and comparators differ; five efficacy studies do not constitute five independent confirmations of a retail product.</p>
        <p className="leading-7 text-muted">Bias and funding: the lipid review reports inconsistency, the fruit comparisons are small, and the IBS trial had substantial attrition. The constipation review was funded by the British Dietetic Association; its authors disclose food-industry research funding and consultancy relationships, including Danone, Alpro and Puratos. The authors report that funders had no role in the review. <Cite n={2} /> The Chey fruit comparison was funded by kiwifruit marketer Zespri International. Investigator Shanti Eswaran also disclosed receiving Zespri research funding in her <a className="underline" href="https://pubmed.ncbi.nlm.nih.gov/34035773/">published discussion of this trial (PMID 34035773)</a>. Consider this commercial relationship alongside the small sample and partial randomization when interpreting the tolerability findings. <Cite n={4} /> Full funding and conflicts have not been independently resolved for every study; no independence or brand-replication claim is made. None of the four shopping searches represents a clinically validated brand choice.</p>
        <ol id="references" className="space-y-5 scroll-mt-24">{studies.map((study, i) => <li key={study.pmid} id={`ref-${i + 1}`} className="card-premium p-5 space-y-2 scroll-mt-24"><h3 className="text-lg font-semibold">[{i + 1}] {study.title}</h3><p className="leading-7 text-muted">{study.context}</p><p className="leading-7 text-muted"><strong>What it does not establish:</strong> {study.boundary}</p><a className="inline-flex min-h-11 items-center font-semibold underline" href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}>Verify on PubMed · PMID {study.pmid}</a></li>)}</ol>
      </section>
      <LegacyGuideFAQ questions={faqs} pagePath={pagePath} />
      <section className="max-w-4xl space-y-3"><h2 className="text-2xl font-semibold">Continue your research</h2><ul className="space-y-2 leading-7 underline"><li><Link href="/herbs/psyllium/">Psyllium ingredient profile</Link></li><li><Link href="/guides/other/prebiotics/">Prebiotic fiber types and their evidence boundaries</Link></li><li><Link href="/guides/compare/">More supplement comparisons</Link></li><li><Link href="/info/affiliate-disclosure/">Affiliate and editorial disclosure</Link></li></ul></section>
    </article>
  )
}

function Cite({ n }: { n: number }) {
  return <a className="font-semibold underline underline-offset-2" href={`#ref-${n}`} aria-label={`Reference ${n}`}>[{n}]</a>
}
