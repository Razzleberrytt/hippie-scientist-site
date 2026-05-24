import { PageLayout } from "@/components/layout/PageLayout";
import { useCompounds } from "@/hooks/use-data";
import { CardItem } from "@/components/ui/card-item";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Compounds() {
  const { data: compounds, isLoading } = useCompounds();
  const [search, setSearch] = useState("");

  const filtered = compounds?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.summary?.toLowerCase().includes(search.toLowerCase()) ||
    c.primary_effects?.some(e => e.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <PageLayout>
      <div className="space-y-8 max-w-6xl mx-auto py-8">
        <header className="border-b border-border pb-6 space-y-4">
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-foreground">Compound Index</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Isolated molecules, amino acids, and specific active ingredients.
          </p>
        </header>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search compounds..."
              className="w-full pl-12 pr-4 py-6 text-base bg-white border-border shadow-sm rounded-xl focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>
          <div className="w-full md:w-auto flex justify-start md:justify-end">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-mono whitespace-nowrap">
              Showing {isLoading ? "..." : filtered.length} results
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <CardItem key={item.slug} item={item} type="compounds" index={i} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground border border-border border-dashed rounded-xl bg-card">
            No compounds found matching "{search}".
          </div>
        )}
      </div>
    </PageLayout>
  );
}
