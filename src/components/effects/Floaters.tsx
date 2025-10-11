import { motion } from "framer-motion";
import { useTrippy } from "../../lib/trippy";

export default function Floaters() {
  const { trippy, enabled } = useTrippy();
  if (!trippy || !enabled) return null;

  const dots = Array.from({ length: 18 });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1.5 w-1.5 rounded-full bg-teal-300/40 blur-[1px]"
          style={{
            left: `${(index * 53) % 100}%`,
            top: `${(index * 29) % 100}%`,
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, 8 * ((index % 3) - 1), 0],
            opacity: [0.15, 0.45, 0.15],
          }}
          transition={{ duration: 6 + (index % 5), repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
        />
      ))}
    </div>
  );
}

