import { useEffect, useState } from "react";
import Meta from "../components/Meta";
import { useTrippy } from "@/lib/trippy";
import { melt, type MeltIntensity, type MeltPalette, type MeltSettings } from "@/state/melt";

export default function Theme() {
  const { enabled: motionEnabled } = useTrippy();
  const [settings, setSettings] = useState<MeltSettings>(() => ({
    enabled: melt.enabled,
    palette: melt.palette,
    intensity: melt.intensity,
  }));

  useEffect(() => {
    return melt.subscribeSettings((next) => {
      setSettings(next);
    });
  }, []);

  const toggle = () => melt.set(!settings.enabled);
  const selectPalette = (value: MeltPalette) => melt.setPalette(value);
  const selectIntensity = (value: MeltIntensity) => melt.setIntensity(value);

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
        <div className="mt-6 space-y-6 rounded-3xl bg-white/14 p-6 text-white ring-1 ring-white/12 shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              disabled={!motionEnabled}
              className="btn-secondary rounded-2xl px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {settings.enabled ? "Disable Melt" : "Enable Melt"}
            </button>
            <p className="text-sm text-zinc-300/80">
              {!motionEnabled
                ? "Melt stays off automatically because your device prefers reduced motion."
                : settings.enabled
                ? "Melt is on. Tap to pause the shader background."
                : "Melt is off. Re-enable it when you want full vibes."}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">Palette</h2>
            <div className="flex flex-wrap gap-2">
              {["ocean", "aura", "amethyst", "forest"].map((option) => {
                const label = option === "ocean" ? "Ocean" : option === "aura" ? "Aura" : option === "amethyst" ? "Amethyst" : "Forest";
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectPalette(option as MeltPalette)}
                    disabled={!settings.enabled || !motionEnabled}
                    className={`btn-secondary rounded-2xl px-3 py-1.5 text-sm ${
                      settings.palette === option ? "ring-white/40 bg-white/16" : "hover:bg-white/9"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">Intensity</h2>
            <div className="flex flex-wrap gap-2">
              {["low", "med", "high"].map((option) => {
                const label = option === "low" ? "Low" : option === "med" ? "Medium" : "High";
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectIntensity(option as MeltIntensity)}
                    disabled={!settings.enabled || !motionEnabled}
                    className={`btn-secondary rounded-2xl px-3 py-1.5 text-sm ${
                      settings.intensity === option ? "ring-white/40 bg-white/16" : "hover:bg-white/9"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
