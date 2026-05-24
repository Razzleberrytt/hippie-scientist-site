import { Badge } from "@/components/ui/badge";

export function BadgeTier({ tier }: { tier?: string }) {
  if (!tier) return null;
  const t = tier.toUpperCase();
  if (t === "A") {
    return <Badge className="bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/50">Tier A</Badge>;
  }
  if (t === "B") {
    return <Badge className="bg-amber-900/40 text-amber-400 border border-amber-500/30 hover:bg-amber-900/50">Tier B</Badge>;
  }
  if (t === "C") {
    return <Badge className="bg-orange-900/40 text-orange-400 border border-orange-500/30 hover:bg-orange-900/50">Tier C</Badge>;
  }
  return <Badge variant="outline" className="text-muted-foreground border-border hover:bg-transparent">Tier {t}</Badge>;
}
