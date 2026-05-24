import { PageLayout } from "@/components/layout/PageLayout";
import { useGoals } from "@/hooks/use-data";
import { Target, Moon, Brain, Battery } from "lucide-react";

export default function Goals() {
  const { data: goals, isLoading } = useGoals();

  const isComingSoon = !goals || goals.length === 0;

  return (
    <PageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-foreground mb-4">Goals</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Browse mechanisms and compounds mapped to specific physiological or cognitive outcomes.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : isComingSoon ? (
          <div className="space-y-8">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-primary flex items-center gap-3">
              <Target className="w-6 h-6 flex-shrink-0" />
              <p className="font-medium">The Goals directory is currently under construction. Check back soon for mapped pathways.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 pointer-events-none">
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                <Moon className="w-8 h-8 text-blue-500" />
                <h3 className="text-xl font-bold text-foreground">Sleep & Recovery</h3>
                <p className="text-sm text-muted-foreground">GABAergic modulators, adenosine facilitators, and circadian rhythm support.</p>
              </div>
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                <Brain className="w-8 h-8 text-purple-500" />
                <h3 className="text-xl font-bold text-foreground">Focus & Cognition</h3>
                <p className="text-sm text-muted-foreground">Cholinergic pathways, dopaminergic support, and neuroplasticity agents.</p>
              </div>
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                <Battery className="w-8 h-8 text-emerald-500" />
                <h3 className="text-xl font-bold text-foreground">Energy & Metabolism</h3>
                <p className="text-sm text-muted-foreground">Mitochondrial support, AMPK activators, and cellular energy optimization.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((g: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="text-xl font-bold text-foreground">{g.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
