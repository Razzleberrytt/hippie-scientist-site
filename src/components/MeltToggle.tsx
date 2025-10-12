import clsx from "clsx";
import { Sparkles } from "lucide-react";
import { useTrippy } from "@/lib/trippy";

type MeltToggleProps = {
  className?: string;
};

export default function MeltToggle({ className }: MeltToggleProps) {
  const { level, setLevel, enabled } = useTrippy();
  const active = level === "melt";

  const toggle = () => {
    if (!enabled) return;
    setLevel(active ? "off" : "melt");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      disabled={!enabled}
      title={active ? "Disable Melt" : "Enable Melt"}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
        "ring-1 ring-white/10 bg-white/5 hover:bg-white/10 text-white",
        !enabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <Sparkles className="h-4 w-4" aria-hidden />
      {active ? "Melt" : "Melt Off"}
    </button>
  );
}

