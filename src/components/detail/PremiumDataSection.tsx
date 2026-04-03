import { Link } from 'react-router-dom'

type PremiumDetail = {
  title: string
  value: string
}

type PremiumRelation = {
  label: string
  to?: string
}

type PremiumRelationGroup = {
  title: string
  items: PremiumRelation[]
}

type PremiumDataSectionProps = {
  details?: PremiumDetail[]
  relationGroups?: PremiumRelationGroup[]
}

export default function PremiumDataSection({
  details = [],
  relationGroups = [],
}: PremiumDataSectionProps) {
  const visibleDetails = details.filter(detail => detail.value.trim())
  const visibleRelationGroups = relationGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.label.trim()),
    }))
    .filter(group => group.items.length > 0)

  if (!visibleDetails.length && !visibleRelationGroups.length) return null

  return (
    <section className='border-white/8 mt-6 border-t pt-5'>
      <h2 className='mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
        Premium Profile
      </h2>

      {visibleDetails.length > 0 && (
        <div className='grid gap-3 sm:grid-cols-2'>
          {visibleDetails.map(detail => (
            <div
              key={detail.title}
              className='rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3'
            >
              <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45'>
                {detail.title}
              </p>
              <p className='mt-2 text-sm leading-relaxed text-white/88'>{detail.value}</p>
            </div>
          ))}
        </div>
      )}

      {visibleRelationGroups.length > 0 && (
        <div className='mt-4 space-y-4'>
          {visibleRelationGroups.map(group => (
            <div key={group.title}>
              <h3 className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55'>
                {group.title}
              </h3>
              <div className='flex flex-wrap gap-2'>
                {group.items.map(item =>
                  item.to ? (
                    <Link
                      key={`${group.title}-${item.label}`}
                      to={item.to}
                      className='ds-pill transition hover:border-white/30'
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span key={`${group.title}-${item.label}`} className='ds-pill'>
                      {item.label}
                    </span>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
