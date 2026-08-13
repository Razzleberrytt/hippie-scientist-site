import type { Metadata } from 'next'
import Link from 'next/link'

import FAQAccordion from '@/components/FAQAccordion'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import { SITE_URL } from '@/src/lib/seo'
import { buildGuideHubSchemaGraph } from '@/src/lib/schema-graph'

import AlkaloidDirectory from './AlkaloidDirectory'
import {
  ALKALOID_DIRECTORY,
  COMMONLY_MISTAKEN_FOR_ALKALOIDS,
  PRODUCT_SCREENING_CRITERIA,
} from './alkaloids'

const PATH = '/guides/other/alkaloids-on-amazon/'
const TITLE = 'Alkaloid Supplements on Amazon: A Marketplace Safety Directory'
const DESCRIPTION =
  'A safety-first, non-exhaustive directory for evaluating alkaloid supplement labels discussed on Amazon and other online marketplaces—not a live inventory or product-endorsement page.'
const REVIEWED_ON = 'August 1, 2026'

const FAQS = [
  {
    question: 'What is an alkaloid?',
    answer:
      'Alkaloid is a broad chemistry term for naturally occurring nitrogen-containing compounds, many of which have meaningful biological activity. The category includes several chemical families, so sharing the label “alkaloid” does not mean two ingredients work alike or carry the same risk.',
  },
  {
    question: 'Is L-theanine an alkaloid?',
    answer:
      'No. L-theanine is a non-protein amino acid found in tea. It is often grouped with caffeine in supplement discussions, but caffeine is a methylxanthine alkaloid and L-theanine is not.',
  },
  {
    question: 'Is California poppy the same plant as opium poppy?',
    answer:
      'No. California poppy is Eschscholzia californica. Opium poppy is Papaver somniferum, the source of opium alkaloids such as morphine and codeine. A responsible California poppy label should state Eschscholzia californica and the plant part.',
  },
  {
    question: 'Are the ingredients on this page currently sold on Amazon?',
    answer:
      'This page does not verify or monitor current Amazon listings, prices, sellers, or availability. Marketplace inventory changes quickly. Every product would need a separate identity, label, testing, manufacturer, claims, and catalog review before it could be considered for a recommendation.',
  },
  {
    question: 'Does a higher-caution label mean an ingredient is illegal?',
    answer:
      'No. The label reflects evidence uncertainty, pharmacology, interaction potential, product variability, or reported harms; it is not a legal-status determination. Laws and marketplace policies vary by place and can change.',
  },
  {
    question: 'Can blue lotus or cat’s claw replace kratom or 7-OH during withdrawal?',
    answer:
      'There is no reliable human evidence supporting either as a kratom or 7-OH withdrawal treatment or substitute. This page provides no substitution protocol. People experiencing withdrawal or concerning symptoms should seek qualified medical or addiction care.',
  },
]

const REFERENCES = [
  {
    n: 1,
    label: 'PubChem. L-Theanine compound summary.',
    url: 'https://pubchem.ncbi.nlm.nih.gov/compound/L-Theanine',
  },
  {
    n: 2,
    label: 'U.S. Food and Drug Administration. FDA 101: Dietary Supplements.',
    url: 'https://www.fda.gov/consumers/consumer-updates/fda-101-dietary-supplements',
  },
  {
    n: 3,
    label: 'U.S. Food and Drug Administration. Dietary supplement current good manufacturing practices.',
    url: 'https://www.fda.gov/food/dietary-supplements-guidance-documents-regulatory-information/backgrounder-final-rule-current-good-manufacturing-practices-cgmps-dietary-supplements',
  },
  {
    n: 4,
    label: 'NIH Office of Dietary Supplements. Dietary Supplements for Weight Loss: Health Professional Fact Sheet.',
    url: 'https://ods.od.nih.gov/factsheets/WeightLoss-HealthProfessional/',
  },
  {
    n: 5,
    label: 'National Center for Complementary and Integrative Health. Bitter Orange: Usefulness and Safety.',
    url: 'https://www.nccih.nih.gov/health/bitter-orange',
  },
  {
    n: 6,
    label: 'National Center for Complementary and Integrative Health. Yohimbe: Usefulness and Safety.',
    url: 'https://www.nccih.nih.gov/health/yohimbe',
  },
  {
    n: 7,
    label: 'Wang J, et al. The effects of Huperzine A on dementia and mild cognitive impairment: an overview of systematic reviews. 2021.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33851462/',
  },
  {
    n: 8,
    label: 'Schimpf M, et al. Toxicity From Blue Lotus After Ingestion or Inhalation: A Case Series. Military Medicine. 2023.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34345890/',
  },
  {
    n: 9,
    label: 'European Medicines Agency. Eschscholziae herba (California poppy) assessment resources.',
    url: 'https://www.ema.europa.eu/en/medicines/herbal/eschscholziae-herba',
  },
  {
    n: 10,
    label: 'U.S. Drug Enforcement Administration. Opium fact sheet (Papaver somniferum).',
    url: 'https://www.dea.gov/factsheets/opium',
  },
  {
    n: 11,
    label: 'Eisenreich W, et al. Large variability in the alkaloid content of Corydalis yanhusuo dietary supplements. 2025.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39881869/',
  },
  {
    n: 12,
    label: 'National Center for Complementary and Integrative Health. Cat’s Claw: Usefulness and Safety.',
    url: 'https://www.nccih.nih.gov/health/cats-claw',
  },
  {
    n: 13,
    label: 'National Center for Complementary and Integrative Health. Diabetes and Dietary Supplements (berberine evidence and safety).',
    url: 'https://www.nccih.nih.gov/health/diabetes-and-dietary-supplements-what-you-need-to-know',
  },
  {
    n: 14,
    label: 'U.S. Food and Drug Administration. Avoiding Products Contaminated with Hidden Ingredients.',
    url: 'https://www.fda.gov/drugs/medication-health-fraud/avoiding-products-contaminated-hidden-ingredients',
  },
  {
    n: 15,
    label: 'U.S. Food and Drug Administration. Sexual Enhancement and Energy Product Notifications.',
    url: 'https://www.fda.gov/drugs/medication-health-fraud-notifications/sexual-enhancement-and-energy-product-notifications',
  },
  {
    n: 16,
    label: 'Wikoff D, et al. Systematic review of the potential adverse effects of caffeine consumption. Food and Chemical Toxicology. 2017.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28438661/',
  },
  {
    n: 17,
    label: 'European Food Safety Authority. Scientific opinion and consumer summary on the safety of caffeine.',
    url: 'https://www.efsa.europa.eu/en/topics/topic/caffeine',
  },
  {
    n: 18,
    label: 'Baggott MJ, et al. Psychopharmacology of theobromine in healthy volunteers. Psychopharmacology. 2013.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23420115/',
  },
]

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'article',
    images: ['/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function AlkaloidsOnAmazonPage() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: PATH,
    title: TITLE,
    description: DESCRIPTION,
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Topic Guides', url: `${SITE_URL}/guides/other/` },
      { name: 'Alkaloids on Amazon', url: `${SITE_URL}${PATH}` },
    ],
    itemListName: 'Naturally occurring alkaloid supplement categories',
    items: ALKALOID_DIRECTORY.map((entry) => ({
      name: entry.name,
      url: `${PATH}#${entry.id}`,
    })),
  })

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
      <SchemaGraphScript graph={schemaGraph} />
      <FaqJsonLd items={FAQS} />

      <nav className="mb-5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <Link href="/guides/other/" className="hover:text-ink">Topic guides</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Alkaloids on Amazon</span>
      </nav>

      <header className="relative overflow-hidden rounded-[2rem] border border-brand-900/12 bg-[linear-gradient(135deg,var(--surface-card),var(--surface-subtle))] p-6 shadow-sm sm:p-10 lg:p-12">
        <div aria-hidden="true" className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="relative max-w-4xl">
          <p className="eyebrow-label">Chemistry before commerce</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
            Alkaloid Supplements on Amazon
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
            A science-first directory for understanding naturally occurring alkaloids that appear in
            online supplement conversations—without pretending a marketplace listing proves identity,
            evidence, safety, or quality.
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <span><strong className="text-ink">Reviewed:</strong> {REVIEWED_ON}</span>
            <span>
              <strong className="text-ink">By:</strong>{' '}
              <Link href="/info/about/" className="font-semibold text-brand-800 hover:underline">Willie B. Randolph III</Link>
            </span>
            <Link href="/info/methodology/" className="font-semibold text-brand-800 hover:underline">Review methodology →</Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#directory"
              className="inline-flex min-h-11 items-center rounded-full bg-brand-800 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 dark:bg-brand-600 dark:text-[#07150c]"
            >
              Explore the directory
            </a>
            <a
              href="#screening-checklist"
              className="inline-flex min-h-11 items-center rounded-full border border-brand-900/15 bg-[var(--surface-card)] px-5 py-2.5 font-semibold text-ink transition hover:border-brand-700/35 hover:text-brand-800"
            >
              Use the screening checklist
            </a>
          </div>
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-7 text-amber-950 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="text-xs font-bold uppercase tracking-widest">Commerce status: research only</p>
        <p className="mt-2">
          This page has no affiliate links, merchant links, ranked products, prices, or verified
          availability claims. Amazon and other marketplace inventory is not monitored. Product recommendations remain intentionally inactive until a current
          catalog, label, testing, manufacturer, claims, disclosure, legal, privacy, and tracking review
          is complete.
        </p>
        <Link href="/info/affiliate-disclosure/" className="mt-2 inline-flex font-semibold underline decoration-current/30 underline-offset-4">
          Read the site’s affiliate and editorial policy
        </Link>
      </section>

      <section className="mt-6 rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5 sm:p-6">
        <p className="eyebrow-label">Scope and update policy</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Representative, not exhaustive</h2>
        <div className="mt-4 grid gap-5 text-sm leading-7 text-muted md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-ink">Included</h3>
            <p className="mt-1">Naturally occurring alkaloids or alkaloid-bearing botanicals commonly discussed in U.S. online supplement shopping, selected to illustrate evidence, identity, and safety differences.</p>
          </div>
          <div>
            <h3 className="font-semibold text-ink">Excluded</h3>
            <p className="mt-1">Prescription drugs, tobacco and nicotine products, controlled substances, synthetic “research chemicals,” and products whose main positioning is vaping, intoxication, or withdrawal substitution.</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted">Editorial evidence and regulatory sources are reviewed periodically. A marketplace claim would require a separate dated catalog review; absence from this page does not imply safety, legality, or availability.</p>
      </section>

      <section className="my-12 grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">1 · Identity</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">The name is not enough</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            “Poppy,” “lotus,” and “cat’s claw” can each hide a species problem. Start with the Latin
            binomial and plant part before considering evidence.
          </p>
        </article>
        <article className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">2 · Evidence</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Separate the evidence lanes</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Human outcomes, traditional use, receptor mechanisms, and animal studies answer different
            questions. This directory never treats them as interchangeable.
          </p>
        </article>
        <article className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">3 · Product</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">A listing is not verification</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            FDA does not approve dietary supplements for safety and effectiveness before sale. Labels,
            testing, claims, and manufacturers require their own review. [2, 3]
          </p>
        </article>
      </section>

      <aside className="mb-12 rounded-3xl border-2 border-rose-800/20 bg-rose-50/70 p-5 sm:p-7 dark:border-rose-400/25 dark:bg-rose-950/30">
        <p className="text-xs font-bold uppercase tracking-widest text-rose-800 dark:text-rose-200">
          Not a kratom or 7-OH withdrawal guide
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-rose-950 dark:text-rose-100">
          Curiosity is not evidence of a safe substitute
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-rose-950/85 dark:text-rose-100/85">
          Blue lotus and cat’s claw are sometimes discussed in communities where people are reducing or
          stopping kratom or concentrated 7-OH. Reliable human evidence does not support either as a
          withdrawal treatment or replacement, and this page offers no substitution instructions. If
          you are experiencing withdrawal or concerning symptoms, seek qualified medical or addiction
          care. Severe or rapidly worsening symptoms need urgent evaluation.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link href="/guides/other/kratom-7oh-withdrawal-management/" className="text-rose-900 underline underline-offset-4 dark:text-rose-200">
            Read the separate harm-reduction guide
          </Link>
          <Link href="/info/disclaimer/" className="text-rose-900 underline underline-offset-4 dark:text-rose-200">
            Health information disclaimer
          </Link>
        </div>
      </aside>

      <AlkaloidDirectory entries={ALKALOID_DIRECTORY} />

      <section id="screening-checklist" className="mt-16 scroll-mt-24">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Affiliate-readiness gate</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Product-screening criteria
          </h2>
          <p className="mt-3 text-base leading-8 text-muted">
            These are inclusion gates, not quality decorations. A future catalog entry should fail
            closed when identity, dose, testing, manufacturer, or positioning cannot be verified.
          </p>
        </div>
        <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCT_SCREENING_CRITERIA.map((criterion, index) => (
            <li key={criterion.title} className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5">
              <span className="text-xs font-bold text-brand-700">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-semibold text-ink">{criterion.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{criterion.detail}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm leading-7 text-muted">
          Also check FDA’s current health-fraud notifications, especially for sexual enhancement,
          weight loss, energy, pain, bodybuilding, and sleep products, where hidden ingredients are a
          documented concern. [14, 15]
        </p>
      </section>

      <section className="mt-16 rounded-3xl border border-sky-900/12 bg-sky-50/60 p-6 sm:p-8 dark:border-sky-400/20 dark:bg-sky-950/25">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-800 dark:text-sky-200">
          Taxonomy check
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-sky-950 dark:text-sky-100">
          Commonly mistaken for alkaloids
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-sky-950/80 dark:text-sky-100/80">
          Nitrogen-containing or “nootropic” does not automatically mean alkaloid. L-theanine is the
          most important correction for this shopping context. [1]
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {COMMONLY_MISTAKEN_FOR_ALKALOIDS.map((item) => (
            <article key={item.name} className="rounded-2xl border border-sky-900/10 bg-[var(--surface-card)] p-4">
              <h3 className="font-semibold text-ink">{item.name}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{item.classification}</p>
              {'href' in item ? (
                <Link href={item.href} className="mt-2 inline-flex text-sm font-semibold text-brand-800 hover:underline">
                  Read the compound profile →
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16" id="faq">
        <FAQAccordion faqs={FAQS} heading="Questions this directory should answer" />
      </section>

      <section id="references" aria-label="References" className="mt-12 rounded-3xl border border-brand-900/10 bg-[var(--surface-card)] p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-ink">References and regulatory sources</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          Primary research is used where available; federal and European public-health sources support
          taxonomy, regulation, and safety interpretation.
        </p>
        <ol className="mt-5 space-y-3 text-sm leading-6 text-muted">
          {REFERENCES.map((reference) => (
            <li key={reference.n} id={`ref-${reference.n}`} className="scroll-mt-24">
              <span className="font-semibold text-ink">[{reference.n}]</span>{' '}
              {reference.label}{' '}
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-800 underline decoration-brand-700/25 underline-offset-3 hover:decoration-brand-700"
              >
                View source
              </a>
            </li>
          ))}
        </ol>
      </section>

      <aside className="mt-12 rounded-2xl border border-brand-900/12 bg-brand-50/60 p-6 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
        <h2 className="font-display text-xl font-semibold text-ink">Continue with evidence, not a cart</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
          Use the full topic library for deeper safety, comparison, and supplement-label guides. This
          directory is educational and does not diagnose, treat, or recommend a product.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link href="/guides/other/" className="text-brand-800 hover:underline">Browse topic guides →</Link>
          <Link href="/info/methodology/" className="text-brand-800 hover:underline">How evidence is graded →</Link>
          <Link href="/safety-checker/" className="text-brand-800 hover:underline">Use the safety checker →</Link>
        </div>
      </aside>
    </div>
  )
}
