import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'

type GoalPageRecord = {
  slug?: string
  title?: string
  summary?: string
}

function toTitleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function GoalProfilePage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const goalSlug = String(slug || '').trim().toLowerCase()
  const [goalRecord, setGoalRecord] = useState<GoalPageRecord | null>(null)

  useEffect(() => {
    let active = true

    if (!goalSlug) {
      setGoalRecord(null)
      return () => {
        active = false
      }
    }

    const loadGoalRecord = async () => {
      try {
        const response = await fetch('/data/goal-pages.json')
        if (!response.ok) return

        const payload: unknown = await response.json()
        if (!Array.isArray(payload)) return

        const match = payload.find(item => {
          if (!item || typeof item !== 'object') return false
          const candidate = (item as { slug?: unknown }).slug
          return typeof candidate === 'string' && candidate.trim().toLowerCase() === goalSlug
        })

        if (!active) return

        if (match && typeof match === 'object') {
          setGoalRecord(match as GoalPageRecord)
        } else {
          setGoalRecord(null)
        }
      } catch {
        if (active) setGoalRecord(null)
      }
    }

    loadGoalRecord()

    return () => {
      active = false
    }
  }, [goalSlug])

  const fallbackTitle = useMemo(() => toTitleCase(goalSlug), [goalSlug])
  const heading = goalRecord?.title?.trim() || fallbackTitle || 'Goal'
  const summary = goalRecord?.summary?.trim() || 'Goal profile pending review.'

  return (
    <main className='container-page py-8'>
      <Meta
        title={`${heading} Goal | The Hippie Scientist`}
        description='Goal profile pending review.'
        path={goalSlug ? `/goals/${goalSlug}` : '/goals'}
      />

      <section className='ds-card-lg'>
        <h1 className='text-3xl font-semibold text-white'>{heading}</h1>
        <p className='mt-3 text-sm text-white/80'>{summary}</p>

        <div className='mt-5 flex flex-wrap gap-2'>
          {goalSlug ? (
            <Link
              to={`/herbs-for-${encodeURIComponent(goalSlug)}`}
              className='rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 transition hover:border-cyan-300/50 hover:text-cyan-100'
            >
              Browse herbs for this goal
            </Link>
          ) : null}
          <Link
            to='/learning'
            className='rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 transition hover:border-cyan-300/50 hover:text-cyan-100'
          >
            Explore learning paths
          </Link>
        </div>
      </section>
    </main>
  )
}
