import type { ReactNode } from 'react'

export default function SpanishLayout({ children }: { children: ReactNode }) {
  return (
    <div lang='es' dir='ltr' data-locale='es'>
      {children}
    </div>
  )
}
