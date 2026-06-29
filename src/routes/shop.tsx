import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductMark } from "@/components/site/ProductMark";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Maison Presse" },
      { name: "description", content: "Letterpress cards, monogrammed stationery, rigid packaging, hardcover books. Configure paper, finish, and quantity." },
      { property: "og:title", content: "Shop — Maison Presse" },
      { property: "og:description", content: "Configure paper, finish, and quantity. Live pricing in INR with GST." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [cat, setCat] = useState<string>("all");
  const filtered = cat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat);

  return (
    <SiteLayout>
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-xs uppercase tracking-widest text-gold mb-4">The catalogue</div>
          <h1 className="font-display text-6xl md:text-7xl leading-[0.95]">
            Everything we press.
          </h1>
        </motion.div>
      </section>

      <section className="sticky top-16 z-30 backdrop-blur-xl bg-background/70 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-2 overflow-x-auto">
          <FilterPill active={cat === "all"} onClick={() => setCat("all")} label="All" />
          {CATEGORIES.map((c) => (
            <FilterPill key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)} label={c.name} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
            >
              <Link to="/shop/$slug" params={{ slug: p.slug }} className="group block">
                <div className="relative aspect-[4/5] rounded-2xl border border-border bg-card/60 overflow-hidden mb-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 p-12 text-gold"
                  >
                    <ProductMark kind={p.hero} className="w-full h-full" />
                  </motion.div>
                  <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {CATEGORIES.find((c) => c.slug === p.category)?.name}
                  </div>
                  <div className="absolute bottom-4 right-4 text-xs px-2.5 py-1 rounded-full border border-border bg-background/60 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                    Configure →
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-xl leading-tight group-hover:text-gold transition-colors">{p.name}</div>
                    <p className="text-xs text-muted-foreground mt-1">{p.tagline}</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground text-[11px]">from</div>
                    <div className="font-display text-lg">₹{p.basePrice}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </SiteLayout>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
        active ? "text-ink" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId="filter-active"
          className="absolute inset-0 rounded-full bg-gold"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}
