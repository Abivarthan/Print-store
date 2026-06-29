import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/Layout";
import { getMyOrders } from "@/lib/orders.functions";
import { fmtINR } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersPage,
});

const statusLabels: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  in_prepress: "In prepress",
  printing: "On press",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

function OrdersPage() {
  const fetchOrders = useServerFn(getMyOrders);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof fetchOrders>> | null>(null);

  useEffect(() => {
    fetchOrders().then(setOrders).catch(() => setOrders([]));
  }, [fetchOrders]);

  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <div className="text-xs uppercase tracking-widest text-gold">Account</div>
        <h1 className="font-display text-5xl mt-2">Orders</h1>
        <p className="text-muted-foreground mt-2">Every press run, every dispatch.</p>

        <div className="mt-12 space-y-3">
          {orders === null && <div className="text-muted-foreground text-sm">Loading…</div>}
          {orders && orders.length === 0 && (
            <div className="rounded-2xl border border-border p-12 text-center">
              <p className="font-display text-2xl">No orders yet.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 mt-4 text-gold text-sm">
                Browse the press <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
          {orders?.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-mono text-sm text-gold">{o.order_number}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(o.placed_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-border">
                  {statusLabels[o.status] ?? o.status}
                </span>
                <div className="font-display text-xl">{fmtINR(o.total_paise / 100)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
