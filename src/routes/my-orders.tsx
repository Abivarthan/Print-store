import { createFileRoute, Link } from "@tanstack/react-router";
import { Package } from "lucide-react";

export const Route = createFileRoute("/my-orders")({
  head: () => ({ meta: [{ title: "My orders — Metier" }, { name: "robots", content: "noindex" }] }),
  component: MyOrders,
});

const ORDERS = [
  { id: "MET-4X8R2", date: "May 12, 2026", total: 342.5, status: "Shipped", items: "Lux Cotton Cards × 200, Envelopes × 100" },
  { id: "MET-3P1KA", date: "Apr 30, 2026", total: 128.0, status: "Delivered", items: "Sculpted Vinyl Labels × 300" },
  { id: "MET-2M0QQ", date: "Apr 08, 2026", total: 890.0, status: "In production", items: "Onyx Packaging Boxes × 75" },
];

function MyOrders() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy mb-10">My orders</h1>
      <div className="space-y-4">
        {ORDERS.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl p-6 border border-burgundy/5 grid sm:grid-cols-[auto_1fr_auto] items-center gap-4">
            <div className="size-12 rounded-full bg-gold/10 text-gold grid place-items-center shrink-0"><Package className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display font-bold text-burgundy">{o.id}</span>
                <span className="text-xs text-ink/40">{o.date}</span>
              </div>
              <div className="text-sm text-ink/60 mt-1">{o.items}</div>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-burgundy">${o.total.toFixed(2)}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-gold mt-1">{o.status}</div>
            </div>
          </div>
        ))}
      </div>
      <Link to="/shop" className="mt-10 inline-flex bg-burgundy text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine">Continue shopping</Link>
    </div>
  );
}
