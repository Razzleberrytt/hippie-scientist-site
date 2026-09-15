import type { ReactNode } from 'react'
import '../../styles/profile-premium.css'

export default function CompoundsLayout({ children }: { children: ReactNode }) {
  return <div className="profile-route-theme profile-route-theme--compounds">{children}</div>
}
