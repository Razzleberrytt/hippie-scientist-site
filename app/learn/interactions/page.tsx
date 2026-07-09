import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import References from '@/components/References'

const TITLE = 'Psychoactive Interactions: A Conservative Safety Framework'
const DESCRIPTION =
  'Learn how to think about psychoactive interaction risk, pathway overlap, serotonergic stacking, sedative combinations, stimulant load, and evidence-informed safety checks.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/learn/interactions/',
  openGraphType: 'article',
})

const systems = [
  {
    href: '/learn/harm-reduction',
    title: 'Harm Reduction',
    body: 'A broader safety lens for dose caution, source uncertainty, set-and-setting awareness, and avoiding risky combinations.',
  },
  {
    href: '/learn/serotonergic-stacking-risks',
    title: 'Serotonergic Risks',
    body: 'A focused explainer for serotonin-pathway overlap, medication context, and why stacking requires extra caution.',
  },
  {
    href: '/learn/serotonin',
    title: 'Serotonin Pathway',
    body: 'Background on mood, perception, sleep, appetite, and serotonergic signaling without treating pathway activity as a simple benefit claim.',
  },
  {
    href: '/learn/gaba',
    title: 'GABA Pathway',
    body: 'Educational context for inhibitory signaling, sedation, calming tone, and why CNS depressant overlap matters.',
  },
]

const interactionPatterns = [
  {
    title: 'Same-pathway stacking',
    body: 'Several ingredients may point at the same receptor, transporter, enzyme, or downstream pathway. Similar mechanisms can make a stack less predictable even when each ingredient looks mild in isolation.',
  },
  {
    title: 'Opposing signals',
    body: 'A stimulating ingredient and a calming ingredient do not simply cancel each other out. Mixed signals can change heart rate, sleep architecture, perceived anxiety, focus, or next-day fatigue.',
  },
  {
    title: 'Metabolism bottlenecks',
    body: 'Some herbs and compounds may affect liver-enzyme or transporter systems. That matters most when a person is also using prescription medication, alcohol, or multiple supplements.',
  },
]

const redFlags = [
  'Combining multiple sedating products before sleep.',
  'Layering several stimulant or caffeine-like products for focus.',
  'Adding serotonergic products around antidepressants or mood medications.',
  'Using several liver-metabolized products at once without a clear reason.',
  'Taking a new stack when tired, dehydrated, sick, or unsure of the dose.',
]

const faqItems = [
  {
    question: 'What is a psychoactive interaction?',
    answer:
      'A psychoactive interaction is a change in effect or risk when two or more substances influence mood, arousal, sleep, perception, cognition, sedation, or related nervous-system pathways at the same time.',
  },
  {
    question: 'Why can natural products still interact?',
    answer:
      'Natural products can contain active compounds that influence receptors, enzymes, transporters, hormones, or blood-pressure systems. Natural origin does not remove interaction risk.',
  },
  {
    question: 'What is the safest way to compare a stack?',
    answer:
      'The conservative approach is to identify overlapping pathways, avoid adding multiple new ingredients at once, check medication context, and read the full safety profile before combining products.',
  },
]

const INTERACTIONS_REFS = [
  { n: 1, text: 'Boyer EW, Shannon M. (2005). Serotonin syndrome. N Engl J Med, 352(11): 1112-1120.', url: 'https://pubmed.ncbi.nlm.nih.gov/15784664/' },
  { n: 2, text: 'Izzo AA, et al. (2016). Interactions between herbal medicines and prescribed drugs. Drugs, 76: 1469-1490.', url: 'https://pubmed.ncbi.nlm.nih.gov/27412798/' },
]

export default function PsychoactiveInteractionsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url="https://thehippiescientist.net/learn/interactions"
        type="Article"
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Education', url: 'https://thehippiescientist.net/learn' },
          { name: 'Psychoactive Interactions', url: 'https://thehippiescientist.net/learn/interactions' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Interactions' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="eyebrow-label">Educational Safety Hub</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Psychoactive interactions: the safety layer before stacking.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          Psychoactive ingredients can overlap across mood, sedation, stimulation, sleep, cognition,
          blood pressure, and liver-metabolism pathways. This page gives readers a simple framework
          for spotting interaction risk before combining herbs, supplements, or compounds.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {['Pathway overlap', 'Medication context', 'Conservative stacking'].map((item) => (
            <div key={item} className="rounded-2xl border border-brand-900/10 bg-brand-50/70 p-4 text-sm font-bold text-brand-900">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {interactionPatterns.map((pattern) => (
          <article key={pattern.title} className="card-premium p-6">
            <p className="eyebrow-label">Interaction pattern</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{pattern.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{pattern.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-amber-900/15 bg-amber-50/80 p-6 text-amber-950 shadow-sm sm:p-8">
        <div className="max-w-3xl space-y-3">
          <p className="eyebrow-label">Fast safety screen</p>
          <h2 className="text-3xl font-semibold tracking-tight">Five interaction red flags to check first</h2>
          <p className="text-sm leading-7">
            These are not predictions that something bad will happen. They are conservative prompts for slowing down,
            checking the full profile, and avoiding a casual stack decision.
          </p>
        </div>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {redFlags.map((flag) => (
            <li key={flag} className="rounded-2xl border border-amber-900/10 bg-white/70 p-4 text-sm leading-6">
              {flag}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {systems.map((system) => (
          <Link
            key={system.href}
            href={system.href}
            className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Related safety system</p>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">{system.title}</h2>
              <p className="text-sm leading-7 text-muted">{system.body}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow-label">How to use this page</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Start with the interaction question, then read the full ingredient profile.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          A pathway match is not proof of benefit or harm. Use this framework to decide what to investigate next:
          which ingredients share mechanisms, which warnings deserve attention, and whether a simpler stack would
          be easier to evaluate. Then continue with the specific herb or compound profile before making decisions.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/learn/explorer/" className="chip-readable hover:bg-white transition">Open the pathway explorer</Link>
          <Link href="/learn/product-quality/" className="chip-readable hover:bg-white transition">Check product quality</Link>
          <Link href="/safety-checker/" className="chip-readable hover:bg-white transition">Use the safety checker</Link>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">FAQ</h2>
        <div className="mt-4 grid gap-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-bold text-ink">{item.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <References refs={INTERACTIONS_REFS} />
    </div>
  )
}
