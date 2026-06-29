import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Radio, Ban, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/Layout";
import { getMyOrder, getMyOrderEvents } from "@/lib/orders.functions";
import {
  listOrderChangeRequests,
  cancelChangeRequest,
} from "@/lib/order-requests.functions";
import { fmtINR } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { RequestChangeDialog } from "@/components/site/RequestChangeDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  component: OrderDetail,
});

const MODIFIABLE = new Set(["pending_payment", "paid", "in_prepress"]);

type ChangeRequest = Awaited<ReturnType<typeof listOrderChangeRequests>>[number];

const REQ_LABEL: Record<string, string> = {
  cancel: "Cancellation",
  edit_address: "Address change",
  edit_items: "Item change",
  other: "Other",
};
const REQ_STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  applied: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};


const FLOW = [
  "pending_payment",
  "paid",
  "in_prepress",
  "printing",
  "shipped",
  "delivered",
] as const;

const LABEL: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  in_prepress: "In prepress",
  printing: "On press",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

type Order = Awaited<ReturnType<typeof getMyOrder>>;
type Event = Awaited<ReturnType<typeof getMyOrderEvents>>[number];

function OrderDetail() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getMyOrder);
  const fetchEvents = useServerFn(getMyOrderEvents);
  const { session } = useSession();

  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const fetchRequests = useServerFn(listOrderChangeRequests);
  const dropRequest = useServerFn(cancelChangeRequest);

  async function refreshRequests() {
    try {
      setRequests(await fetchRequests({ data: { orderId: id } }));
    } catch {
      /* ignore */
    }
  }


  useEffect(() => {
    let active = true;
    Promise.all([
      fetchOrder({ data: { id } }),
      fetchEvents({ data: { orderId: id } }),
      fetchRequests({ data: { orderId: id } }),
    ])
      .then(([o, e, r]) => {
        if (!active) return;
        setOrder(o);
        setEvents(e);
        setRequests(r);
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : "Could not load order"));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  // Realtime: this order + its events + its change requests
  useEffect(() => {
    if (!session?.user?.id) return;
    const channel = supabase
      .channel(`order:${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, ...(payload.new as Partial<Order>) } : prev));
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_status_events", filter: `order_id=eq.${id}` },
        (payload) => {
          const ev = payload.new as Event;
          setEvents((prev) => (prev.some((e) => e.id === ev.id) ? prev : [...prev, ev]));
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_change_requests", filter: `order_id=eq.${id}` },
        () => {
          refreshRequests();
        },
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session?.user?.id]);


  if (error) {
    return (
      <SiteLayout>
        <section className="max-w-3xl mx-auto px-6 pt-32 pb-24 text-center">
          <h1 className="font-display text-3xl">Couldn't load this order</h1>
          <p className="text-muted-foreground mt-2 text-sm">{error}</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 mt-6 text-gold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </section>
      </SiteLayout>
    );
  }

  if (!order) {
    return (
      <SiteLayout>
        <section className="max-w-4xl mx-auto px-6 pt-32 pb-24">
          <div className="text-muted-foreground text-sm">Loading…</div>
        </section>
      </SiteLayout>
    );
  }

  const currentIndex = FLOW.indexOf(order.status as (typeof FLOW)[number]);
  const isTerminalBad = order.status === "cancelled" || order.status === "refunded";

  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>

        <div className="mt-4 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">Order</div>
            <h1 className="font-mono text-3xl mt-2">{order.order_number}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Placed {new Date(order.placed_at).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {MODIFIABLE.has(order.status) && (
              <button
                onClick={() => setRequestOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
              >
                <Ban className="w-3 h-3" /> Request change
              </button>
            )}
            <div
              className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
                live ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5" : "border-border text-muted-foreground"
              }`}
            >
              <Radio className="w-3 h-3" /> {live ? "Live" : "Connecting…"}
            </div>
          </div>

        </div>

        {/* Progress flow */}
        {!isTerminalBad ? (
          <div className="mt-10 rounded-2xl border border-border bg-card/40 p-6">
            <div className="flex items-center justify-between gap-2 relative">
              <div className="absolute left-0 right-0 top-3 h-px bg-border" />
              <motion.div
                className="absolute left-0 top-3 h-px bg-gradient-to-r from-gold to-gold-soft"
                initial={false}
                animate={{
                  width: `${Math.max(0, (currentIndex / (FLOW.length - 1)) * 100)}%`,
                }}
                transition={{ type: "spring", stiffness: 60, damping: 18 }}
              />
              {FLOW.map((s, i) => {
                const done = i <= currentIndex;
                return (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                    <motion.div
                      animate={{ scale: i === currentIndex ? [1, 1.15, 1] : 1 }}
                      transition={{ duration: 1.6, repeat: i === currentIndex ? Infinity : 0 }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        done ? "bg-gold border-gold text-ink" : "bg-ink border-border text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-2 h-2" />}
                    </motion.div>
                    <span
                      className={`text-[10px] uppercase tracking-wider text-center ${
                        done ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {LABEL[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-rose-200">
            This order was {LABEL[order.status].toLowerCase()}.
          </div>
        )}

        {/* Change requests */}
        {requests.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-card/40 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Change requests</h2>
              {MODIFIABLE.has(order.status) && (
                <button
                  onClick={() => setRequestOpen(true)}
                  className="text-xs text-gold hover:underline"
                >
                  + New request
                </button>
              )}
            </div>
            <ul className="mt-4 space-y-3">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-border bg-ink/40 p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-sm">{REQ_LABEL[r.kind] ?? r.kind}</span>
                      <span
                        className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          REQ_STATUS_TONE[r.status]
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    {r.message && (
                      <p className="text-xs text-muted-foreground mt-1.5 whitespace-pre-wrap">
                        “{r.message}”
                      </p>
                    )}
                    {r.staff_note && (
                      <p className="text-xs text-gold/80 mt-1.5 whitespace-pre-wrap">
                        Studio: {r.staff_note}
                      </p>
                    )}
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
                      {new Date(r.created_at).toLocaleString("en-IN")}
                    </div>
                  </div>
                  {r.status === "pending" && (
                    <button
                      onClick={async () => {
                        if (!confirm("Withdraw this request?")) return;
                        try {
                          await dropRequest({ data: { id: r.id } });
                          toast.success("Withdrawn");
                          refreshRequests();
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Could not withdraw");
                        }
                      }}
                      className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground shrink-0"
                      aria-label="Withdraw request"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}


        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mt-6">
          {/* Items */}
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <h2 className="font-display text-xl mb-4">Items</h2>
            <ul className="divide-y divide-border">
              {order.order_items?.map((it) => (
                <li key={it.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm">{it.product_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {it.qty} units · {fmtINR(it.unit_paise / 100)} each
                    </div>
                  </div>
                  <div className="font-display">{fmtINR(it.line_total_paise / 100)}</div>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-1.5 text-sm">
              <Row label="Subtotal" value={fmtINR(order.subtotal_paise / 100)} />
              {order.discount_paise > 0 && (
                <Row label={`Discount${order.coupon_code ? ` · ${order.coupon_code}` : ""}`} value={`− ${fmtINR(order.discount_paise / 100)}`} accent />
              )}
              <Row label="GST (18%)" value={fmtINR(order.gst_paise / 100)} />
              <Row label="Shipping" value={order.shipping_paise === 0 ? "Free" : fmtINR(order.shipping_paise / 100)} />
              <div className="border-t border-border mt-3 pt-3">
                <Row label="Total" value={fmtINR(order.total_paise / 100)} large />
              </div>
            </dl>
          </div>

          {/* Timeline + shipping */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card/40 p-6">
              <h2 className="font-display text-xl mb-4">Timeline</h2>
              <ol className="relative border-l border-border ml-2 space-y-4">
                <AnimatePresence initial={false}>
                  {events.length === 0 && (
                    <li className="pl-4 text-sm text-muted-foreground">
                      Status updates will appear here in real time.
                    </li>
                  )}
                  {events.map((e) => (
                    <motion.li
                      key={e.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="pl-4 relative"
                    >
                      <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gold" />
                      <div className="text-sm">{LABEL[e.status] ?? e.status}</div>
                      {e.note && <div className="text-xs text-muted-foreground mt-0.5">{e.note}</div>}
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                        {new Date(e.created_at).toLocaleString("en-IN")}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </div>

            {order.shipping_address && (
              <div className="rounded-2xl border border-border bg-card/40 p-6">
                <h2 className="font-display text-xl mb-3">Shipping to</h2>
                <address className="not-italic text-sm text-muted-foreground leading-relaxed">
                  {(order.shipping_address as { line1: string }).line1}
                  {(order.shipping_address as { line2?: string }).line2 && (
                    <>
                      <br />
                      {(order.shipping_address as { line2: string }).line2}
                    </>
                  )}
                  <br />
                  {(order.shipping_address as { city: string }).city},{" "}
                  {(order.shipping_address as { state: string }).state}{" "}
                  {(order.shipping_address as { pincode: string }).pincode}
                </address>
                <div className="text-xs text-muted-foreground mt-3">
                  {order.contact_email} · {order.contact_phone}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <RequestChangeDialog
        open={requestOpen}
        orderId={id}
        onClose={() => setRequestOpen(false)}
        onCreated={refreshRequests}
        initialKind="cancel"
      />
    </SiteLayout>
  );
}


function Row({ label, value, accent, large }: { label: string; value: string; accent?: boolean; large?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={large ? "font-display text-lg" : "text-muted-foreground"}>{label}</dt>
      <dd className={`${large ? "font-display text-lg" : ""} ${accent ? "text-gold" : ""}`}>{value}</dd>
    </div>
  );
}
