import type { InteractionCatalogItem } from './InteractionSearch'

type SelectedInteractionItemsProps = {
  items: InteractionCatalogItem[]
  onRemove: (id: string) => void
  maxSelection?: number
}

export default function SelectedInteractionItems({
  items,
  onRemove,
  maxSelection = 3,
}: SelectedInteractionItemsProps) {
  if (items.length === 0) {
    return (
      <p className='rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-3 text-sm text-white/65'>
        Select at least two items to compare.
      </p>
    )
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-xs uppercase tracking-[0.2em] text-white/60'>Selected</p>
        <p className='text-xs text-white/60'>
          {items.length === maxSelection
            ? `Max ${maxSelection} selected`
            : `${maxSelection - items.length} slot${maxSelection - items.length === 1 ? '' : 's'} left`}
        </p>
      </div>
      <div className='flex flex-wrap gap-2'>
        {items.map((item, index) => (
          <div
            key={item.id}
            className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-white/90'
          >
            <span className='rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/70'>
              {index + 1}
            </span>
            <span>{item.name}</span>
            <span className='text-[11px] uppercase tracking-wide text-white/60'>{item.kind}</span>
            <button
              type='button'
              className='rounded-full border border-white/20 px-1.5 text-xs text-white/75 transition hover:border-rose-400/50 hover:text-rose-200'
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
