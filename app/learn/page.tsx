import Link from 'next/link'
import { learnPosts } from './data'
import EducationSupernodeGrid from '@/components/education/education-supernode-grid'

const educationHubs = [
  {
    title: 'Scientific But Human Neuroscience',
    href: '/education/scientific-but-human-neuroscience',
  },
  {
    title: 'Cognitive Resilience Systems',
    href: '/education/cognitive-resilience-systems',
  },
  {
    title: 'Stress and Cognition Continuity',
    href: '/education/stress-and-cognition-continuity',
  },
]

const supernodes = [
  {
    title: 'Stress Neurobiology',
    description:
      'Explore stress physiology, burnout systems, recovery-oriented cognition, nervous-system regulation, and resilience biology.',
    href: '/education/how-stress-affects-the-brain',
    category: 'Recovery Neuroscience',
  },
  {
    title: 'Neuroplasticity and Learning',
    description:
      'Educational systems covering neuroplasticity, memory formation, attentional adaptation, and learning continuity.',
    href: '/education/how-learning-affects-neuroplasticity',
    category: 'Cognition Systems',
  },
  {
    title: 'Adaptogens and Recovery',
    description:
      'Systems-oriented exploration of adaptogens, resilience biology, stress signaling, and fatigue recovery systems.',
    href: '/education/what-are-adaptogens',
    category: 'Stress Physiology',
  },
  {
    title: 'Psychoactive Systems',
    description:
      'Educational framework exploring altered states, contextual neurobiology, emotional intensity, and perception systems.',
    href: '/education/understanding-altered-states',
    category: 'Contextual Neurobiology',
  },
]

export default function LearnPage() {
  return (
    <div className='space-y-16'>
      <section className='space-y-5 max-w-4xl'>
        <div className='space-y-3'>
          <p className='text-xs uppercase tracking-[0.2em] text-muted'>
            Education Ecosystem
          </p>

          <h1 className='text-5xl font-bold tracking-tight'>Learn</h1>
        </div>

        <div className='space-y-5 text-lg leading-8 text-muted'>
          <p>
            Explore evidence-aware educational systems covering contextual
            neurobiology, cognition continuity, stress physiology,
            neuropharmacology, emotional regulation, psychoactive education,
            and recovery-oriented neuroscience.
          </p>

          <p>
            The Learn ecosystem acts as a discovery layer connecting major
            neuroscience authority hubs, educational supernodes, practical
            guides, and systems-oriented scientific literacy resources.
          </p>
        </div>

        <div className='flex flex-wrap gap-3 pt-2'>
          <Link
            href='/education'
            className='rounded-full border px-4 py-2 text-sm hover:bg-black hover:text-white transition'
          >
            Explore Education Hub
          </Link>

          <Link
            href='/education/neuroscience-glossary'
            className='rounded-full border px-4 py-2 text-sm hover:bg-black hover:text-white transition'
          >
            Neuroscience Glossary
          </Link>
        </div>
      </section>

      <EducationSupernodeGrid
        title='Explore major neuroscience supernodes'
        description='Discover foundational authority systems spanning stress neurobiology, cognition continuity, psychoactive education, neuroplasticity, and resilience-oriented neuroscience.'
        items={supernodes}
      />

      <section className='space-y-5'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-muted'>
            Authority Hubs
          </p>

          <h2 className='text-3xl font-semibold mt-2'>
            Core Educational Systems
          </h2>
        </div>

        <div className='grid gap-5 md:grid-cols-3'>
          {educationHubs.map(hub => (
            <Link
              key={hub.href}
              href={hub.href}
              className='rounded-2xl border p-5 hover:shadow-sm transition'
            >
              <p className='text-xs uppercase text-muted'>Educational Hub</p>

              <h3 className='text-lg font-semibold mt-2'>
                {hub.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <section className='space-y-5'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-muted'>
            Featured Guides
          </p>

          <h2 className='text-3xl font-semibold mt-2'>
            Practical Evidence-Aware Learning
          </h2>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {learnPosts.map(post => (
            <Link
              key={post.slug}
              href={`/learn/${post.slug}`}
              className='rounded-2xl border p-5 hover:shadow-sm transition'
            >
              <p className='text-xs uppercase text-muted'>
                {post.category} • {post.readingTime}
              </p>

              <h2 className='text-xl font-semibold mt-1'>
                {post.title}
              </h2>

              <p className='text-sm text-muted mt-2'>
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
