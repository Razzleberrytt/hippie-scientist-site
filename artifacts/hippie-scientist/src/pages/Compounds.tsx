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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-4">Compound Index</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Isolated molecules, amino acids, and specific active ingredients. 
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 600+ compounds..." 
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
              <CardItem key={item.slug} item={item} type="compounds" index={i} />
            ))}
          </div>
        )}
        
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            No compounds found matching "{search}".
          </div>
        )}
      </div>
    </PageLayout>
  );
}
