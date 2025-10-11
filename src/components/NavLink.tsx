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
        "flex items-center justify-center rounded-xl text-sm font-medium",
        "border border-white/10 text-white/80 transition-colors hover:border-white/20 hover:text-white",
        "bg-transparent hover:bg-white/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0",
        isActive && "border-white/25 bg-white/5 text-white",
        className,
      )}
    >
      {children}
    </Link>
  );
}
