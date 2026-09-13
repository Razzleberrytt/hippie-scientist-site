import type { ReactNode } from 'react'

export default function SwedishLayout({ children }: { children: ReactNode }) {
  return <div lang='sv' dir='ltr' data-locale='sv'>{children}</div>
}
