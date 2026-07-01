import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Star, Truck } from "lucide-react";
import { FAQS, getCategory, getProduct, relatedProducts } from "@/data/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const p = getProduct(params.slug);
    const title = p ? `${p.name} — Metier` : "Product — Metier";
    return {
      meta: [
        { title },
        { name: "description", content: p?.description.slice(0, 155) ?? "Premium print product." },
        { property: "og:title", content: title },
        { property: "og:description", content: p?.description.slice(0, 155) ?? "" },
        { property: "og:url", content: `/product/${params.slug}` },
        { property: "og:image", content: p?.image ?? "" },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
    };
  },
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return { product: p };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-bold text-burgundy">Product not found</h1>
    </div>
  ),
});

function ProductDetail() {
  const { product } = Route.useLoaderData() as { product: import("@/data/catalog").Product };
  const category = getCategory(product.categorySlug);
  const related = relatedProducts(product.slug, product.categorySlug);
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const navigate = useNavigate();

  const [gallery, setGallery] = useState(0);
  const [material, setMaterial] = useState(product.materials[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [finish, setFinish] = useState(product.finishes[0]);
  const [qty, setQty] = useState(product.minQty);
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false });

  const wished = wishlist.includes(product.slug);
  const price = useMemo(() => {
    const finishMult = finish === "Letterpress" ? 1.4 : finish === "Gold Foil" ? 1.5 : finish === "Foil" ? 1.3 : 1;
    const qtyMult = Math.max(0.6, 1 - Math.log10(qty / product.minQty + 1) * 0.15);
    return +(product.price * (qty / product.minQty) * finishMult * qtyMult).toFixed(2);
  }, [finish, qty, product]);

  const add = () => {
    addToCart({ slug: product.slug, qty, material, size, finish });
    navigate({ to: "/cart" });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumbs items={[
        { label: "Shop", to: "/shop" },
        ...(category ? [{ label: category.name, to: `/category/${category.slug}` } as const] : []),
        { label: product.name },
      ]} />

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div>
          <div
            className="aspect-square rounded-3xl overflow-hidden bg-white bento-drop border border-burgundy/5 relative cursor-zoom-in"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, active: true });
            }}
            onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
          >
            <img
              src={product.gallery[gallery]}
              alt={product.name}
              className={cn("w-full h-full object-cover transition-transform duration-200", zoom.active && "scale-150")}
              style={zoom.active ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </div>
          {product.gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {product.gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setGallery(i)}
                  className={cn("aspect-square rounded-xl overflow-hidden border-2 transition-colors",
                    gallery === i ? "border-burgundy" : "border-transparent")}
                >
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {category && <p className="text-gold font-bold text-xs tracking-widest uppercase mb-2">{category.name}</p>}
          <h1 className="font-display text-3xl md:text-5xl font-bold text-burgundy leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-ink/60">
            <span className="flex items-center gap-1 text-gold"><Star className="h-4 w-4 fill-current" /> {product.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{product.reviewCount} reviews</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> {product.turnaround}</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-burgundy">${price.toFixed(2)}</span>
            <span className="text-sm text-ink/50">for {qty} units</span>
          </div>
          <p className="text-ink/70 mt-4 leading-relaxed">{product.description}</p>

          {/* Options */}
          <div className="mt-8 space-y-5">
            <OptionGroup label="Material" value={material} options={product.materials} onChange={setMaterial} />
            <OptionGroup label="Size" value={size} options={product.sizes} onChange={setSize} />
            <OptionGroup label="Finish" value={finish} options={product.finishes} onChange={setFinish} />

            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-ink/50 block mb-3">Quantity</label>
              <div className="inline-flex items-center bg-white rounded-full border border-burgundy/10 overflow-hidden">
                <button onClick={() => setQty(Math.max(product.minQty, qty - product.minQty))} className="p-3 hover:bg-burgundy/5"><Minus className="h-4 w-4" /></button>
                <span className="px-6 font-bold text-burgundy min-w-16 text-center">{qty}</span>
                <button onClick={() => setQty(qty + product.minQty)} className="p-3 hover:bg-burgundy/5"><Plus className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-ink/40 mt-2">Minimum {product.minQty} units.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={add} className="flex-1 min-w-48 inline-flex items-center justify-center gap-2 bg-burgundy text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-wine transition-colors">
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
            <button
              onClick={() => toggleWishlist(product.slug)}
              className={cn("size-14 rounded-full grid place-items-center transition-colors",
                wished ? "bg-burgundy text-white" : "border border-burgundy/20 text-burgundy hover:bg-burgundy/5")}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn("h-5 w-5", wished && "fill-current")} />
            </button>
            <Link to="/quote" className="inline-flex items-center gap-2 border border-burgundy/20 text-burgundy px-6 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-burgundy/5 transition-colors">
              Request quote
            </Link>
          </div>

          <div className="mt-8 p-5 bg-white rounded-2xl border border-burgundy/5 flex items-start gap-3 text-sm">
            <Truck className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-burgundy">Delivery estimate</p>
              <p className="text-ink/60 mt-1">Production in {product.turnaround}. Free worldwide DHL shipping on orders over $200.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <section className="mt-20 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-2xl font-bold text-burgundy mb-6">Specifications</h2>
          <dl className="space-y-3">
            {product.specs.map((s) => (
              <div key={s.label} className="flex justify-between py-3 border-b border-burgundy/5">
                <dt className="text-ink/50 uppercase text-xs tracking-widest">{s.label}</dt>
                <dd className="font-medium text-burgundy text-right">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-burgundy mb-6">Frequently asked</h2>
          <div className="space-y-3">
            {FAQS.slice(0, 4).map((f) => (
              <details key={f.q} className="group bg-white rounded-2xl px-5 py-4 border border-burgundy/5">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="font-display font-bold text-burgundy text-sm">{f.q}</span>
                  <span className="text-gold text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-ink/60 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-burgundy mb-6">Reviews</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Elena K.", rating: 5, text: "The paper feels expensive from the moment you hold it. Foil is crisp." },
            { name: "Marcus D.", rating: 5, text: "Repeat client. Never a misprint, always beautiful." },
            { name: "Ana R.", rating: 4, text: "Slightly longer turnaround than expected, but the result is worth it." },
          ].map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-6 border border-burgundy/5">
              <div className="flex gap-0.5 text-gold mb-3">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm text-ink/70">{r.text}</p>
              <p className="mt-4 text-xs font-bold text-burgundy uppercase tracking-widest">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold text-burgundy mb-8">You may also love</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function OptionGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-bold tracking-widest uppercase text-ink/50 block mb-3">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn("px-4 py-2 rounded-full text-sm border transition-colors",
              value === o ? "bg-burgundy text-white border-burgundy" : "bg-white text-ink border-burgundy/10 hover:border-burgundy")}
          >{o}</button>
        ))}
      </div>
    </div>
  );
}
