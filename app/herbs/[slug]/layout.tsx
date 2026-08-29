import type { ReactNode } from 'react'

import '@/styles/herb-profile-polish.css'

export default function HerbProfileLayout({ children }: { children: ReactNode }) {
  return <div data-profile-page>{children}</div>
}
