import { useEffect } from "react";

export default function AmbientCursor() {
  useEffect(() => {
    const root = document.documentElement;
    const move = (event: MouseEvent) => {
      root.style.setProperty("--cursor-x", `${event.clientX}px`);
      root.style.setProperty("--cursor-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay" />;
}
