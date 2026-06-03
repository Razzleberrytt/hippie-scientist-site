import { PropsWithChildren } from 'react'

type SiteLayoutProps = PropsWithChildren<{
  ambientEnabled?: boolean
}>

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className='relative isolate min-h-svh overflow-x-hidden bg-[var(--bg)]'>
      <div className='relative z-10 flex min-h-svh flex-col'>{children}</div>
    </div>
  )
}
