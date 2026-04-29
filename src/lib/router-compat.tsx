"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type LinkClassName =
  | string
  | ((args: { isActive: boolean }) => string | undefined);

type RouterLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className"
> & {
  to: string;
  className?: LinkClassName;
  children?: ReactNode;
};

export function RouterLink({
  to,
  className,
  children,
  ...rest
}: RouterLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === to || pathname.startsWith(`${to}/`);

  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <Link href={to} className={resolvedClassName} {...rest}>
      {children}
    </Link>
  );
}

export const NavLink = RouterLink;
export const LinkCompat = RouterLink;
