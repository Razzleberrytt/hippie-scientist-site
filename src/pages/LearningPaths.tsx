import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LearningPanelSkeleton } from '@/components/skeletons/DetailSkeletons'
import { useLearningProgress } from '@/lib/growth'
import type { LearningPath } from '@/data/learning-paths'

export default function LearningPaths() {
  const [paths, setPaths] = useState<LearningPath[] | null>(null)

  useEffect(() => {
    let alive = true

    import('@/data/learning-paths')
      .then(module => {
        if (!alive) return
        setPaths(module.learningPaths)
      })
      .catch(() => {
        if (!alive) return
        setPaths([])
      })

    return () => {
      alive = false
    }
  }, [])

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

      {paths === null ? (
        <section className='mt-6'>
          <LearningPanelSkeleton />
        </section>
      ) : (
        <section className='mt-6 grid gap-5'>
          {paths.map(path => (
            <PathCard key={path.id} path={path} />
          ))}
        </section>
      )}
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
