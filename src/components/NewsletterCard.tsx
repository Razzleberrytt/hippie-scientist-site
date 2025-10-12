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
            className="w-full sm:flex-1 rounded-2xl bg-white/14 px-4 py-3 text-base text-white/90 placeholder-white/50 backdrop-blur-xl ring-1 ring-white/12 focus:ring-white/30"
          />
          <Magnetic strength={12}>
            <button
              type="submit"
              className="btn-primary rounded-2xl px-6 py-3"
            >
              Join the newsletter
            </button>
          </Magnetic>
        </form>
      </div>
    </section>
  );
}
