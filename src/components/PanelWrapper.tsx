import React from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

const PanelWrapper: React.FC<Props> = ({ children, className }) => (
  <section
    className={`neon-card soft-border-glow relative my-12 overflow-hidden rounded-xl p-6 ${className ?? ''}`}
  >
    <div className='via-lichen/30 absolute inset-x-0 top-0 h-px animate-pulse bg-gradient-to-r from-transparent to-transparent' />
    {children}
    <div className='via-comet/30 absolute inset-x-0 bottom-0 h-px animate-pulse bg-gradient-to-r from-transparent to-transparent' />
  </section>
)

export default PanelWrapper
