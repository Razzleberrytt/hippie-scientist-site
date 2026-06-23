import type { ReactNode } from 'react'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

type EducationPageLayoutProps = {
  title: string
  description?: string
  breadcrumb?: string
  children: ReactNode
}

export default function EducationPageLayout({
  title,
  description,
  breadcrumb,
  children,
}: EducationPageLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 lg:py-16">
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: breadcrumb || title },
        ]}
      />
      <header className="mt-6 max-w-3xl space-y-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-base leading-7 text-muted sm:text-lg">{description}</p>
        )}
      </header>
      <div className="mt-10 space-y-12">{children}</div>
    </div>
  )
}
