import type { ReactNode } from 'react'

export default function FrenchLayout({ children }: { children: ReactNode }) {
  return (
    <div lang='fr' dir='ltr' data-locale='fr'>
      {children}
    </div>
  )
}
