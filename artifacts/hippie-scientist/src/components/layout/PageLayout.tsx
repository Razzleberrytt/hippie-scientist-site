import { NavBar } from "./NavBar";
import { ReactNode } from "react";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans flex flex-col relative overflow-hidden">
      {/* Background visual texture */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(20, 40, 30, 0.5) 0%, transparent 60%)' }} />
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      
      <NavBar />
      <main className="flex-1 relative z-10 w-full container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
      <footer className="py-12 border-t border-white/5 relative z-10 text-center">
        <p className="text-muted-foreground font-mono text-xs">The Hippie Scientist © {new Date().getFullYear()} — Evidence-based context.</p>
      </footer>
    </div>
  );
}
