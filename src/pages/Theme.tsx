import ThemeMenu from "../components/ThemeMenu";
import Meta from "../components/Meta";

export default function Theme() {
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
          <p className="text-sm text-zinc-300/80">Choose a style preset to apply instantly:</p>
          <div className="mt-4">
            <ThemeMenu triggerClassName="btn-pill" />
          </div>
        </div>
      </section>
    </>
  );
}
