import Link from 'next/link'
import type { ReactNode } from 'react'

type AffiliateLinkProps = {
  href: string
  children: ReactNode
  affiliate?: boolean
  merchant?: string
  className?: string
}

const isExternal = (href: string): boolean => /^https?:\/\//i.test(href)

export function AffiliateLink({
  href,
  children,
  affiliate = false,
  merchant,
  className = '',
}: AffiliateLinkProps) {
  const isValid = typeof href === 'string' && (href.startsWith('/') || href.startsWith('http://') || href.startsWith('https://'))

  if (!isValid) {
    return (
      <span className={`${className} cursor-not-allowed opacity-60`} title="Link unavailable">
        {children}
      </span>
    )
  }

  if (!isExternal(href)) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }

  const rel = affiliate
    ? 'sponsored nofollow noopener noreferrer'
    : 'noopener noreferrer'

  return (
    <span className='inline-flex flex-col items-start gap-1'>
      <a href={href} target='_blank' rel={rel} className={className}>
        {children}
      </a>
      {affiliate ? (
        <span className='text-[11px] font-medium uppercase tracking-[0.14em] text-muted'>
          Affiliate link{merchant ? ` · ${merchant}` : ''}
        </span>
      ) : null}
    </span>
  )
}
