function normalizeTier(tier?: string): "A" | "B" | "C" | null {
  if (!tier) return null;
  const t = tier.toLowerCase();
  if (t === "a" || t === "b+" || t.includes("strong")) return "A";
  if (t === "b" || t.includes("moderate")) return "B";
  if (t === "c" || t.includes("limited") || t.includes("mechanistic")) return "C";
  return null;
}

export function BadgeTier({ tier }: { tier?: string }) {
  const normalized = normalizeTier(tier);
  if (!normalized) return null;
  
  if (normalized === "A") {
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs shrink-0 shadow-sm">A</span>;
  }
  if (normalized === "B") {
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs shrink-0 shadow-sm">B</span>;
  }
  return <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-orange-50 text-orange-700 border border-orange-200 font-bold text-xs shrink-0 shadow-sm">C</span>;
}
