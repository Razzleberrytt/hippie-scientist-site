import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, speed = 600) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();

    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / speed);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));

      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, [target, speed]);

  return val;
}
