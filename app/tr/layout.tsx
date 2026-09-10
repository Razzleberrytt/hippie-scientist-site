import type { ReactNode } from 'react'

export default function TurkishLayout({ children }: { children: ReactNode }) {
  return <div lang='tr' dir='ltr' data-locale='tr'>{children}</div>
}
