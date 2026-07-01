import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/order-success")({
  head: () => ({ meta: [{ title: "Order confirmed — Metier" }, { name: "robots", content: "noindex" }] }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const orderId = "MET-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="size-16 rounded-full bg-gold/15 text-gold grid place-items-center mx-auto mb-6">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Order confirmed</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy">Thank you.</h1>
      <p className="text-ink/60 mt-4">Order <span className="font-bold text-burgundy">{orderId}</span> is now being prepared. A production artist will review your file within 24 hours.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/my-orders" className="bg-burgundy text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine transition-colors">View orders</Link>
        <Link to="/shop" className="border border-burgundy/20 text-burgundy px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-burgundy/5 transition-colors">Continue shopping</Link>
      </div>
    </div>
  );
}
