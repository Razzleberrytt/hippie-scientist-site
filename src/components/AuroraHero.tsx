import {useEffect, useRef} from "react";

export default function AuroraHero({title, subtitle}:{title:string; subtitle:string}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      el.style.setProperty("--y", String(Math.min(y, 240)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {passive:true});
    return () => window.removeEventListener("scroll", onScroll);
  },[]);
  return (
    <section ref={ref} className="relative overflow-hidden"
      style={{height:"52vh", transform:"translateZ(0)"}}>
      <div className="absolute inset-0 -z-10 app-aurora" />
      <div className="container h-full flex flex-col justify-end pb-10"
        style={{ transform:`translateY(calc(var(--y,0) * -0.15px))`}}>
        <h1 className="gradient-text text-5xl font-semibold">{title}</h1>
        <p className="mt-3 text-white/75 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}
