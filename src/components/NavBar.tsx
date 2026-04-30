"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PUBLIC_ROUTES } from "@/lib/public-routes";

const linkBase =
  "rounded-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition";
const linkActive = "bg-white/10 text-white";

function navClass(pathname: string, href: string) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return `${linkBase} ${active ? linkActive : ""}`;
}

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        
        {/* Logo / Brand */}
        <Link href={PUBLIC_ROUTES.home} className="text-sm font-semibold tracking-wide text-white">
          The Hippie Scientist
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1.5 md:flex">
          <Link href={PUBLIC_ROUTES.herbs} className={navClass(pathname, PUBLIC_ROUTES.herbs)}>
            Herbs
          </Link>

          <Link href={PUBLIC_ROUTES.compounds} className={navClass(pathname, PUBLIC_ROUTES.compounds)}>
            Compounds
          </Link>

          <Link href={PUBLIC_ROUTES.blog} className={navClass(pathname, PUBLIC_ROUTES.blog)}>
            Blog
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Link
            href={PUBLIC_ROUTES.build}
            className="rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 transition"
          >
            Build a Blend
          </Link>
        </div>
      </div>
    </nav>
  );
}
