import React from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

const CardShell: React.FC<Props> = ({ children, className }) => (
  <div
    className={`relative rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] p-4 ${className ?? ''}`}
  >
    {children}
  </div>
)

export default CardShell
