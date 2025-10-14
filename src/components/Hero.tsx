import { motion, useReducedMotion } from "framer-motion";
import Tilt from "./Tilt";
import StatPill from "./StatPill";
import HeroCTA from "./HeroCTA";

type HeroCounts = {
  herbs: number;
  compounds: number;
  articles: number;
};

type HeroProps = {
  counts?: HeroCounts;
};

export default function Hero({ counts }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const { herbs = 0, compounds = 0, articles = 0 } = counts ?? {};

  return (
    <section className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
        <div className="size-[52rem] rounded-full bg-gradient-to-br from-emerald-500/15 via-fuchsia-500/10 to-indigo-500/15 blur-3xl animate-breathe" />
      </div>

      <Tilt maxTilt={6} perspective={900} className="relative">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.985 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={reduceMotion ? undefined : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-halo"
        >
          <div className="pointer-events-none absolute -top-24 left-0 right-0 h-48 bg-gradient-to-b from-white/10 to-transparent" aria-hidden />

          <div className="relative p-6 sm:p-10">
            <motion.h1
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? undefined : { delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl"
            >
              The Hippie <br className="hidden sm:block" /> Scientist
            </motion.h1>
            <motion.p
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? undefined : { delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg"
            >
              Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
            </motion.p>

            <div className="mt-6">
              <HeroCTA />
            </div>

            <nav aria-label="Site stats" className="mt-6 flex flex-wrap gap-2 sm:gap-3">
              <StatPill to="/herbs" value={herbs} label="psychoactive herbs" testId="pill-herbs" />
              <StatPill to="/compounds" value={compounds} label="active compounds" testId="pill-compounds" />
              <StatPill to="/blog" value={articles} label="articles" testId="pill-articles" />
            </nav>
          </div>
        </motion.div>
      </Tilt>
    </section>
  );
}
