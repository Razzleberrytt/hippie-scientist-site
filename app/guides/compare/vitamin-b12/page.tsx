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

const pagePath = '/guides/compare/vitamin-b12/'
const title = 'Best Vitamin B12? Methylcobalamin vs Cyanocobalamin, Forms and Routes'
const description = 'Compare four vitamin B12 forms, oral vs sublingual vs injections, who needs replacement, studied doses and safety before shopping. PubMed-verified evidence and FAQs.'
export const metadata: Metadata = buildPageMetadata({ title, description, path: pagePath })

export default function VitaminB12Comparison() {
  return (
    <article className="container-page py-10 space-y-8 text-ink">
      <AuthorityJsonLd title={title} description={description} url={`https://thehippiescientist.net${pagePath}`} type="MedicalWebPage" includeArticle citationUrls={studies.map(s => `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`)} />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Comparisons', href: '/guides/compare/' }, { label: 'Vitamin B12 forms' }]} />
      <header className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Evidence-first buyer comparison · References checked October 22, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Vitamin B12: which form and route are worth choosing?</h1>
        <p className="text-lg leading-8 text-muted">Cyanocobalamin is a practical oral reference option with established deficiency-replacement evidence. Methylcobalamin, hydroxocobalamin and adenosylcobalamin have different uses and formulations, but no universal winner is established. Sublingual marketing does not prove better absorption. First establish whether you need replacement and whether your gut can absorb it. <Cite n={1} /> <Cite n={2} /> <Cite n={3} /></p>
      </header>
      <AffiliateDisclosure className="max-w-4xl" />
      <nav aria-label="On this page" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold underline">
        {[['safety', 'Safety first'], ['compare', 'Compare four forms'], ['routes', 'Oral, sublingual or injection'], ['who-needs-it', 'Who needs B12?'], ['shopping', 'Label and buying checks'], ['research', 'Evidence and references'], ['frequently-asked-questions', 'Questions']].map(([id, label]) => <a key={id} className="inline-flex min-h-11 items-center" href={`#${id}`}>{label}</a>)}
      </nav>
      <section className="card-premium max-w-4xl space-y-4 p-6" aria-labelledby="benefits">
        <h2 id="benefits" className="text-2xl font-semibold">Vitamin B12 benefits depend on deficiency, not the price of the bottle</h2>
        <p className="leading-7 text-muted">Deficiency replacement, nerve symptoms, memory, mood and fatigue are separate outcomes. In adults without overt deficiency, a review of 16 randomized trials found no overall cognitive or depressive-symptom benefit; only one fatigue study was available. A higher blood B12 result is not proof of more energy or better focus. <Cite n={15} /></p>
        <p className="leading-7 text-muted">This page compares forms and routes rather than ranking brands. Symptoms and the cause of deficiency matter more than the word “active” on a label. New numbness, balance trouble, cognitive changes or unexplained anemia need prompt assessment; do not postpone care while comparing supplements. A clinician may use blood counts, serum B12 and sometimes methylmalonic acid, interpreted alongside symptoms. <Cite n={13} /> <Cite n={14} /></p>
      </section>
      <section id="safety" className="max-w-4xl scroll-mt-24 rounded-2xl border border-amber-900/20 bg-amber-50 p-6 space-y-4 text-amber-950 dark:border-amber-200/25 dark:bg-amber-300/10 dark:text-amber-100">
        <h2 className="text-2xl font-semibold">B12 safety: read this before shopping</h2>
        <p className="leading-7"><strong>Folate can mask the blood signs of B12 deficiency.</strong> Folic acid can correct the anemia while B12-related neurological injury remains untreated. Do not use folate or a B-complex to explain away neurological symptoms or replace B12 assessment. A normal blood count does not rule out B12-related neurological disease. Review both nutrients with a clinician. <Cite n={13} /> <Cite n={14} /> See also the <a className="underline" href="https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/">NIH folate safety explanation</a>.</p>
        <p className="leading-7"><strong>Medication review:</strong> long-term metformin increased deficiency risk in a randomized trial. Long-term PPIs and H2 blockers were associated with deficiency in observational data. These medicines may impair B12 availability; B12 is not a reason to stop prescribed treatment. Ask about testing and monitoring, especially with anemia or neuropathy. Evidence for PPIs/H2 blockers should not be stretched to every occasional antacid. <Cite n={7} /> <Cite n={8} /></p>
        <p className="leading-7"><strong>Acneiform eruptions:</strong> acne-like papules and pustules have followed oral and injected B12, including cases with very high blood levels. Exact high-dose thresholds and incidence are unknown. Report a new eruption and discuss formulation or treatment changes; do not abandon necessary deficiency replacement without an alternative plan. Breathing difficulty or throat swelling after any product needs emergency help. <Cite n={12} /></p>
        <p className="leading-7"><strong>High-dose B vitamins and lung cancer in male smokers:</strong> in the observational VITAL cohort, men averaging more than 55 mcg/day supplemental B12 over ten years had nearly twice the lung-cancer risk of nonusers (HR 1.98, 95% CI 1.32–2.97). B6 above 20 mg/day was also associated with increased risk (HR 1.82, 1.25–2.65). Associations were stronger among men smoking at baseline. Individual supplements drove the signal; no association was found in women. <Cite n={9} /></p>
        <p className="leading-7">The ATBC nested study in Finnish male smokers found <strong>no significant association between serum B12 and lung cancer</strong>. ATBC randomized vitamin E and beta-carotene, not B12. Its blood-marker result does not cancel VITAL’s supplement signal or establish a safe supplement dose. Later pooled biomarker and genetic analyses also raised concern about higher B12 status. These are different exposures and designs, with uncertainty about causality. <Cite n={10} /> <Cite n={11} /></p>
        <p className="leading-7"><strong>Male smokers should avoid unnecessary high-dose B12 or B-complex supplementation and discuss medically indicated replacement with their clinician.</strong> The VITAL category is not a toxicity cutoff, and these findings do not justify leaving deficiency untreated. No tolerable upper intake level has been established for B12; that does not mean unlimited doses are proven harmless. See the <a className="underline" href="https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/">NIH B12 safety and upper-limit context</a>. <Cite n={9} /> <Cite n={13} /></p>
        <p className="leading-7">Pernicious anemia, gastrointestinal surgery, malabsorption, pregnancy, breastfeeding and children need individualized assessment rather than an adult shopping guide. Review all medicines, supplements and known allergies, including cobalt/B12 reactions, before treatment. See our <Link className="underline" href="/info/disclaimer/">medical disclaimer</Link> and <Link className="underline" href="/safety-checker/">safety resources</Link>. <Cite n={13} /> <Cite n={14} /></p>
      </section>
      <section id="compare" className="scroll-mt-24 space-y-5">
        <h2 className="text-2xl font-semibold">Methylcobalamin vs cyanocobalamin vs hydroxo vs adenosyl</h2>
        <p className="max-w-4xl leading-7 text-muted">Evidence confidence is strongest for correcting deficiency markers with established preparations, weaker for differences in patient outcomes between forms. Methyl and adenosyl forms still undergo cellular processing; “active” does not mean conversion-free or clinically superior. Hydroxocobalamin’s use by injection cannot prove an oral hydroxo product has an advantage. <Cite n={1} /> <Cite n={2} /></p>
        <ResponsiveTable label="Vitamin B12 forms comparison; scroll horizontally on small screens" showTitle={false}>
          <table className="w-full min-w-[960px] table-fixed text-left text-sm leading-7">
            <caption className="sr-only">Four B12 forms compared by practical fit, label checks and evidence boundary</caption>
            <thead className="bg-brand-50 dark:bg-[var(--surface-subtle)]"><tr>{['Form', 'Practical fit', 'What to compare', 'Evidence boundary'].map(label => <th key={label} scope="col" className="p-4 align-top">{label}</th>)}</tr></thead>
            <tbody>{forms.map(form => <tr key={form.name} className="border-t border-brand-900/10 dark:border-white/10"><th scope="row" className="p-4 align-top font-semibold">{form.name}</th><td className="p-4 align-top">{form.fit}</td><td className="p-4 align-top">{form.compare}</td><td className="p-4 align-top">{form.boundary} {form.refs.map(n => <span key={n}><Cite n={n} />{' '}</span>)}</td></tr>)}</tbody>
          </table>
        </ResponsiveTable>
      </section>
      <section id="routes" className="max-w-4xl scroll-mt-24 space-y-4">
        <h2 className="text-2xl font-semibold">Oral, sublingual or injection: what absorption evidence shows</h2>
        <p className="leading-7 text-muted"><strong>Swallowed oral B12:</strong> normal absorption uses intrinsic factor; a small fraction of a large dose can also enter independently of it. This explains why high-dose oral replacement can work even when intrinsic factor is impaired. It does not mean all malabsorption causes respond reliably, or that a low-dose multivitamin is equivalent to supervised replacement. <Cite n={13} /></p>
        <p className="leading-7 text-muted"><strong>Sublingual B12:</strong> a 30-person randomized comparison of 500 mcg/day found similar serum improvements with swallowed and sublingual products. It did not quantify uptake through the mouth lining. Some of a dissolved dose can be swallowed; do not interpret a lozenge format as proven bypass of intestinal absorption. <Cite n={3} /></p>
        <p className="leading-7 text-muted"><strong>Injected B12:</strong> bypasses intestinal absorption and gives clinicians a dependable delivery route when symptoms, absorption or adherence warrant it. The Cochrane review found low-certainty evidence for similar short-term serum results with oral 1,000–2,000 mcg/day, without adequate symptom outcomes. Injection is not proven to enhance energy in people without deficiency. <Cite n={2} /> <Cite n={13} /> <Cite n={15} /></p>
        <p className="leading-7 text-muted"><strong>Long-term equivalence is not established for every schedule.</strong> In OB12, 283 deficient adults aged 65 or older had similar short-term normalization, but oral treatment dropped from 1 mg daily to 1 mg weekly after eight weeks. Oral non-inferiority was not established at one year. The tested maintenance schedule matters; this is not proof that oral therapy inherently fails. <Cite n={16} /></p>
      </section>
      <section id="who-needs-it" className="max-w-4xl scroll-mt-24 space-y-5">
        <h2 className="text-2xl font-semibold">Who needs B12, and what doses were actually studied?</h2>
        <p className="leading-7 text-muted">These amounts describe studies, not personal instructions. Prevention, mild biochemical deficiency and symptomatic malabsorption are different clinical jobs. One milligram (mg) equals 1,000 micrograms (mcg); check units and total intake across products.</p>
        <ul className="space-y-4 leading-7 text-muted">
          <li><strong>Vegans and vegetarians:</strong> a reliable B12 source matters. In 40 marginally deficient adults, 50 mcg/day or 2,000 mcg once weekly sublingual cyanocobalamin for 12 weeks improved biomarkers. This was not a severe-deficiency or neurological-recovery trial. <Cite n={4} /></li>
          <li><strong>Adults over 50:</strong> review diet, gastric absorption and symptoms; age alone is not a high-dose prescription. In 120 older adults already mildly deficient, 2.5–1,000 mcg/day cyanocobalamin was tested for 16 weeks. Higher doses gave larger methylmalonic-acid responses, without establishing universal memory or fatigue benefits. <Cite n={5} /> <Cite n={13} /> <Cite n={15} /></li>
          <li><strong>Metformin users:</strong> testing and follow-up deserve attention. A one-year trial used 1,000 mcg/day oral dispersible methylcobalamin in patients with low B12 and established diabetic neuropathy; some nerve and pain measures improved, but two clinical test domains did not. No preventive dose for every metformin user follows from this trial. <Cite n={6} /> <Cite n={7} /></li>
          <li><strong>PPI, H2-blocker and antacid users:</strong> discuss sustained acid suppression and B12 risk. The large medication study was observational and did not test B12 supplementation, so it supplies no preventive dose. If deficiency is confirmed, the cause and response guide replacement; do not borrow another population’s schedule automatically. <Cite n={8} /> <Cite n={13} /></li>
          <li><strong>Pernicious anemia or malabsorption:</strong> establish the cause and a monitored long-term plan. Oral trials used 1,000–2,000 mcg/day in mixed deficiency populations; they do not resolve every malabsorption disorder. Injection schedules are clinician-directed, particularly with neurological involvement. Do not replace prescribed injections with a retail supplement independently. <Cite n={2} /> <Cite n={13} /> <Cite n={14} /></li>
        </ul>
      </section>
      <section id="shopping" className="scroll-mt-24 space-y-5">
        <h2 className="text-2xl font-semibold">Buying checks after the safety and diagnosis questions</h2>
        <p className="max-w-4xl leading-7 text-muted">There are no HIGH-confidence verified B12 ASINs in our product catalog. All four links below are explicitly labeled Amazon searches, not verified products or efficacy rankings. We do not endorse search results, sell injections, or independently confirm price, availability, seller quality or batch purity.</p>
        <p className="max-w-4xl leading-7 text-muted">Compare the exact form, amount per serving, serving size, allergens and excipients. Check whether a blend also supplies folic acid or B6; avoid duplicating high-dose B vitamins across products. Compare cost at the amount agreed with your clinician rather than bottle price. Ask for current, batch-specific identity and contaminant testing; a label claim alone does not verify purity. <Cite n={9} /> <Cite n={13} /> <Cite n={14} /></p>
        <div className="grid gap-4 sm:grid-cols-2">{forms.map(form => <div key={form.name} className="card-premium p-5 space-y-3"><h3 className="text-lg font-semibold">{form.name}</h3><p className="text-sm leading-7 text-muted">Search results may include unrelated forms or blends. Confirm the actual label and seller. This is not a verified product selection.</p><a className="inline-flex min-h-11 items-center font-semibold underline" href={`https://www.amazon.com/s?k=${encodeURIComponent(form.query)}&tag=${AFFILIATE_TAGS.amazon}`} rel="sponsored nofollow noopener" target="_blank">Search Amazon: {form.name} (affiliate)</a></div>)}</div>
      </section>
      <section id="research" className="max-w-4xl scroll-mt-24 space-y-5">
        <h2 className="text-2xl font-semibold">Research, uncertainty and verified references</h2>
        <p className="leading-7 text-muted">All 16 PMID identities and abstracts were checked against PubMed on October 22, 2026. This is a selected evidence review, not an exhaustive systematic search. Confidence differs by question: randomized biochemical replacement evidence, limited direct form/route comparisons, observational cancer signals and uncontrolled skin-reaction cases should not be pooled into one “B12 evidence grade.”</p>
        <p className="leading-7 text-muted">Funding and bias matter: UNI-PHARMA supplied the methylcobalamin trial’s active and placebo tablets; investigators reported no external funding, no conflicts and no company role in the study or publication. The metformin risk trial disclosed Merck Sharp &amp; Dohme financial support. Full funding/conflict details remain unresolved for some older reports, and no independent replication of a retail brand is claimed. Small samples, biomarker endpoints, different maintenance schedules and observational confounding limit conclusions. <Cite n={6} /> <Cite n={7} /></p>
        <ol id="references" className="space-y-5 scroll-mt-24">{studies.map((study, i) => <li key={study.pmid} id={`ref-${i + 1}`} className="card-premium p-5 space-y-2 scroll-mt-24"><h3 className="text-lg font-semibold">[{i + 1}] {study.title}</h3><p className="leading-7 text-muted">{study.context}</p><p className="leading-7 text-muted"><strong>What it does not establish:</strong> {study.boundary}</p><a className="inline-flex min-h-11 items-center font-semibold underline" href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}>Verify on PubMed · PMID {study.pmid}</a></li>)}</ol>
      </section>
      <LegacyGuideFAQ questions={faqs} pagePath={pagePath} />
      <section className="max-w-4xl space-y-3"><h2 className="text-2xl font-semibold">Continue your research</h2><ul className="space-y-2 leading-7 underline"><li><Link href="/compounds/cobalamin/">Vitamin B12 ingredient profile</Link></li><li><Link href="/guides/compare/psyllium-husk/">Psyllium forms: another evidence-first comparison</Link></li><li><Link href="/guides/compare/">More supplement comparisons</Link></li><li><Link href="/info/affiliate-disclosure/">Affiliate and editorial disclosure</Link></li></ul></section>
    </article>
  )
}

function Cite({ n }: { n: number }) {
  return <a className="font-semibold underline underline-offset-2" href={`#ref-${n}`} aria-label={`Reference ${n}`}>[{n}]</a>
}
