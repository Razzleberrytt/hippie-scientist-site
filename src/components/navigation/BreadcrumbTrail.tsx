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
    <nav aria-label='Breadcrumb' className={className.trim()}>
      <ol className='flex flex-wrap items-center'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className='inline-flex items-center'>
              {item.to && !isLast ? (
                <Link to={item.to} className='text-xs text-white/45 transition-colors hover:text-white/80'>
                  {item.label}
                </Link>
              ) : (
                <span className='text-xs font-medium text-white/80'>{item.label}</span>
              )}

              {!isLast && (
                <span aria-hidden='true' className='mx-1.5 text-white/25'>
                  /
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
