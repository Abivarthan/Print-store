import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartTotals, useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Metier" }, { property: "og:url", content: "/cart" }], links: [{ rel: "canonical", href: "/cart" }] }),
  component: Cart,
});

function Cart() {
  const { items, subtotal, shipping, tax, total, count } = useCartTotals();
  const { updateQty, removeFromCart } = useStore();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <h1 className="font-display text-4xl font-bold text-burgundy">Your cart is quiet.</h1>
        <p className="text-ink/60 mt-3">Add a specimen and it'll live here.</p>
        <Link to="/shop" className="mt-8 inline-flex items-center bg-burgundy text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine transition-colors">
          Explore the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy mb-10">Cart <span className="text-ink/40 text-2xl">({count})</span></h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-4">
          {items.map(({ item, product }) => (
            <div key={item.slug} className="bg-white rounded-2xl p-4 border border-burgundy/5 flex flex-col sm:flex-row gap-4">
              <Link to="/product/$slug" params={{ slug: product.slug }} className="size-32 sm:size-28 rounded-xl overflow-hidden bg-cream shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to="/product/$slug" params={{ slug: product.slug }} className="font-display font-bold text-burgundy hover:underline">{product.name}</Link>
                    <p className="text-xs text-ink/50 mt-1">{item.material} · {item.size} · {item.finish}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.slug)} aria-label="Remove" className="text-ink/40 hover:text-burgundy">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-end justify-between mt-4 gap-3">
                  <div className="inline-flex items-center bg-cream rounded-full border border-burgundy/10">
                    <button onClick={() => updateQty(item.slug, item.qty - product.minQty)} className="p-2"><Minus className="h-3 w-3" /></button>
                    <span className="px-4 text-sm font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.slug, item.qty + product.minQty)} className="p-2"><Plus className="h-3 w-3" /></button>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-burgundy">${(item.qty * product.price).toFixed(2)}</div>
                    <div className="text-xs text-ink/40">${product.price.toFixed(2)} / unit</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-white rounded-2xl p-6 border border-burgundy/5 h-fit sticky top-28">
          <h3 className="font-display text-lg font-bold text-burgundy mb-5">Order summary</h3>
          <div className="space-y-3 text-sm">
            <Line label="Subtotal" value={subtotal} />
            <Line label="Shipping" value={shipping} note={shipping === 0 ? "Free" : undefined} />
            <Line label="Tax" value={tax} />
            <div className="border-t border-burgundy/10 pt-3 mt-3 flex justify-between font-bold text-lg text-burgundy">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout" className="mt-6 block text-center bg-burgundy text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine transition-colors">
            Checkout
          </Link>
          <Link to="/shop" className="mt-3 block text-center text-sm text-ink/60 hover:text-burgundy">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function Line({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="flex justify-between text-ink/70">
      <span>{label}</span>
      <span>{note ?? `$${value.toFixed(2)}`}</span>
    </div>
  );
}
