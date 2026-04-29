"use client";

import LinkNext from "next/link";
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
  href?: string;
  className?: LinkClassName;
  children?: ReactNode;
};

export function RouterLink({
  to,
  href,
  className,
  children,
  ...rest
}: RouterLinkProps) {
  const pathname = usePathname();
  const destination = href ?? to;

  const isActive =
    pathname === destination || pathname.startsWith(`${destination}/`);

  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <LinkNext href={destination} className={resolvedClassName} {...rest}>
      {children}
    </LinkNext>
  );
}

export const Link = RouterLink;
export const NavLink = RouterLink;
export const LinkCompat = RouterLink;
