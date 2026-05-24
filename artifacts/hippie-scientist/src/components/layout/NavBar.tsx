import { Link, useLocation } from "wouter";
import { Beaker } from "lucide-react";

export function NavBar() {
  const [location] = useLocation();

  const links = [
    { href: "/herbs", label: "Herbs" },
    { href: "/compounds", label: "Compounds" },
    { href: "/stacks", label: "Stacks" },
    { href: "/goals", label: "Goals" },
    { href: "/learn", label: "Learn" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Beaker className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="font-outfit font-bold text-lg tracking-tight">The Hippie Scientist</span>
        </Link>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
