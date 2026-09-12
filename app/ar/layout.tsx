import type { ReactNode } from 'react'

export default function ArabicLayout({ children }: { children: ReactNode }) {
  return <div lang='ar' dir='rtl' data-locale='ar'>{children}</div>
}
