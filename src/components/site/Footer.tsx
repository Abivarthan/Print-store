import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary shadow-sm" />
            <span className="font-display text-xl text-foreground">Colour Print</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Premium printing services based in Trichy. Offset, digital, and custom jobs.
          </p>
        </div>
        {[
          { h: "Shop", l: [["Business cards", "/shop"], ["Stationery", "/shop"], ["Packaging", "/shop"], ["Books", "/shop"]] },
          { h: "Atelier", l: [["About", "/about"], ["Process", "/about"], ["Materials", "/about"]] },
          { h: "Service", l: [["Contact", "/contact"], ["Custom quote", "/contact"], ["Trade", "/contact"]] },
        ].map((c) => (
          <div key={c.h}>
            <div className="text-xs uppercase tracking-widest text-primary mb-4 font-semibold">{c.h}</div>
            <ul className="space-y-2 text-sm">
              {c.l.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Kruthick Printers — GSTIN 33BWXPR0732C1ZH</span>
          <span>Trichy, Tamil Nadu.</span>
        </div>
      </div>
    </footer>
  );
}
