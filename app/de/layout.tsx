import type { ReactNode } from 'react'

export default function GermanLayout({ children }: { children: ReactNode }) {
  return (
    <div lang='de' dir='ltr' data-locale='de'>
      {children}
    </div>
  )
}
