import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

type Props = { to: string; children: React.ReactNode; className?: string };

export default function NavLink({ to, children, className }: Props) {
  const { pathname, hash } = useLocation();
  const isActive = pathname === to || `#${pathname}` === to || hash === to;

  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={clsx(
        "px-3 py-1.5 rounded-lg text-sm font-medium",
        "text-white/80 hover:text-white",
        "border border-white/10 hover:border-white/20",
        "bg-transparent hover:bg-white/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-0",
        "transition-colors",
        isActive && "text-white border-white/25 bg-white/5",
        className,
      )}
    >
      {children}
    </Link>
  );
}
