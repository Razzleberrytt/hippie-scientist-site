import { PageLayout } from "@/components/layout/PageLayout";
import { useHerbs, useCompounds } from "@/hooks/use-data";
import { CardItem } from "@/components/ui/card-item";
import { Input } from "@/components/ui/input";
import { Search, Database, FlaskConical, ShieldAlert, Sparkles, Beaker } from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { BadgeTier } from "@/components/ui/badge-tier";

export default function Home() {
  const { data: herbs, isLoading: isLoadingHerbs } = useHerbs();
  const { data: compounds, isLoading: isLoadingCompounds } = useCompounds();
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/herbs?q=${encodeURIComponent(search)}`);
    }
  };

  const featuredHerbs = herbs?.filter(h => ["A", "B"].includes(h.evidence_tier || h.evidence_grade || "")).slice(0, 4) || [];
  const featuredCompounds = compounds?.filter(c => ["A", "B"].includes(c.evidence_tier || c.evidence_grade || "")).slice(0, 4) || [];

  return (
    <PageLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="w-full bg-[hsl(160,20%,97%)] border-b border-border py-20 px-6 -mt-8 mx-[calc(-50vw+50%)] relative left-1/2 right-1/2 w-screen overflow-hidden">
          <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
              <span className="text-primary font-mono text-sm tracking-wider uppercase font-semibold">Rigorous Context. Zero Hype.</span>
              <h1 className="text-5xl md:text-6xl font-outfit font-bold tracking-tight text-foreground leading-[1.1]">
                Evidence-first herb & compound reference.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                For people who want deeper mechanisms, safety framing, and harm reduction context beyond standard supplement advice.
              </p>

              <form onSubmit={handleSearch} className="relative max-w-md pt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search herbs, compounds, or effects..."
                  className="w-full pl-12 pr-4 py-6 text-base bg-white border-border shadow-sm rounded-xl focus-visible:ring-primary focus-visible:border-primary"
                />
              </form>

              <div className="flex items-center gap-6 pt-2 font-mono text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <span className="font-bold text-primary">{isLoadingHerbs ? "..." : herbs?.length || 295}</span>
                  <span className="text-muted-foreground">Herbs</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <span className="font-bold text-primary">{isLoadingCompounds ? "..." : compounds?.length || 617}</span>
                  <span className="text-muted-foreground">Compounds</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="hidden lg:block relative">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
              <div className="relative bg-white border border-border shadow-sm rounded-2xl p-6 w-full max-w-md ml-auto">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-4 border-b border-border pb-2">Recently Reviewed</div>
                <div className="space-y-4">
                  {featuredHerbs.slice(0,3).map(herb => (
                    <Link key={herb.slug} href={`/herbs/${herb.slug}`} className="flex items-center justify-between group">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{herb.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{herb.primary_effects?.[0] || 'Adaptogen'}</span>
                      </div>
                      <BadgeTier tier={herb.evidence_tier || herb.evidence_grade} />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="py-16 space-y-20">
          {/* How to use */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground font-outfit">Mechanism First</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Understand exactly how a compound interacts with receptors and pathways, rather than just treating symptoms.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground font-outfit">Evidence Tiers</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Clear distinction between human clinical trials (Tier A) and promising but unproven in-vitro data (Tier C).
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground font-outfit">Harm Reduction</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Prominent contraindications and interaction warnings. We don't hide the risks in the fine print.
              </p>
            </div>
          </section>

          {/* Featured Content */}
          <div className="space-y-16 max-w-6xl mx-auto">
            <section>
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <h2 className="text-2xl font-bold font-outfit text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Featured Herbs
                </h2>
                <Link href="/herbs" className="text-sm font-medium text-primary hover:underline">View All →</Link>
              </div>
              {isLoadingHerbs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredHerbs.map((item, i) => (
                    <CardItem key={item.slug} item={item} type="herbs" index={i} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <h2 className="text-2xl font-bold font-outfit text-foreground flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-primary" />
                  Featured Compounds
                </h2>
                <Link href="/compounds" className="text-sm font-medium text-primary hover:underline">View All →</Link>
              </div>
              {isLoadingCompounds ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredCompounds.map((item, i) => (
                    <CardItem key={item.slug} item={item} type="compounds" index={i} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
