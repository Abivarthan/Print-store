import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Metier" },
      { name: "description", content: "Browse Metier's full range: cotton business cards, invitations, packaging, stickers, marketing print and more." },
      { property: "og:title", content: "Shop — Metier" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: Shop,
});

const GROUPS = ["Business", "Marketing", "Packaging", "Invitations", "Gifts", "Services"] as const;
const SORTS = ["Featured", "Price ↑", "Price ↓", "Top rated"] as const;

function Shop() {
  const [group, setGroup] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Featured");
  const [max, setMax] = useState(200);
  const [drawer, setDrawer] = useState(false);
  const [page, setPage] = useState(1);
  const PER = 8;

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (group) {
      const catSlugs = CATEGORIES.filter((c) => c.group === group).map((c) => c.slug);
      list = list.filter((p) => catSlugs.includes(p.categorySlug));
    }
    list = list.filter((p) => p.price <= max);
    if (sort === "Price ↑") list.sort((a, b) => a.price - b.price);
    if (sort === "Price ↓") list.sort((a, b) => b.price - a.price);
    if (sort === "Top rated") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [group, max, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER));
  const shown = filtered.slice((page - 1) * PER, page * PER);

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h4 className="font-display font-bold text-burgundy mb-3">Category</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => { setGroup(null); setPage(1); }}
            className={cn("block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors",
              !group ? "bg-burgundy text-white" : "hover:bg-burgundy/5 text-ink/70")}
          >All categories</button>
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => { setGroup(g); setPage(1); }}
              className={cn("block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors",
                group === g ? "bg-burgundy text-white" : "hover:bg-burgundy/5 text-ink/70")}
            >{g}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-display font-bold text-burgundy mb-3">Max price: <span className="text-gold">${max}</span></h4>
        <input type="range" min={5} max={200} step={5} value={max} onChange={(e) => setMax(+e.target.value)} className="w-full accent-burgundy" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy">Shop everything</h1>
          <p className="text-ink/60 mt-2">{filtered.length} products • Bespoke reproduction available on every item.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDrawer(true)} className="lg:hidden flex items-center gap-2 border border-burgundy/20 rounded-full px-4 py-2 text-sm">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="border border-burgundy/20 rounded-full px-4 py-2 text-sm bg-white"
          >
            {SORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden lg:block sticky top-28 self-start"><FilterPanel /></aside>
        <div>
          {shown.length === 0 ? (
            <div className="text-center py-20 text-ink/50">No products match those filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {shown.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          )}
          {pageCount > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn("size-10 rounded-full text-sm font-bold transition-colors",
                    page === i + 1 ? "bg-burgundy text-white" : "border border-burgundy/20 hover:bg-burgundy/5")}
                >{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setDrawer(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-cream p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-burgundy text-lg">Filters</h3>
              <button onClick={() => setDrawer(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}
