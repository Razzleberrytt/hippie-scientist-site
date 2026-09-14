import type { ReactNode } from 'react'

export default function ThaiLayout({ children }: { children: ReactNode }) {
  return <div lang='th' dir='ltr' data-locale='th'>{children}</div>
}
