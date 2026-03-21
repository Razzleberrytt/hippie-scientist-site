import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'

const variantClasses: Record<'default' | 'primary' | 'ghost', string> = {
  default: 'btn',
  primary: 'btn btn-primary',
  ghost: 'btn btn-ghost',
}

type ButtonProps = {
  children: ReactNode
  variant?: 'default' | 'primary' | 'ghost'
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const MotionButton = motion.button

export function Button({ children, variant = 'default', className = '', ...props }: ButtonProps) {
  return (
    <MotionButton
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -1 }}
      className={`${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </MotionButton>
  )
}
