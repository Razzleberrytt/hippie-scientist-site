import { motion, useScroll, useTransform } from "framer-motion";

export default function AuroraHero({ title, subtitle }: { title: string; subtitle: string }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const blur = useTransform(scrollY, [0, 300], ["blur(0px)", "blur(6px)"]);

  return (
    <section className="relative overflow-hidden h-[55vh] flex flex-col justify-end">
      <motion.div className="absolute inset-0 -z-10 app-aurora" style={{ filter: blur }} />
      <div className="container pb-10 relative z-10">
        <motion.h1 className="gradient-text text-5xl font-semibold" style={{ y }}>
          {title}
        </motion.h1>
        <p className="mt-3 text-white/80 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}
