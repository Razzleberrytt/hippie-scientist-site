import type { ReactNode } from 'react'

export default function ItalianLayout({ children }: { children: ReactNode }) {
  return <div lang='it' dir='ltr' data-locale='it'>{children}</div>
}
