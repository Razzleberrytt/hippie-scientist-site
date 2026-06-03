import { useState } from 'react'
import { trackEvent } from '@/lib/growth'
import { Button } from '@/components/ui/Button'

type ShareInsightCardProps = {
  title: string
  insight: string
  kind: 'herb' | 'compound'
  slug: string
}

export default function ShareInsightCard({ title, insight, kind, slug }: ShareInsightCardProps) {
  const [open, setOpen] = useState(false)

  const copyLink = async () => {
    const url = `${window.location.origin}${kind === 'herb' ? '/herbs' : '/compounds'}/${slug}`
    await navigator.clipboard.writeText(url)
    trackEvent('detail_click', { kind, slug, action: 'copy_link' })
  }

  return (
    <div className='mt-3 flex flex-wrap gap-2'>
      <Button variant='secondary' onClick={() => setOpen(value => !value)}>
        Share insight
      </Button>
      <Button variant='ghost' className='text-sm' onClick={copyLink}>
        Copy link
      </Button>
      {open && (
        <article className='w-full max-w-xl rounded-2xl border border-white/20 bg-black/45 p-4'>
          <p className='text-xs uppercase tracking-[0.16em] text-emerald-200/80'>
            Hippie Scientist
          </p>
          <h3 className='mt-1 text-lg font-semibold text-white'>{title}</h3>
          <p className='mt-2 text-sm leading-7 text-white/80'>{insight}</p>
        </article>
      )}
    </div>
  )
}
