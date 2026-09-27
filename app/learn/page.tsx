import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import EditorialFamilyNav from '@/components/navigation/EditorialFamilyNav'
import { learnPosts } from './data'

export const metadata: Metadata = {
  title: 'Learn — Neuroscience, Evidence & Mechanisms',
  description:
    'Learn evidence literacy, neuroscience, cognition, stress biology, neurochemistry, psychoactive science, and safety concepts without the hype.',
  alternates: { canonical: '/learn/' },
  openGraph: {
    title: 'Learn — Neuroscience, Evidence & Mechanisms',
    description: 'Understand the concepts behind the evidence: research literacy, neurochemistry, cognition, stress, recovery, and psychoactive science.',
    url: '/learn/',
    images: ['/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn — Neuroscience, Evidence & Mechanisms',
    description: 'Understand the concepts behind the evidence: research literacy, neurochemistry, cognition, stress, recovery, and psychoactive science.',
  },
}

const LEARNING_TRACKS = [
  {
    title: 'Evidence literacy',
    href: '/learn/evidence-literacy/',
    description: 'Learn how trials, evidence hierarchies, conflicting studies, uncertainty, and individual variability change what a claim means.',
  },
  {
    title: 'Brain & neurochemistry',
    href: '/learn/how-neurotransmitters-work/',
    description: 'Build a foundation in neurotransmitters, receptors, neuropharmacology, and why single-chemical explanations usually fail.',
  },
  {
    title: 'Cognition, stress & recovery',
    href: '/learn/how-stress-affects-the-brain/',
    description: 'Understand focus, memory, neuroplasticity, stress biology, fatigue, sleep, and emotional regulation as connected systems.',
  },
  {
    title: 'Psychoactive science & safety',
    href: '/learn/understanding-altered-states/',
    description: 'Learn altered-state mechanisms, context, perception, harm reduction, serotonergic risk, and psychoactive plant science.',
  },
] as const

const STARTING_POINTS = [
  { title: 'How to Read Scientific Studies', href: '/learn/how-to-read-scientific-studies/' },
  { title: 'How Neurotransmitters Work', href: '/learn/how-neurotransmitters-work/' },
  { title: 'How Receptors Work', href: '/learn/how-receptors-work/' },
  { title: 'Why Studies Conflict', href: '/learn/why-studies-conflict/' },
  { title: 'How Focus and Motivation Work', href: '/learn/how-focus-and-motivation-work/' },
  { title: 'How Sleep Affects Neurochemistry', href: '/learn/how-sleep-affects-neurochemistry/' },
  { title: 'Understanding Altered States', href: '/learn/understanding-altered-states/' },
  { title: 'Psychoactive Harm Reduction', href: '/learn/harm-reduction/' },
] as const

const EDUCATION_TOPICS = [
  { title: 'Evidence Literacy: Clinical Trial Design', href: '/learn/evidence-literacy/' },
  { title: 'How to Read Scientific Studies', href: '/learn/how-to-read-scientific-studies/' },
  { title: 'How Neurotransmitters Work', href: '/learn/how-neurotransmitters-work/' },
  { title: 'How Receptors Work', href: '/learn/how-receptors-work/' },
  { title: 'Why Neurochemistry Is Complex', href: '/learn/why-neurochemistry-is-complex/' },
  { title: 'Evidence Hierarchy', href: '/learn/evidence-hierarchy/' },
  { title: 'How Focus and Motivation Work', href: '/learn/how-focus-and-motivation-work/' },
  { title: 'How Memory Formation Works', href: '/learn/how-memory-formation-works/' },
  { title: 'How Learning Affects Neuroplasticity', href: '/learn/how-learning-affects-neuroplasticity/' },
  { title: 'What Is a Nootropic?', href: '/learn/what-is-a-nootropic/' },
  { title: 'How Sleep Affects Neurochemistry', href: '/learn/how-sleep-affects-neurochemistry/' },
  { title: 'How the Brain Recovers From Fatigue', href: '/learn/how-the-brain-recovers-from-fatigue/' },
  { title: 'What Is Neuroinflammation?', href: '/learn/what-is-neuroinflammation/' },
  { title: 'How Emotional Regulation Works', href: '/learn/how-emotional-regulation-works/' },
  { title: 'Rhabdomyolysis: How Muscle Breakdown Can Injure the Kidneys', href: '/learn/rhabdomyolysis/' },
  { title: 'Understanding Altered States', href: '/learn/understanding-altered-states/' },
  { title: 'How Set and Setting Matter', href: '/learn/why-set-and-setting-matter/' },
  { title: 'Psychoactive Substances Overview', href: '/novel-psychoactive-substances/' },
  { title: 'Calming Psychoactives: GABA, Stress Regulation & Safety', href: '/learn/calming/' },
  { title: 'Dissociative Mechanisms: NMDA, Perception & Safety', href: '/learn/dissociative-mechanisms/' },
  { title: 'Psychoactive Harm Reduction: Interactions, Set, Setting & Safety', href: '/learn/harm-reduction/' },
  { title: 'Serotonergic Stacking Risks', href: '/learn/serotonergic-stacking-risks/' },
  { title: '18 Supplements That Can Trigger Serotonin Syndrome', href: '/learn/serotonin-syndrome-supplements/' },
  { title: 'Dopamine', href: '/learn/dopamine/' },
  { title: 'Serotonin', href: '/learn/serotonin/' },
  { title: 'GABA Pathway', href: '/learn/gaba/' },
  { title: 'Glutamate', href: '/learn/glutamate/' },
  { title: 'Cholinergic System', href: '/learn/cholinergic-system/' },
  { title: 'GABA vs Serotonin', href: '/learn/gaba-vs-serotonin/' },
  { title: 'Evidence Levels', href: '/learn/evidence-levels/' },
  { title: 'What Is Neuropharmacology?', href: '/learn/what-is-neuropharmacology/' },
  { title: 'Why Human Trials Matter', href: '/learn/why-human-trials-matter/' },
  { title: 'Why Studies Conflict', href: '/learn/why-studies-conflict/' },
  { title: 'Why Neuroscience Is Difficult', href: '/learn/why-neuroscience-is-difficult/' },
  { title: 'Why Individual Variability Matters', href: '/learn/why-individual-variability-matters/' },
  { title: 'Why Online Supplement Claims Spread', href: '/learn/why-online-supplement-claims-spread/' },
  { title: 'Common Neurochemistry Myths', href: '/learn/common-neurochemistry-myths/' },
  { title: 'Scientific but Human Neuroscience', href: '/learn/scientific-but-human-neuroscience/' },
  { title: 'Understanding Individual Variability', href: '/learn/understanding-individual-variability/' },
  { title: 'Study Design Snapshots: Reading an Evidence Grade', href: '/learn/study-design-snapshot/' },
  { title: 'What Are Psychoactive Herbs?', href: '/learn/what-are-psychoactive-herbs/' },
  { title: 'What Is an Entheogen?', href: '/learn/what-is-an-entheogen/' },
  { title: 'How Psychoactive Plants Affect the Brain', href: '/learn/how-psychoactive-plants-affect-the-brain/' },
  { title: 'How Psychoactive Substances Affect Perception', href: '/learn/how-psychoactive-substances-affect-perception/' },
  { title: 'How Herbal Psychoactives Differ from Pharmaceuticals', href: '/learn/how-herbal-psychoactives-differ-from-pharmaceuticals/' },
  { title: 'Dream Herbs: Oneirogenic Plants, REM Sleep & Safety', href: '/learn/dream-herbs/' },
  { title: 'Entheogens and Psychoactive Botanicals', href: '/learn/entheogens/' },
  { title: 'Why Burnout Affects Cognition', href: '/learn/why-burnout-affects-cognition/' },
  { title: 'Stress and Cognition Continuity', href: '/learn/stress-and-cognition-continuity/' },
  { title: 'Cognitive Resilience Systems', href: '/learn/cognitive-resilience-systems/' },
  { title: 'Emotional Amplification Systems', href: '/learn/emotional-amplification-systems/' },
  { title: 'Why Fatigue Is Biologically Complex', href: '/learn/why-fatigue-is-biologically-complex/' },
  { title: 'Understanding Placebo and Expectancy', href: '/learn/understanding-placebo-and-expectancy/' },
  { title: 'Placebo and Context Effects', href: '/learn/placebo-and-context-effects/' },
  { title: 'What Is Anxiety Neurochemistry?', href: '/learn/what-is-anxiety-neurochemistry/' },
  { title: 'Why Overstimulation Impairs Focus', href: '/learn/why-overstimulation-impairs-focus/' },
  { title: 'Why Calm Focus Differs from Stimulation', href: '/learn/why-calm-focus-differs-from-stimulation/' },
  { title: 'Why Sleep Matters for Mental Health', href: '/learn/why-sleep-matters-for-mental-health/' },
  { title: 'Why Sleep Changes Emotional Regulation', href: '/learn/why-sleep-changes-emotional-regulation/' },
  { title: 'Neuroscience Glossary', href: '/learn/neuroscience-glossary/' },
  { title: 'Inflammation and the Brain', href: '/learn/inflammation/' },
  { title: 'Supplement Product Quality Guide', href: '/learn/product-quality/' },
] as const

const LEGACY_UTILITY_ROUTES = [
  { title: 'Scientific Evidence Citation Explorer', href: '/learn/citation-explorer/', owner: 'Research' },
  { title: 'Interactive Supplement Efficacy Modeler', href: '/learn/efficacy-model/', owner: 'Research' },
  { title: 'Biological Pathway Connectivity Explorer', href: '/learn/explorer/', owner: 'Research' },
  { title: 'Research Methodology', href: '/learn/research-methodology/', owner: 'Research' },
  { title: 'Safety and Educational Disclaimers', href: '/learn/safety-and-disclaimers/', owner: 'Safety / trust' },
] as const

export default function EducationHubPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 pb-24 pt-4 sm:pt-6'>
      <AuthorityJsonLd
        title='Learn — Neuroscience, Evidence & Mechanisms'
        description='Evidence-informed education covering research literacy, neurochemistry, cognition, stress biology, recovery systems, and psychoactive science.'
        url='https://thehippiescientist.net/learn/'
        type='CollectionPage'
      />

      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Learn' }]} />

      <header className='hero-shell rounded-[2rem] border px-5 py-6 sm:p-8'>
        <p className='eyebrow-label'>Editorial library · Concepts and mechanisms</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>Learn</h1>
        <p className='text-reading mt-4 max-w-3xl'>
          Use Learn when you want to understand how something works. Practical decisions belong in Guides; research notes and reviews belong in Articles; source-level verification belongs in Research.
        </p>
      </header>

      <EditorialFamilyNav active='learn' />

      <section aria-labelledby='learning-tracks-heading'>
        <div className='max-w-3xl'>
          <p className='eyebrow-label'>Choose a learning track</p>
          <h2 id='learning-tracks-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
            Start with the concept you want to understand
          </h2>
        </div>
        <div className='mt-5 grid gap-4 md:grid-cols-2'>
          {LEARNING_TRACKS.map((track) => (
            <Link key={track.href} href={track.href} className='card-premium p-6 transition hover:bg-brand-50/30'>
              <h3 className='text-xl font-semibold text-ink'>{track.title}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{track.description}</p>
              <span className='mt-4 inline-flex text-sm font-semibold text-brand-700'>Start learning →</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby='common-starting-points-heading'>
        <h2 id='common-starting-points-heading' className='text-2xl font-semibold tracking-tight text-ink'>
          Common starting points
        </h2>
        <div className='mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
          {STARTING_POINTS.map((item) => (
            <Link key={item.href} href={item.href} className='rounded-xl border border-brand-900/10 bg-white px-4 py-3 text-sm font-medium text-brand-800 transition hover:bg-brand-50/40'>
              {item.title} →
            </Link>
          ))}
        </div>
      </section>

      <details className='section-frame p-5 sm:p-6'>
        <summary className='cursor-pointer text-lg font-semibold text-ink'>
          Complete learning index ({EDUCATION_TOPICS.length + LEGACY_UTILITY_ROUTES.length + learnPosts.length} routes)
        </summary>
        <p className='mt-3 max-w-3xl text-sm leading-6 text-muted'>
          The full route inventory stays available without turning the top of the page into a wall of cards. Legacy utility and practical routes are labeled by their logical owner.
        </p>

        <div className='mt-6'>
          <h3 className='text-base font-semibold text-ink'>Education topics</h3>
          <div className='mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {EDUCATION_TOPICS.map((item) => (
              <Link key={item.href} href={item.href} className='rounded-lg border border-brand-900/10 bg-white px-3 py-2 text-sm text-brand-800 hover:bg-brand-50/40'>
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className='mt-7'>
          <h3 className='text-base font-semibold text-ink'>Legacy utility routes</h3>
          <div className='mt-3 grid gap-2 sm:grid-cols-2'>
            {LEGACY_UTILITY_ROUTES.map((item) => (
              <Link key={item.href} href={item.href} className='rounded-lg border border-brand-900/10 bg-white px-3 py-2 text-sm text-brand-800 hover:bg-brand-50/40'>
                {item.title} <span className='text-muted'>· {item.owner}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className='mt-7'>
          <h3 className='text-base font-semibold text-ink'>Practical legacy Learn routes</h3>
          <p className='mt-1 text-xs leading-5 text-muted'>
            These URLs remain stable and discoverable. New practical decision content belongs under Guides.
          </p>
          <div className='mt-3 grid gap-2 sm:grid-cols-2'>
            {learnPosts.map((post) => (
              <Link key={post.slug} href={'/learn/' + post.slug + '/'} className='rounded-lg border border-brand-900/10 bg-white px-3 py-2 text-sm text-brand-800 hover:bg-brand-50/40'>
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      </details>

      <aside className='rounded-2xl border border-brand-900/10 bg-brand-50/45 p-5 text-sm leading-6 text-muted sm:p-6'>
        Need source-level verification? Go to <Link href='/research/' className='font-semibold text-brand-700 hover:underline'>Research</Link>.
        Looking up a specific herb or compound? Use <Link href='/herbs/' className='font-semibold text-brand-700 hover:underline'>Ingredients</Link>.
      </aside>
    </div>
  )
}
