'use client'

import Link, { type LinkProps } from 'next/link'
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation'
import React, { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react'

type To = string

type RouterLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'> & {
  className?: string
  to: To
  replace?: boolean
  prefetch?: LinkProps['prefetch']
  children?: ReactNode
}

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(function RouterLink(
  { to, children, replace, prefetch, ...rest },
  ref,
) {
  return (
    <Link ref={ref} href={to} replace={replace} prefetch={prefetch} {...rest}>
      {children}
    </Link>
  )
})

export { RouterLink as Link }

export function NavLink({
  to,
  className,
  children,
  ...rest
}: RouterLinkProps & {
  className?: string | ((args: { isActive: boolean }) => string)
}) {
  const pathname = usePathname() ?? ''
  const isActive = pathname === to
  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className

  return (
    <RouterLink to={to} className={resolvedClassName} {...rest}>
      {children}
    </RouterLink>
  )
}

export function useLocation() {
  const pathname = usePathname() ?? '/'
  const searchParams = useNextSearchParams()
  const search = searchParams.toString()
  return {
    pathname,
    search: search ? `?${search}` : '',
    hash: '',
  }
}

export function useNavigate() {
  const router = useRouter()
  return (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(to)
      return
    }
    router.push(to)
  }
}

export function useSearchParams() {
  const params = useNextSearchParams()
  const setParams = (_next: URLSearchParams | string) => {
    // no-op compatibility shim for legacy components
  }
  return [params, setParams] as const
}
