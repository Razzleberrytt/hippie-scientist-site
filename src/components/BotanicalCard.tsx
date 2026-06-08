import { Link } from '@/lib/router-compat'
import { type BotanicalCardProps } from '../types/botanical'

export default function BotanicalCard({ data }: BotanicalCardProps) {
  const { name, summary, effects, confidence, sourceLine, type, slug } = data
  const linkHref = type === 'herb' ? `/herbs/${slug}` : `/compounds/${slug}`

  return (
    <article className='group relative flex h-full flex-col gap-2.5 rounded-2xl border border-brand-900/10 bg-white/90 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300/30 hover:shadow-md'>
      <h3 className='line-clamp-2 min-h-[2rem] text-base font-semibold leading-tight text-slate-900'>
        {name}
      </h3>
      <p className='line-clamp-2 text-xs leading-relaxed text-slate-600'>
        {summary || 'No summary available.'}
      </p>
      <div className='flex flex-wrap gap-1.5'>
        <span className='inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600'>
          {confidence}
        </span>
        {effects.slice(0, 2).map((effect, idx) => (
          <span
            key={idx}
            className='inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700'
          >
            {effect}
          </span>
        ))}
      </div>
      {sourceLine && (
        <p className='line-clamp-1 text-[10px] text-slate-500'>
          {sourceLine}
        </p>
      )}
      <div className='mt-auto pt-3'>
        <Link
          to={linkHref}
          className='inline-flex w-full items-center justify-center rounded-lg bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100'
        >
          View Details
        </Link>
      </div>
    </article>
  )
}
