import { PageLayout } from "@/components/layout/PageLayout";
import { useHerbs, useCompounds } from "@/hooks/use-data";
import { CardItem } from "@/components/ui/card-item";
import { Input } from "@/components/ui/input";
import { Search, Database, FlaskConical, ShieldAlert, Sparkles, Badge, Beaker } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

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
      <div className="flex flex-col gap-24 py-12 pb-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-6 font-mono text-xs text-primary border-primary/20 bg-primary/5 uppercase tracking-widest px-3 py-1">
              Rigorous Context. Zero Hype.
            </Badge>
            <h1 className="text-5xl md:text-7xl font-outfit font-bold tracking-tight text-foreground mb-6">
              Evidence-first herb & compound reference.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              For people who want deeper mechanisms, safety framing, and harm reduction context beyond standard supplement advice.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSearch}
            className="w-full relative max-w-xl group"
          >
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search herbs, compounds, or effects..."
                className="w-full pl-12 pr-4 py-6 text-lg rounded-2xl focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mt-8"
          >
            <div className="flex flex-col items-center bg-muted border border-border px-6 py-4 rounded-xl">
              <span className="text-3xl font-bold font-mono text-foreground mb-1">{isLoadingHerbs ? "..." : herbs?.length || 295}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Herbs Profiled</span>
            </div>
            <div className="flex flex-col items-center bg-muted border border-border px-6 py-4 rounded-xl">
              <span className="text-3xl font-bold font-mono text-foreground mb-1">{isLoadingCompounds ? "..." : compounds?.length || 617}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Compounds Traced</span>
            </div>
          </motion.div>
        </section>

        {/* How to use */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Mechanism First</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Understand exactly how a compound interacts with receptors and pathways, rather than just treating symptoms.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
              <FlaskConical className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Evidence Tiers</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Clear distinction between human clinical trials (Tier A) and promising but unproven in-vitro data (Tier C).
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
              <ShieldAlert className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Harm Reduction</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Prominent contraindications and interaction warnings. We don't hide the risks in the fine print.
            </p>
          </div>
        </section>

        {/* Featured Content */}
        <div className="space-y-16">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-outfit text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Featured Herbs
              </h2>
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-outfit text-foreground flex items-center gap-2">
                <Beaker className="w-5 h-5 text-primary" />
                Featured Compounds
              </h2>
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
    </PageLayout>
  );
}
