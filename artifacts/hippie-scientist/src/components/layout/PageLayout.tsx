import { NavBar } from "./NavBar";
import { ReactNode } from "react";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 font-sans flex flex-col">
      <NavBar />
      <main className="flex-1 w-full container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
      <footer className="py-12 border-t border-border text-center">
        <p className="text-muted-foreground font-mono text-xs">The Hippie Scientist © {new Date().getFullYear()} — Evidence-based context.</p>
      </footer>
    </div>
  );
}
