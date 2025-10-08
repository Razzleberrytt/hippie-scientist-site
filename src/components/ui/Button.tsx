import type { ButtonHTMLAttributes, ReactNode } from 'react';

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

export function Button({ children, variant = 'default', className = '', ...props }: ButtonProps) {
  return (
    <button className={`${variantClasses[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
