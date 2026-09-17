import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { SITE_URL } from '@/lib/navigation-config'
import { buildTwitterMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Substance Use, Dependence & Harm Reduction — Evidence Hub',
  description:
    'Evidence-based guides on dependence, withdrawal, overdose risk, kratom-derived opioids, tianeptine, novel psychoactive substances, and harm-reduction research.',
  alternates: { canonical: `${SITE_URL}/guides/substance-use/` },
  openGraph: {
    title: 'Substance Use, Dependence & Harm Reduction — Evidence Hub',
    description:
      'Research-first coverage of dependence, withdrawal, overdose risk, emerging opioids, kratom alkaloids, tianeptine, and harm reduction.',
    url: `${SITE_URL}/guides/substance-use/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Substance Use, Dependence & Harm Reduction — Evidence Hub',
    description:
      'Research-first coverage of dependence, withdrawal, overdose risk, emerging opioids, kratom alkaloids, tianeptine, and harm reduction.',
  }),
}

const START_HERE = [
  {
    href: '/articles/mitragynine/',
    title: 'Mitragynine',
    desc: 'The main kratom alkaloid: pharmacology, human data, metabolism, safety, and what evidence does and does not support.',
  },
  {
    href: '/articles/7-hydroxymitragynine/',
    title: '7-Hydroxymitragynine (7-OH)',
    desc: 'Opioid pharmacology, respiratory-depression evidence, dependence and withdrawal reports, and major evidence gaps.',
  },
  {
    href: '/articles/tianeptine-opioid-dependence-withdrawal-evidence-review/',
    title: 'Tianeptine',
    desc: 'Why an atypical antidepressant also behaves as a mu-opioid receptor agonist, with U.S. safety warnings and dependence evidence.',
  },
]

const KRATOM_CLUSTER = [
  {
    href: '/articles/dihydro-7-hydroxy-mitragynine-mgm-15/',
    title: 'MGM-15 / Dihydro-7-Hydroxymitragynine',
    desc: 'A potent semi-synthetic kratom-derived opioid with very limited human safety data.',
  },
  {
    href: '/articles/mitragynine-pseudoindoxyl/',
    title: 'Mitragynine Pseudoindoxyl',
    desc: 'A potent kratom metabolite/derivative with emerging human withdrawal case reports and major product-quality uncertainty.',
  },
  {
    href: '/articles/corynoxine-b-opioid-addiction-evidence-review/',
    title: 'Corynoxine B',
    desc: 'Conflicting opioid-receptor assays, newer human-MOR activity, and why receptor activity is not the same thing as proven addiction.',
  },
  {
    href: '/novel-psychoactive-substances/7-hydroxymitragynine-vs-mgm-15-vs-mitragynine-pseudoindoxyl/',
    title: '7-OH vs MGM-15 vs Mitragynine Pseudoindoxyl',
    desc: 'A side-by-side evidence and safety comparison of three kratom-derived opioids.',
  },
]

const DEPENDENCE = [
  {
    href: '/guides/other/kratom-7oh-withdrawal-management/',
    title: 'Kratom & 7-OH Withdrawal: Evidence and Clinical Context',
    desc: 'What is known about tolerance, dependence, withdrawal, and when medical assessment matters.',
  },
  {
    href: '/novel-psychoactive-substances/harm-reduction-considerations-for-kratom-derived-semi-synthetic-opioids/',
    title: 'Harm Reduction for Kratom-Derived Semi-Synthetic Opioids',
    desc: 'Product uncertainty, potency escalation, co-use risk, and evidence limitations without normalizing unsafe use.',
  },
  {
    href: '/learn/harm-reduction/',
    title: 'Harm Reduction Foundations',
    desc: 'General risk-reduction principles, uncertainty, and why product identity and co-exposures matter.',
  },
]

const NOVEL = [
  {
    href: '/novel-psychoactive-substances/',
    title: 'Novel Psychoactive Substances',
    desc: 'The broader research collection for emerging compounds with limited or rapidly changing human evidence.',
  },
  {
    href: '/novel-psychoactive-substances/kratom-derived-semi-synthetic-opioids/',
    title: 'Kratom-Derived Semi-Synthetic Opioids',
    desc: 'What is actually changing in concentrated and semi-synthetic kratom markets.',
  },
  {
    href: '/novel-psychoactive-substances/the-rise-of-novel-psychoactive-substances-in-2026/',
    title: 'The Rise of Novel Psychoactive Substances in 2026',
    desc: 'A high-level map of the fast-moving NPS landscape and why evidence often lags the market.',
  },
]

function Card({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card-premium group flex h-full flex-col p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
      <span className="mt-auto pt-4 text-sm font-semibold text-brand-700 group-hover:underline">Read evidence →</span>
    </Link>
  )
}

export default function SubstanceUseHub() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-24 pt-6 sm:px-6">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: '/guides/', label: 'Evidence Library' },
          { label: 'Substance Use & Harm Reduction' },
        ]}
      />

      <header className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
        <p className="eyebrow-label">Substance use · dependence · withdrawal · harm reduction</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Substance Use, Dependence & Harm Reduction
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          A research-first section for compounds that sit at the intersection of pharmacology, dependence, withdrawal,
          overdose risk, product uncertainty, and emerging drug markets. The goal is to separate established human evidence
          from receptor assays, case reports, marketing claims, and speculation.
        </p>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-amber-950">
          <strong>Safety note:</strong> this section is educational, not a detox protocol. Severe sedation, trouble breathing,
          loss of consciousness, seizures, chest pain, or rapidly worsening symptoms require urgent medical evaluation.
          Dependence and withdrawal questions are safest to handle with qualified medical or addiction-treatment support.
        </div>
      </header>

      <section className="space-y-4">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Start here</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">The highest-signal evidence pages</h2>
          <p className="mt-3 text-muted">
            These pages have the strongest combination of human relevance, current reader demand, and direct dependence or opioid-pharmacology questions.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {START_HERE.map((item) => <Card key={item.href} {...item} />)}
        </div>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Kratom-derived opioid cluster</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Mitragynine, 7-OH, MGM-15 and related compounds</h2>
          <p className="mt-3 text-muted">
            This cluster deliberately separates whole-leaf kratom, naturally occurring alkaloids, metabolites, concentrates,
            and semi-synthetic derivatives instead of treating them as one exposure.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {KRATOM_CLUSTER.map((item) => <Card key={item.href} {...item} />)}
        </div>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Dependence, withdrawal & risk reduction</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Clinical questions need a different evidence standard</h2>
          <p className="mt-3 text-muted">
            Receptor potency does not tell you how withdrawal will unfold in a person. These resources prioritize human reports,
            clinical guidance, poison-center data, product uncertainty, and the limits of self-directed management.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {DEPENDENCE.map((item) => <Card key={item.href} {...item} />)}
        </div>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Research frontier</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Novel and poorly characterized substances</h2>
          <p className="mt-3 text-muted">
            These pages are most useful when the market is moving faster than the clinical literature. A thin evidence base is shown as a limitation, not filled with confident guesses.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {NOVEL.map((item) => <Card key={item.href} {...item} />)}
        </div>
      </section>

      <section className="section-frame p-6 sm:p-8">
        <p className="eyebrow-label">How to read this section</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Keep four questions separate</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Pharmacology', 'What receptors or pathways does the compound affect, and at what concentration?'],
            ['Exposure', 'Do real human doses and blood levels reach the range implied by laboratory assays?'],
            ['Dependence', 'Are tolerance, withdrawal, compulsive use, or loss of control documented in humans?'],
            ['Treatment', 'Is there actual clinical evidence for managing toxicity or withdrawal, rather than an anecdote repeated as a protocol?'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-brand-900/10 bg-white p-4">
              <p className="font-semibold text-ink">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
