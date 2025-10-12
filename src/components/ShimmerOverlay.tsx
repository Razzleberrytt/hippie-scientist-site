import { useEffect, useRef } from "react";
import { melt } from "@/state/melt";

export default function ShimmerOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const apply = (enabled: boolean) => {
      document.documentElement.classList.toggle("shimmer-on", enabled);
      el.style.opacity = enabled ? "1" : "0";
    };
    apply(melt.enabled);
    const unsub = melt.subscribe(apply);
    return () => {
      unsub();
      document.documentElement.classList.remove("shimmer-on");
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="shimmer-layer pointer-events-none"
    />
  );
}
