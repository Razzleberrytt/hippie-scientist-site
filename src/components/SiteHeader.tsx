import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import NavLink from "./NavLink";
import ThemeMenu from "./ThemeMenu";
import Logo from "./Logo";
import { useIsHome } from "../lib/useIsHome";

const navLinks = [
  { to: "/database", label: "Browse" },
  { to: "/blend", label: "Build" },
  { to: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  const isHome = useIsHome();
  const ref = useRef<HTMLElement | null>(null);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const setVar = () => {
      const height = ref.current?.clientHeight ?? 56;
      document.documentElement.style.setProperty("--header-h", `${height}px`);
      document.documentElement.style.setProperty("--headerH", `${height}px`);
    };

    setVar();

    let observer: ResizeObserver | null = null;
    if (ref.current && "ResizeObserver" in window) {
      observer = new ResizeObserver(() => setVar());
      observer.observe(ref.current);
    }

    window.addEventListener("resize", setVar, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setCondensed(window.scrollY > 48);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const buttonSizing = condensed ? "h-8 px-2.5 text-sm" : "h-9 px-3 text-sm";

  return (
    <header
      ref={ref}
      data-condensed={condensed ? "true" : "false"}
      className="fixed inset-x-0 top-0 z-40 transition-all"
    >
      <div
        className={clsx(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6",
          condensed
            ? "border-b border-white/5 bg-surface/80 py-2 shadow-lg backdrop-blur-md sm:py-2.5"
            : "bg-transparent py-3 sm:py-3.5",
        )}
      >
        <Link
          to="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="The Hippie Scientist"
        >
          {isHome ? (
            <>
              <span
                aria-hidden
                className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-fuchsia-500 shadow-[0_10px_30px_-12px_rgba(56,189,248,0.7)]"
              />
              <span
                aria-hidden
                className="font-semibold tracking-[0.5em] text-sm uppercase text-white/90"
              >
                T&nbsp;H&nbsp;S
              </span>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span aria-hidden>
                <Logo size={32} className="drop-shadow-[0_0_14px_rgba(56,189,248,0.35)]" />
              </span>
              <span aria-hidden className="text-lg font-semibold text-white/90">
                The Hippie Scientist
              </span>
            </div>
          )}
          <span className="sr-only">The Hippie Scientist</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={buttonSizing}
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeMenu
            triggerClassName={buttonSizing}
          />
        </nav>
      </div>
    </header>
  );
}
