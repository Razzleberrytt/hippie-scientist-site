import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import ResultsSummaryCard from '@/components/ResultsSummaryCard'
import Meta from '@/components/Meta'

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
    <main className='container space-y-8 py-8 sm:py-10'>
      <Meta
        title='Starter Pack Confirmation | The Hippie Scientist'
        description='Starter pack confirmation and next steps.'
        path='/starter-pack-success'
        noindex
      />
      <section className='border-white/12 from-lime-400/14 rounded-3xl border bg-gradient-to-br via-black/40 to-lime-400/5 p-5 shadow-[0_0_0_1px_rgba(163,230,53,0.07),0_18px_38px_-22px_rgba(163,230,53,0.7)] sm:p-7'>
        <p className='text-xs uppercase tracking-[0.3em] text-white/60'>Starter Pack</p>
        <h1 className='h1-grad mt-2 text-3xl font-semibold md:text-4xl'>You&apos;re in.</h1>
        <p className='mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base'>
          Your Starter Pack is on the way. Here&apos;s what to do next.
        </p>

        <div className='mt-5 grid gap-3'>
          {CHECKLIST_ITEMS.map((item, index) => (
            <div
              key={item}
              className='border-white/15/80 bg-white/[0.04]/70 flex items-start gap-3 rounded-xl border p-3.5'
            >
              <span className='mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-sm font-semibold text-lime-300'>
                {index + 1}
              </span>
              <p className='text-sm text-white'>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='grid gap-5 lg:grid-cols-[1.25fr_1fr]'>
        <Card className='border-white/15/80 space-y-4 bg-black/25 p-5 sm:p-6'>
          <h2 className='text-lg font-semibold text-white'>Your saved blend</h2>

          {hasSavedBlend ? (
            <ResultsSummaryCard
              goal={savedBlend?.goal ?? 'Not set yet'}
              blendName={savedBlend?.blendName ?? 'Starter recommendation'}
              herbs={savedBlend?.herbs ?? []}
              explanation='Saved handoff from your recent Starter Pack recommendation.'
              variant='expanded'
            />
          ) : (
            <div className='border-white/15/80 bg-white/[0.04]/65 rounded-xl border p-3.5'>
              <p className='text-sm text-white/60'>
                No saved blend found yet. Pick a goal and get your Starter Pack to see your
                personalized handoff details here.
              </p>
            </div>
          )}

          <div className='flex flex-col gap-2.5 pt-1 sm:flex-row'>
            <Link
              to='/herbs'
              className='btn justify-center border border-lime-400/35 bg-lime-400/20 text-lime-300 hover:bg-lime-400/30'
            >
              Explore These Herbs
            </Link>
            <Link to='/build' className='btn justify-center'>
              Build Another Blend
            </Link>
          </div>
        </Card>

        <Card className='border-white/15/80 space-y-3.5 bg-black/25 p-5 sm:p-6'>
          <h2 className='text-lg font-semibold text-white'>What you&apos;ll get</h2>
          <ul className='space-y-2'>
            {includedItems.map(item => (
              <li
                key={item}
                className='border-white/15/80 bg-white/[0.04]/65 rounded-lg border px-3 py-2 text-sm text-white/60'
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
