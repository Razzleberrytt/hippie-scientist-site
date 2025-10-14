import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Tilt from "./Tilt";
import Magnetic from "./Magnetic";
import StatPill from "./StatPill";
import { loadCounts } from "@/lib/data";

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [counts, setCounts] = useState({ herbCount: 0, compoundCount: 0 });

  useEffect(() => {
    let active = true;
    loadCounts().then((data) => {
      if (active) setCounts(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-12">
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

            <div className="mt-6 flex flex-wrap gap-3">
              <Magnetic strength={12}>
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { y: 0 }}
                  transition={reduceMotion ? undefined : { type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    to="/browse/herbs"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500/90 px-5 text-sm font-semibold text-black shadow-[0_10px_40px_-18px_rgba(16,185,129,0.9)] transition hover:bg-emerald-400"
                  >
                    🌿 Browse Herbs
                  </Link>
                </motion.div>
              </Magnetic>
              <Magnetic strength={12}>
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { y: 0 }}
                  transition={reduceMotion ? undefined : { type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    to="/build"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    🧪 Build a Blend
                  </Link>
                </motion.div>
              </Magnetic>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatPill to="/browse/herbs" value={counts.herbCount} label="psychoactive herbs" testId="pill-herbs" />
              <StatPill to="/browse/compounds" value={counts.compoundCount} label="active compounds" testId="pill-compounds" />
            </div>
          </div>
        </motion.div>
      </Tilt>
    </section>
  );
}
