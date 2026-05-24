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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-4">Herbal Index</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Botanical extracts and whole-plant preparations. Filter by name, mechanism, or intended effect.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 290+ herbs..." 
            className="pl-10 bg-black/40 border-white/10"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <CardItem key={item.slug} item={item} type="herbs" index={i} />
            ))}
          </div>
        )}
        
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            No herbs found matching "{search}".
          </div>
        )}
      </div>
    </PageLayout>
  );
}
