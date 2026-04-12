import { Link } from 'react-router-dom'

type BreadcrumbItem = {
  label: string
  to?: string
}

type BreadcrumbTrailProps = {
  items: BreadcrumbItem[]
  className?: string
}

export default function BreadcrumbTrail({ items, className = '' }: BreadcrumbTrailProps) {
  if (!items.length) return null

  return (
    <nav
      aria-label='Breadcrumb'
      className={`mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 ${className}`.trim()}
    >
      <ol className='flex flex-wrap items-center gap-1.5'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className='inline-flex items-center gap-1.5'>
              {item.to && !isLast ? (
                <Link to={item.to} className='hover:text-white'>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-white/90' : ''}>{item.label}</span>
              )}
              {!isLast && <span aria-hidden='true'>/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
