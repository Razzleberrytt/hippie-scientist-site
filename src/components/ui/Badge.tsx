import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  children: ReactNode;
  className?: string;
};

export default function Badge({ children, className = '', ...props }: BadgeProps) {
  const classes = className ? `badge ${className}` : 'badge';
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
