import { PageLayout } from "@/components/layout/PageLayout";
import { useStacks } from "@/hooks/use-data";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export default function Stacks() {
  const { data: stacks, isLoading } = useStacks();

  return (
    <PageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-4">Supplement Stacks</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Curated combinations of compounds designed to act synergistically. 
            Remember to check individual compound safety profiles before combining.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid gap-8">
            {stacks?.map((stack) => (
              <div key={stack.slug} className="border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold font-outfit text-white mb-2 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        {stack.title}
                      </h2>
                      <p className="text-muted-foreground">{stack.short_description}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Goal: {stack.goal}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stack.stack.map((item, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h4 className="font-semibold text-white mb-1">{item.compound}</h4>
                        <div className="font-mono text-sm text-primary mb-3">{item.dosage}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-gray-300">Role: </span>
                          {item.role}
                        </p>
                        {item.timing && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <span className="font-semibold text-gray-300">Timing: </span>
                            {item.timing}
                          </p>
                        )}
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
