import type { ReactNode } from 'react'
import '../../styles/profile-premium.css'

export default function HerbsLayout({ children }: { children: ReactNode }) {
  return <div className="profile-route-theme profile-route-theme--herbs">{children}</div>
}
