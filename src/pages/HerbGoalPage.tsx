import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useHerbData } from '@/lib/herb-data'
import { getCommonName } from '@/lib/herbName'

const GOALS: Record<string, { label: string; keywords: string[]; intro: string }> = {
  relaxation: {
    label: 'Herbs for Relaxation',
    keywords: ['calm', 'relax', 'sleep', 'anxiolytic', 'sedative'],
    intro:
      'A quick educational shortlist of herbs commonly discussed for calming and downshifting.',
  },
  focus: {
    label: 'Herbs for Focus',
    keywords: ['focus', 'clarity', 'attention', 'nootropic', 'cognitive', 'energy'],
    intro:
      'A mechanism-first index of herbs people explore for attention, clarity, and cognitive endurance.',
  },
  sleep: {
    label: 'Herbs for Sleep',
    keywords: ['sleep', 'sedative', 'insomnia', 'rest', 'night'],
    intro:
      'Educational profiles for sleep-oriented herbs with links to safety details and related compounds.',
  },
}

export default function HerbGoalPage() {
  const { goal = '' } = useParams<{ goal: string }>()
  const config = GOALS[goal]
  const herbs = useHerbData()

  if (!config) {
    return (
      <main className='container-page py-8 text-white/80'>
        <p>Collection not found.</p>
      </main>
    )
  }

  const matches = herbs.filter(herb => {
    const blob =
      `${herb.effects || ''} ${herb.description || ''} ${(herb.tags || []).join(' ')}`.toLowerCase()
    return config.keywords.some(keyword => blob.includes(keyword))
  })

  return (
    <main className='container-page py-8'>
      <Meta
        title={`${config.label} | The Hippie Scientist`}
        description={config.intro}
        path={`/herbs-for-${goal}`}
      />
      <section className='ds-card-lg'>
        <h1 className='text-3xl font-semibold text-white'>{config.label}</h1>
        <p className='mt-3 text-sm leading-7 text-white/80'>{config.intro}</p>
      </section>
      <section className='mt-5 grid gap-3 sm:grid-cols-2'>
        {matches.slice(0, 24).map(herb => (
          <Link key={herb.slug} to={`/herbs/${herb.slug}`} className='ds-card p-4'>
            <p className='text-sm font-semibold text-white'>
              {getCommonName(herb) || herb.scientific || herb.slug}
            </p>
            <p className='mt-1 text-xs text-white/70'>
              {herb.effectsSummary || herb.effects || 'See profile for details.'}
            </p>
          </Link>
        ))}
      </section>
    </main>
  )
}
