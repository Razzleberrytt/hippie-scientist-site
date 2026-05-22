import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Learn Supplement Science and Safety Basics',
  description:
    'Read plain-English education on supplement science, evidence quality, safety context, and decision-making tradeoffs.',
  alternates: { canonical: '/learn' },
  openGraph: {
    title: 'Learn Supplement Science and Safety Basics',
    description:
      'Read plain-English education on supplement science, evidence quality, safety context, and decision-making tradeoffs.',
    url: '/learn',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Supplement Science and Safety Basics',
    description:
      'Read plain-English education on supplement science, evidence quality, safety context, and decision-making tradeoffs.',
  },
}

import { learnPosts } from './data'
import EducationSupernodeGrid from '@/components/education/education-supernode-grid'

const educationHubs = [
  {
    title: 'Stress and brain basics',
    href: '/education/scientific-but-human-neuroscience',
  },
  {
    title: 'Focus and resilience guides',
    href: '/education/cognitive-resilience-systems',
  },
  {
    title: 'Stress and cognition patterns',
    href: '/education/stress-and-cognition-continuity',
  },
]

const startHereCards = [
  {
    title: 'Start with the basics',
    body: 'Begin with the Education Hub to learn what a supplement claim means and which claims are mostly marketing.',
    href: '/education',
    cta: 'Start with the basics',
  },
  {
    title: 'Learn how to read evidence',
    body: 'Use the glossary and evidence guides to check study quality, dosing context, and what is still uncertain.',
    href: '/education/neuroscience-glossary',
    cta: 'Learn how to read evidence',
  },
  {
    title: 'Understand safety and tradeoffs',
    body: 'Supplement effects vary between individuals. Review medications, sensitivity, sleep impact, and product quality before trying anything.',
    href: '/learn/adaptogens-explained-without-hype',
    cta: 'Understand safety and tradeoffs',
  },
  {
    title: 'Compare before stacking',
    body: 'Compare single herbs and compounds first, then build a stack only when each piece has a clear purpose.',
    href: '/learn/cognitive-stack-that-actually-makes-sense',
    cta: 'Compare before stacking',
  },
]

const supernodes = [
  {
    title: 'Stress Neurobiology',
    description:
      'Plain-language education on stress physiology, burnout patterns, nervous-system regulation, and recovery-oriented cognition.',
    href: '/education/how-stress-affects-the-brain',
    category: 'Recovery Neuroscience',
  },
  {
    title: 'Neuroplasticity and Learning',
    description:
      'How memory, attention, repetition, sleep, and adaptation shape learning over time without reducing everything to hype.',
    href: '/education/how-learning-affects-neuroplasticity',
    category: 'Cognition Systems',
  },
  {
    title: 'Adaptogens and Recovery',
    description:
      'A careful look at adaptogens, stress signaling, fatigue, resilience claims, and where the evidence still has limits.',
    href: '/education/what-are-adaptogens',
    category: 'Stress Physiology',
  },
  {
    title: 'Psychoactive Systems',
    description:
      'Education on altered states, perception, emotional intensity, and safety context without romanticizing risky use.',
    href: '/education/understanding-altered-states',
    category: 'Safety context',
  },
]

export default function LearnPage() {
  return (
    <div className='space-y-16'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <div className='max-w-4xl space-y-5'>
          <div className='space-y-3'>
            <p className='eyebrow-label'>Learn the basics</p>

            <h1 className='text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
              Evidence-aware supplement education
            </h1>
          </div>

          <div className='space-y-4 text-base leading-7 text-muted sm:text-lg'>
            <p>
              Start here if you want to understand herbs, nootropics, adaptogens, and compounds without getting pulled into hype. These guides explain how to read claims, compare evidence, and think through safety tradeoffs.
            </p>

            <p>
              This section is educational, not medical advice. Evidence quality varies by topic, and results can differ substantially between individuals.
            </p>
          </div>

          <div className='flex flex-wrap gap-3 pt-2'>
            <Link
              href='/education'
              className='rounded-full border border-brand-900/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-white'
            >
              Explore Education Hub
            </Link>

            <Link
              href='/education/neuroscience-glossary'
              className='rounded-full border border-brand-900/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-white'
            >
              Neuroscience Glossary
            </Link>
          </div>
        </div>
      </section>

      <section className='space-y-4'>
        <div className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
          <p className='eyebrow-label'>Start here</p>
          <h2 className='mt-2 text-2xl font-semibold text-ink sm:text-3xl'>Pick your first click</h2>
          <p className='mt-2 text-sm leading-6 text-muted sm:text-base'>
            New here? Start with these four steps. They keep learning practical and help you compare options before you stack anything.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
        {startHereCards.map(card => (
          <article key={card.title} className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
            <h2 className='text-lg font-semibold text-ink'>{card.title}</h2>
            <p className='mt-2 text-sm leading-6 text-muted'>{card.body}</p>
            <Link
              href={card.href}
              className='mt-4 inline-flex text-sm font-medium text-emerald-700 underline-offset-4 hover:underline'
            >
              {card.cta}
            </Link>
          </article>
        ))}
              </div>
      </section>

      <EducationSupernodeGrid
        title='Explore major education hubs'
        description='Move from basic concepts into deeper systems: stress biology, cognition, neuroplasticity, adaptogens, and psychoactive education.'
        items={supernodes}
      />

      <section className='space-y-5'>
        <div>
          <p className='eyebrow-label'>Authority Hubs</p>

          <h2 className='mt-2 text-3xl font-semibold text-ink'>
            Core educational systems
          </h2>
        </div>

        <div className='grid gap-5 md:grid-cols-3'>
          {educationHubs.map(hub => (
            <Link
              key={hub.href}
              href={hub.href}
              className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 transition hover:shadow-sm'
            >
              <p className='text-xs uppercase tracking-[0.16em] text-muted'>Educational Hub</p>

              <h3 className='mt-2 text-lg font-semibold text-ink'>
                {hub.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <section className='space-y-5'>
        <div>
          <p className='eyebrow-label'>Featured Guides</p>

          <h2 className='mt-2 text-3xl font-semibold text-ink'>
            Practical evidence-aware learning
          </h2>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {learnPosts.map(post => (
            <Link
              key={post.slug}
              href={`/learn/${post.slug}`}
              className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 transition hover:shadow-sm'
            >
              <p className='text-xs uppercase tracking-[0.16em] text-muted'>
                {post.category} • {post.readingTime}
              </p>

              <h2 className='mt-1 text-xl font-semibold text-ink'>
                {post.title}
              </h2>

              <p className='mt-2 text-sm leading-6 text-muted'>
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
