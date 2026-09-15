import type { ReactNode } from 'react'
import '../../styles/research-library-premium.css'

export default function ResearchLayout({ children }: { children: ReactNode }) {
  return <div className="research-route-theme">{children}</div>
}
