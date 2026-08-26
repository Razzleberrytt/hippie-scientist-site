import type { ReactNode } from 'react'

export default function JapaneseLayout({ children }: { children: ReactNode }) {
  return <div lang='ja' dir='ltr' data-locale='ja'>{children}</div>
}
