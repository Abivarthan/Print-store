import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { useState } from "react";
import { useCartTotals, useStore } from "@/lib/store";
import { CATEGORIES, groupedCategories } from "@/data/catalog";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Business", group: "Business" },
  { label: "Marketing", group: "Marketing" },
  { label: "Packaging", group: "Packaging" },
  { label: "Invitations", group: "Invitations" },
  { label: "Gifts", group: "Gifts" },
] as const;

export function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const { toggleTheme, theme, wishlist } = useStore();
  const { count } = useCartTotals();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const groups = groupedCategories();

  const searchResults = query.length > 1
    ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-50 bg-cream/85 backdrop-blur-md border-b border-burgundy/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-10 min-w-0">
          <button className="md:hidden shrink-0 text-burgundy" onClick={() => setMobile(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="font-display font-bold text-2xl tracking-tight text-burgundy shrink-0">
            METIER<span className="text-gold">.</span>
          </Link>
          <nav
            className="hidden md:flex gap-8 text-sm font-medium tracking-wide"
            onMouseLeave={() => setOpen(null)}
          >
            {NAV.map((n) => (
              <div key={n.label} className="relative" onMouseEnter={() => setOpen(n.group)}>
                <button
                  className={cn(
                    "py-2 transition-colors",
                    pathname.startsWith("/categories") ? "text-ink" : "text-ink hover:text-burgundy",
                    open === n.group && "text-burgundy",
                  )}
                >
                  {n.label}
                </button>
              </div>
            ))}
            <Link to="/shop" className="py-2 hover:text-burgundy transition-colors">Shop</Link>
            <Link to="/about" className="py-2 hover:text-burgundy transition-colors">About</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button onClick={() => setSearch(true)} aria-label="Search" className="p-2 hover:text-burgundy transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 hover:text-burgundy transition-colors hidden sm:block">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link to="/wishlist" aria-label="Wishlist" className="relative p-2 hover:text-burgundy transition-colors">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 grid place-items-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/dashboard" aria-label="Account" className="p-2 hover:text-burgundy transition-colors hidden sm:block">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative flex items-center gap-2 bg-burgundy text-white pl-3 pr-4 h-10 rounded-full hover:bg-wine transition-colors" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-xs font-bold">{count}</span>
          </Link>
        </div>
      </div>

      {/* Mega menu */}
      {open && groups[open] && (
        <div
          className="hidden md:block absolute inset-x-0 top-full bg-white border-b border-burgundy/5 shadow-lift"
          onMouseEnter={() => setOpen(open)}
          onMouseLeave={() => setOpen(null)}
        >
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-4 gap-6">
            {groups[open].map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group"
                onClick={() => setOpen(null)}
              >
                <div className="text-xs font-bold tracking-widest uppercase text-gold mb-1">{c.group}</div>
                <div className="font-display font-bold text-lg text-burgundy group-hover:underline underline-offset-4 decoration-gold">
                  {c.name}
                </div>
                <div className="text-sm text-ink/60 mt-1">{c.blurb}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search overlay */}
      {search && (
        <div className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm" onClick={() => setSearch(false)}>
          <div className="max-w-2xl mx-auto mt-24 bg-white rounded-3xl shadow-lift overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-6 border-b border-burgundy/5">
              <Search className="h-5 w-5 text-ink/40" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, materials, finishes..."
                className="flex-1 py-5 bg-transparent focus:outline-none text-base"
              />
              <button onClick={() => setSearch(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-96 overflow-auto p-2">
              {searchResults.length === 0 && query.length > 1 && (
                <div className="p-6 text-center text-ink/50 text-sm">No matches. Try "cards", "labels", "invitations".</div>
              )}
              {searchResults.map((c) => (
                <Link
                  key={c.slug}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  onClick={() => { setSearch(false); setQuery(""); }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream transition-colors"
                >
                  <div className="size-12 rounded-lg overflow-hidden bg-cream shrink-0">
                    <img src={c.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-burgundy truncate">{c.name}</div>
                    <div className="text-xs text-ink/50 truncate">{c.blurb}</div>
                  </div>
                </Link>
              ))}
              {query.length < 2 && (
                <div className="p-6 text-sm text-ink/50">
                  <div className="mb-3 font-semibold text-ink/70">Popular searches</div>
                  <div className="flex flex-wrap gap-2">
                    {["Business cards", "Wedding invitations", "Stickers", "Packaging", "Letterhead"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-3 py-1.5 rounded-full border border-burgundy/10 hover:border-burgundy transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-[60] bg-ink/40 md:hidden" onClick={() => setMobile(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-cream p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <span className="font-display font-bold text-2xl text-burgundy">METIER<span className="text-gold">.</span></span>
              <button onClick={() => setMobile(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-6">
              {Object.entries(groups).map(([group, cats]) => (
                <div key={group}>
                  <div className="text-xs font-bold tracking-widest uppercase text-gold mb-2">{group}</div>
                  <div className="space-y-1">
                    {cats.map((c) => (
                      <Link
                        key={c.slug}
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        onClick={() => setMobile(false)}
                        className="block py-2 text-base text-burgundy hover:text-wine"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-burgundy/10 space-y-2">
                <Link to="/shop" onClick={() => setMobile(false)} className="block py-2 text-burgundy">Shop</Link>
                <Link to="/about" onClick={() => setMobile(false)} className="block py-2 text-burgundy">About</Link>
                <Link to="/contact" onClick={() => setMobile(false)} className="block py-2 text-burgundy">Contact</Link>
                <Link to="/faq" onClick={() => setMobile(false)} className="block py-2 text-burgundy">FAQ</Link>
                <Link to="/dashboard" onClick={() => setMobile(false)} className="block py-2 text-burgundy">Account</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
