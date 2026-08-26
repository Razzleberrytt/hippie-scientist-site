import type { ReactNode } from 'react'

export default function PolishLayout({ children }: { children: ReactNode }) {
  return <div lang='pl' dir='ltr' data-locale='pl'>{children}</div>
}
