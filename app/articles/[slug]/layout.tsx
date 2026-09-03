import type { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
  params: Promise<{ slug: string }>
}

export default function ArticleLayout({ children }: LayoutProps) {
  return children
}
