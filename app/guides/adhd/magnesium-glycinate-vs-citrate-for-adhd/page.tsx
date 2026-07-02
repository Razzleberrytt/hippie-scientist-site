import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import type { Metadata } from 'next'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../src/lib/seo'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import PathwayDiagram from '@/components/PathwayDiagram'
import EvidenceLegend from '@/components/EvidenceLegend'
import { pathwayDiagrams } from '@/lib/pathway-data'
import { AFFILIATE_TAGS } from '@/config/affiliate'

const SLUG = 'magnesium-glycinate-vs-citrate-for-adhd'
const TITLE = 'Magnesium Glycinate vs Citrate for ADHD: Which Form Works Better?'
const DESCRIPTION =
  'Evidence-based comparison of magnesium glycinate and citrate for ADHD. Covers absorption, sleep support, calming effects, GI tolerability, dosage, and practical product guidance.'
const DATE = '2026-06-12'
const AUTHOR = 'Will'
const READING_TIME = '11 min read'
const TAGS = ['magnesium', 'ADHD', 'focus', 'sleep', 'minerals']
const CATEGORY = 'Supplement Evidence'

export const metadata: Metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/adhd/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Is magnesium glycinate or citrate better for ADHD?',
    answer:
      'Magnesium glycinate is generally considered the better first choice for ADHD-related use. The glycine component adds mild calming support, it is gentler on the digestive system, and it is well-absorbed. Citrate is a reasonable alternative with good absorption at a lower price point, but it has a stronger laxative effect at higher doses. For sleep support, glycinate is typically preferred. For general magnesium repletion at a lower cost, citrate is acceptable.',
  },
  {
    question: 'Can magnesium help ADHD symptoms directly?',
    answer:
      'The evidence for magnesium improving core ADHD symptoms (inattention, hyperactivity) is primarily in populations with documented magnesium deficiency — which is more common in ADHD than the general population. Correcting a deficiency may improve symptoms by normalizing nervous system excitability. Using magnesium as a primary ADHD treatment in a non-deficient person has weaker supporting evidence. Testing serum magnesium levels before supplementing is reasonable.',
  },
  {
    question: 'What dose of magnesium glycinate for ADHD?',
    answer:
      'Common supplemental doses are 200–400 mg elemental magnesium daily. For ADHD specifically, many practitioners use 200–300 mg elemental magnesium glycinate taken in the evening. Start at the lower end and increase gradually. Note that "magnesium glycinate 400 mg" on a label refers to the total salt weight, not elemental magnesium — check the label for elemental magnesium content, which is typically 60–75 mg per 400 mg serving of the chelate.',
  },
  {
    question: 'Can I take magnesium glycinate every night for ADHD?',
    answer:
      'Daily evening use is a common pattern and is generally considered reasonable for healthy adults within typical supplemental dose ranges. Long-term formal safety data for high-dose supplementation is limited, but magnesium at physiological doses has a good safety record. Avoid exceeding the tolerable upper intake level of 350 mg supplemental magnesium per day from supplements (dietary magnesium is not counted in this limit). If you have kidney disease or take medications, consult a clinician first.',
  },
  {
    question: 'Does magnesium citrate have a laxative effect at ADHD doses?',
    answer:
      'At typical ADHD supplemental doses (150–200 mg elemental magnesium), GI effects are mild for most people. Magnesium citrate has a stronger osmotic laxative effect than glycinate at equal elemental doses, particularly above 200–300 mg. If loose stools occur with citrate, switching to glycinate or reducing the dose usually resolves the issue. Some people find citrate useful for constipation as a side benefit; for others it is a reason to use glycinate instead.',
  },
  {
    question: 'Is magnesium threonate better than glycinate for ADHD?',
    answer:
      'Magnesium threonate (L-threonate) is marketed for brain health due to animal data suggesting greater brain penetration. Human trial data for threonate vs glycinate in ADHD specifically is very limited. It is substantially more expensive than glycinate. For most people starting magnesium supplementation for ADHD, glycinate is the most practical first choice: better evidence, better cost, and a strong safety profile. Threonate may be worth exploring if glycinate does not produce results after a fair trial.',
  },
]

export default function MagnesiumGlycinateCitrateAdhdPage() {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Articles', url: 'https://thehippiescientist.net/articles' },
    { name: TITLE, url: `https://thehippiescientist.net/articles/${SLUG}` },
  ])
  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    `/articles/${SLUG}`,
  )
  const faqLd = faqPageJsonLd({ pagePath: `/articles/${SLUG}`, questions: FAQS })

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleLd} />
      <JsonLd schema={breadcrumbLd} />
      {faqLd && <JsonLd schema={faqLd} />}

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/guides/" className="transition hover:text-ink">Articles</Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      {/* Hero */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            {CATEGORY}
          </span>
          {TAGS.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
              {tag}
            </span>
          ))}
          <span className="text-muted">June 12, 2026</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>
        <p className="mt-2 text-sm text-muted">
          By{' '}
          <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">
            {AUTHOR}
          </Link>
        </p>
        <div className="mt-3">
          <LastUpdatedBadge date={DATE} label="Last updated" />
        </div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>
      </section>

      {/* Disclosure */}
      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article contains affiliate
        links. If you purchase through these links, we may earn a commission at no additional cost to
        you. We only link to forms and dose ranges consistent with the research reviewed on this page.
      </div>

      {/* Body + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Glycinate or Citrate — Which Wins for ADHD?
            </h2>
            <ul className="mt-4 space-y-2">
              {[
                ['Glycinate is the better first choice for ADHD', 'The glycine component adds mild calming support, GI tolerance is better, and it\'s well-suited for evening use.'],
                ['Citrate is a reasonable budget alternative', 'Similar elemental absorption at lower cost, but more laxative potential at higher doses.'],
                ['Both forms help correct magnesium deficiency', 'Deficiency is more common in ADHD and correcting it may reduce hyperactivation and support sleep.'],
                ['Neither is a primary ADHD treatment', 'Evidence for direct ADHD symptom improvement is strongest in deficient populations — not as a standalone stimulant replacement.'],
              ].map(([bold, rest]) => (
                <li key={bold as string} className="flex gap-2 text-[1.01rem] leading-[1.85] text-muted">
                  <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                  <span><strong>{bold as string}.</strong> {rest as string}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Main content */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            <div id="why-form-matters">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Why the Form of Magnesium Matters for ADHD
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Not all magnesium supplements deliver the same amount of usable magnesium to your cells.
                Bioavailability — how much is absorbed in the gut and reaches tissues — varies significantly
                by form. For ADHD specifically, additional factors matter: whether the chelating agent has
                its own neurological effect (glycine does), how the supplement affects digestion, and
                whether the timing suits sleep support.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                <strong>Magnesium glycinate</strong> is magnesium chelated to glycine, an amino acid that
                acts as an inhibitory neurotransmitter in the central nervous system. Glycine itself has
                evidence for sleep quality support and may add a calming effect beyond what magnesium alone
                provides — making glycinate a natural fit for ADHD-related sleep difficulties and evening
                calming support.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                <strong>Magnesium citrate</strong> is magnesium bound to citric acid. It has good
                bioavailability and is substantially cheaper than glycinate, but the citrate form has
                a stronger osmotic effect in the gut — meaning it draws water into the intestines, which
                can cause loose stools at higher doses. At typical supplemental doses for ADHD (150–200 mg
                elemental), this is usually mild, but it is a meaningful difference for sensitive users.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Mechanism */}
            <div id="mechanism">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                How Magnesium Works in the Brain
              </h2>
              <PathwayDiagram data={pathwayDiagrams['magnesium-adhd']} />
              <p className="mt-4 text-[1.01rem] leading-[1.85] text-muted">
                Magnesium&apos;s primary role in neural excitability is as a voltage-dependent blocker of
                NMDA receptors — the &ldquo;volume knob&rdquo; for excitatory signaling in the brain. When
                magnesium levels are adequate, NMDA receptors require stronger signals to activate, which
                reduces neural hyperactivation. This is particularly relevant for ADHD, where
                hyperactivation and sensory overload are common presentations.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Magnesium also supports GABA activity (the brain&apos;s primary inhibitory
                neurotransmitter), which contributes to its calming and sleep-supporting properties. GABA
                dysregulation is implicated in anxiety and sleep problems commonly co-occurring with ADHD.
              </p>
              <EvidenceLegend highlightTier="moderate" className="mt-4" />
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence */}
            <div id="evidence">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence Summary
              </h2>
              <EvidenceSummaryCard
                title="Magnesium &amp; ADHD Symptoms"
                evidenceLevel="Moderate"
                humanEvidence="Several controlled trials show improvements in ADHD-related hyperactivity, emotional dysregulation, and sleep — particularly in children and adults with confirmed low magnesium status. Effects are most consistent in deficient populations; evidence in magnesium-replete individuals is weaker. Form comparison trials (glycinate vs citrate specifically for ADHD) are limited."
                mechanisticEvidence="NMDA receptor blockade by magnesium is well-established in preclinical literature. The connection to ADHD is biologically plausible: NMDA hyperactivation is proposed to contribute to impulsivity and executive dysfunction. GABA support via magnesium provides additional rationale for sleep and calming effects."
                safetyProfile="Well-tolerated at supplemental doses. Main risks: laxative effect (dose-dependent, stronger with citrate), hypotension at very high doses, contraindication in severe kidney disease. Avoid magnesium oxide — poor bioavailability and significant GI effects."
              />
            </div>

            <hr className="border-brand-900/10" />

            {/* Comparison Table */}
            <div id="comparison">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Glycinate vs Citrate: Side-by-Side
              </h2>
              <ResponsiveTable label="Magnesium glycinate vs citrate comparison for ADHD">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      {['Factor', 'Glycinate', 'Citrate'].map((h) => (
                        <th key={h} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    {[
                      ['Absorption', 'High — chelated form bypasses some GI barriers', 'Good — soluble salt, solid bioavailability'],
                      ['GI tolerance', 'Excellent — rarely causes loose stools', 'Moderate — laxative effect above ~200 mg elemental'],
                      ['Glycine co-factor', 'Yes — glycine adds mild calming + sleep support', 'No — citrate is neutral, no added CNS effect'],
                      ['Cost', '$$–$$$ — premium form', '$ — widely available, lower cost'],
                      ['Best for ADHD sleep', '★★★ First choice', '★★ Acceptable alternative'],
                      ['Best for ADHD calm focus', '★★★ First choice', '★★ Good if tolerated'],
                      ['Best for deficiency correction', '★★★', '★★★ (both equally effective)'],
                      ['Avoid at high doses?', 'No special concern', 'Yes — GI effects above 300 mg elemental/day'],
                    ].map(([factor, glycinate, citrate]) => (
                      <tr key={factor as string} className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">{factor}</td>
                        <td className="py-3 pr-4 text-muted">{glycinate}</td>
                        <td className="py-3 text-muted">{citrate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosage */}
            <div id="dosage">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosage Guide for ADHD
              </h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Magnesium Dosage Reference — ADHD Use
                </p>
                <ResponsiveTable label="Magnesium dosage for ADHD">
                  <table className="min-w-[520px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        {['Use Case', 'Form', 'Elemental Dose', 'Timing'].map((h) => (
                          <th key={h} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      {[
                        ['Sleep + calm support', 'Glycinate', '200–300 mg', '30–60 min before bed'],
                        ['General repletion', 'Glycinate or Citrate', '200–400 mg', 'Evening, with food'],
                        ['Budget option', 'Citrate', '150–250 mg', 'Evening — start low'],
                        ['Deficiency correction', 'Either', '200–400 mg', 'As directed by clinician'],
                      ].map(([use, form, dose, timing]) => (
                        <tr key={use as string} className="align-top">
                          <td className="py-3 pr-4 font-medium text-ink">{use}</td>
                          <td className="py-3 pr-4 text-muted">{form}</td>
                          <td className="py-3 pr-4 text-muted">{dose}</td>
                          <td className="py-3 text-muted">{timing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Check product labels for elemental magnesium content — the chelate weight shown on the
                  label is not the same as elemental magnesium. A product showing &ldquo;400 mg magnesium
                  glycinate&rdquo; typically provides 60–80 mg of elemental magnesium per tablet.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Products */}
            <div id="products">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Product Recommendations
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                These links reflect forms and dose ranges consistent with the evidence reviewed.
                Affiliate links support this site at no additional cost to you.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    eyebrow: 'Top Pick — Sleep & Calm',
                    name: 'Magnesium Glycinate 400mg',
                    desc: 'The most recommended form for ADHD-related sleep and calm support. Check the elemental magnesium per serving before purchasing.',
                    query: 'magnesium+glycinate+400mg+sleep',
                    cta: 'View Glycinate on Amazon →',
                  },
                  {
                    eyebrow: 'Budget Option',
                    name: 'Magnesium Citrate',
                    desc: 'Good absorption at lower cost. Best used at evening doses of 150–200 mg elemental to minimize GI effects.',
                    query: 'magnesium+citrate+supplement',
                    cta: 'View Citrate on Amazon →',
                  },
                  {
                    eyebrow: 'High-Absorption Premium',
                    name: 'Magnesium Bisglycinate (chelate)',
                    desc: 'Bisglycinate is another term for glycinate chelate — identical mechanism. Look for 200–400 mg elemental per serving.',
                    query: 'magnesium+bisglycinate+chelate',
                    cta: 'View Bisglycinate on Amazon →',
                  },
                  {
                    eyebrow: 'Avoid for ADHD',
                    name: 'Magnesium Oxide — Skip This',
                    desc: 'Very poor bioavailability (~4%). Almost entirely passes through the gut as a laxative. Not appropriate for ADHD use.',
                    query: 'magnesium+glycinate+adhd',
                    cta: 'See better options →',
                  },
                ].map(({ eyebrow, name, desc, query, cta }) => (
                  <div key={name} className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">{eyebrow}</p>
                    <p className="font-semibold text-ink">{name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
                    <a
                      href={`https://www.amazon.com/s?k=${query}&tag=${AFFILIATE_TAGS.amazon}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                    >
                      {cta}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Safety</h2>
              <SafetyNotice title="Safety Summary — Magnesium for ADHD">
                <ul className="ml-5 space-y-1.5 list-disc">
                  {[
                    ['Generally safe at supplemental doses', 'Magnesium from food and supplements at physiological amounts is well-tolerated in healthy adults and children.'],
                    ['Tolerable upper level: 350 mg/day supplemental', 'This limit applies to magnesium from supplements only. Dietary magnesium from food is not counted. Exceeding this level increases risk of adverse effects including diarrhea.'],
                    ['Kidney disease caution', 'Magnesium is renally cleared. Impaired kidney function can lead to magnesium accumulation. Do not supplement without clinician guidance if you have chronic kidney disease.'],
                    ['Drug interactions', 'Magnesium can reduce absorption of tetracycline and quinolone antibiotics, some bisphosphonates, and may interact with blood pressure medications. Take at least 2 hours apart from these drugs.'],
                    ['ADHD medications', 'No established interaction between supplemental magnesium and stimulant ADHD medications. Some practitioners use magnesium alongside methylphenidate to potentially reduce side effects — discuss with your prescribing clinician.'],
                    ['Avoid oxide form', 'Magnesium oxide is poorly absorbed and acts primarily as a laxative. It is not appropriate for ADHD-related supplementation goals.'],
                  ].map(([bold, text]) => (
                    <li key={bold as string}>
                      <strong>{bold as string}.</strong> {text as string}
                    </li>
                  ))}
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* FAQ */}
            <div id="faq">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <div key={i} className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4">
                    <h3 className="font-semibold text-ink">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Related */}
            <div id="related">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Related Articles</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['/guides/adhd/magnesium-for-adhd/', 'ADHD Cluster', 'Magnesium for ADHD', 'Evidence review, forms, sleep, and practical use.'],
                  ['/guides/adhd/best-supplements-for-adhd/', 'ADHD Cornerstone', 'Best Supplements for ADHD', 'Evidence-ranked guide covering all key ADHD supplements.'],
                  ['/guides/adhd/l-theanine-magnesium-adhd-stack', 'ADHD Cluster', 'L-Theanine + Magnesium Stack', 'How to combine L-theanine and magnesium for ADHD.'],
                  ['/guides/adhd/best-magnesium-supplement-for-adhd', 'Buying Guide', 'Best Magnesium Supplement for ADHD', 'Which product to buy first — form, dose, and practical guidance.'],
                  ['/guides/adhd/adhd-stack-guide', 'ADHD Cluster', 'ADHD Stack Guide', 'How to build a safe, evidence-based ADHD supplement stack.'],
                  ['/guides/adhd/l-theanine-for-adhd/', 'ADHD Cluster', 'L-Theanine for ADHD', 'Evidence on attention, sleep, and emotional regulation.'],
                  ['/guides/adhd/sleep-and-adhd', 'Sleep + ADHD', 'Sleep and ADHD', 'Why sleep issues are common in ADHD and how to address them.'],
                  ['/guides/focus', 'Goal Hub', 'Focus Goal Hub', 'Compare all focus supplements side by side.'],
                ].map(([href, eyebrow, label, desc]) => (
                  <Link key={href as string} href={href as string}
                    className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">{eyebrow}</p>
                    <p className="font-semibold text-ink transition group-hover:text-brand-700">{label}</p>
                    <p className="mt-1 text-xs text-muted">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

          </section>

          <EmailCapture
            headline="Get the ADHD supplement checklist"
            description="Evidence-first supplement updates, safety context, and ADHD research notes. No diagnosis or personal medical advice."
            ctaLabel="Get Checklist"
            location={`article-${SLUG}`}
          />

          <NewsletterCtaBlock
            title="Continue with the newsletter archive"
            description="Short notes built for cautious supplement decisions."
            location={`article-${SLUG}-newsletter`}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">In this article</p>
            <nav className="mt-3 space-y-1.5" aria-label="Article sections">
              {[
                ['#why-form-matters', 'Why Form Matters'],
                ['#mechanism', 'How Magnesium Works'],
                ['#evidence', 'Evidence Summary'],
                ['#comparison', 'Glycinate vs Citrate'],
                ['#dosage', 'Dosage Guide'],
                ['#products', 'Product Picks'],
                ['#safety', 'Safety'],
                ['#faq', 'FAQ'],
                ['#related', 'Related Articles'],
              ].map(([href, label]) => (
                <a key={href} href={href as string}
                  className="block text-sm text-brand-700 hover:text-brand-800 hover:underline">
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">ADHD cluster</p>
            <div className="mt-3 space-y-2">
              {[
                ['/guides/adhd/best-supplements-for-adhd/', 'Best supplements for ADHD →'],
                ['/guides/adhd/magnesium-for-adhd/', 'Magnesium for ADHD →'],
                ['/guides/adhd/l-theanine-for-adhd/', 'L-Theanine for ADHD →'],
                ['/guides/adhd/adhd-stack-guide', 'ADHD stack guide →'],
                ['/guides/adhd/sleep-and-adhd', 'Sleep and ADHD →'],
                ['/guides/focus', 'Focus goal hub →'],
              ].map(([href, label]) => (
                <Link key={href as string} href={href as string}
                  className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/guides/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
    </article>
  )
}
