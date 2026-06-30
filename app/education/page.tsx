import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import EducationSupernodeGrid from '@/components/learn/learn-supernode-grid'

export const metadata: Metadata = {
  title: 'Neuroscience and Neuropharmacology Education',
  description:
    'Explore education on neurochemistry, cognition, stress biology, recovery systems, and psychoactive neuroscience.',
  alternates: { canonical: '/learn/' },
  openGraph: {
    title: 'Neuroscience and Neuropharmacology Education',
    description:
      'Explore education on neurochemistry, cognition, stress biology, recovery systems, and psychoactive neuroscience.',
    url: '/learn/',
    images: ['/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neuroscience and Neuropharmacology Education',
    description:
      'Explore education on neurochemistry, cognition, stress biology, recovery systems, and psychoactive neuroscience.',
  },
}

const supernodes = [
  {
    title: 'Stress and Recovery Biology',
    description:
      'Educational exploration of stress neurobiology, burnout systems, recovery-oriented neuropharmacology, sleep continuity, fatigue systems, and nervous-system resilience.',
    href: '/learn/how-stress-affects-the-brain/',
    category: 'Recovery Neuroscience',
  },
  {
    title: 'Cognition and Neuroplasticity',
    description:
      'Explore memory formation, neuroplasticity, focus continuity, executive-function systems, learning adaptation, and cognition-oriented neuroscience.',
    href: '/learn/how-learning-affects-neuroplasticity/',
    category: 'Cognition Systems',
  },
  {
    title: 'Psychoactive Education',
    description:
      'Systems-oriented psychoactive education covering altered states, contextual neurobiology, emotional processing, set and setting, and harm-reduction framing.',
    href: '/learn/understanding-altered-states/',
    category: 'Contextual Neurobiology',
  },
  {
    title: 'Adaptogens and Stress Resilience',
    description:
      'Educational exploration of adaptogens, stress-response physiology, neuroendocrine adaptation, burnout systems, and resilience biology.',
    href: '/learn/what-are-adaptogens/',
    category: 'Stress Physiology',
  },
]

const foundational = [
  {
    title: 'Evidence Literacy: Clinical Trial Design',
    href: '/learn/study-design-snapshot/',
  },
  {
    title: 'How to Read Scientific Studies',
    href: '/learn/how-to-read-scientific-studies/',
  },
  {
    title: 'How Neurotransmitters Work',
    href: '/learn/how-neurotransmitters-work/',
  },
  {
    title: 'How Receptors Work',
    href: '/learn/how-receptors-work/',
  },
  {
    title: 'Why Neurochemistry Is Complex',
    href: '/learn/why-neurochemistry-is-complex/',
  },
  {
    title: 'Evidence Hierarchy',
    href: '/learn/evidence-hierarchy/',
  },
]

const cognition = [
  {
    title: 'How Focus and Motivation Work',
    href: '/learn/how-focus-and-motivation-work/',
  },
  {
    title: 'How Memory Formation Works',
    href: '/learn/how-memory-formation-works/',
  },
  {
    title: 'How Learning Affects Neuroplasticity',
    href: '/learn/how-learning-affects-neuroplasticity/',
  },
  {
    title: 'What Is a Nootropic?',
    href: '/learn/what-is-a-nootropic/',
  },
]

const recovery = [
  {
    title: 'How Sleep Affects Neurochemistry',
    href: '/learn/how-sleep-affects-neurochemistry/',
  },
  {
    title: 'How the Brain Recovers From Fatigue',
    href: '/learn/how-the-brain-recovers-from-fatigue/',
  },
  {
    title: 'What Is Neuroinflammation?',
    href: '/learn/what-is-neuroinflammation/',
  },
  {
    title: 'How Emotional Regulation Works',
    href: '/learn/how-emotional-regulation-works/',
  },
]

const psychoactive = [
  {
    title: 'Understanding Altered States',
    href: '/learn/understanding-altered-states/',
  },
  {
    title: 'How Set and Setting Matter',
    href: '/learn/why-set-and-setting-matter/',
  },
  {
    title: 'Psychoactive Substances Overview',
    href: '/novel-psychoactive-substances/',
  },
  {
    title: 'Psychoactive Education Hub',
    href: '/psychoactive/',
  },
]

const researchTools = [
  {
    title: 'Scientific Evidence Citation Explorer',
    href: '/learn/citation-explorer/',
  },
  {
    title: 'Interactive Supplement Efficacy Modeler',
    href: '/learn/efficacy-model/',
  },
  {
    title: 'Biological Pathway Connectivity Explorer',
    href: '/learn/explorer/',
  },
  {
    title: 'Research Methodology',
    href: '/learn/research-methodology/',
  },
  {
    title: 'Safety and Educational Disclaimers',
    href: '/learn/safety-and-disclaimers/',
  },
]

const neurotransmitters = [
  { title: 'Dopamine', href: '/learn/dopamine/' },
  { title: 'Serotonin', href: '/learn/serotonin/' },
  { title: 'GABA Pathway', href: '/learn/gaba/' },
  { title: 'Glutamate', href: '/learn/glutamate/' },
  { title: 'Cholinergic System', href: '/learn/cholinergic-system/' },
  { title: 'GABA vs Serotonin', href: '/learn/gaba-vs-serotonin/' },
  { title: 'Evidence Levels', href: '/learn/evidence-levels/' },
  { title: 'What Is Neuropharmacology?', href: '/learn/what-is-neuropharmacology/' },
]

const researchLiteracy = [
  { title: 'Why Human Trials Matter', href: '/learn/why-human-trials-matter/' },
  { title: 'Why Studies Conflict', href: '/learn/why-studies-conflict/' },
  { title: 'Why Neuroscience Is Difficult', href: '/learn/why-neuroscience-is-difficult/' },
  { title: 'Why Individual Variability Matters', href: '/learn/why-individual-variability-matters/' },
  { title: 'Why Online Supplement Claims Spread', href: '/learn/why-online-supplement-claims-spread/' },
  { title: 'Common Neurochemistry Myths', href: '/learn/common-neurochemistry-myths/' },
  { title: 'Scientific but Human Neuroscience', href: '/learn/scientific-but-human-neuroscience/' },
  { title: 'Understanding Individual Variability', href: '/learn/understanding-individual-variability/' },
]

const psychoactivePlants = [
  { title: 'What Are Psychoactive Herbs?', href: '/learn/what-are-psychoactive-herbs/' },
  { title: 'What Is an Entheogen?', href: '/learn/what-is-an-entheogen/' },
  { title: 'How Psychoactive Plants Affect the Brain', href: '/learn/how-psychoactive-plants-affect-the-brain/' },
  { title: 'How Psychoactive Substances Affect Perception', href: '/learn/how-psychoactive-substances-affect-perception/' },
  { title: 'How Herbal Psychoactives Differ from Pharmaceuticals', href: '/learn/how-herbal-psychoactives-differ-from-pharmaceuticals/' },
]

const burnoutFatigue = [
  { title: 'Why Burnout Affects Cognition', href: '/learn/why-burnout-affects-cognition/' },
  { title: 'Stress and Cognition Continuity', href: '/learn/stress-and-cognition-continuity/' },
  { title: 'Cognitive Resilience Systems', href: '/learn/cognitive-resilience-systems/' },
  { title: 'Emotional Amplification Systems', href: '/learn/emotional-amplification-systems/' },
  { title: 'Why Fatigue Is Biologically Complex', href: '/learn/why-fatigue-is-biologically-complex/' },
]

const variabilityAndContext = [
  { title: 'Understanding Placebo and Expectancy', href: '/learn/understanding-placebo-and-expectancy/' },
  { title: 'Placebo and Context Effects', href: '/learn/placebo-and-context-effects/' },
  { title: 'What Is Anxiety Neurochemistry?', href: '/learn/what-is-anxiety-neurochemistry/' },
  { title: 'Why Overstimulation Impairs Focus', href: '/learn/why-overstimulation-impairs-focus/' },
  { title: 'Why Calm Focus Differs from Stimulation', href: '/learn/why-calm-focus-differs-from-stimulation/' },
  { title: 'Why Sleep Matters for Mental Health', href: '/learn/why-sleep-matters-for-mental-health/' },
  { title: 'Why Sleep Changes Emotional Regulation', href: '/learn/why-sleep-changes-emotional-regulation/' },
  { title: 'Neuroscience Glossary', href: '/learn/neuroscience-glossary/' },
  { title: 'Inflammation and the Brain', href: '/learn/inflammation/' },
]

function CompactSection({
  title,
  items,
}: {
  title: string
  items: { title: string; href: string }[]
}) {
  return (
    <section className='space-y-4'>
      <h2 className='text-xl font-semibold tracking-tight text-ink'>{title}</h2>
      <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='rounded-xl border border-brand-900/10 bg-white/70 px-4 py-3 text-sm font-medium text-brand-800 transition hover:border-brand-700/20 hover:bg-brand-50/30'
          >
            {item.title} →
          </Link>
        ))}
      </div>
    </section>
  )
}

function Section({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: { title: string; href: string }[]
}) {
  return (
    <section className='space-y-6'>
      <div className='space-y-2 max-w-3xl'>
        <p className='eyebrow-label'>Educational Cluster</p>

        <h2 className='text-3xl font-semibold tracking-tight text-ink'>
          {title}
        </h2>

        <p className='text-base leading-8 text-muted'>
          {description}
        </p>
      </div>

      <div className='grid gap-5 lg:grid-cols-2'>
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='card-premium p-6 transition motion-safe:hover:-translate-y-0.5'
          >
            <div className='space-y-3'>
              <p className='eyebrow-label'>Authority Page</p>

              <h3 className='text-2xl font-semibold tracking-tight text-ink'>
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function EducationHubPage() {
  return (
    <div className='container-page py-10 space-y-16'>
      <AuthorityJsonLd
        title='Neuroscience and Neuropharmacology Education'
        description='Evidence-informed educational ecosystem covering neurochemistry, cognition systems, stress biology, recovery neuropharmacology, psychoactive education, and systems-oriented neuroscience.'
        url='https://thehippiescientist.net/learn/'
        type='CollectionPage'
      />

      <section className='space-y-8 max-w-5xl'>
        <div className='space-y-4'>
          <p className='eyebrow-label'>Educational Authority Hub</p>

          <h1 className='text-6xl font-bold tracking-tight text-ink leading-tight'>
            Neuroscience, Neuropharmacology, and Systems-Biology Education
          </h1>
        </div>

        <div className='space-y-5 text-lg leading-9 text-muted max-w-4xl'>
          <p>
            The Hippie Scientist educational ecosystem explores neurochemistry,
            cognition systems, stress neurobiology, psychoactive education,
            recovery-oriented neuroscience, and evidence-informed
            neuropharmacology through a systems-oriented framework.
          </p>

          <p>
            Educational content is designed to emphasize scientific nuance,
            biological complexity, evidence interpretation, uncertainty
            awareness, and anti-oversimplification neuroscience literacy rather
            than sensationalized optimization narratives.
          </p>
        </div>
      </section>

      <EducationSupernodeGrid
        title='Start with the major neuroscience systems'
        description='Explore foundational authority hubs covering stress physiology, cognition systems, contextual neurobiology, recovery-oriented neuroscience, and resilience biology.'
        items={supernodes}
      />

      <Section
        title='Foundational Neuroscience'
        description='Core neuroscience-literacy systems covering neurotransmitters, receptors, evidence interpretation, and systems-oriented neurobiology.'
        items={foundational}
      />

      <Section
        title='Cognition and Learning Systems'
        description='Educational exploration of attention, memory, neuroplasticity, executive function, motivation systems, and cognition-oriented neuropharmacology.'
        items={cognition}
      />

      <Section
        title='Stress, Recovery, and Emotional Regulation'
        description='Recovery-oriented educational systems covering stress physiology, sleep neurochemistry, neuroinflammation, fatigue recovery, and emotional regulation biology.'
        items={recovery}
      />

      <Section
        title='Psychoactive and Altered-State Education'
        description='Systems-oriented psychoactive education focused on perception, contextual neurobiology, altered states, emotional intensity, and harm-reduction awareness.'
        items={psychoactive}
      />

      <Section
        title='Research Tools and Safety Pages'
        description='Methodology, citation, modeling, pathway, and safety pages that should be reachable from the main education hub instead of sitting isolated.'
        items={researchTools}
      />

      <section className='space-y-10'>
        <div className='space-y-2'>
          <p className='eyebrow-label'>Complete Topic Index</p>
          <h2 className='text-3xl font-semibold tracking-tight text-ink'>All Education Topics</h2>
          <p className='text-base leading-8 text-muted max-w-3xl'>
            Explore the full depth of the educational ecosystem — neurotransmitter pathways, research literacy, psychoactive plant science, burnout biology, individual variability, and reference pages.
          </p>
        </div>
        <CompactSection title='Neurotransmitter Pathways' items={neurotransmitters} />
        <CompactSection title='Research Literacy and Evidence Limitations' items={researchLiteracy} />
        <CompactSection title='Psychoactive Plant Science' items={psychoactivePlants} />
        <CompactSection title='Burnout, Fatigue, and Resilience' items={burnoutFatigue} />
        <CompactSection title='Context, Variability, and Applied Topics' items={variabilityAndContext} />
      </section>

      <section className='card-premium p-8 space-y-6'>
        <div className='space-y-3 max-w-3xl'>
          <p className='eyebrow-label'>Educational Philosophy</p>

          <h2 className='text-3xl font-semibold tracking-tight text-ink'>
            Scientific nuance over oversimplification
          </h2>

          <p className='text-base leading-8 text-muted'>
            Many neuroscience and supplement discussions online reduce complex
            biological systems into simplistic narratives involving single
            neurotransmitters, deterministic optimization frameworks, or
            exaggerated mechanistic claims. This educational ecosystem instead
            emphasizes systems biology, uncertainty awareness, contextual
            interpretation, evidence limitations, and scientific humility.
          </p>
        </div>

        <div className='grid gap-5 lg:grid-cols-3'>
          <div className='rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3'>
            <h3 className='text-xl font-semibold text-ink'>Evidence Aware</h3>

            <p className='text-sm leading-7 text-muted'>
              Human evidence, mechanistic limitations, translational
              uncertainty, and biological variability are emphasized throughout
              the platform.
            </p>
          </div>

          <div className='rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3'>
            <h3 className='text-xl font-semibold text-ink'>Systems Oriented</h3>

            <p className='text-sm leading-7 text-muted'>
              Stress biology, cognition systems, sleep recovery, emotional
              regulation, neuropharmacology, and environmental context are
              treated as interacting systems.
            </p>
          </div>

          <div className='rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3'>
            <h3 className='text-xl font-semibold text-ink'>Anti-Hype</h3>

            <p className='text-sm leading-7 text-muted'>
              Educational content avoids sensationalized optimization narratives,
              simplistic neurotransmitter explanations, and exaggerated
              psychoactive claims.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
