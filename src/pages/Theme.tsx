import Meta from "../components/Meta";
import { TRIPPY_LABELS, nextTrippyLevel, useTrippy } from "@/lib/trippy";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

export default function Theme() {
  const { level, setLevel, enabled } = useTrippy();
  const active = level !== "off";
  const cycleLevel = () => setLevel(nextTrippyLevel(level));
  return (
    <>
      <Meta title="Theme Lab | The Hippie Scientist" description="Adjust the site appearance to match your vibe." path="/theme" />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-6 md:pt-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-white/90 md:text-5xl">Theme Lab</h1>
          <p className="max-w-2xl text-base text-zinc-300/80 md:text-lg">
            Experiment with color schemes and appearance settings to personalize The Hippie Scientist.
          </p>
        </header>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <p className="text-sm text-zinc-300/80">Toggle the visual flourishes that give the site its dreamy vibe:</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-pressed={active}
              aria-label={`Trippy mode: ${TRIPPY_LABELS[level]}. Tap to change.`}
              disabled={!enabled}
              onClick={cycleLevel}
              className={clsx(
                "pill relative",
                !enabled && "cursor-not-allowed opacity-50",
                active && "ring-1 ring-emerald-400/40",
              )}
            >
              <Sparkles className="mr-1 h-4 w-4" aria-hidden />
              {TRIPPY_LABELS[level]}
              <span
                className={clsx(
                  "pointer-events-none absolute -inset-4 rounded-full blur-2xl",
                  active ? "bg-emerald-500/10" : "hidden",
                )}
              />
            </button>
            <p className="text-sm text-zinc-300/80">
              {enabled
                ? `Current vibe: ${TRIPPY_LABELS[level]}. We remember your choice on this device, so the effects stay just how you like them.`
                : "Trippy mode stays off automatically because your device prefers reduced motion."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
