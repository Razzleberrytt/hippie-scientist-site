import type { ReactNode } from 'react'

export default function RussianLayout({ children }: { children: ReactNode }) {
  return <div lang='ru' dir='ltr' data-locale='ru'>{children}</div>
}
