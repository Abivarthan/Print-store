import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-soft" />
            <span className="font-display text-xl">Maison Presse</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Print, pressed and finished in a small atelier in Jaipur. Shipped worldwide.
          </p>
        </div>
        {[
          { h: "Shop", l: [["Business cards", "/shop"], ["Stationery", "/shop"], ["Packaging", "/shop"], ["Books", "/shop"]] },
          { h: "Atelier", l: [["About", "/about"], ["Process", "/about"], ["Materials", "/about"]] },
          { h: "Service", l: [["Contact", "/contact"], ["Custom quote", "/contact"], ["Trade", "/contact"]] },
        ].map((c) => (
          <div key={c.h}>
            <div className="text-xs uppercase tracking-widest text-gold mb-4">{c.h}</div>
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
          <span>© {new Date().getFullYear()} Maison Presse Pvt. Ltd. — GSTIN 08AAAAA0000A1Z5</span>
          <span>Pressed in India. Shipped worldwide.</span>
        </div>
      </div>
    </footer>
  );
}
