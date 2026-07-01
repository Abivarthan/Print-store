import { createFileRoute, Link } from "@tanstack/react-router";
import { PRODUCTS } from "@/data/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Metier" }, { name: "robots", content: "noindex" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const items = PRODUCTS.filter((p) => wishlist.includes(p.slug));
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy mb-10">Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink/60">Nothing saved yet. Tap the heart on any product to add it here.</p>
          <Link to="/shop" className="mt-6 inline-flex bg-burgundy text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine">Browse shop</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </div>
  );
}
