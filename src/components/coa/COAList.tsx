import COACard from '@/components/coa/COACard'
import type { COADocument } from '@/types/coa'

type COAListProps = {
  entries: COADocument[]
  title?: string
}

export default function COAList({ entries, title = 'COA verification' }: COAListProps) {
  return (
    <section className='space-y-4' aria-label={title}>
      <div>
        <p className='eyebrow-label'>Trust infrastructure</p>
        <h2 className='text-2xl font-semibold tracking-tight text-ink'>{title}</h2>
      </div>
      <div className='grid gap-4'>
        {entries.map((entry) => (
          <COACard key={entry.id} coa={entry} />
        ))}
      </div>
    </section>
  )
}
