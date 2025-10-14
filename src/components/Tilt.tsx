"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

type Props = React.ComponentProps<typeof motion.div> & {
  maxTilt?: number;
  perspective?: number;
};

export default function Tilt({
  children,
  className,
  maxTilt = 6,
  perspective = 900,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const rx = useTransform(py, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const ry = useTransform(px, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const r = useTransform([rx, ry], ([x, y]) => `rotateX(${x}deg) rotateY(${y}deg)`);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    function handle(e: PointerEvent) {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      px.set(x);
      py.set(y);
    }

    function reset() {
      animate(px, 0, { type: "spring", stiffness: 180, damping: 25 });
      animate(py, 0, { type: "spring", stiffness: 180, damping: 25 });
    }

    const el = ref.current;
    if (!el) return;

    el.addEventListener("pointermove", handle, { passive: true });
    el.addEventListener("pointerleave", reset);
    el.addEventListener("pointercancel", reset);
    el.addEventListener("pointerup", reset);

    return () => {
      el.removeEventListener("pointermove", handle);
      el.removeEventListener("pointerleave", reset);
      el.removeEventListener("pointercancel", reset);
      el.removeEventListener("pointerup", reset);
    };
  }, [px, py]);

  if (prefersReduced) {
    return (
      <motion.div ref={ref} className={className} {...rest}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ transformStyle: "preserve-3d", perspective }}
      className={className}
      {...rest}
    >
      <motion.div style={{ transform: r }}>{children}</motion.div>
    </motion.div>
  );
}
