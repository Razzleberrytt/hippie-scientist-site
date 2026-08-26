import type { ReactNode } from 'react'

export default function DutchLayout({ children }: { children: ReactNode }) {
  return <div lang='nl' dir='ltr' data-locale='nl'>{children}</div>
}
