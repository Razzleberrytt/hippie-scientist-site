import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { SITE_URL } from '@/lib/navigation-config'
import {
  breadcrumbJsonLd,
  buildTwitterMetadata,
  canonicalUrl,
  collectionPageJsonLd,
  itemListJsonLd,
} from '@/lib/seo'

const HUB_PATH = '/guides/substance-use'
const HUB_TITLE = 'Substance Use, Withdrawal & Recovery — Evidence Hub'
const HUB_DESCRIPTION =
  'Evidence-based guides on dependence, withdrawal, recovery, overdose risk, alcohol, opioids, kratom-derived opioids, research chemicals, novel psychoactive substances, tianeptine, and harm-reduction research.'
const REVIEW_DATE = '2026-10-03'

export const metadata: Metadata = {
  title: HUB_TITLE,
  description: HUB_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${HUB_PATH}/` },
  openGraph: {
    title: HUB_TITLE,
    description:
      'Research-first coverage of dependence, withdrawal, recovery, overdose risk, emerging opioids, kratom alkaloids, tianeptine, and harm reduction.',
    url: `${SITE_URL}${HUB_PATH}/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: HUB_TITLE,
    description:
      'Research-first coverage of dependence, withdrawal, recovery, alcohol, opioids, emerging substances, research chemicals, and harm reduction.',
  }),
}

const START_HERE = [
  {
    href: '/articles/alcohol-withdrawal-recovery-guide/',
    title: 'Alcohol Withdrawal & Recovery: Complete Evidence Guide',
    desc: 'Life-threatening withdrawal risk, timelines, seizures, delirium, kindling, CIWA-Ar/PAWSS, benzodiazepines, phenobarbital, thiamine, and long-term AUD recovery.',
  },
  {
    href: '/articles/opioid-withdrawal-recovery-guide/',
    title: 'Opioid Withdrawal & Recovery: Complete Evidence Guide',
    desc: 'Shared withdrawal biology, major opioid differences, fentanyl-era complications, acute treatment, post-acute recovery, overdose risk, and evidence-based long-term care.',
  },
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
    href: '/articles/3-dehydromitragynine/',
    title: '3-Dehydromitragynine',
    desc: 'Oxidative metabolism and mouse toxicity, with human exposure and clinical attribution unresolved.',
  },
  {
    href: '/articles/speciociliatine/',
    title: 'Speciociliatine',
    desc: 'Mixed-kratom human exposure, conflicting receptor assays, and laboratory metabolism.',
  },
  {
    href: '/articles/speciogynine/',
    title: 'Speciogynine',
    desc: 'Preclinical serotonin findings and human exposure data, without established mood-treatment evidence.',
  },
  {
    href: '/articles/mitraciliatine/',
    title: 'Mitraciliatine',
    desc: 'Mixed opioid-receptor activity, species differences, and unresolved clinical safety.',
  },
  {
    href: '/articles/dihydro-7-hydroxy-mitragynine-mgm-15/',
    title: 'MGM-15 / Dihydro-7-Hydroxymitragynine',
    desc: 'A potent semi-synthetic kratom-derived opioid with very limited human safety data.',
  },
  {
    href: '/articles/mgm-16/',
    title: 'MGM-16',
    desc: 'A fluorinated 7-OH/MGM-15 derivative with potent preclinical opioid activity, no established human dose, and current federal Schedule I status.',
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

const EMERGING = [
  {
    href: '/articles/2c-b-effects/',
    title: '2C-B: Human Evidence, Risks & Pharmacology',
    desc: 'Controlled human studies, toxicology, product-identity uncertainty, and severe-case evidence without dosing or use-optimization instructions.',
  },
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

const RESEARCH_CHEMICALS = [
  {
    href: '/articles/research-chemicals-nps-guide/',
    title: 'Research Chemicals & NPS Evidence Map',
    desc: 'Start here for designer benzos, cathinones, dissociatives, psychedelics, nitazenes, synthetic cannabinoids, and benzofuran entactogens.',
  },
  {
    href: '/articles/designer-benzodiazepines-research-chemicals/',
    title: 'Designer Benzodiazepines',
    desc: 'Bromazolam, clonazolam, flualprazolam and related RC benzos: counterfeit pills, blackouts, dependence, withdrawal, and toxicology.',
  },
  {
    href: '/articles/synthetic-cathinones-rc-stimulants/',
    title: 'Synthetic Cathinones & RC Stimulants',
    desc: 'NEP, alpha-PiHP, MDPHP and related stimulants: cardiovascular toxicity, psychosis, seizures, and compulsive-use risk.',
  },
  {
    href: '/articles/non-cathinone-rc-stimulants/',
    title: 'Other RC Stimulants',
    desc: '4F-MPH, 3-FPM and related non-cathinone stimulants, with clinical poisonings kept separate from online “functional stimulant” claims.',
  },
  {
    href: '/articles/rc-dissociatives-ketamine-pcp-analogues/',
    title: 'RC Dissociatives',
    desc: '2F-DCK, DCK, O-PCE, FXE, DMXE and PCP/PCE analogues, separated by the strength of their actual human evidence.',
  },
  {
    href: '/articles/rc-psychedelics-tryptamines-lysergamides/',
    title: 'RC Psychedelics',
    desc: '1P-LSD, 4-AcO-DMT, 5-MeO-MiPT and other lysergamides/tryptamines, with human evidence kept separate from assumptions.',
  },
  {
    href: '/articles/nitazene-opioids/',
    title: 'Nitazene Opioids',
    desc: 'Isotonitazene, protonitazene, metonitazene and related high-potency synthetic opioids, overdose risk, naloxone, and testing gaps.',
  },
  {
    href: '/articles/designer-synthetic-opioids-beyond-nitazenes/',
    title: 'Designer Opioids Beyond Nitazenes',
    desc: 'U-47700, brorphine and AP-237/AP-238 analogues: respiratory depression, fatal casework, counterfeit products, naloxone and testing gaps.',
  },
  {
    href: '/articles/synthetic-cannabinoids-spice/',
    title: 'Synthetic Cannabinoids / Spice',
    desc: 'Modern high-potency SCRAs such as MDMB-4en-PINACA and ADB-BUTINACA, including seizures, coma, psychosis, and hidden exposure.',
  },
  {
    href: '/articles/benzofurans-entactogens/',
    title: 'Benzofurans & RC Entactogens',
    desc: '6-APB, 5-APB, 5-MAPB and related serotonergic stimulants, with toxicity and product-identity limits.',
  },
  {
    href: '/articles/cats-claw-kava-hidden-opioids/',
    title: 'Cat’s Claw & Kava Products With Hidden Opioids',
    desc: 'Official testing and poison-center warnings around Buzzers, Homiez, MGM-15, mitragynine pseudoindoxyl, and misleading botanical labels.',
  },
  {
    href: '/articles/novel-sedatives-qualone-analogues/',
    title: 'Novel Sedatives & Quaalude Analogues',
    desc: 'Dicloqualone, 2-methoxyqualone and other non-benzo depressants where market availability has outrun human safety data.',
  },
  {
    href: '/articles/orphine-opioids/',
    title: 'Orphine Opioids',
    desc: 'Cychlorphine, chlorphine, spirochlorphine and the newer synthetic-opioid family emerging after the nitazene wave.',
  },
]

const HUB_ITEMS = [...START_HERE, ...KRATOM_CLUSTER, ...DEPENDENCE, ...RESEARCH_CHEMICALS, ...EMERGING]

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
  const hubUrl = canonicalUrl(HUB_PATH)
  const breadcrumbId = `${hubUrl}#breadcrumb`
  const itemListId = `${hubUrl}#evidence-list`
  const collectionId = `${hubUrl}#collection`
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Evidence Library', url: canonicalUrl('/guides') },
    { name: 'Substance Use, Withdrawal & Recovery', url: hubUrl },
  ], { id: breadcrumbId })
  const itemListLd = itemListJsonLd({
    id: itemListId,
    name: 'Substance Use, Withdrawal & Recovery Evidence Resources',
    path: HUB_PATH,
    items: HUB_ITEMS.map((item) => ({ name: item.title, url: item.href })),
  })
  const collectionLd = {
    ...collectionPageJsonLd({
      title: HUB_TITLE,
      description: HUB_DESCRIPTION,
      path: HUB_PATH,
      itemListId,
      breadcrumbId,
    }),
    '@id': collectionId,
    inLanguage: 'en-US',
    dateModified: REVIEW_DATE,
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-24 pt-6 sm:px-6">
      <JsonLd schema={collectionLd} />
      <JsonLd schema={itemListLd} />
      <JsonLd schema={breadcrumbLd} />

      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: '/guides/', label: 'Evidence Library' },
          { label: 'Substance Use, Withdrawal & Recovery' },
        ]}
      />

      <header className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
        <p className="eyebrow-label">Substance use · dependence · withdrawal · recovery · harm reduction</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Substance Use, Withdrawal & Recovery
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          A research-first section for compounds that sit at the intersection of pharmacology, dependence, withdrawal,
          recovery, overdose risk, product uncertainty, and emerging drug markets. The goal is to separate established human evidence
          from receptor assays, case reports, marketing claims, and speculation.
        </p>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-amber-950">
          <strong>Safety note:</strong> this section is educational, not a detox protocol. Severe sedation, trouble breathing,
          loss of consciousness, seizures, delirium/confusion, chest pain, or rapidly worsening symptoms require urgent medical evaluation.
          Dependence and withdrawal questions are safest to handle with qualified medical or addiction-treatment support.
        </div>
      </header>

      <section className="space-y-4">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Start here</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">The highest-signal evidence pages</h2>
          <p className="mt-3 text-muted">
            These pages have the strongest combination of human relevance, current reader demand, and direct dependence, withdrawal, recovery, or high-risk pharmacology questions.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {START_HERE.map((item) => <Card key={item.href} {...item} />)}
        </div>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Kratom-derived opioid cluster</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Mitragynine, 7-OH, MGM-15, MGM-16 and related compounds</h2>
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
          <p className="eyebrow-label">Research chemicals & NPS</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Know the class before trusting the label</h2>
          <p className="mt-3 text-muted">
            These pages organize rapidly changing research-chemical markets by pharmacology and verified toxicology. Reddit and forum reports are used as discovery signals, while claims about identity, toxicity, and deaths are grounded in analytical, clinical, forensic, poison-center, and regulatory evidence.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {RESEARCH_CHEMICALS.map((item) => <Card key={item.href} {...item} />)}
        </div>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Research frontier</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Psychedelics, novel and poorly characterized substances</h2>
          <p className="mt-3 text-muted">
            This collection separates compounds with controlled human evidence, such as 2C-B, from substances whose markets are moving faster than the clinical literature. Thin evidence is shown as a limitation rather than filled with confident guesses.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {EMERGING.map((item) => <Card key={item.href} {...item} />)}
        </div>
      </section>

      <section className="section-frame p-6 sm:p-8">
        <p className="eyebrow-label">How to read this section</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Keep four questions separate</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Pharmacology', 'What receptors or pathways does the compound affect, and at what concentration?'],
            ['Exposure', 'Do real human exposures and blood levels reach the range implied by laboratory assays?'],
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
