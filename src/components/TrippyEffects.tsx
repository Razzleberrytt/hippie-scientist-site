import React, { useEffect, useRef, type CSSProperties } from "react";

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-24 h-[80vh] w-[80vw] rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 h-[80vh] w-[80vw] rounded-full bg-fuchsia-500/10 blur-3xl" />
    </div>
  );
}

function Floaters({ count = 12 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nodes = Array.from(el.children) as HTMLElement[];
    let raf = 0;

    const tick = (time: number) => {
      nodes.forEach((node, index) => {
        const seed = 4000 + index * 173;
        const x = Math.sin((time + seed) / 13000 + index) * 40;
        const y = Math.cos((time + seed) / 9000 + index) * 30;
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="absolute size-2 rounded-full bg-white/20 [left:var(--floater-left)] [top:var(--floater-top)] blur-[2px]"
          style={{
            "--floater-left": `${(index * 97) % 100}%`,
            "--floater-top": `${(index * 57) % 100}%`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

export default function TrippyEffects() {
  return (
    <>
      <Aurora />
      <Floaters />
    </>
  );
}
