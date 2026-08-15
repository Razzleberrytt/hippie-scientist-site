import type { ReactNode } from 'react'

type EducationPageLayoutProps = {
  title: string
  description?: string
  breadcrumb?: string
  children: ReactNode
}

export default function EducationPageLayout({
  title,
  description,
  children,
}: EducationPageLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-6 sm:space-y-12 sm:py-10 lg:py-12">
      <header className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">Learning library</p>
        <h1 className="heading-premium mt-5 max-w-3xl">{title}</h1>
        {description ? (
          <p className="text-reading mt-4 max-w-3xl">{description}</p>
        ) : null}
      </header>
      <div className="space-y-12">{children}</div>
    </div>
  )
}
