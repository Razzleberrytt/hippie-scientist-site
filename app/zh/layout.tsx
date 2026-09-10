import type { ReactNode } from 'react'

export default function ChineseLayout({ children }: { children: ReactNode }) {
  return <div lang='zh-CN' dir='ltr' data-locale='zh-CN'>{children}</div>
}
