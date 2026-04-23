import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'

type GoalPageRecord = {
  routeKey: string
  title: string
  summary?: string
  description?: string
}

export default function GoalPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [records, setRecords] = useState<GoalPageRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/data/goal-pages.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load goal pages')
        return response.json()
      })
      .then((rows: GoalPageRecord[]) => {
        if (cancelled) return
        setRecords(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (cancelled) return
        setRecords([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const normalizedSlug = String(slug || '').trim().toLowerCase()
  const goalPage = useMemo(
    () => records.find(item => String(item.routeKey || '').trim().toLowerCase() === normalizedSlug),
    [records, normalizedSlug],
  )

  if (loading) {
    return <main className='container-page py-8 text-white/80'>Loading goal page…</main>
  }

  if (!goalPage) {
    return (
      <main className='container-page py-8 text-white/80'>
        <Meta
          title='Goal page not found | The Hippie Scientist'
          description='Requested goal page does not exist.'
          path={`/goals/${normalizedSlug}`}
          noindex
        />
        <p>Goal page not found.</p>
        <Link to={`/herbs-for-${encodeURIComponent(normalizedSlug)}`} className='btn-secondary mt-4 inline-flex'>
          Try herbs-for-{normalizedSlug}
        </Link>
      </main>
    )
  }

  return (
    <main className='container-page py-8'>
      <Meta
        title={`${goalPage.title} | The Hippie Scientist`}
        description={goalPage.summary || goalPage.description || `${goalPage.title} guidance and references.`}
        path={`/goals/${goalPage.routeKey}`}
      />
      <section className='ds-card-lg'>
        <p className='text-xs uppercase tracking-wide text-white/60'>Goal page</p>
        <h1 className='mt-2 text-3xl font-semibold text-white'>{goalPage.title}</h1>
        {goalPage.summary ? <p className='mt-3 text-sm text-white/80'>{goalPage.summary}</p> : null}
      </section>
      {goalPage.description ? (
        <section className='ds-card mt-5'>
          <p className='text-sm leading-7 text-white/80'>{goalPage.description}</p>
        </section>
      ) : null}
      <section className='ds-card mt-5'>
        <Link to={`/herbs-for-${encodeURIComponent(goalPage.routeKey)}`} className='btn-secondary inline-flex'>
          Browse herbs for this goal
        </Link>
      </section>
    </main>
  )
}
