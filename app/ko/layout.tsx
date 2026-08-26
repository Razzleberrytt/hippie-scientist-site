import type { ReactNode } from 'react'

export default function KoreanLayout({ children }: { children: ReactNode }) {
  return <div lang='ko' dir='ltr' data-locale='ko'>{children}</div>
}
