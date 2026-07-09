import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import EfficacyModelerClient from '../../../src/components/education/EfficacyModelerClient'
import References from '@/components/References'
import { buildPageMetadata } from '../../../src/lib/seo'

const TITLE = 'Supplement Efficacy Modeler: Onset, Peak, Half-Life, and Build-Up'
const DESCRIPTION =
  'Use the supplement efficacy modeler to understand onset timing, peak effect windows, half-life clearance, build-up curves, and why pharmacokinetics are only one part of evidence quality.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/learn/efficacy-model/',
  openGraphType: 'article',
})

const modelConcepts = [
  {
    title: 'Onset is not the same as benefit',
    body: 'Onset describes when a compound may begin reaching meaningful exposure. It does not prove that the person will feel a reliable outcome or that the effect is clinically important.',
  },
  {
    title: 'Peak timing helps with expectations',
    body: 'Peak windows can help explain why some ingredients feel fast, delayed, or inconsistent depending on food, dose form, sleep debt, caffeine, and baseline stress.',
  },
  {
    title: 'Half-life shapes carryover',
    body: 'Clearance time matters for next-day grogginess, repeated dosing, steady-state build-up, and whether a stack becomes harder to interpret over time.',
  },
]

const workflowSteps = [
  'Start with the evidence profile, not the curve.',
  'Check whether the studied dose resembles the product dose.',
  'Use the modeler to estimate timing and accumulation patterns.',
  'Compare safety warnings before combining ingredients.',
  'Treat the output as educational, not as personalized dosing advice.',
]

const faqItems = [
  {
    question: 'What does the efficacy modeler show?',
    answer:
      'It visualizes simplified timing concepts such as onset, peak action windows, clearance half-life, and possible build-up patterns. It is a teaching tool, not a personalized prediction engine.',
  },
  {
    question: 'Can pharmacokinetics prove a supplement works?',
    answer:
      'No. Pharmacokinetics can explain timing and exposure, but efficacy depends on human outcome data, dose realism, population fit, safety context, and effect size.',
  },
  {
    question: 'Why does half-life matter for supplements?',
    answer:
      'Half-life can influence whether effects wear off quickly, carry into the next day, or accumulate with repeated use. It also helps explain why some stacks become harder to interpret over time.',
  },
]

const EFFICACY_MODEL_REFS = [
  { n: 1, text: 'Burns PB, et al. (2011). Levels of evidence. Plast Reconstr Surg, 128(1): 305-310.', url: 'https://pubmed.ncbi.nlm.nih.gov/21701348/' },
  { n: 2, text: 'Toutain PL, Bousquet-Melou A. (2004). Plasma terminal half-life. J Vet Pharmacol Ther, 27(6): 427-439.', url: 'https://pubmed.ncbi.nlm.nih.gov/15601438/' },
]

export default function EfficacyModelPage() {
  return (
    <div className='container-page py-10 space-y-12'>
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url='https://thehippiescientist.net/learn/efficacy-model'
        type='Article'
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Education', url: 'https://thehippiescientist.net/learn' },
          { name: 'Efficacy Modeler', url: 'https://thehippiescientist.net/learn/efficacy-model' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Efficacy Modeler' },
        ]}
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Decision Support Tools</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl'>
          Supplement efficacy modeler: timing is only one layer of evidence.
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          This modeler helps readers understand onset, peak windows, clearance, and build-up patterns.
          The goal is not to promise an effect. The goal is to make timing, dose realism, and safety
          context easier to discuss before comparing herbs or compounds.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/learn/product-quality/' className='chip-readable hover:bg-white transition'>Product-quality checklist</Link>
          <Link href='/learn/interactions/' className='chip-readable hover:bg-white transition'>Interaction framework</Link>
          <Link href='/learn/explorer/' className='chip-readable hover:bg-white transition'>Pathway explorer</Link>
        </div>
      </section>

      <section className='grid gap-5 lg:grid-cols-3'>
        {modelConcepts.map((concept) => (
          <article key={concept.title} className='card-premium p-6'>
            <p className='eyebrow-label'>Model concept</p>
            <h2 className='mt-2 text-2xl font-semibold tracking-tight text-ink'>{concept.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{concept.body}</p>
          </article>
        ))}
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8'>
        <div className='max-w-3xl space-y-3'>
          <p className='eyebrow-label'>Evidence workflow</p>
          <h2 className='text-3xl font-semibold tracking-tight text-ink'>How to use the model without over-reading it</h2>
          <p className='text-sm leading-7 text-muted'>
            A smooth curve can look convincing even when the underlying evidence is weak. Use the modeler as a timing
            layer after the evidence layer: mechanism, human outcomes, safety, product form, and real-world fit still matter.
          </p>
        </div>
        <ol className='mt-6 grid gap-3 md:grid-cols-2'>
          {workflowSteps.map((step, index) => (
            <li key={step} className='rounded-2xl border border-brand-900/10 bg-white/80 p-4 text-sm leading-6 text-muted'>
              <span className='mr-2 font-bold text-brand-800'>{index + 1}.</span>{step}
            </li>
          ))}
        </ol>
      </section>

      <section className='card-premium p-6 sm:p-8'>
        <div className='max-w-3xl space-y-3'>
          <p className='eyebrow-label'>Interactive tool</p>
          <h2 className='text-2xl font-semibold tracking-tight text-ink'>Adjust timing assumptions below</h2>
          <p className='text-sm leading-7 text-muted'>
            Use the tool as a visual teaching aid. If a modeled timeline looks unusual, use that as a prompt
            to read the ingredient profile, check dose form, and look for human trial context.
          </p>
        </div>
        <div className='mt-6'>
          <EfficacyModelerClient />
        </div>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm'>
        <h2 className='text-2xl font-semibold tracking-tight text-ink'>FAQ</h2>
        <div className='mt-4 grid gap-4'>
          {faqItems.map((item) => (
            <article key={item.question} className='rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4'>
              <h3 className='font-bold text-ink'>{item.question}</h3>
              <p className='mt-2 text-sm leading-7 text-muted'>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <References refs={EFFICACY_MODEL_REFS} />
    </div>
  )
}
