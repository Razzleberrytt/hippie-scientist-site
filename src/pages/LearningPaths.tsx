import { Link } from 'react-router-dom'
import { useLearningProgress } from '@/lib/growth'

type PathItem = { id: string; title: string; href: string; type: 'herb' | 'compound' | 'article' }
type LearningPath = { id: string; title: string; description: string; items: PathItem[] }

const PATHS: LearningPath[] = [
  {
    id: 'beginner-effects',
    title: 'Beginner: Understanding Herbal Effects',
    description: 'Start with gentle profiles, then compare mechanism claims with observed effects.',
    items: [
      {
        id: 'h-passionflower',
        title: 'Passionflower profile',
        href: '/herbs/passionflower',
        type: 'herb',
      },
      { id: 'h-gotu-kola', title: 'Gotu Kola profile', href: '/herbs/gotu-kola', type: 'herb' },
      {
        id: 'c-apigenin',
        title: 'Apigenin mechanism',
        href: '/compounds/apigenin',
        type: 'compound',
      },
      {
        id: 'a-read-research',
        title: 'How to read herbal research',
        href: '/blog/how-to-read-herbal-research',
        type: 'article',
      },
    ],
  },
  {
    id: 'psychedelic-mechanisms',
    title: 'Psychedelic Mechanisms 101',
    description: 'Map receptor hypotheses and uncertainty boundaries before interpreting outcomes.',
    items: [
      { id: 'h-blue-lotus', title: 'Blue Lotus profile', href: '/herbs/blue-lotus', type: 'herb' },
      {
        id: 'h-calea',
        title: 'Calea zacatechichi profile',
        href: '/herbs/calea-zacatechichi',
        type: 'herb',
      },
      {
        id: 'c-muscimol',
        title: 'Muscimol profile',
        href: '/compounds/muscimol',
        type: 'compound',
      },
      {
        id: 'a-what-psychoactive-herb',
        title: 'What is a psychoactive herb?',
        href: '/blog/what-is-a-psychoactive-herb',
        type: 'article',
      },
    ],
  },
  {
    id: 'safety-risk',
    title: 'Safety & Risk Awareness',
    description: 'Build a repeatable process for contraindications, side effects, and context.',
    items: [
      { id: 'h-valerian', title: 'Valerian profile', href: '/herbs/valerian', type: 'herb' },
      { id: 'h-kava', title: 'Kava profile', href: '/herbs/kava', type: 'herb' },
      {
        id: 'c-kavalactones',
        title: 'Kavalactones overview',
        href: '/blog/kava-safety-kavalactones',
        type: 'article',
      },
    ],
  },
  {
    id: 'traditional-modern',
    title: 'Traditional vs Modern Use',
    description: 'Compare ethnobotanical context with modern extraction and dosing assumptions.',
    items: [
      {
        id: 'h-ashwagandha',
        title: 'Ashwagandha profile',
        href: '/herbs/ashwagandha',
        type: 'herb',
      },
      { id: 'h-rhodiola', title: 'Rhodiola profile', href: '/herbs/rhodiola-rosea', type: 'herb' },
      {
        id: 'a-traditional-use',
        title: 'Traditional use notes',
        href: '/blog/2026-03-17-traditional-use-ashwagandha',
        type: 'article',
      },
    ],
  },
]

export default function LearningPaths() {
  return (
    <main className='container mx-auto max-w-5xl px-4 py-8'>
      <header className='card p-6'>
        <p className='text-xs uppercase tracking-[0.2em] text-white/60'>Learning paths</p>
        <h1 className='mt-2 text-3xl font-semibold text-white'>
          Structured exploration, not random browsing
        </h1>
        <p className='mt-3 text-sm text-white/75'>
          Each path includes 3–6 connected items and local progress tracking.
        </p>
      </header>

      <section className='mt-6 grid gap-5'>
        {PATHS.map(path => (
          <PathCard key={path.id} path={path} />
        ))}
      </section>
    </main>
  )
}

function PathCard({ path }: { path: LearningPath }) {
  const { completed, toggleCompleted } = useLearningProgress(path.id)
  const percent = Math.round((completed.length / path.items.length) * 100)

  return (
    <article className='card p-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold text-white'>{path.title}</h2>
          <p className='mt-2 text-sm text-white/70'>{path.description}</p>
        </div>
        <p className='text-sm text-emerald-200'>
          {completed.length}/{path.items.length} complete ({percent}%)
        </p>
      </div>

      <ul className='mt-4 space-y-2'>
        {path.items.map(item => {
          const done = completed.includes(item.id)
          return (
            <li key={item.id} className='rounded-xl border border-white/10 bg-white/5 p-3'>
              <div className='flex items-center justify-between gap-3'>
                <Link
                  className='text-sm text-[color:var(--accent)] underline-offset-2 hover:underline'
                  to={item.href}
                >
                  {item.title}
                </Link>
                <button
                  className='rounded-full border border-white/20 px-3 py-1 text-xs text-white/80'
                  onClick={() => toggleCompleted(item.id)}
                >
                  {done ? 'Completed' : 'Mark complete'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
