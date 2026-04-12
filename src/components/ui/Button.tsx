import type { ReactNode } from 'react'
import { motion } from '@/lib/motion'
import type { HTMLMotionProps } from '@/lib/motion'

const variantClasses: Record<'default' | 'primary' | 'secondary' | 'ghost', string> = {
  default: 'btn',
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
}

type ButtonProps = {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'ghost'
  className?: string
} & Omit<HTMLMotionProps<'button'>, 'children' | 'className'>

const MotionButton = motion.button

export function Button({ children, variant = 'default', className = '', ...props }: ButtonProps) {
  return (
    <MotionButton
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -1, scale: 1.005 }}
      className={`${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </MotionButton>
  )
}
