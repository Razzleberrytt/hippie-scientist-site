import { Link } from "react-router-dom";
import HeaderNav from "./HeaderNav";

type Props = { subtleOnHome?: boolean };

export default function SiteHeader({ subtleOnHome = false }: Props) {
  return (
    <header className="safe-top sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3 text-white"
          aria-label="The Hippie Scientist"
        >
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow" aria-hidden />
          <span className="font-semibold tracking-wide">THS</span>
          <span className={subtleOnHome ? "sr-only" : "text-white/70"}>
            The Hippie Scientist
          </span>
        </Link>
        <div className="ml-auto min-w-0 flex-1">
          <HeaderNav />
        </div>
      </div>
    </header>
  );
}
