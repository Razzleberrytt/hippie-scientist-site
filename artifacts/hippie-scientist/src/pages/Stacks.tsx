import { PageLayout } from "@/components/layout/PageLayout";
import { useStacks } from "@/hooks/use-data";
import { Layers } from "lucide-react";

export default function Stacks() {
  const { data: stacks, isLoading } = useStacks();

  return (
    <PageLayout>
      <div className="space-y-10 max-w-5xl mx-auto py-8">
        <header className="border-b border-border pb-6 space-y-4">
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-foreground">Supplement Stacks</h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Curated combinations of compounds designed to act synergistically.
            Remember to check individual compound safety profiles before combining.
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-8">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse border border-border" />)}
          </div>
        ) : (
          <div className="grid gap-10">
            {stacks?.map((stack) => (
              <div key={stack.slug} className="border border-border bg-card rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-primary/[0.03] border-b border-border p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold font-outfit text-foreground mb-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 text-primary" />
                      </div>
                      {stack.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{stack.short_description}</p>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-primary/20 text-primary text-sm font-semibold tracking-wide whitespace-nowrap shadow-sm">
                    Goal: {stack.goal}
                  </span>
                </div>

                <div className="p-6 md:p-8 bg-white">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono mb-6">Components</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stack.stack.map((item, i) => (
                      <div key={i} className="flex flex-col h-full bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h4 className="font-semibold text-foreground text-base mb-1">{item.compound}</h4>
                        <div className="font-mono text-sm text-primary font-medium mb-4">{item.dosage}</div>
                        <div className="space-y-3 mt-auto">
                          <p className="text-sm text-foreground leading-relaxed">
                            <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider mb-1 font-mono">Role</span>
                            {item.role}
                          </p>
                          {item.timing && (
                            <p className="text-sm text-foreground leading-relaxed">
                              <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider mb-1 font-mono">Timing</span>
                              {item.timing}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
