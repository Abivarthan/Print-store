import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Plus, Star, Trash2, Pencil, X } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { AddressForm, type AddressFormValue } from "@/components/site/AddressForm";
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/addresses.functions";

export const Route = createFileRoute("/_authenticated/addresses")({
  component: AddressesPage,
});

type Address = Awaited<ReturnType<typeof listAddresses>>[number];

function AddressesPage() {
  const list = useServerFn(listAddresses);
  const create = useServerFn(createAddress);
  const update = useServerFn(updateAddress);
  const remove = useServerFn(deleteAddress);
  const setDefault = useServerFn(setDefaultAddress);

  const [rows, setRows] = useState<Address[] | null>(null);
  const [editor, setEditor] = useState<{ mode: "create" } | { mode: "edit"; row: Address } | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      setRows(await list());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load addresses");
      setRows([]);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(v: AddressFormValue) {
    setBusy(true);
    try {
      if (editor?.mode === "edit") {
        await update({ data: { id: editor.row.id, ...v } });
        toast.success("Address updated");
      } else {
        await create({ data: v });
        toast.success("Address saved");
      }
      setEditor(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(row: Address) {
    if (!confirm(`Delete "${row.label}"?`)) return;
    try {
      await remove({ data: { id: row.id } });
      toast.success("Address deleted");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    }
  }

  async function onSetDefault(row: Address) {
    try {
      await setDefault({ data: { id: row.id } });
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not set default");
    }
  }

  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>

        <div className="mt-4 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">Account</div>
            <h1 className="font-display text-5xl mt-2">Saved addresses</h1>
            <p className="text-muted-foreground mt-2">
              Reuse them at checkout. The default ships first.
            </p>
          </div>
          <button
            onClick={() => setEditor({ mode: "create" })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-ink text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add address
          </button>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {rows === null && (
            <div className="text-muted-foreground text-sm col-span-2 py-8">Loading…</div>
          )}
          {rows && rows.length === 0 && (
            <div className="col-span-2 rounded-2xl border border-border bg-card/40 p-12 text-center">
              <MapPin className="w-6 h-6 text-gold mx-auto" />
              <p className="font-display text-2xl mt-3">No addresses yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Save one to speed up future orders.
              </p>
              <button
                onClick={() => setEditor({ mode: "create" })}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-ink text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add your first address
              </button>
            </div>
          )}
          <AnimatePresence initial={false}>
            {rows?.map((r) => (
              <motion.article
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-2xl border p-5 bg-card/40 ${
                  r.is_default ? "border-gold/50" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg">{r.label}</h2>
                      {r.is_default && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold px-2 py-0.5 rounded-full border border-gold/40">
                          <Star className="w-2.5 h-2.5 fill-current" /> Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-1">{r.contact_name}</div>
                    <div className="text-xs text-muted-foreground">{r.contact_phone}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditor({ mode: "edit", row: r })}
                      className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground"
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(r)}
                      className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <address className="not-italic text-sm text-muted-foreground mt-3 leading-relaxed">
                  {r.line1}
                  {r.line2 ? (
                    <>
                      <br />
                      {r.line2}
                    </>
                  ) : null}
                  <br />
                  {r.city}, {r.state} {r.pincode}
                  <br />
                  {r.country}
                </address>

                {!r.is_default && (
                  <button
                    onClick={() => onSetDefault(r)}
                    className="mt-4 text-xs text-gold hover:underline inline-flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" /> Make default
                  </button>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {editor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => !busy && setEditor(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-card border border-border rounded-3xl p-8 my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">
                  {editor.mode === "edit" ? "Edit address" : "New address"}
                </h2>
                <button
                  onClick={() => !busy && setEditor(null)}
                  className="p-1.5 hover:bg-white/5 rounded-full"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <AddressForm
                initial={
                  editor.mode === "edit"
                    ? {
                        label: editor.row.label,
                        contactName: editor.row.contact_name,
                        contactPhone: editor.row.contact_phone,
                        line1: editor.row.line1,
                        line2: editor.row.line2 ?? "",
                        city: editor.row.city,
                        state: editor.row.state,
                        pincode: editor.row.pincode,
                        country: editor.row.country,
                        isDefault: editor.row.is_default,
                      }
                    : undefined
                }
                onSubmit={save}
                onCancel={() => setEditor(null)}
                submitting={busy}
                submitLabel={editor.mode === "edit" ? "Save changes" : "Save address"}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}
