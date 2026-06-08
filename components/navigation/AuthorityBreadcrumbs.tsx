import Link from 'next/link'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type AuthorityBreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export default function AuthorityBreadcrumbs({
  items,
}: AuthorityBreadcrumbsProps) {
  if (!items?.length) {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-[#5c6b63]"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-ink transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-ink' : ''}>
                {item.label}
              </span>
            )}

            {!isLast ? (
              <span aria-hidden="true" className="text-[#94a39a]">
                /
              </span>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}
