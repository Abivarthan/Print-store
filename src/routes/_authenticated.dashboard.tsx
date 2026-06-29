import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Package, Truck, CheckCircle2, Clock, Sparkles, Radio, MapPin, MessageSquare, ShoppingBag } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/Layout";
import { getMyOrders } from "@/lib/orders.functions";
import { listAddresses } from "@/lib/addresses.functions";
import { listMyChangeRequests } from "@/lib/order-requests.functions";
import { fmtINR } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});


type Order = Awaited<ReturnType<typeof getMyOrders>>[number];

const STATUS_META: Record<
  string,
  { label: string; tone: string; icon: typeof Package; progress: number }
> = {
  pending_payment: { label: "Awaiting payment", tone: "amber", icon: Clock, progress: 5 },
  paid: { label: "Paid", tone: "emerald", icon: CheckCircle2, progress: 20 },
  in_prepress: { label: "In prepress", tone: "sky", icon: Sparkles, progress: 40 },
  printing: { label: "On press", tone: "indigo", icon: Package, progress: 65 },
  shipped: { label: "Shipped", tone: "violet", icon: Truck, progress: 85 },
  delivered: { label: "Delivered", tone: "emerald", icon: CheckCircle2, progress: 100 },
  cancelled: { label: "Cancelled", tone: "rose", icon: Clock, progress: 0 },
  refunded: { label: "Refunded", tone: "zinc", icon: Clock, progress: 0 },
};

const TONE: Record<string, string> = {
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  zinc: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

function Dashboard() {
  const fetchOrders = useServerFn(getMyOrders);
  const fetchAddresses = useServerFn(listAddresses);
  const fetchRequests = useServerFn(listMyChangeRequests);
  const { session } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [addressCount, setAddressCount] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [pulse, setPulse] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    fetchOrders()
      .then((d) => active && setOrders(d))
      .catch(() => active && setOrders([]));
    fetchAddresses()
      .then((d) => active && setAddressCount(d.length))
      .catch(() => active && setAddressCount(0));
    fetchRequests()
      .then((d) => {
        if (!active) return;
        setRequestCount(d.length);
        setPendingRequests(d.filter((r) => r.status === "pending").length);
      })
      .catch(() => {
        if (!active) return;
        setRequestCount(0);
        setPendingRequests(0);
      });
    return () => {
      active = false;
    };
  }, [fetchOrders, fetchAddresses, fetchRequests]);


  // Realtime: orders for this user
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const channel = supabase
      .channel(`orders:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${userId}` },
        (payload) => {
          setOrders((prev) => {
            if (!prev) return prev;
            if (payload.eventType === "INSERT") {
              return [payload.new as Order, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const next = payload.new as Order;
              setPulse(next.id);
              setTimeout(() => setPulse((p) => (p === next.id ? null : p)), 2400);
              return prev.map((o) => (o.id === next.id ? { ...o, ...next } : o));
            }
            if (payload.eventType === "DELETE") {
              const old = payload.old as { id: string };
              return prev.filter((o) => o.id !== old.id);
            }
            return prev;
          });
        },
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const stats = useMemo(() => {
    if (!orders) return null;
    const open = orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status));
    const delivered = orders.filter((o) => o.status === "delivered");
    const totalSpent = orders
      .filter((o) => !["cancelled", "refunded", "pending_payment"].includes(o.status))
      .reduce((s, o) => s + o.total_paise, 0);
    return {
      total: orders.length,
      open: open.length,
      delivered: delivered.length,
      spent: totalSpent,
    };
  }, [orders]);

  return (
    <SiteLayout>
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">Account</div>
            <h1 className="font-display text-5xl mt-2">Your dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Every press run, every dispatch — updated the moment we touch it.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                live
                  ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5"
                  : "border-border text-muted-foreground"
              }`}
              aria-live="polite"
            >
              <span className="relative flex w-2 h-2">
                {live && (
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                )}
                <span className={`relative inline-flex w-2 h-2 rounded-full ${live ? "bg-emerald-400" : "bg-zinc-500"}`} />
              </span>
              <Radio className="w-3 h-3" />
              {live ? "Live updates on" : "Connecting…"}
            </div>
          </div>
        </div>


        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <StatCard label="Total orders" value={stats ? String(stats.total) : "—"} />
          <StatCard label="In progress" value={stats ? String(stats.open) : "—"} accent />
          <StatCard label="Delivered" value={stats ? String(stats.delivered) : "—"} />
          <StatCard label="Lifetime spend" value={stats ? fmtINR(stats.spent / 100) : "—"} />
        </div>

        {/* Section navigation */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <SectionCard
            to="/orders"
            icon={ShoppingBag}
            title="Orders"
            count={stats?.total}
            hint={stats?.open ? `${stats.open} in progress` : "Full press history"}
          />
          <SectionCard
            to="/addresses"
            icon={MapPin}
            title="Saved addresses"
            count={addressCount ?? undefined}
            hint="Reuse at checkout"
          />
          <SectionCard
            to="/requests"
            icon={MessageSquare}
            title="Change requests"
            count={requestCount ?? undefined}
            hint={pendingRequests ? `${pendingRequests} pending` : "Cancellations & edits"}
            badge={pendingRequests > 0}
          />
        </div>


        {/* Order list */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Order history</h2>
            <Link to="/shop" className="text-sm text-gold inline-flex items-center gap-1.5">
              New order <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders === null && (
            <div className="text-muted-foreground text-sm py-12 text-center">Loading…</div>
          )}

          {orders && orders.length === 0 && (
            <div className="rounded-2xl border border-border bg-card/40 p-14 text-center">
              <p className="font-display text-2xl">No orders yet.</p>
              <p className="text-muted-foreground text-sm mt-2">
                Your first press run is one click away.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-gold text-ink text-sm font-medium"
              >
                Browse the press <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {orders?.map((o, i) => {
                const meta = STATUS_META[o.status] ?? STATUS_META.paid;
                const Icon = meta.icon;
                const pulsing = pulse === o.id;
                return (
                  <motion.li
                    key={o.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  >
                    <Link
                      to="/orders/$id"
                      params={{ id: o.id }}
                      className={`group relative block rounded-2xl border bg-card/40 p-5 transition-colors hover:border-gold/40 ${
                        pulsing ? "border-gold/60" : "border-border"
                      }`}
                    >
                      {pulsing && (
                        <motion.span
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 2.2 }}
                          className="pointer-events-none absolute inset-0 rounded-2xl bg-gold/10"
                        />
                      )}
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-gold">{o.order_number}</span>
                            {pulsing && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[10px] uppercase tracking-widest text-gold"
                              >
                                · updated
                              </motion.span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Placed{" "}
                            {new Date(o.placed_at).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border ${TONE[meta.tone]}`}
                          >
                            <Icon className="w-3 h-3" />
                            {meta.label}
                          </span>
                          <div className="font-display text-xl">{fmtINR(o.total_paise / 100)}</div>
                        </div>
                      </div>

                      <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gold to-gold-soft"
                          initial={false}
                          animate={{ width: `${meta.progress}%` }}
                          transition={{ type: "spring", stiffness: 80, damping: 18 }}
                        />
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent ? "border-gold/30 bg-gold/5" : "border-border bg-card/40"
      }`}
    >
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl mt-2 ${accent ? "text-gold" : ""}`}>{value}</div>
    </div>
  );
}

function SectionCard({
  to,
  icon: Icon,
  title,
  count,
  hint,
  badge,
}: {
  to: "/orders" | "/addresses" | "/requests";
  icon: typeof Package;
  title: string;
  count?: number;
  hint: string;
  badge?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group relative rounded-2xl border border-border bg-card/40 p-5 hover:border-gold/40 transition-colors flex items-center gap-4"
    >
      <div className="relative w-11 h-11 rounded-xl border border-gold/20 bg-gold/5 flex items-center justify-center text-gold">
        <Icon className="w-5 h-5" />
        {badge && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-background" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <div className="font-display text-lg">{title}</div>
          <div className="text-gold font-mono text-sm">
            {count === undefined ? "—" : count}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{hint}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
    </Link>
  );
}

