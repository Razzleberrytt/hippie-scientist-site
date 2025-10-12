import { useEffect, useState } from "react";
import clsx from "clsx";
import { Sparkles } from "lucide-react";
import { melt } from "@/state/melt";
import { useTrippy } from "@/lib/trippy";

type MeltToggleProps = {
  className?: string;
};

export default function MeltToggle({ className }: MeltToggleProps) {
  const [active, setActive] = useState(melt.enabled);
  const { enabled } = useTrippy();

  useEffect(() => melt.subscribe(setActive), []);

  return (
    <button
      type="button"
      onClick={() => melt.toggle()}
      aria-pressed={active}
      disabled={!enabled}
      title={active ? "Disable Melt" : "Enable Melt"}
      className={clsx(
        "pill border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10",
        active && "border-teal-200/60 bg-white/10 text-white",
        !enabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <Sparkles className="h-4 w-4" aria-hidden />
      {active ? "Melt" : "Melt Off"}
    </button>
  );
}

