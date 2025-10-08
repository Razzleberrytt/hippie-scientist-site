import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

const variantClasses: Record<'default' | 'primary' | 'ghost', string> = {
  default: 'btn',
  primary: 'btn btn-primary',
  ghost: 'btn bg-transparent border-transparent hover:bg-white/5',
};

type ButtonProps = {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'ghost';
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const MotionButton = motion.button;

export function Button({ children, variant = 'default', className = '', ...props }: ButtonProps) {
  return (
    <MotionButton
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={`${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </MotionButton>
  );
}
