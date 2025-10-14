import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

type AuroraHeroProps = {
  title: string;
  subtitle: string;
};

export default function AuroraHero({ title, subtitle }: AuroraHeroProps) {
  const { scrollY } = useScroll();
  const headingY = useTransform(scrollY, [0, 280], [0, -40]);
  const subheadingY = useTransform(scrollY, [0, 280], [0, -28]);
  const bgY = useTransform(scrollY, [0, 320], [0, 25]);

  return (
    <section
      className="hero relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center"
      style={{ minHeight: "clamp(70vh, 82vh, 92vh)" }}
      aria-labelledby="hero-title"
    >
      <motion.div
        aria-hidden
        className="aurora-bg absolute inset-0 -z-10"
        style={{ y: bgY }}
      />

      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-6">
        <motion.h1
          id="hero-title"
          style={{ y: headingY }}
          transition={{ type: "spring", damping: 20, stiffness: 110 }}
          className="gradient-text-animated text-balance text-[clamp(2.75rem,6vw,4.8rem)] font-semibold tracking-tight sm:text-[clamp(3.2rem,5vw,5.4rem)]"
        >
          {title}
        </motion.h1>

        <motion.p
          style={{ y: subheadingY }}
          transition={{ delay: 0.1, type: "spring", damping: 22, stiffness: 120 }}
          className="max-w-xl text-pretty text-base font-light text-white/85 sm:text-lg md:text-xl"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <Link
            to="/herbs"
            className="btn-primary rounded-full px-6 py-2.5 text-sm sm:text-base"
          >
            Browse Herbs
          </Link>
          <Link
            to="/blend"
            className="btn-secondary rounded-full px-6 py-2.5 text-sm sm:text-base"
          >
            Build a Blend
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
