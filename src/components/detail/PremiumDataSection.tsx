import { Link } from '@/lib/router-compat'

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

function isEvidenceDetail(title: string) {
  return title.trim().toLowerCase() === 'evidence level'
}

export default function PremiumDataSection({
  details = [],
  relationGroups = [],
}: PremiumDataSectionProps) {
  const visibleDetails = details
    .map(detail => ({
      ...detail,
      title: detail.title.trim(),
      value: detail.value.trim(),
    }))
    .filter(detail => detail.value)
  const visibleRelationGroups = relationGroups
    .map(group => ({
      ...group,
      items: Array.from(
        new Map(
          group.items
            .map(item => ({ ...item, label: item.label.trim(), to: item.to?.trim() }))
            .filter(item => item.label)
            .map(item => [
              `${item.label.toLowerCase()}|${(item.to || '').toLowerCase()}`,
              item,
            ]),
        ).values(),
      ),
    }))
    .filter(group => group.items.length > 0)

  if (!visibleDetails.length && !visibleRelationGroups.length) return null

  return (
    <section className='mt-8 rounded-[28px] border border-white/10 bg-white/[0.045] px-5 py-5 shadow-[0_18px_50px_rgba(8,12,20,0.22)] backdrop-blur-sm sm:px-6 sm:py-6'>
      <div className='max-w-2xl'>
        <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48'>
          Premium Profile
        </p>
        <h2 className='mt-2 text-lg font-semibold tracking-tight text-white/96 sm:text-xl'>
          Structured insights from available data
        </h2>
      </div>

      {visibleDetails.length > 0 && (
        <div className='mt-5 grid gap-3 sm:grid-cols-2'>
          {visibleDetails.map(detail => (
            <div
              key={detail.title}
              className='flex min-h-[124px] flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4'
            >
              <div className='flex items-start justify-between gap-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-white/48'>
                  {detail.title}
                </p>
                {isEvidenceDetail(detail.title) && (
                  <span className='inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/90'>
                    Evidence
                  </span>
                )}
              </div>
              {isEvidenceDetail(detail.title) ? (
                <div className='mt-4'>
                  <span className='inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-white/92'>
                    {detail.value}
                  </span>
                </div>
              ) : (
                <p className='mt-4 max-w-prose text-sm leading-6 text-white/84 sm:text-[15px]'>
                  {detail.value}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {visibleRelationGroups.length > 0 && (
        <div className='mt-5 space-y-3'>
          {visibleRelationGroups.map(group => (
            <div
              key={group.title}
              className='rounded-2xl border border-white/8 bg-black/10 px-4 py-4'
            >
              <h3 className='text-[11px] font-semibold uppercase tracking-[0.16em] text-white/52'>
                {group.title}
              </h3>
              <div className='mt-3 flex flex-wrap gap-2.5'>
                {group.items.map(item =>
                  item.to ? (
                    <Link
                      key={`${group.title}-${item.label}`}
                      to={item.to}
                      className='inline-flex items-center rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-medium tracking-[0.01em] text-white/86 transition duration-200 hover:border-white/24 hover:bg-white/[0.085] hover:text-white'
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      key={`${group.title}-${item.label}`}
                      className='inline-flex items-center rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-medium tracking-[0.01em] text-white/82'
                    >
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
