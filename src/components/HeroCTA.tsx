import { Link } from "react-router-dom";
import clsx from "clsx";

const baseButton =
  "grid place-items-center rounded-full px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 sm:text-base";

export default function HeroCTA() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        to="/herbs"
        className={clsx(
          baseButton,
          "bg-emerald-500/90 text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400/90",
        )}
      >
        🌿 Browse Herbs
      </Link>
      <Link
        to="/build"
        className={clsx(
          baseButton,
          "border border-white/15 bg-white/20 text-white/90 backdrop-blur hover:border-white/30 hover:bg-white/25",
        )}
      >
        🧪 Build a Blend
      </Link>
    </div>
  );
}
