import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Inbox } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/Layout";
import { listMyChangeRequests } from "@/lib/order-requests.functions";

export const Route = createFileRoute("/_authenticated/requests")({
  component: RequestsPage,
});

const KIND_LABEL: Record<string, string> = {
  cancel: "Cancellation",
  edit_address: "Address change",
  edit_items: "Edit items",
  other: "Other",
};

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  applied: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

type Row = Awaited<ReturnType<typeof listMyChangeRequests>>[number];

function RequestsPage() {
  const fetchRequests = useServerFn(listMyChangeRequests);
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    fetchRequests().then(setRows).catch(() => setRows([]));
  }, [fetchRequests]);

  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <div className="text-xs uppercase tracking-widest text-gold">Account</div>
        <h1 className="font-display text-5xl mt-2">Change requests</h1>
        <p className="text-muted-foreground mt-2">
          Cancellations and edits you've asked our atelier to handle.
        </p>

        <div className="mt-12 space-y-3">
          {rows === null && <div className="text-muted-foreground text-sm">Loading…</div>}
          {rows && rows.length === 0 && (
            <div className="rounded-2xl border border-border bg-card/40 p-14 text-center">
              <Inbox className="w-6 h-6 mx-auto text-muted-foreground" />
              <p className="font-display text-2xl mt-3">No requests yet.</p>
              <p className="text-muted-foreground text-sm mt-2">
                Open an order to request a cancellation or edit.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-gold text-ink text-sm font-medium"
              >
                Back to dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {rows?.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="rounded-2xl border border-border bg-card/40 p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-gold">
                      {r.orders?.order_number}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {KIND_LABEL[r.kind] ?? r.kind}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Filed{" "}
                    {new Date(r.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                  {r.message && (
                    <p className="text-sm mt-3 text-foreground/80 max-w-2xl">"{r.message}"</p>
                  )}
                  {r.staff_note && (
                    <p className="text-xs mt-2 text-muted-foreground">
                      Atelier: {r.staff_note}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border ${
                      STATUS_TONE[r.status] ?? "border-border text-muted-foreground"
                    }`}
                  >
                    {r.status}
                  </span>
                  <Link
                    to="/orders/$id"
                    params={{ id: r.order_id }}
                    className="text-xs text-gold inline-flex items-center gap-1"
                  >
                    View order <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
