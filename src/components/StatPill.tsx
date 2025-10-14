import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

const numberFormatter = new Intl.NumberFormat();

type StatPillProps = {
  value: number;
  label: string;
  delay?: number;
  countUp?: boolean;
};

export default function StatPill({ value, label, delay = 0, countUp = true }: StatPillProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { margin: "-20% 0px", once: true });
  const counted = useCountUp(isInView ? value : 0, 700);
  const displayValue = countUp ? counted : value;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2"
      role="group"
    >
      <span className="inline-grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-base font-semibold tabular-nums">
        {numberFormatter.format(displayValue)}
      </span>
      <span className="text-sm opacity-90">{label}</span>
    </motion.div>
  );
}
