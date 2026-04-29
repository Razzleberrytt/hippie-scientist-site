"use client";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ClassNameValue = string | ((args: { isActive: boolean }) => string | undefined);

type BaseCompatProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className"
> & {
  to?: NextLinkProps["href"];
  href?: NextLinkProps["href"];
  className?: ClassNameValue;
  children?: ReactNode;
};

function normalizePath(value: NextLinkProps["href"]): string {
  if (typeof value === "string") return value;
  return value.pathname ?? "";
}

export function RouterLink({ to, href, className, children, ...rest }: BaseCompatProps) {
  const pathname = usePathname() ?? "";
  const destination = href ?? to ?? "#";
  const destinationPath = normalizePath(destination);
  const isActive =
    !!destinationPath &&
    (pathname === destinationPath || pathname.startsWith(`${destinationPath}/`));
  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <NextLink href={destination} className={resolvedClassName} {...rest}>
      {children}
    </NextLink>
  );
}

export const Link = RouterLink;
export const NavLink = RouterLink;
export const LinkCompat = RouterLink;

export function useNavigate() {
  const router = useRouter();
  return (to: string) => router.push(to);
}

export function useLocation() {
  const pathname = usePathname() ?? "";
  const searchParams = useNextSearchParams();
  const search = searchParams.toString();
  return { pathname, search: search ? `?${search}` : "" };
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams) => void] {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const params = useNextSearchParams();
  const mutable = new URLSearchParams(params.toString());

  const setSearchParams = (next: URLSearchParams) => {
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return [mutable, setSearchParams];
}
