import Meta from "../components/Meta";
import { useTrippy } from "../lib/trippy";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

export default function Theme() {
  const { trippy, setTrippy, enabled } = useTrippy();
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
              aria-pressed={trippy}
              aria-label="Toggle trippy mode"
              disabled={!enabled}
              onClick={() => setTrippy(!trippy)}
              className={clsx(
                "pill relative",
                !enabled && "cursor-not-allowed opacity-50",
                trippy && "ring-1 ring-emerald-400/40",
              )}
            >
              <Sparkles className="mr-1 h-4 w-4" aria-hidden />
              Trippy {trippy ? "On" : "Off"}
              <span
                className={clsx(
                  "pointer-events-none absolute -inset-4 rounded-full blur-2xl",
                  trippy ? "bg-emerald-500/10" : "hidden",
                )}
              />
            </button>
            <p className="text-sm text-zinc-300/80">
              {enabled
                ? "We remember your choice on this device, so the effects stay just how you like them."
                : "Trippy mode stays off automatically because your device prefers reduced motion."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
