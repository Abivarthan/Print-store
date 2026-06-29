import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { fmtINR } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersAdmin,
});

type Order = Awaited<ReturnType<typeof adminListOrders>>[number];

const STATUSES = [
  "pending_payment",
  "paid",
  "in_prepress",
  "printing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const STATUS_COLOR: Record<string, string> = {
  pending_payment: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  in_prepress: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  printing: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  shipped: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  delivered: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  refunded: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

function OrdersAdmin() {
  const list = useServerFn(adminListOrders);
  const update = useServerFn(adminUpdateOrderStatus);
  const [rows, setRows] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");

  async function refresh() {
    setRows((await list()) ?? []);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(id: string, status: (typeof STATUSES)[number]) {
    try {
      await update({ data: { id, status } });
      toast.success(`Marked ${status.replace("_", " ")}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="p-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold">Atelier</div>
          <h1 className="font-display text-4xl mt-2">Orders</h1>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-card border border-border rounded-full px-4 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-mono text-sm text-gold">{o.order_number}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(o.placed_at).toLocaleString("en-IN")} · {o.contact_email}
                </div>
                {o.shipping_address && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {(o.shipping_address as { line1: string }).line1},{" "}
                    {(o.shipping_address as { city: string }).city} —{" "}
                    {(o.shipping_address as { pincode: string }).pincode}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border ${STATUS_COLOR[o.status]}`}>
                  {o.status.replace("_", " ")}
                </span>
                <div className="font-display text-2xl">{fmtINR(o.total_paise / 100)}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(o.id, s)}
                  disabled={o.status === s}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    o.status === s
                      ? "border-gold/50 text-gold opacity-50 cursor-default"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-gold/40"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-16">No orders match.</div>
        )}
      </div>
    </div>
  );
}
