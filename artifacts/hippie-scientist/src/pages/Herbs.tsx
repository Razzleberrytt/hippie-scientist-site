import { PageLayout } from "@/components/layout/PageLayout";
import { useHerbs } from "@/hooks/use-data";
import { CardItem } from "@/components/ui/card-item";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Herbs() {
  const { data: herbs, isLoading } = useHerbs();
  const [search, setSearch] = useState("");

  const params = new URLSearchParams(window.location.search);
  const initialQ = params.get("q");

  useState(() => {
    if (initialQ) setSearch(initialQ);
  });

  const filtered = herbs?.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.summary?.toLowerCase().includes(search.toLowerCase()) ||
    h.primary_effects?.some(e => e.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <PageLayout>
      <div className="space-y-8 max-w-6xl mx-auto py-8">
        <header className="border-b border-border pb-6 space-y-4">
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-foreground">Herbal Index</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Botanical extracts and whole-plant preparations. Filter by name, mechanism, or intended effect.
          </p>
        </header>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search herbs..."
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
              <CardItem key={item.slug} item={item} type="herbs" index={i} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground border border-border border-dashed rounded-xl bg-card">
            No herbs found matching "{search}".
          </div>
        )}
      </div>
    </PageLayout>
  );
}
