import { Link, useLocation } from "wouter";
import { Beaker } from "lucide-react";

export function NavBar() {
  const [location] = useLocation();

  const links = [
    { href: "/herbs", label: "Herbs" },
    { href: "/compounds", label: "Compounds" },
    { href: "/goals", label: "Goals" },
    { href: "/learn", label: "Learn" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Beaker className="w-5 h-5 text-primary" />
          </div>
          <span className="font-outfit font-bold tracking-tight text-foreground text-lg group-hover:text-primary transition-colors">
            The Hippie Scientist
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const isActive = location.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary relative py-2 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
          <Link
            href="/stacks"
            className="text-sm font-medium border border-primary text-primary hover:bg-primary/5 px-4 py-2 rounded-md transition-colors"
          >
            Stacks
          </Link>
        </div>
      </div>
    </nav>
  );
}
