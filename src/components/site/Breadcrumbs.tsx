import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-xs text-ink/50 mb-6">
      <Link to="/" className="hover:text-burgundy">Home</Link>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {c.to ? (
            <Link to={c.to} className="hover:text-burgundy">{c.label}</Link>
          ) : (
            <span className="text-ink/70">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
