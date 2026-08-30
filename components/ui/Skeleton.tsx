import type { HTMLAttributes } from 'react'

type SkeletonVariant = 'line' | 'block' | 'circle'

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SkeletonVariant
  className?: string
}

const variantClass: Record<SkeletonVariant, string> = {
  line: 'h-3 rounded-md',
  block: 'rounded-xl',
  circle: 'rounded-full',
}

export default function Skeleton({
  variant = 'block',
  className = '',
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-busy="true"
      className={`animate-pulse bg-brand-900/10 ${variantClass[variant]} ${className}`.trim()}
      {...props}
    />
  )
}