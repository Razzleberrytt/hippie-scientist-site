import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'

type LastSelectedBlend = {
  goal?: string
  blendName?: string
  herbs?: string[]
}

const CHECKLIST_ITEMS = [
  'Check your email for access details',
  'Save your recommended blend',
  'Explore the herbs in your stack',
]

const includedItems = ['Blend guide', 'Prep instructions', 'Beginner-friendly usage notes']

export default function StarterPackSuccess() {
  const [savedBlend, setSavedBlend] = useState<LastSelectedBlend | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem('hs_last_selected_blend')
      if (!raw) {
        setSavedBlend(null)
        return
      }

      const parsed = JSON.parse(raw) as LastSelectedBlend | null
      if (!parsed || typeof parsed !== 'object') {
        setSavedBlend(null)
        return
      }

      setSavedBlend({
        goal: typeof parsed.goal === 'string' ? parsed.goal : undefined,
        blendName: typeof parsed.blendName === 'string' ? parsed.blendName : undefined,
        herbs: Array.isArray(parsed.herbs)
          ? parsed.herbs.filter(herb => typeof herb === 'string')
          : [],
      })
    } catch {
      setSavedBlend(null)
    }
  }, [])

  const hasSavedBlend = useMemo(() => {
    if (!savedBlend) return false
    return Boolean(savedBlend.goal || savedBlend.blendName || savedBlend.herbs?.length)
  }, [savedBlend])

  return (
    <main className='container space-y-6 py-8'>
      <section className='border-border/80 from-brand-lime/12 via-panel to-brand-lime/5 rounded-2xl border bg-gradient-to-br p-5 shadow-[0_0_0_1px_rgba(163,230,53,0.05),0_16px_36px_-22px_rgba(163,230,53,0.7)] sm:p-6'>
        <p className='text-sub text-xs uppercase tracking-[0.3em]'>Starter Pack</p>
        <h1 className='h1-grad mt-2 text-3xl font-semibold md:text-4xl'>You&apos;re in.</h1>
        <p className='text-sub mt-3 max-w-2xl text-sm sm:text-base'>
          Your Starter Pack is on the way. Here&apos;s what to do next.
        </p>

        <div className='mt-5 grid gap-3'>
          {CHECKLIST_ITEMS.map((item, index) => (
            <div
              key={item}
              className='border-border/80 bg-panel/70 flex items-start gap-3 rounded-xl border p-3'
            >
              <span className='text-brand-lime bg-brand-lime/15 mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
                {index + 1}
              </span>
              <p className='text-text text-sm'>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-[1.25fr_1fr]'>
        <Card className='border-border/80 space-y-4 bg-black/25 p-4 sm:p-5'>
          <h2 className='text-text text-lg font-semibold'>Your saved blend</h2>

          {hasSavedBlend ? (
            <div className='space-y-3'>
              <div className='grid gap-2 sm:grid-cols-2'>
                <div className='border-border/80 bg-panel/65 rounded-lg border p-3'>
                  <p className='text-sub text-xs uppercase tracking-wide'>Goal</p>
                  <p className='text-text mt-1 text-sm font-medium'>
                    {savedBlend?.goal ?? 'Not set yet'}
                  </p>
                </div>
                <div className='border-border/80 bg-panel/65 rounded-lg border p-3'>
                  <p className='text-sub text-xs uppercase tracking-wide'>Blend name</p>
                  <p className='text-text mt-1 text-sm font-medium'>
                    {savedBlend?.blendName ?? 'Starter recommendation'}
                  </p>
                </div>
              </div>

              <div className='border-border/80 bg-panel/65 rounded-lg border p-3'>
                <p className='text-sub text-xs uppercase tracking-wide'>Herb list</p>
                {savedBlend?.herbs?.length ? (
                  <ul className='text-text mt-2 list-inside list-disc space-y-1 text-sm'>
                    {savedBlend.herbs.map(herb => (
                      <li key={herb}>{herb}</li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-sub mt-2 text-sm'>No herbs saved yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className='border-border/80 bg-panel/65 rounded-lg border p-3'>
              <p className='text-sub text-sm'>
                No saved blend found yet. Pick a goal and get your Starter Pack to see your
                personalized handoff details here.
              </p>
            </div>
          )}

          <div className='flex flex-col gap-2 pt-1 sm:flex-row'>
            <Link
              to='/herbs'
              className='btn border-brand-lime/35 bg-brand-lime/20 text-brand-lime hover:bg-brand-lime/30 justify-center border'
            >
              Explore These Herbs
            </Link>
            <Link to='/build' className='btn justify-center'>
              Build Another Blend
            </Link>
          </div>
        </Card>

        <Card className='border-border/80 space-y-3 bg-black/25 p-4 sm:p-5'>
          <h2 className='text-text text-lg font-semibold'>What you&apos;ll get</h2>
          <ul className='space-y-2'>
            {includedItems.map(item => (
              <li
                key={item}
                className='border-border/80 bg-panel/65 text-sub rounded-lg border px-3 py-2 text-sm'
              >
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </main>
  )
}
