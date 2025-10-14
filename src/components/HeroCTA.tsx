import { Link } from "react-router-dom";

const baseButtonClasses =
  "flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export default function HeroCTA() {
  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/herbs"
          className={`${baseButtonClasses} bg-emerald-500/90 text-slate-950 hover:bg-emerald-400/90`}
        >
          🌿 Browse
        </Link>
        <Link
          to="/build"
          className={`${baseButtonClasses} bg-white/15 text-white/90 hover:bg-white/20`}
        >
          🧪 Build
        </Link>
      </div>
    </div>
  );
}
