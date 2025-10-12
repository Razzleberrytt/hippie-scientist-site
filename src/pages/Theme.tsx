import Meta from "../components/Meta";
import { useTrippy } from "@/lib/trippy";
import MeltToggle from "@/components/MeltToggle";

export default function Theme() {
  const { level, enabled } = useTrippy();
  const active = level === "melt";
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
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-zinc-300/80">Toggle the Melt background to let the aurora flow across the site:</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MeltToggle />
            <p className="text-sm text-zinc-300/80">
              {enabled
                ? active
                  ? "Melt is on. We’ll remember this choice on this device."
                  : "Melt is off. Turn it back on anytime for full vibes."
                : "Melt stays off automatically because your device prefers reduced motion."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
