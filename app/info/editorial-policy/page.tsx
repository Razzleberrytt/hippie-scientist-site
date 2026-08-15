import type { Metadata } from 'next'
import Link from 'next/link'
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
    rule: 'Requires a mature, direct human evidence base: replicated relevant human outcomes or a high-quality synthesis of relevant human trials, acceptable consistency, and no major directness problem that would make the public claim broader than the evidence.',
  },
  {
    grade: 'B',
    label: 'Moderate',
    rule: 'Meaningful direct human evidence exists, but replication, precision, duration, population breadth, consistency, formulation match, or study quality still limits confidence.',
  },
  {
    grade: 'C',
    label: 'Limited',
    rule: 'Human evidence is sparse, small, indirect, inconsistent, exploratory, or strongly dependent on a narrow preparation/population. Mechanistic or preclinical evidence may add plausibility but cannot promote a claim to B by itself.',
  },
  {
    grade: 'D',
    label: 'Preliminary',
    rule: 'Evidence is mainly mechanistic, animal, in-vitro, traditional, uncontrolled, or otherwise too indirect to support a practical efficacy conclusion. The page may remain useful as a research reference.',
  },
  {
    grade: 'Avoid / Insufficient',
    label: 'Do not infer benefit',
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
      <section className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">Public scientific standard</p>
        <h1 className="heading-premium mt-4">Editorial, evidence &amp; automation policy</h1>
        <p className="text-reading mt-4 max-w-3xl">
          This is the operational contract behind the research pages: what can raise confidence, what cannot,
          how conflicting evidence is handled, what automation is allowed to do, and which commercial
          incentives are forbidden from affecting scientific conclusions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/info/methodology/" className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900">
            Methodology overview
          </Link>
          <Link href="/info/corrections/" className="rounded-full border border-brand-900/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50">
            Corrections history
          </Link>
        </div>
      </section>

      <section aria-labelledby="grade-rules-title">
        <p className="eyebrow-label">Canonical grading rules</p>
        <h2 id="grade-rules-title" className="mt-2 text-3xl font-semibold tracking-tight text-ink">A / B / C / D / Avoid–Insufficient</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Grades describe confidence in a defined claim or profile conclusion. A strong grade cannot be created
          by citation volume, mechanistic plausibility, popularity, or commercial value alone.
        </p>
        <div className="mt-6 divide-y divide-brand-900/10 rounded-2xl border border-brand-900/10 bg-white">
          {gradeRules.map(item => (
            <article key={item.grade} className="grid gap-3 p-5 md:grid-cols-[150px_1fr]">
              <div>
                <span className="inline-flex rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">{item.grade}</span>
                <p className="mt-2 text-sm font-semibold text-ink">{item.label}</p>
              </div>
              <p className="text-sm leading-7 text-muted">{item.rule}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="standards-title">
        <p className="eyebrow-label">Inclusion, interpretation &amp; safety</p>
        <h2 id="standards-title" className="mt-2 text-3xl font-semibold tracking-tight text-ink">Rules that constrain the conclusion</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {standards.map(item => (
            <article key={item.title} className="card-premium p-6">
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 sm:p-8" aria-labelledby="automation-title">
        <p className="eyebrow-label">AI &amp; editorial automation</p>
        <h2 id="automation-title" className="mt-2 text-3xl font-semibold tracking-tight text-ink">Automation can transform evidence; it cannot manufacture authority</h2>
        <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
          {automationRules.map(rule => <li key={rule}>• {rule}</li>)}
        </ul>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="card-premium p-6">
          <p className="eyebrow-label">External review</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Reviewer claims are conditional on real review events</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            A page may display an external reviewer’s identity, qualifications, and review date only when a real,
            page-specific review event has been recorded. The site does not imply physician, pharmacist, dietitian,
            or other professional review where it did not occur.
          </p>
        </article>
        <article className="card-premium p-6">
          <p className="eyebrow-label">Funding &amp; independence</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Evidence rankings are not for sale</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Supplement companies cannot pay to raise or alter an evidence grade. Affiliate commissions cannot
            alter evidence grades, safety conclusions, source selection, or the scientific inclusion threshold.
            Product-quality scoring, when used, remains separate from efficacy evidence.
          </p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Why trust this page?</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">The standard is designed to be auditable</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          The useful question is not whether a page sounds confident; it is whether its claims can be traced to
          identifiable evidence, whether limitations remain visible, whether review dates represent actual review,
          and whether material corrections remain public. Those are the constraints this policy is designed to enforce.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/learn/citation-explorer/" className="text-brand-700 hover:underline">Citation Explorer →</Link>
          <Link href="/evidence/evidence-report/" className="text-brand-700 hover:underline">Evidence Report →</Link>
          <Link href="/info/affiliate-disclosure/" className="text-brand-700 hover:underline">Affiliate disclosure →</Link>
        </div>
      </section>
    </main>
  )
}
