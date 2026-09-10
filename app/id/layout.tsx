import type { ReactNode } from 'react'

export default function IndonesianLayout({ children }: { children: ReactNode }) {
  return <div lang='id' dir='ltr' data-locale='id'>{children}</div>
}
