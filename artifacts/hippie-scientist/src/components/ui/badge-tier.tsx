import { Badge } from "@/components/ui/badge";

export function BadgeTier({ tier }: { tier?: string }) {
  if (!tier) return null;
  const t = tier.toUpperCase();
  if (t === "A") {
    return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-100">Tier A</Badge>;
  }
  if (t === "B") {
    return <Badge className="bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100">Tier B</Badge>;
  }
  if (t === "C") {
    return <Badge className="bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-100">Tier C</Badge>;
  }
  return <Badge variant="outline" className="text-muted-foreground border-border hover:bg-transparent">Tier {t}</Badge>;
}
