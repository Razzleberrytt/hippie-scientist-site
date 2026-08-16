import type { ReactNode } from 'react'

export default function PortugueseLayout({ children }: { children: ReactNode }) {
  return (
    <div lang='pt-BR' dir='ltr' data-locale='pt-BR'>
      {children}
    </div>
  )
}
