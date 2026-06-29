import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductMark } from "@/components/site/ProductMark";
import { ArtworkUploader } from "@/components/site/ArtworkUploader";
import { getProduct, calcPrice, fmtINR, type Product } from "@/lib/catalog";
import { cart } from "@/lib/cart-store";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Maison Presse` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — Maison Presse` },
          { property: "og:description", content: loaderData.product.tagline },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h1 className="font-display text-5xl">Out of print.</h1>
        <p className="mt-3 text-muted-foreground">That product isn't in our catalogue.</p>
        <Link to="/shop" className="mt-8 inline-flex px-6 py-3 rounded-full bg-gold text-ink">Back to shop</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h1 className="font-display text-3xl">Couldn't load that page.</h1>
      </div>
    </SiteLayout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  return (
    <SiteLayout>
      <Detail product={product} />
    </SiteLayout>
  );
}

function Detail({ product }: { product: Product }) {
  const [size, setSize] = useState(product.options.sizes[0].id);
  const [paper, setPaper] = useState(product.options.papers[0].id);
  const [finish, setFinish] = useState(product.options.finishes[0].id);
  const [qty, setQty] = useState(product.options.qtyTiers[0].qty);
  const [added, setAdded] = useState(false);

  const price = useMemo(() => calcPrice(product, { size, paper, finish, qty }), [product, size, paper, finish, qty]);
  const physicalSize = useMemo(() => {
    const label = product.options.sizes.find((s) => s.id === size)?.label ?? "";
    // Match "W × H in" or "W × H mm"
    const m = label.match(/([\d.]+)\s*[×x]\s*([\d.]+)\s*(in|mm)/i);
    if (!m) return { w: 3.5, h: 2 };
    const w = parseFloat(m[1]);
    const h = parseFloat(m[2]);
    return m[3].toLowerCase() === "mm" ? { w: w / 25.4, h: h / 25.4 } : { w, h };
  }, [product, size]);

  function addToCart() {
    cart.add({
      id: `${product.slug}-${Date.now()}`,
      slug: product.slug,
      name: product.name,
      config: { size, paper, finish, qty },
      unit: price.unit,
      subtotal: price.subtotal,
      gst: price.gst,
      total: price.total,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-32">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10">
        <ArrowLeft className="w-4 h-4" /> Back to shop
      </Link>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="lg:sticky lg:top-24 self-start"
        >
          <div className="aspect-[4/5] rounded-3xl border border-border bg-card/60 relative overflow-hidden">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 p-16 text-gold"
            >
              <ProductMark kind={product.hero} className="w-full h-full" />
            </motion.div>
            <div className="absolute top-6 left-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              No. {product.slug.split("-").length.toString().padStart(2, "0")}
            </div>
            <div className="absolute bottom-6 right-6 text-xs text-gold">{product.options.papers.find(p => p.id === paper)?.label}</div>
          </div>
        </motion.div>

        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-xs uppercase tracking-widest text-gold mb-3">{product.category}</div>
            <h1 className="font-display text-5xl md:text-6xl leading-[0.95]">{product.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{product.tagline}</p>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-prose">{product.description}</p>
          </motion.div>

          <div className="mt-12 space-y-8">
            <Group title="Size">
              <SegGroup options={product.options.sizes.map(s => ({ id: s.id, label: s.label }))} value={size} onChange={setSize} />
            </Group>
            <Group title="Paper">
              <SegGroup options={product.options.papers.map(s => ({ id: s.id, label: s.label }))} value={paper} onChange={setPaper} stack />
            </Group>
            <Group title="Finish">
              <SegGroup
                options={product.options.finishes.map(s => ({ id: s.id, label: s.label, sub: s.add ? `+₹${s.add}` : "included" }))}
                value={finish}
                onChange={setFinish}
                stack
              />
            </Group>
            <Group title="Quantity">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.options.qtyTiers.map((t) => (
                  <button
                    key={t.qty}
                    onClick={() => setQty(t.qty)}
                    className={`relative px-4 py-4 rounded-xl border text-left transition-all ${
                      qty === t.qty ? "border-gold bg-gold/5" : "border-border hover:border-white/20"
                    }`}
                  >
                    <div className="font-display text-xl">{t.qty}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {t.discount > 0 ? `−${Math.round(t.discount * 100)}%` : "base"}
                    </div>
                  </button>
                ))}
              </div>
            </Group>

            <Group title="Artwork">
              <ArtworkUploader
                productSlug={product.slug}
                targetWidthIn={physicalSize.w}
                targetHeightIn={physicalSize.h}
              />
            </Group>
          </div>

          <motion.div
            layout
            className="mt-12 rounded-2xl border border-border p-6 bg-card/40"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Unit price</div>
                <div className="font-display text-2xl mt-1">{fmtINR(price.unit)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Total · incl. GST</div>
                <div className="font-display text-4xl text-gold-gradient mt-1">{fmtINR(price.total)}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Subtotal {fmtINR(price.subtotal)}</span>
              <span>GST 18% {fmtINR(price.gst)}</span>
              {price.discount > 0 && <span className="text-gold">Volume −{Math.round(price.discount * 100)}%</span>}
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={addToCart}
              className="mt-6 w-full py-4 rounded-full bg-gold text-ink font-medium hover:bg-gold-soft transition-colors relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span key="ok" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Added to cart
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                    Add to cart · {qty} units
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <p className="mt-3 text-[11px] text-center text-muted-foreground">Free shipping above ₹2,000 · Dispatched in 4–6 working days</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{title}</div>
      {children}
    </div>
  );
}

function SegGroup({
  options,
  value,
  onChange,
  stack,
}: {
  options: { id: string; label: string; sub?: string }[];
  value: string;
  onChange: (id: string) => void;
  stack?: boolean;
}) {
  return (
    <div className={stack ? "space-y-2" : "flex flex-wrap gap-2"}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`relative ${stack ? "w-full text-left" : ""} px-4 py-3 rounded-xl border text-sm transition-all ${
              active ? "border-gold bg-gold/5" : "border-border hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span>{o.label}</span>
              {o.sub && <span className={`text-xs ${active ? "text-gold" : "text-muted-foreground"}`}>{o.sub}</span>}
              {active && !o.sub && <Check className="w-4 h-4 text-gold" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
