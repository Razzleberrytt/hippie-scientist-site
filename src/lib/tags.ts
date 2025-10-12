export function chipClassFor(tag: string) {
  const t = (tag || "").toLowerCase();
  const base = "pill bg-white/10 text-white/80";
  if (/(psychedelic|entheogen|hallucin|vision)/.test(t)) return `${base} bg-fuchsia-500/15 text-fuchsia-200`;
  if (/(adaptogen|tonic)/.test(t)) return `${base} bg-emerald-500/15 text-emerald-200`;
  if (/(stimulant|energ)/.test(t)) return `${base} bg-amber-500/15 text-amber-200`;
  if (/(sedative|anxiolytic|calm)/.test(t)) return `${base} bg-blue-500/15 text-blue-200`;
  if (/(dream|oneiro|lucid)/.test(t)) return `${base} bg-sky-500/15 text-sky-200`;
  if (/(visionary|shamanic|ritual)/.test(t)) return `${base} bg-indigo-500/15 text-indigo-200`;
  if (/(toxic|caution|restricted|poison)/.test(t)) return `${base} bg-rose-500/15 text-rose-200`;
  return base;
}
