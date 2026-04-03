/**
 * CANONICAL HERB CARD
 *
 * This is the ONLY allowed herb card component.
 * Do NOT create variants.
 * Extend via props only.
 */
import { memo } from 'react'
import { Link } from 'react-router-dom'
import Card from './ui/Card'
import './HerbCard.css'

interface HerbCardProps {
  name: string
  summary: string
  tags?: string[]
  detailUrl: string
}

function HerbCard({ name, summary, tags = [], detailUrl }: HerbCardProps) {
  return (
    <div className='group relative h-full transition-transform duration-200 HerbCardTilt'>
      <div className='HerbCardGlow pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
      <Card className='card-pad relative flex h-full flex-col gap-4 transition-shadow duration-200 hover:shadow-glow'>
        <header className='space-y-1'>
          <h2 className='text-2xl font-semibold leading-tight text-lime-300'>{name}</h2>
        </header>

        <section className='space-y-3 text-white/80'>
          <p className='line-clamp-3 text-sm leading-6 text-white/85'>{summary}</p>
          <div className='flex flex-wrap gap-2'>
            {tags.map(tag => (
              <span
                key={tag}
                className='rounded-full border border-violet-300/35 bg-violet-500/15 px-2.5 py-1 text-xs text-violet-100'
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <footer className='mt-auto flex items-center justify-end pt-1 text-sm'>
          <Link
            to={detailUrl}
            className='rounded-md px-2 py-1 text-white/75 underline underline-offset-4 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300'
          >
            View details
          </Link>
        </footer>
      </Card>
    </div>
  )
}

export default memo(HerbCard)
