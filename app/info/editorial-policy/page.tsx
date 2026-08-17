import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Editorial, Evidence & Automation Policy',
  description: 'Exact evidence grading, source inclusion, conflict resolution, branded-extract, safety, dosing, affiliate, AI automation, review, and correction standards used by The Hippie Scientist.',
  path: '/info/editorial-policy/',
  openGraphType: 'article',
})

const gradeRules = [
  {
    grade: 'A',
    label: 'Strong',
    tone: 'border-emerald-700/20 bg-emerald-50 text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100',
    rule: 'Requires a mature, direct human evidence base: replicated relevant human outcomes or a high-quality synthesis of relevant human trials, acceptable consistency, and no major directness problem that would make the public claim broader than the evidence.',
  },
  {
    grade: 'B',
    label: 'Moderate',
    tone: 'border-blue-700/20 bg-blue-50 text-blue-800 dark:border-blue-300/20 dark:bg-blue-300/10 dark:text-blue-100',
    rule: 'Meaningful direct human evidence exists, but replication, precision, duration, population breadth, consistency, formulation match, or study quality still limits confidence.',
  },
  {
    grade: 'C',
    label: 'Limited',
    tone: 'border-amber-700/20 bg-amber-50 text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100',
    rule: 'Human evidence is sparse, small, indirect, inconsistent, exploratory, or strongly dependent on a narrow preparation/population. Mechanistic or preclinical evidence may add plausibility but cannot promote a claim to B by itself.',
  },
  {
    grade: 'D',
    label: 'Preliminary',
    tone: 'border-stone-600/20 bg-stone-100 text-stone-800 dark:border-stone-300/20 dark:bg-stone-300/10 dark:text-stone-200',
    rule: 'Evidence is mainly mechanistic, animal, in-vitro, traditional, uncontrolled, or otherwise too indirect to support a practical efficacy conclusion. The page may remain useful as a research reference.',
  },
  {
    grade: 'Avoid / Insufficient',
    label: 'Do not infer benefit',
    tone: 'border-slate-500/20 bg-slate-50 text-slate-700 dark:border-slate-300/20 dark:bg-slate-300/10 dark:text-slate-200',
    rule: 'Evidence is absent, materially unfavorable, too unreliable to support the claim, or the practical framing is limited by a safety context that makes casual recommendation inappropriate. Safety certainty and efficacy certainty remain separate fields.',
  },
]

const standards = [
  {
    title: 'Evidence inclusion',
    body: 'Include sources that actually test or materially inform the ingredient, preparation, outcome, population, safety question, interaction, or mechanism being discussed. Primary human studies are preferred for efficacy claims; high-quality systematic reviews and meta-analyses can summarize a body of evidence.',
  },
  {
    title: 'Evidence exclusion',
    body: 'Do not count a paper toward a claim when it studies a different ingredient without a defensible bridge, only mentions the ingredient in background text, is duplicate reporting of the same study population, or cannot be identified well enough to audit. Retracted or invalidated work should not support a current conclusion.',
  },
  {
    title: 'Conflicting studies',
    body: 'Do not average disagreement into a falsely smooth conclusion. Separate supporting, mixed, null, and contradicting evidence, then inspect study quality, preparation, dose, population, duration, outcome definition, and risk of bias. Strong wording is reduced when material disagreement remains unresolved.',
  },
  {
    title: 'Animal and mechanistic evidence',
    body: 'Animal, cell, receptor, pathway, and biochemical evidence can explain plausibility or generate hypotheses. It does not establish a human benefit, an effective consumer dose, or clinical equivalence. Mechanism and outcome labels remain visibly separate.',
  },
  {
    title: 'Branded extracts and specific forms',
    body: 'Evidence from a specific branded extract, standardized preparation, plant part, salt, chelate, delivery system, or formulation is labeled as such. Findings are not generalized to every product sharing the ingredient name unless the evidence supports that generalization.',
  },
  {
    title: 'Safety evidence',
    body: 'Safety is evaluated independently from efficacy. Contraindications, adverse events, pregnancy/lactation concerns, organ-specific cautions, dependence potential, dose-related toxicity, and high-risk populations require source-backed treatment appropriate to the seriousness of the risk.',
  },
  {
    title: 'Interaction evidence',
    body: 'Documented clinical interactions, pharmacokinetic interactions, pharmacodynamic additive risks, case evidence, and theoretical mechanisms are not presented as equivalent. Missing interaction data means “no documented interaction in our dataset,” not “safe.”',
  },
  {
    title: 'Dose selection',
    body: 'Studied doses are reported as research context, not automatically as medical dosing advice. Preparation, extract standardization, elemental amount, route, population, and duration must match the statement. “No standardized medical dose” is distinct from “doses studied in trials.”',
  },
  {
    title: 'Affiliate selection',
    body: 'Commercial eligibility comes after evidence and safety evaluation. Product-quality criteria may consider formulation match, label clarity, clinically studied form, third-party testing, and reliability, but affiliate payout cannot change an evidence grade, safety flag, or scientific conclusion.',
  },
]

const automationRules = [
  'Structured workbook/database fields are transformed into pages, tables, relationships, indexes, and quality reports by code. That transformation is automation, not scientific judgment.',
  'Automated systems may normalize terminology, retrieve citation metadata, detect contradictions, calculate completeness, flag suspicious claims, and prepare review queues.',
  'Automation must not silently promote an evidence grade, invent reviewer credentials, create a medical-review claim, or turn missing safety information into reassurance.',
  'Material scientific conclusions should remain traceable to structured claims and sources. Changes that could alter a reader’s interpretation belong in review/correction provenance.',
  'AI-assisted drafting or extraction is treated as an intermediate process. Public claims remain subject to source, evidence-language, safety, and production-content validation.',
]

export default function EditorialPolicyPage() {
  return (
    <main className="container-page mx-auto max-w-5xl space-y-12 py-10">
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info/' },
          { label: 'Editorial Policy' },
        ]}
      />

      <section className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">Public scientific standard</p>
        <h1 className="heading-premium mt-5">Editorial, evidence &amp; automation policy</h1>
        <p className="text-reading mt-4 max-w-3xl">
          This is the operational contract behind the research pages: what can raise confidence, what cannot,
          how conflicting evidence is handled, what automation is allowed to do, and which commercial
          incentives are forbidden from affecting scientific conclusions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/info/methodology/" className="button-primary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-bold">
            Methodology overview
          </Link>
          <Link href="/info/corrections/" className="button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold">
            Corrections history
          </Link>
        </div>
      </section>

      <section aria-labelledby="grade-rules-title">
        <p className="eyebrow-label">Canonical grading rules</p>
        <h2 id="grade-rules-title" className="compact-heading mt-3">A / B / C / D / Avoid–Insufficient</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]">
          Grades describe confidence in a defined claim or profile conclusion. A strong grade cannot be created
          by citation volume, mechanistic plausibility, popularity, or commercial value alone.
        </p>
        <div className="section-frame mt-6 overflow-hidden p-0">
          {gradeRules.map((item, index) => (
            <article key={item.grade} className={`grid gap-3 p-5 md:grid-cols-[150px_1fr] ${index > 0 ? 'border-t border-[color:var(--hs-hairline)]' : ''}`}>
              <div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${item.tone}`}>{item.grade}</span>
                <p className="mt-2 text-sm font-semibold text-[color:var(--hs-ink)]">{item.label}</p>
              </div>
              <p className="text-sm leading-7 text-[color:var(--hs-body)]">{item.rule}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="standards-title">
        <p className="eyebrow-label">Inclusion, interpretation &amp; safety</p>
        <h2 id="standards-title" className="compact-heading mt-3">Rules that constrain the conclusion</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {standards.map(item => (
            <article key={item.title} className="card-premium p-6">
              <h3 className="text-lg font-semibold text-[color:var(--hs-ink)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-frame p-6 sm:p-8" aria-labelledby="automation-title">
        <p className="eyebrow-label">AI &amp; editorial automation</p>
        <h2 id="automation-title" className="compact-heading mt-3">Automation can transform evidence; it cannot manufacture authority</h2>
        <ul className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--hs-body)]">
          {automationRules.map(rule => <li key={rule}>• {rule}</li>)}
        </ul>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="card-premium p-6">
          <p className="eyebrow-label">External review</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--hs-ink)]">Reviewer claims are conditional on real review events</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)]">
            A page may display an external reviewer’s identity, qualifications, and review date only when a real,
            page-specific review event has been recorded. The site does not imply physician, pharmacist, dietitian,
            or other professional review where it did not occur.
          </p>
        </article>
        <article className="card-premium p-6">
          <p className="eyebrow-label">Funding &amp; independence</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--hs-ink)]">Evidence rankings are not for sale</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)]">
            Supplement companies cannot pay to raise or alter an evidence grade. Affiliate commissions cannot
            alter evidence grades, safety conclusions, source selection, or the scientific inclusion threshold.
            Product-quality scoring, when used, remains separate from efficacy evidence.
          </p>
        </article>
      </section>

      <section className="section-frame p-6 sm:p-8">
        <p className="eyebrow-label">Why trust this page?</p>
        <h2 className="compact-heading mt-3">The standard is designed to be auditable</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]">
          The useful question is not whether a page sounds confident; it is whether its claims can be traced to
          identifiable evidence, whether limitations remain visible, whether review dates represent actual review,
          and whether material corrections remain public. Those are the constraints this policy is designed to enforce.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/learn/citation-explorer/" className="text-[color:var(--hs-gold-ink)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2">Citation Explorer →</Link>
          <Link href="/evidence/evidence-report/" className="text-[color:var(--hs-gold-ink)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2">Evidence Report →</Link>
          <Link href="/info/affiliate-disclosure/" className="text-[color:var(--hs-gold-ink)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2">Affiliate disclosure →</Link>
        </div>
      </section>
    </main>
  )
}