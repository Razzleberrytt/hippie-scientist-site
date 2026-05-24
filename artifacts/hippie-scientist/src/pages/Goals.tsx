import { PageLayout } from "@/components/layout/PageLayout";
import { useGoals } from "@/hooks/use-data";
import { Target, Moon, Brain, Battery } from "lucide-react";

export default function Goals() {
  const { data: goals, isLoading } = useGoals();

  const isComingSoon = !goals || goals.length === 0;

  return (
    <PageLayout>
      <div className="space-y-10 max-w-5xl mx-auto py-8">
        <header className="border-b border-border pb-6 space-y-4">
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-foreground">Goals</h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Browse mechanisms and compounds mapped to specific physiological or cognitive outcomes.
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted border border-border animate-pulse" />)}
          </div>
        ) : isComingSoon ? (
          <div className="space-y-10">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1 pt-2">
                <h3 className="font-semibold text-primary">Under Construction</h3>
                <p className="text-muted-foreground">The Goals directory is currently being curated. Check back soon for pathways mapped to specific outcomes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 grayscale-[0.5] pointer-events-none select-none">
              <div className="p-8 rounded-xl border border-border bg-card shadow-sm space-y-4">
                <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-outfit">Sleep & Recovery</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">GABAergic modulators, adenosine facilitators, and circadian rhythm support.</p>
              </div>
              <div className="p-8 rounded-xl border border-border bg-card shadow-sm space-y-4">
                <div className="w-12 h-12 rounded bg-purple-50 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-outfit">Focus & Cognition</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Cholinergic pathways, dopaminergic support, and neuroplasticity agents.</p>
              </div>
              <div className="p-8 rounded-xl border border-border bg-card shadow-sm space-y-4">
                <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center">
                  <Battery className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-outfit">Energy & Metabolism</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Mitochondrial support, AMPK activators, and cellular energy optimization.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {goals.map((g: any, i: number) => (
              <div key={i} className="p-8 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-foreground font-outfit">{g.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
