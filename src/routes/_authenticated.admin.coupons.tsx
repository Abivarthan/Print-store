import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { adminListCoupons, adminUpsertCoupon, adminDeleteCoupon } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  component: CouponsAdmin,
});

type Coupon = Awaited<ReturnType<typeof adminListCoupons>>[number];

function CouponsAdmin() {
  const list = useServerFn(adminListCoupons);
  const upsert = useServerFn(adminUpsertCoupon);
  const del = useServerFn(adminDeleteCoupon);

  const [rows, setRows] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);

  async function refresh() {
    setRows((await list()) ?? []);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!editing) return;
    try {
      await upsert({
        data: {
          id: editing.id,
          code: editing.code!,
          kind: (editing.kind ?? "percent") as "percent" | "flat",
          percentBps: editing.percent_bps ?? null,
          valuePaise: editing.value_paise ?? null,
          minSubtotalPaise: editing.min_subtotal_paise ?? 0,
          maxDiscountPaise: editing.max_discount_paise ?? null,
          startsAt: editing.starts_at ?? null,
          expiresAt: editing.expires_at ?? null,
          usageLimit: editing.usage_limit ?? null,
          active: editing.active ?? true,
        },
      });
      toast.success("Saved");
      setEditing(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold">Atelier</div>
          <h1 className="font-display text-4xl mt-2">Coupons</h1>
        </div>
        <button
          onClick={() => setEditing({ code: "", kind: "percent", percent_bps: 1000, min_subtotal_paise: 0, active: true })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-ink text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New coupon
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left p-4">Code</th>
              <th className="text-left p-4">Kind</th>
              <th className="text-right p-4">Value</th>
              <th className="text-right p-4">Min subtotal</th>
              <th className="text-right p-4">Usage</th>
              <th className="text-center p-4">Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-4 font-mono text-gold">{c.code}</td>
                <td className="p-4 capitalize">{c.kind}</td>
                <td className="p-4 text-right">
                  {c.kind === "percent" ? `${((c.percent_bps ?? 0) / 100).toFixed(2)} %` : `₹${(c.value_paise ?? 0) / 100}`}
                </td>
                <td className="p-4 text-right">₹{c.min_subtotal_paise / 100}</td>
                <td className="p-4 text-right text-muted-foreground">
                  {c.usage_count}
                  {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${c.active ? "bg-emerald-400" : "bg-zinc-600"}`} />
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(c)} className="p-1.5 hover:bg-white/5 rounded">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete ${c.code}?`)) return;
                      await del({ data: { id: c.id } });
                      refresh();
                    }}
                    className="p-1.5 hover:bg-white/5 rounded text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card border border-border rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">{editing.id ? "Edit" : "New"} coupon</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-white/5 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <F label="Code (uppercase)" value={editing.code ?? ""} onChange={(v) => setEditing({ ...editing, code: v.toUpperCase() })} />
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Kind</span>
                <select
                  value={editing.kind ?? "percent"}
                  onChange={(e) => setEditing({ ...editing, kind: e.target.value as "percent" | "flat" })}
                  className="mt-1 w-full bg-card border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="percent">Percent</option>
                  <option value="flat">Flat (paise)</option>
                </select>
              </label>
              {editing.kind === "percent" ? (
                <div className="grid grid-cols-2 gap-4">
                  <F
                    label="Percent (basis points, 1000 = 10%)"
                    type="number"
                    value={String(editing.percent_bps ?? 0)}
                    onChange={(v) => setEditing({ ...editing, percent_bps: Number(v) })}
                  />
                  <F
                    label="Max discount (paise)"
                    type="number"
                    value={String(editing.max_discount_paise ?? "")}
                    onChange={(v) => setEditing({ ...editing, max_discount_paise: v ? Number(v) : null })}
                  />
                </div>
              ) : (
                <F
                  label="Flat value (paise)"
                  type="number"
                  value={String(editing.value_paise ?? 0)}
                  onChange={(v) => setEditing({ ...editing, value_paise: Number(v) })}
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <F
                  label="Min subtotal (paise)"
                  type="number"
                  value={String(editing.min_subtotal_paise ?? 0)}
                  onChange={(v) => setEditing({ ...editing, min_subtotal_paise: Number(v) })}
                />
                <F
                  label="Usage limit"
                  type="number"
                  value={String(editing.usage_limit ?? "")}
                  onChange={(v) => setEditing({ ...editing, usage_limit: v ? Number(v) : null })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F
                  label="Starts at"
                  type="datetime-local"
                  value={editing.starts_at ? String(editing.starts_at).slice(0, 16) : ""}
                  onChange={(v) => setEditing({ ...editing, starts_at: v || null })}
                />
                <F
                  label="Expires at"
                  type="datetime-local"
                  value={editing.expires_at ? String(editing.expires_at).slice(0, 16) : ""}
                  onChange={(v) => setEditing({ ...editing, expires_at: v || null })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button onClick={save} className="px-5 py-2 rounded-full bg-gold text-ink text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50"
      />
    </label>
  );
}
