export function chipClassFor(tag: string){
  const t = (tag || "").toLowerCase();
  if (/(psychedelic|entheogen|hallucin|vision)/.test(t)) return "chip chip--psy";
  if (/(adaptogen|tonic)/.test(t)) return "chip chip--adapt";
  if (/(stimulant|energ)/.test(t)) return "chip chip--stim";
  if (/(sedative|anxiolytic|calm)/.test(t)) return "chip chip--sed";
  if (/(dream|oneiro|lucid)/.test(t)) return "chip chip--dream";
  if (/(visionary|shamanic|ritual)/.test(t)) return "chip chip--vision";
  if (/(toxic|caution|restricted|poison)/.test(t)) return "chip chip--warn";
  return "chip";
}
