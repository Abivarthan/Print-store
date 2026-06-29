import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { adminListProducts, adminUpsertProduct, adminDeleteProduct } from "@/lib/admin.functions";
import { fmtINR } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

type Product = Awaited<ReturnType<typeof adminListProducts>>[number];

function ProductsAdmin() {
  const list = useServerFn(adminListProducts);
  const upsert = useServerFn(adminUpsertProduct);
  const del = useServerFn(adminDeleteProduct);

  const [rows, setRows] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

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
          slug: editing.slug!,
          name: editing.name!,
          tagline: editing.tagline ?? null,
          description: editing.description ?? null,
          hero: editing.hero ?? null,
          categorySlug: editing.category_slug ?? null,
          basePricePaise: editing.base_price_paise ?? 0,
          minQty: editing.min_qty ?? 1,
          active: editing.active ?? true,
          sortOrder: editing.sort_order ?? 0,
        },
      });
      toast.success("Saved");
      setEditing(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function remove(slug: string) {
    if (!confirm(`Delete ${slug}?`)) return;
    await del({ data: { slug } });
    toast.success("Deleted");
    refresh();
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold">Atelier</div>
          <h1 className="font-display text-4xl mt-2">Products</h1>
        </div>
        <button
          onClick={() => setEditing({ slug: "", name: "", active: true, min_qty: 100, base_price_paise: 1000, sort_order: 0 })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-ink text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New product
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left p-4">Slug</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-right p-4">Base price</th>
              <th className="text-right p-4">Min qty</th>
              <th className="text-center p-4">Active</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.slug} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                <td className="p-4 font-mono text-xs text-muted-foreground">{p.slug}</td>
                <td className="p-4">{p.name}</td>
                <td className="p-4 text-muted-foreground">{p.category_slug ?? "—"}</td>
                <td className="p-4 text-right">{fmtINR(p.base_price_paise / 100)}</td>
                <td className="p-4 text-right">{p.min_qty}</td>
                <td className="p-4 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${p.active ? "bg-emerald-400" : "bg-zinc-600"}`} />
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-white/5 rounded">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(p.slug)} className="p-1.5 hover:bg-white/5 rounded text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-card border border-border rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">{editing.slug ? "Edit" : "New"} product</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-white/5 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <F label="Slug" value={editing.slug ?? ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <F label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <F label="Tagline" value={editing.tagline ?? ""} onChange={(v) => setEditing({ ...editing, tagline: v })} />
              <F label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} textarea />
              <div className="grid grid-cols-2 gap-4">
                <F label="Category slug" value={editing.category_slug ?? ""} onChange={(v) => setEditing({ ...editing, category_slug: v || null })} />
                <F label="Hero" value={editing.hero ?? ""} onChange={(v) => setEditing({ ...editing, hero: v })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <F
                  label="Base price (paise)"
                  type="number"
                  value={String(editing.base_price_paise ?? 0)}
                  onChange={(v) => setEditing({ ...editing, base_price_paise: Number(v) })}
                />
                <F
                  label="Min qty"
                  type="number"
                  value={String(editing.min_qty ?? 1)}
                  onChange={(v) => setEditing({ ...editing, min_qty: Number(v) })}
                />
                <F
                  label="Sort order"
                  type="number"
                  value={String(editing.sort_order ?? 0)}
                  onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })}
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
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50"
        />
      )}
    </label>
  );
}
