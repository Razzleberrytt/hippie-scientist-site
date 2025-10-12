import Magnetic from "./Magnetic";

export default function NewsletterCard() {
  return (
    <section className="animated-border mt-10">
      <div className="glass rounded-[27px] p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Stay in the loop</h2>
        <p className="mt-2 text-sm md:text-base text-white/70">
          Get field notes on new psychoactive herbs, blends, and research drops.
        </p>
        <form className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full sm:flex-1 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3 text-base placeholder-white/50 outline-none focus:ring-white/30"
          />
          <Magnetic strength={12}>
            <button
              type="submit"
              className="rounded-2xl px-5 py-3 font-medium bg-teal-500/90 hover:bg-teal-400 active:bg-teal-500 transition-colors ring-1 ring-black/10"
            >
              Join the newsletter
            </button>
          </Magnetic>
        </form>
      </div>
    </section>
  );
}
